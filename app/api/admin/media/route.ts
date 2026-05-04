import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Media } from "@/models/Media";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

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

    return NextResponse.json({ items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Server error" }, { status: 500 });
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

      const allowed = ["image/", "video/"];
      if (!allowed.some((prefix) => file.type.startsWith(prefix))) {
        return NextResponse.json({ error: "Only images and videos are supported" }, { status: 400 });
      }
      if (file.size > 50 * 1024 * 1024) {
        return NextResponse.json({ error: "File must be under 50MB" }, { status: 400 });
      }

      const fileType = file.type.startsWith("image/") ? "image" : "video";
      const folder = String(formData.get("folder") ?? "products");
      const safeName = `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;

      let url: string;

      // Use Vercel Blob if token is configured, otherwise return error
      const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
      if (blobToken) {
        const { put } = await import("@vercel/blob");
        const blob = await put(safeName, file, { access: "public", token: blobToken });
        url = blob.url;
      } else {
        // Fallback: return error instructing to set up Vercel Blob
        return NextResponse.json({
          error: "File upload requires BLOB_READ_WRITE_TOKEN. Add a URL manually or set up Vercel Blob in your project settings."
        }, { status: 503 });
      }

      const media = await Media.create({
        filename: safeName,
        originalName: file.name,
        url,
        type: fileType,
        mimeType: file.type,
        size: file.size,
        alt: String(formData.get("alt") ?? ""),
        folder,
        uploadedBy: user.id
      });

      return NextResponse.json({ media, url }, { status: 201 });
    }

    // JSON body — save a URL-based media record
    const body = await req.json();
    if (!body.url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

    const media = await Media.create({
      ...body,
      type: body.type ?? "image",
      uploadedBy: user.id
    });
    return NextResponse.json({ media, url: body.url }, { status: 201 });
  } catch (err: any) {
    console.error("[POST media]", err);
    return NextResponse.json({ error: err.message ?? "Server error" }, { status: 500 });
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

    // Also delete from Vercel Blob if configured
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    if (blobToken && ids?.length) {
      try {
        const { del } = await import("@vercel/blob");
        const items = await Media.find({ _id: { $in: ids } }).select("url").lean();
        const blobUrls = items.map((m) => m.url).filter((u) => u.includes("vercel-storage.com") || u.includes("blob.vercel-storage"));
        if (blobUrls.length) await del(blobUrls, { token: blobToken });
      } catch { /* blob delete errors are non-fatal */ }
    }

    await Media.deleteMany({ _id: { $in: ids } });
    return NextResponse.json({ message: "Deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Server error" }, { status: 500 });
  }
}
