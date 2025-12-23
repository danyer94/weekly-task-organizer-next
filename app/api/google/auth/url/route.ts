import { NextRequest, NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/googleCalendar";

export async function GET(_req: NextRequest) {
  try {
    const url = getAuthUrl();
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Failed to generate Google auth URL", error);
    return NextResponse.json(
      { error: "Failed to generate Google auth URL" },
      { status: 500 }
    );
  }
}
