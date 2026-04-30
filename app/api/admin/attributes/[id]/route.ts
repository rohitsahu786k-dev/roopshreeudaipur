import { NextResponse, type NextRequest } from "next/server";
import slugify from "slugify";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { CatalogAttribute } from "@/models/CatalogAttribute";

type Context = { params: { id: string } };

export async function PATCH(request: NextRequest, { params }: Context) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const payload = await request.json();
    const updates = {
      ...payload,
      slug: payload.slug ?? (payload.name ? slugify(payload.name, { lower: true, strict: true }) : undefined)
    };

    await connectToDatabase();
    const attribute = await CatalogAttribute.findByIdAndUpdate(params.id, updates, { new: true });
    if (!attribute) return NextResponse.json({ error: "Attribute not found" }, { status: 404 });
    return NextResponse.json({ attribute });
  } catch {
    return NextResponse.json({ error: "Unable to update attribute" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Context) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    await connectToDatabase();
    await CatalogAttribute.findByIdAndDelete(params.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete attribute" }, { status: 500 });
  }
}
