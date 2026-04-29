import { NextResponse, type NextRequest } from "next/server";
import { createGoKwikCheckout } from "@/lib/gokwik";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const response = await createGoKwikCheckout(payload);
    return NextResponse.json({ response });
  } catch (error) {
    const message = error instanceof Error ? error.message : "GoKwik request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
