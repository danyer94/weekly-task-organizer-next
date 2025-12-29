import { NextRequest, NextResponse } from "next/server";
import type { NotificationRequest } from "@/types";
import { sendNotification } from "@/lib/notifications";

export const runtime = "nodejs";

const VALID_CHANNELS = new Set(["email", "whatsapp", "sms"]);

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<NotificationRequest>;

    if (!body.channel || !VALID_CHANNELS.has(body.channel)) {
      return NextResponse.json(
        { error: "Invalid channel (email, whatsapp, sms)" },
        { status: 400 }
      );
    }

    if (!body.to || !body.message) {
      return NextResponse.json(
        { error: "Missing required fields: to, message" },
        { status: 400 }
      );
    }

    const result = await sendNotification({
      channel: body.channel,
      to: body.to,
      message: body.message,
      subject: body.subject,
    });

    return NextResponse.json({
      success: true,
      provider: result.provider,
      messageId: result.messageId,
    });
  } catch (error) {
    console.error("Failed to send notification", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}
