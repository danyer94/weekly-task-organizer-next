import { NextRequest, NextResponse } from "next/server";
import { getAuthorizedClientForUser } from "@/lib/googleCalendar";

import { getUidFromRequest } from "@/lib/firebaseAdmin";

export async function GET(request: NextRequest) {
  try {
    const uid = await getUidFromRequest(request);
    console.log("Google Status: Checking for UID ->", uid);

    if (!uid) {
      console.warn("Google Status: No UID found in request headers");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await getAuthorizedClientForUser(uid);
    const connected = !!client;
    console.log("Google Status: Connected ->", connected, "for UID", uid);
    return NextResponse.json({ connected });
  } catch (error: any) {
    console.error("Google Status: ERROR", {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { connected: false, error: error.message },
      { status: 500 }
    );
  }
}
