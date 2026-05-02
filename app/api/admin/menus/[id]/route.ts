import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Menu } from "@/models/Menu";
import { ObjectId } from "mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid menu ID" }, { status: 400 });
    }

    await connectToDatabase();
    const menu = await Menu.findById(id).lean();

    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    return NextResponse.json({ menu });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load menu";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid menu ID" }, { status: 400 });
    }

    await connectToDatabase();
    const body = await request.json();

    const menu = await Menu.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true
    });

    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    return NextResponse.json({ menu });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update menu";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid menu ID" }, { status: 400 });
    }

    await connectToDatabase();
    const menu = await Menu.findByIdAndDelete(id);

    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Menu deleted successfully" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete menu";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
