import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { adminDb, getUidFromRequest } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

const INVALID_USERNAME_RE = /[.#$\[\]\/]/;

type UsernameRecord = {
  uid?: string;
  email?: string;
  createdAt?: number;
  updatedAt?: number;
};

const normalizeUsername = (value: string) => value.trim().toLowerCase();

const parseUsername = (value: unknown) => {
  if (typeof value !== "string") return null;
  const normalized = normalizeUsername(value);
  if (!normalized || INVALID_USERNAME_RE.test(normalized)) return null;
  return normalized;
};

const toUsernameRecord = (value: unknown): UsernameRecord => {
  if (typeof value === "string") {
    return { email: value };
  }
  if (!value || typeof value !== "object") {
    return {};
  }
  return value as UsernameRecord;
};

const jsonResponse = (
  body: Record<string, unknown>,
  status: number
) =>
  NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const username = parseUsername(body?.username);
    const password = typeof body?.password === "string" ? body.password : "";

    if (!username || !password) {
      return jsonResponse(
        {
          error: "Invalid credentials",
          code: "auth/invalid-credential",
        },
        400
      );
    }

    const usernameRef = adminDb.ref(`usernames/${username}`);
    const snapshot = await usernameRef.get();
    if (!snapshot.exists()) {
      return jsonResponse(
        {
          error: "Invalid credentials",
          code: "auth/invalid-credential",
        },
        401
      );
    }

    const record = toUsernameRecord(snapshot.val());
    let uid = typeof record.uid === "string" ? record.uid : null;
    let email = typeof record.email === "string" ? record.email : null;
    const createdAt =
      typeof record.createdAt === "number" ? record.createdAt : undefined;

    if (!uid && email) {
      try {
        const user = await admin.auth().getUserByEmail(email);
        uid = user.uid;
        email = user.email ?? email;
        await usernameRef.set({
          uid,
          createdAt: createdAt ?? Date.now(),
          updatedAt: Date.now(),
        });
      } catch {
        return jsonResponse(
          {
            error: "Invalid credentials",
            code: "auth/invalid-credential",
          },
          401
        );
      }
    }

    if (!uid) {
      return jsonResponse(
        {
          error: "Invalid credentials",
          code: "auth/invalid-credential",
        },
        401
      );
    }

    if (!email) {
      try {
        const user = await admin.auth().getUser(uid);
        email = user.email ?? null;
      } catch {
        return jsonResponse(
          {
            error: "Invalid credentials",
            code: "auth/invalid-credential",
          },
          401
        );
      }
    }

    if (!email) {
      return jsonResponse(
        {
          error: "Invalid credentials",
          code: "auth/invalid-credential",
        },
        401
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) {
      return jsonResponse(
        {
          error: "Firebase API key is not configured.",
        },
        500
      );
    }

    const authResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true,
        }),
      }
    );

    if (!authResponse.ok) {
      return jsonResponse(
        {
          error: "Invalid credentials",
          code: "auth/invalid-credential",
        },
        401
      );
    }

    const authData = (await authResponse.json()) as { localId?: string };
    if (authData.localId && authData.localId !== uid) {
      return jsonResponse(
        {
          error: "Invalid credentials",
          code: "auth/invalid-credential",
        },
        401
      );
    }

    const customToken = await admin.auth().createCustomToken(uid);
    return NextResponse.json(
      { token: customToken },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Username login failed", error);
    return jsonResponse(
      {
        error: "Failed to sign in with username",
      },
      500
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const uid = await getUidFromRequest(request);
    if (!uid) {
      return jsonResponse(
        {
          error: "Unauthorized",
          code: "auth/unauthorized",
        },
        401
      );
    }

    const body = await request.json().catch(() => null);
    const username = parseUsername(body?.username);
    if (!username) {
      return jsonResponse(
        {
          error: "Invalid username",
          code: "auth/invalid-username",
        },
        400
      );
    }

    const user = await admin.auth().getUser(uid);
    const userEmail = user.email?.toLowerCase() ?? null;
    const usernameRef = adminDb.ref(`usernames/${username}`);
    const now = Date.now();

    const result = await usernameRef.transaction(
      (current) => {
        if (current && typeof current === "object" && "uid" in current) {
          const currentUid = (current as { uid?: unknown }).uid;
          if (typeof currentUid === "string" && currentUid !== uid) {
            return;
          }
        }

        if (typeof current === "string") {
          if (!userEmail || current.toLowerCase() !== userEmail) {
            return;
          }
        }

        if (
          current &&
          typeof current === "object" &&
          "email" in current &&
          typeof (current as { email?: unknown }).email === "string"
        ) {
          const currentEmail = (
            current as { email?: string }
          ).email?.toLowerCase();
          if (!userEmail || currentEmail !== userEmail) {
            return;
          }
        }

        const createdAt =
          current &&
          typeof current === "object" &&
          typeof (current as { createdAt?: unknown }).createdAt === "number"
            ? (current as { createdAt: number }).createdAt
            : now;

        return { uid, createdAt, updatedAt: now };
      },
      undefined,
      false
    );

    if (!result.committed) {
      return jsonResponse(
        {
          error: "Username already taken",
          code: "auth/username-taken",
        },
        409
      );
    }

    return NextResponse.json(
      { ok: true, username },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Username claim failed", error);
    return jsonResponse(
      {
        error: "Failed to claim username",
      },
      500
    );
  }
}
