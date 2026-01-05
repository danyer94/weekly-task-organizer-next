import { NextRequest, NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/googleCalendar";

import { getUidFromRequest } from "@/lib/firebaseAdmin";

export async function GET(req: NextRequest) {
  try {
    console.log("Calendar Auth URL: Request received");
    const uid = await getUidFromRequest(req);
    console.log("Calendar Auth URL: UID retrieved ->", uid);

    if (!uid) {
      console.warn("Calendar Auth URL: No valid UID found in request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = getAuthUrl(uid);
    console.log("Calendar Auth URL: Successfully generated for UID", uid);
    return NextResponse.json({ url });
  } catch (error: any) {
    console.error("Calendar Auth URL: CRITICAL ERROR", {
      message: error.message,
      stack: error.stack,
      env: {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
        hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
      },
    });
    return NextResponse.json(
      { error: "Failed to generate Google auth URL", details: error.message },
      { status: 500 }
    );
  }
}
