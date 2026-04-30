import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { connectToDatabase } from "@/lib/mongodb";
import { Media } from "@/models/Media";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "40");
    const type = searchParams.get("type") ?? "";
    const folder = searchParams.get("folder") ?? "";

    const filter: Record<string, unknown> = {};
    if (type) filter.type = type;
    if (folder) filter.folder = folder;

    const total = await Media.countDocuments(filter);
    const items = await Media.find(filter)
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();
    const contentType = req.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file");
      if (!(file instanceof File)) {
        return NextResponse.json({ error: "File is required" }, { status: 400 });
      }

      const allowed = ["image/", "video/", "application/pdf"];
      if (!allowed.some((prefix) => file.type.startsWith(prefix))) {
        return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
      }
      if (file.size > 25 * 1024 * 1024) {
        return NextResponse.json({ error: "File must be under 25MB" }, { status: 400 });
      }

      const bytes = Buffer.from(await file.arrayBuffer());
      const uploadDir = path.join(process.cwd(), "public", "uploads", "media");
      await mkdir(uploadDir, { recursive: true });
      const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
      await writeFile(path.join(uploadDir, safeName), bytes);
      const type = file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "document";
      const media = await Media.create({
        filename: safeName,
        originalName: file.name,
        url: `/uploads/media/${safeName}`,
        type,
        mimeType: file.type,
        size: file.size,
        alt: String(formData.get("alt") ?? ""),
        folder: String(formData.get("folder") ?? "general"),
        uploadedBy: user.id
      });
      return NextResponse.json({ media }, { status: 201 });
    }

    const body = await req.json();
    const media = await Media.create({ ...body, uploadedBy: user.id });
    return NextResponse.json({ media }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();
    const { ids } = await req.json();
    await Media.deleteMany({ _id: { $in: ids } });
    return NextResponse.json({ message: "Deleted" });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
