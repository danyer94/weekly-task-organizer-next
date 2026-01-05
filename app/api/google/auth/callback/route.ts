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
    const tokens = await exchangeCodeForTokens(code);
    await saveUserTokens(state, tokens);
    return NextResponse.redirect(`${origin}/?google=connected`);
  } catch (error) {
    console.error("Failed to handle Google OAuth callback", error);
    return NextResponse.redirect(`${origin}/?google=callback_error`);
  }
}
