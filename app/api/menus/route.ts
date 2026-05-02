import { NextResponse, type NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Menu } from "@/models/Menu";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const placement = searchParams.get("placement") || "header";
    const name = searchParams.get("name");

    const query: any = { isActive: true };
    if (placement) query.placement = placement;
    if (name) query.name = name;

    const menus = await Menu.find(query).sort({ "items.sortOrder": 1 }).lean();

    return NextResponse.json({ menus });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load menus";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
