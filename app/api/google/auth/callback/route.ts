import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens, saveUserTokens } from "@/lib/googleCalendar";

// For now, we assume a single fixed user: Ramon.
const RAMON_USER_ID = "ramon";

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const errorFromGoogle = url.searchParams.get("error");
  const state = url.searchParams.get("state"); // This is the UID

  const origin =
    request.headers.get("origin") ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  if (errorFromGoogle) {
    return NextResponse.redirect(`${origin}/?google=error`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${origin}/?google=missing_info`);
  }

  try {
    console.log("Google Callback: Received request", {
      state,
      hasCode: !!code,
    });
    const tokens = await exchangeCodeForTokens(code);
    console.log(
      "Google Callback: Tokens exchanged successfully for state (UID):",
      state
    );
    await saveUserTokens(state, tokens);
    console.log(
      "Google Callback: Tokens saved successfully to users/" +
        state +
        "/googleAuth"
    );
    return NextResponse.redirect(`${origin}/?google=connected`);
  } catch (error: any) {
    console.error("Google Callback: FAILED", {
      message: error.message,
      state,
      stack: error.stack,
    });
    return NextResponse.redirect(`${origin}/?google=callback_error`);
  }
}
