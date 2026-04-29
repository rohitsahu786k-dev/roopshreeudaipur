import { NextResponse, type NextRequest } from "next/server";
import { sendContactEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 });
    }

    await sendContactEmail({
      name: String(name).trim(),
      email: String(email).trim(),
      message: String(message).trim()
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to send message";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
