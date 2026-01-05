import { NextRequest, NextResponse } from "next/server";
import { getUserTokens } from "@/lib/googleCalendar";

import { getUidFromRequest } from "@/lib/firebaseAdmin";

export async function GET(request: NextRequest) {
  try {
    const uid = await getUidFromRequest(request);
    if (!uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const tokens = await getUserTokens(uid);
    const connected = !!tokens?.accessToken;
    return NextResponse.json({ connected });
  } catch (error) {
    console.error("Failed to read Google auth status", error);
    return NextResponse.json({ connected: false }, { status: 500 });
  }
}
