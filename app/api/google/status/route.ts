import { NextRequest, NextResponse } from "next/server";
import { getUserTokens } from "@/lib/googleCalendar";

const RAMON_USER_ID = "ramon";

export async function GET(_request: NextRequest) {
  try {
    const tokens = await getUserTokens(RAMON_USER_ID);
    const connected = !!tokens?.accessToken;
    return NextResponse.json({ connected });
  } catch (error) {
    console.error("Failed to read Google auth status", error);
    return NextResponse.json({ connected: false }, { status: 500 });
  }
}


