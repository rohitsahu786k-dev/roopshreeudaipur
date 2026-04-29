import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { defaultShippingZones, roopShreeBusiness } from "@/lib/business";
import { connectToDatabase } from "@/lib/mongodb";
import { StoreSetting } from "@/models/StoreSetting";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();
    const settings = await getOrCreateSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load store settings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();
    const body = await request.json();
    const settings = await StoreSetting.findOneAndUpdate({ key: "default" }, { ...body, key: "default" }, {
      new: true,
      upsert: true,
      runValidators: true
    }).lean();

    return NextResponse.json({ settings });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save store settings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function getOrCreateSettings() {
  const existing = await StoreSetting.findOne({ key: "default" }).lean();
  if (existing) return existing;

  return StoreSetting.create({
    key: "default",
    storeName: roopShreeBusiness.name,
    instagramUrl: roopShreeBusiness.instagramUrl,
    defaultSeo: {
      keywords: roopShreeBusiness.seoKeywords
    },
    socialLinks: [{ label: "Instagram", url: roopShreeBusiness.instagramUrl }],
    shippingZones: defaultShippingZones,
    cart: {
      freeShippingThreshold: 2999,
      suggestedCoupons: ["ROOP10", "SHIPFREE", "BRIDAL1500"],
      giftWrapThreshold: 12000
    }
  });
}
