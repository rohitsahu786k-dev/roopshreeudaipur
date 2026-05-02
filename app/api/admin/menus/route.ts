import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
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

    const menus = await Menu.find(query).sort({ updatedAt: -1 }).lean();

    return NextResponse.json({ menus });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load menus";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();
    const body = await request.json();
    
    // Check if menu with same name already exists
    const existingMenu = await Menu.findOne({ name: body.name });
    if (existingMenu) {
      return NextResponse.json(
        { error: "Menu with this name already exists" },
        { status: 400 }
      );
    }

    const menu = await Menu.create({
      ...body,
      items: body.items || []
    });

    return NextResponse.json({ menu }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create menu";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
