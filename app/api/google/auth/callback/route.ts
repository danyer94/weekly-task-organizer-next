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
    request.headers.get("referer")?.split("/").slice(0, 3).join("/") ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  // Validate environment variables first
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error("Google Callback: Missing OAuth credentials", {
      hasClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    });
    return NextResponse.redirect(`${origin}/?google=config_error`);
  }

  if (errorFromGoogle) {
    console.error("Google Callback: Error from Google OAuth", {
      error: errorFromGoogle,
    });
    return NextResponse.redirect(`${origin}/?google=error&reason=${encodeURIComponent(errorFromGoogle)}`);
  }

  if (!code || !signedState) {
    console.error("Google Callback: Missing required parameters", {
      hasCode: !!code,
      hasState: !!signedState,
    });
    return NextResponse.redirect(`${origin}/?google=missing_info`);
  }

  try {
    // Verify the signed state to prevent tampering
    const uid = verifySignedState(signedState);
    if (!uid) {
      console.error("Google Callback: Invalid or tampered state parameter", {
        stateLength: signedState.length,
        hasStateSecret: !!process.env.STATE_SECRET,
        hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      });
      return NextResponse.redirect(`${origin}/?google=invalid_state`);
    }

    console.log("Google Callback: Received request", {
      uid,
      hasCode: !!code,
      codeLength: code.length,
    });

    const tokens = await exchangeCodeForTokens(code);
    console.log("Google Callback: Tokens exchanged successfully for UID:", uid, {
      hasAccessToken: !!tokens.accessToken,
      hasRefreshToken: !!tokens.refreshToken,
      expiryDate: tokens.expiryDate,
    });

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
      code: error.code,
      response: error.response?.data,
      signedState: signedState?.substring(0, 20) + "...",
      stack: error.stack,
      env: {
        hasClientId: !!process.env.GOOGLE_CLIENT_ID,
        hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: process.env.GOOGLE_REDIRECT_URI,
        hasStateSecret: !!process.env.STATE_SECRET,
      },
    });
    
    // Provide more specific error information
    let errorType = "callback_error";
    if (error.message?.includes("redirect_uri_mismatch")) {
      errorType = "redirect_mismatch";
    } else if (error.message?.includes("invalid_grant") || error.code === "400") {
      errorType = "invalid_grant";
    } else if (error.message?.includes("invalid_client")) {
      errorType = "invalid_client";
    }
    
    return NextResponse.redirect(`${origin}/?google=${errorType}&details=${encodeURIComponent(error.message || "Unknown error")}`);
  }
}
