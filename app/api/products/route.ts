import { NextResponse, type NextRequest } from "next/server";
import slugify from "slugify";
import { getCurrentUser } from "@/lib/auth";
import { products, type Product as StaticProduct } from "@/lib/catalog";
import { connectToDatabase } from "@/lib/mongodb";
import { CatalogAttribute } from "@/models/CatalogAttribute";
import { Product } from "@/models/Product";

function valuesFor(params: URLSearchParams, key: string) {
  const direct = params.getAll(key);
  const comma = params.get(key)?.split(",") ?? [];
  return Array.from(new Set([...direct, ...comma].map((item) => item.trim()).filter(Boolean)));
}

function staticMatches(product: StaticProduct, params: URLSearchParams) {
  const category = params.get("category");
  const minPrice = Number(params.get("minPrice") ?? params.get("price_min") ?? 0);
  const maxPrice = Number(params.get("maxPrice") ?? params.get("price_max") ?? Number.MAX_SAFE_INTEGER);
  const sizes = valuesFor(params, "size");
  const colors = valuesFor(params, "color");
  const fabric = valuesFor(params, "fabric");
  const occasion = valuesFor(params, "occasion");

  if (category && category !== "all" && product.category !== category) return false;
  if (product.price < minPrice || product.price > maxPrice) return false;
  if (sizes.length && !sizes.some((size) => product.sizes.includes(size))) return false;
  if (colors.length && !colors.some((color) => product.colors.some((entry) => entry.name.toLowerCase() === color.toLowerCase()))) return false;
  if (fabric.length && !fabric.some((item) => product.fabric.toLowerCase().includes(item.toLowerCase()))) return false;
  if (occasion.length && !occasion.some((item) => product.occasion.map((entry) => entry.toLowerCase()).includes(item.toLowerCase()))) return false;
  return true;
}

function staticFilterBuckets(items: StaticProduct[]) {
  const bucket = (values: string[]) =>
    Array.from(new Set(values)).map((value) => ({
      label: value,
      value,
      count: items.filter((product) => JSON.stringify(product).toLowerCase().includes(value.toLowerCase())).length
    }));

  return [
    { name: "Size", slug: "size", inputType: "size", filterLogic: "or", values: bucket(items.flatMap((product) => product.sizes)) },
    { name: "Color", slug: "color", inputType: "color", filterLogic: "or", values: bucket(items.flatMap((product) => product.colors.map((color) => color.name))) },
    { name: "Fabric", slug: "fabric", inputType: "checkbox", filterLogic: "or", values: bucket(items.map((product) => product.fabric)) },
    { name: "Occasion", slug: "occasion", inputType: "checkbox", filterLogic: "or", values: bucket(items.flatMap((product) => product.occasion)) },
    {
      name: "Price",
      slug: "price",
      inputType: "range",
      filterLogic: "and",
      min: Math.min(...items.map((product) => product.price)),
      max: Math.max(...items.map((product) => product.price)),
      values: []
    }
  ];
}

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    if (!process.env.MONGODB_URI) {
      const filtered = products.filter((product) => staticMatches(product, params));
      return NextResponse.json({ products: filtered, filters: staticFilterBuckets(products), total: filtered.length });
    }

    await connectToDatabase();
    const query: Record<string, unknown> = { isActive: true };
    const category = params.get("category");
    const minPrice = Number(params.get("minPrice") ?? params.get("price_min") ?? 0);
    const maxPrice = Number(params.get("maxPrice") ?? params.get("price_max") ?? Number.MAX_SAFE_INTEGER);
    const search = params.get("q");

    if (category && category !== "all") query.category = category;
    if (Number.isFinite(minPrice) || Number.isFinite(maxPrice)) query.basePrice = { $gte: minPrice, $lte: maxPrice };
    if (search) query.$text = { $search: search };

    const attributes = await CatalogAttribute.find({ isActive: true, isFilterable: true }).sort({ priority: 1 }).lean();
    const attributeFilters = attributes.flatMap((attribute) =>
      valuesFor(params, attribute.slug).map((value) => ({ name: attribute.name, value, logic: attribute.filterLogic }))
    );
    if (attributeFilters.length) {
      query.$and = attributeFilters.map((filter) => ({
        $or: [
          { "attributes.name": new RegExp(`^${filter.name}$`, "i"), "attributes.value": new RegExp(filter.value, "i") },
          { "options.name": new RegExp(`^${filter.name}$`, "i"), "options.values": filter.value },
          { "variants.option1": filter.value },
          { "variants.option2": filter.value },
          { "variants.option3": filter.value }
        ]
      }));
    }

    const databaseProducts = await Product.find(query).sort({ createdAt: -1 }).lean();
    const responseProducts = databaseProducts.length ? databaseProducts : products.filter((product) => staticMatches(product, params));
    const filters = attributes.length
      ? attributes.map((attribute) => ({
          id: String(attribute._id),
          name: attribute.name,
          slug: attribute.slug,
          type: attribute.type,
          inputType: attribute.inputType,
          filterLogic: attribute.filterLogic,
          priority: attribute.priority,
          values: attribute.values.map((value) => ({
            label: value.label,
            value: value.value,
            colorHex: value.colorHex,
            count: databaseProducts.filter((product) =>
              JSON.stringify(product).toLowerCase().includes(String(value.value).toLowerCase())
            ).length
          }))
        }))
      : staticFilterBuckets(products);

    return NextResponse.json({ products: responseProducts, filters, total: responseProducts.length });
  } catch {
    const filtered = products.filter((product) => staticMatches(product, request.nextUrl.searchParams));
    return NextResponse.json({ products: filtered, filters: staticFilterBuckets(products), total: filtered.length });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Admin access is required" }, { status: 403 });
    }

    const payload = await request.json();
    const requiredFields = ["name", "description", "shortDescription", "category", "images", "variants"];
    const missingField = requiredFields.find((field) => !payload[field]);

    if (missingField) {
      return NextResponse.json({ error: `${missingField} is required` }, { status: 400 });
    }

    await connectToDatabase();
    const product = await Product.create({
      ...payload,
      slug: payload.slug ?? slugify(payload.name, { lower: true, strict: true })
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save product";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
