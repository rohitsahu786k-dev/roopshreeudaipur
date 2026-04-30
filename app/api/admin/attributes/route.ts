import { NextResponse, type NextRequest } from "next/server";
import slugify from "slugify";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { CatalogAttribute } from "@/models/CatalogAttribute";

function normalizePayload(payload: Record<string, unknown>) {
  const name = String(payload.name ?? "").trim();
  return {
    name,
    slug: String(payload.slug ?? slugify(name, { lower: true, strict: true })).trim(),
    type: payload.type ?? "multi-select",
    inputType: payload.inputType ?? payload.input_type ?? "checkbox",
    values: Array.isArray(payload.values) ? payload.values : [],
    isFilterable: payload.isFilterable ?? payload.filterable ?? true,
    isSearchable: payload.isSearchable ?? payload.searchable ?? true,
    visibleOnPdp: payload.visibleOnPdp ?? payload.visible_on_pdp ?? true,
    isVariantOption: payload.isVariantOption ?? payload.variant_option ?? false,
    filterLogic: payload.filterLogic ?? payload.logic ?? "or",
    priority: Number(payload.priority ?? 100),
    isActive: payload.isActive ?? payload.status !== "inactive"
  };
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    await connectToDatabase();
    const attributes = await CatalogAttribute.find().sort({ priority: 1, name: 1 }).lean();
    return NextResponse.json({ attributes });
  } catch {
    return NextResponse.json({ error: "Unable to load attributes" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    await connectToDatabase();
    const payload = normalizePayload(await request.json());
    if (!payload.name) return NextResponse.json({ error: "Attribute name is required" }, { status: 400 });
    const attribute = await CatalogAttribute.create(payload);
    return NextResponse.json({ attribute }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save attribute";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
