import { NextRequest, NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/googleCalendar";

import { getUidFromRequest } from "@/lib/firebaseAdmin";

export async function GET(req: NextRequest) {
  try {
    const uid = await getUidFromRequest(req);
    if (!uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = getAuthUrl(uid);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Failed to generate Google auth URL", error);
    return NextResponse.json(
      { error: "Failed to generate Google auth URL" },
      { status: 500 }
    );
  }
}
