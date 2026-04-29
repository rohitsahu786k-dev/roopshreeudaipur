import { NextResponse, type NextRequest } from "next/server";
import { pushOrderToShiprocket } from "@/lib/shiprocket";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const response = await pushOrderToShiprocket(payload);
    return NextResponse.json({ response });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Shiprocket request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
