import { NextRequest, NextResponse } from "next/server";
import {
  exchangeCodeForTokens,
  saveUserTokens,
  verifySignedState,
} from "@/lib/googleCalendar";

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const errorFromGoogle = url.searchParams.get("error");
  const signedState = url.searchParams.get("state"); // This is a signed token containing the UID

  const origin =
    request.headers.get("origin") ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  if (errorFromGoogle) {
    return NextResponse.redirect(`${origin}/?google=error`);
  }

  if (!code || !signedState) {
    return NextResponse.redirect(`${origin}/?google=missing_info`);
  }

  try {
    // Verify the signed state to prevent tampering
    const uid = verifySignedState(signedState);
    if (!uid) {
      console.error("Google Callback: Invalid or tampered state parameter");
      return NextResponse.redirect(`${origin}/?google=invalid_state`);
    }

    console.log("Google Callback: Received request", {
      uid,
      hasCode: !!code,
    });

    const tokens = await exchangeCodeForTokens(code);
    console.log("Google Callback: Tokens exchanged successfully for UID:", uid);

    // Only save tokens if the state was valid
    await saveUserTokens(uid, tokens);
    console.log(
      "Google Callback: Tokens saved successfully to users/" +
        uid +
        "/googleAuth"
    );
    return NextResponse.redirect(`${origin}/?google=connected`);
  } catch (error: any) {
    console.error("Google Callback: FAILED", {
      message: error.message,
      signedState,
      stack: error.stack,
    });
    return NextResponse.redirect(`${origin}/?google=callback_error`);
  }
}
