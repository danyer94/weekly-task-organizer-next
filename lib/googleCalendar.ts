import { google } from "googleapis";
import type { OAuth2Client } from "google-auth-library";
import { database } from "@/lib/firebase";
import { ref, get, set } from "firebase/database";
import { CalendarEventPayload } from "@/types";
import crypto from "crypto";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// Secret key for signing state parameter (use a strong random secret in production)
const STATE_SECRET =
  process.env.STATE_SECRET ||
  GOOGLE_CLIENT_SECRET ||
  "default-secret-change-in-production";

// You should set this to the full URL of your callback in production.
const DEFAULT_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI ||
  "http://localhost:3000/api/google/auth/callback";

const GOOGLE_SCOPES = ["https://www.googleapis.com/auth/calendar.events"];

export interface GoogleAuthInfo {
  accessToken: string;
  refreshToken?: string;
  expiryDate?: number;
}

const getGoogleAuthRef = (userId: string) =>
  ref(database, `users/${userId}/googleAuth`);

/**
 * Signs a state parameter (UID) to prevent tampering.
 * Returns a signed token in the format: base64(uid).signature
 */
const signState = (uid: string): string => {
  const hmac = crypto.createHmac("sha256", STATE_SECRET);
  hmac.update(uid);
  const signature = hmac.digest("base64url");
  const encodedUid = Buffer.from(uid).toString("base64url");
  return `${encodedUid}.${signature}`;
};

/**
 * Verifies and extracts the UID from a signed state parameter.
 * Returns the UID if valid, null otherwise.
 */
const verifyState = (signedState: string): string | null => {
  try {
    const [encodedUid, signature] = signedState.split(".");
    if (!encodedUid || !signature) {
      return null;
    }

    const uid = Buffer.from(encodedUid, "base64url").toString("utf-8");
    const hmac = crypto.createHmac("sha256", STATE_SECRET);
    hmac.update(uid);
    const expectedSignature = hmac.digest("base64url");

    // Use timing-safe comparison to prevent timing attacks
    if (
      !crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      )
    ) {
      return null;
    }

    return uid;
  } catch (error) {
    console.error("Error verifying state:", error);
    return null;
  }
};

export const getOAuthClient = (): OAuth2Client => {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error("Google OAuth credentials are not configured");
  }

  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    DEFAULT_REDIRECT_URI
  );
};

export const getAuthUrl = (uid: string): string => {
  const client = getOAuthClient();
  // Sign the UID to prevent tampering
  const signedState = signState(uid);
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: GOOGLE_SCOPES,
    state: signedState,
  });
};

/**
 * Verifies a signed state parameter and returns the UID if valid.
 * This should be used in the OAuth callback to ensure the state hasn't been tampered with.
 */
export const verifySignedState = (signedState: string): string | null => {
  return verifyState(signedState);
};

export const exchangeCodeForTokens = async (
  code: string
): Promise<GoogleAuthInfo> => {
  const client = getOAuthClient();
  const { tokens } = await client.getToken(code);

  if (!tokens.access_token) {
    throw new Error("No access token returned from Google");
  }

  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiryDate: tokens.expiry_date ?? undefined,
  };
};

export const saveUserTokens = async (
  userId: string,
  tokens: GoogleAuthInfo
): Promise<void> => {
  await set(getGoogleAuthRef(userId), tokens);
};

export const getUserTokens = async (
  userId: string
): Promise<GoogleAuthInfo | null> => {
  const snapshot = await get(getGoogleAuthRef(userId));
  if (!snapshot.exists()) return null;
  const raw = snapshot.val();

  // Normalize both snake_case (legacy) and camelCase (new)
  return {
    accessToken: raw.accessToken || raw.access_token,
    refreshToken: raw.refreshToken || raw.refresh_token,
    expiryDate: raw.expiryDate || raw.expiry_date,
  };
};

/**
 * Ensure we have a valid OAuth2 client for the given user.
 * If the access token is expired and we have a refresh token,
 * we will attempt to refresh it and persist the new tokens.
 */
export const getAuthorizedClientForUser = async (
  userId: string
): Promise<OAuth2Client | null> => {
  const tokens = await getUserTokens(userId);
  if (!tokens) return null;

  const client = getOAuthClient();
  client.setCredentials({
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
    expiry_date: tokens.expiryDate,
  });

  // Refresh token if it's close to expiry and we have a refresh token
  if (
    tokens.refreshToken &&
    tokens.expiryDate &&
    tokens.expiryDate <= Date.now() + 60_000
  ) {
    try {
      const { credentials } = await client.refreshAccessToken();
      if (credentials.access_token) {
        const updated: GoogleAuthInfo = {
          accessToken: credentials.access_token,
          refreshToken: credentials.refresh_token ?? tokens.refreshToken,
          expiryDate: credentials.expiry_date ?? Date.now() + 60 * 60 * 1000,
        };
        await saveUserTokens(userId, updated);
        client.setCredentials({
          access_token: updated.accessToken,
          refresh_token: updated.refreshToken,
          expiry_date: updated.expiryDate,
        });
      }
    } catch (error: any) {
      console.error("Failed to refresh Google access token", error);
      // If the error is 'invalid_grant', the refresh token is dead.
      // We should return null to indicate the connection is no longer valid.
      if (error.message?.includes("invalid_grant") || error.code === "400") {
        return null;
      }
      // For other errors (network?), we can still try to return the client
      // with existing tokens, though it's likely to fail downstream.
    }
  }

  return client;
};

export const deleteGoogleCalendarEvent = async (
  userId: string,
  eventId: string
): Promise<void> => {
  const client = await getAuthorizedClientForUser(userId);
  if (!client) {
    throw new Error("Google account is not connected for this user");
  }

  const calendar = google.calendar({ version: "v3", auth: client });

  try {
    await calendar.events.delete({
      calendarId: "primary",
      eventId: eventId,
    });
  } catch (error: any) {
    // If the event is already deleted (404) or gone (410), we can consider the deletion successful
    if (error.code === 404 || error.code === 410) {
      console.warn(
        `Event ${eventId} already deleted or not found in Google Calendar.`
      );
      return;
    }
    throw error;
  }
};

export const getGoogleCalendarEvent = async (
  userId: string,
  eventId: string
) => {
  const client = await getAuthorizedClientForUser(userId);
  if (!client) {
    throw new Error("Google account is not connected for this user");
  }

  const calendar = google.calendar({ version: "v3", auth: client });

  try {
    const response = await calendar.events.get({
      calendarId: "primary",
      eventId: eventId,
    });
    return response.data;
  } catch (error: any) {
    if (error.code === 404) {
      return null; // Event not found
    }
    throw error;
  }
};

export const listGoogleCalendarEvents = async (
  userId: string,
  timeMin?: string,
  timeMax?: string
) => {
  const client = await getAuthorizedClientForUser(userId);
  if (!client) {
    throw new Error("Google account is not connected for this user");
  }

  const calendar = google.calendar({ version: "v3", auth: client });

  const response = await calendar.events.list({
    calendarId: "primary",
    timeMin: timeMin || new Date().toISOString(),
    timeMax: timeMax,
    maxResults: 100,
    singleEvents: true,
    orderBy: "startTime",
  });

  return response.data.items || [];
};

export const createGoogleCalendarEventForUser = async (
  userId: string,
  payload: CalendarEventPayload
) => {
  const client = await getAuthorizedClientForUser(userId);
  if (!client) {
    throw new Error("Google account is not connected for this user");
  }

  const calendar = google.calendar({ version: "v3", auth: client });

  // If startTime is provided, create a timed event; otherwise, create an all-day event
  if (payload.startTime) {
    // Use the provided timezone or fall back to system timezone
    const eventTimeZone =
      payload.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Construct ISO string for local time (YYYY-MM-DDTHH:mm:ss)
    // We avoid using new Date() on the server to prevent UTC/Local conversion issues
    const formatDateTime = (dateStr: string, timeStr: string) => {
      return `${dateStr}T${timeStr}:00`;
    };

    const startDateTimeStr = formatDateTime(payload.date, payload.startTime);

    // Calculate end time
    let endDateTimeStr: string;
    if (payload.endTime) {
      endDateTimeStr = formatDateTime(payload.date, payload.endTime);
    } else {
      // Default to 1 hour after start
      const [hours, minutes] = payload.startTime.split(":").map(Number);
      const endHours = (hours + 1) % 24;
      const endHoursStr = String(endHours).padStart(2, "0");
      endDateTimeStr = formatDateTime(
        payload.date,
        `${endHoursStr}:${String(minutes).padStart(2, "0")}`
      );
    }

    const event = {
      summary: payload.summary,
      description: payload.description,
      start: {
        dateTime: startDateTimeStr,
        timeZone: eventTimeZone,
      },
      end: {
        dateTime: endDateTimeStr,
        timeZone: eventTimeZone,
      },
    };

    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
    });

    return response.data;
  } else {
    // All-day event (original behavior)
    const startDate = new Date(payload.date);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1);

    const event = {
      summary: payload.summary,
      description: payload.description,
      start: {
        date: payload.date,
      },
      end: {
        date: endDate.toISOString().split("T")[0],
      },
    };

    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
    });

    return response.data;
  }
};

export const updateGoogleCalendarEventForUser = async (
  userId: string,
  eventId: string,
  payload: CalendarEventPayload
) => {
  const client = await getAuthorizedClientForUser(userId);
  if (!client) {
    throw new Error("Google account is not connected for this user");
  }

  const calendar = google.calendar({ version: "v3", auth: client });

  if (payload.startTime) {
    const eventTimeZone =
      payload.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;

    const formatDateTime = (dateStr: string, timeStr: string) => {
      return `${dateStr}T${timeStr}:00`;
    };

    const startDateTimeStr = formatDateTime(payload.date, payload.startTime);

    let endDateTimeStr: string;
    if (payload.endTime) {
      endDateTimeStr = formatDateTime(payload.date, payload.endTime);
    } else {
      const [hours, minutes] = payload.startTime.split(":").map(Number);
      const endHours = (hours + 1) % 24;
      const endHoursStr = String(endHours).padStart(2, "0");
      endDateTimeStr = formatDateTime(
        payload.date,
        `${endHoursStr}:${String(minutes).padStart(2, "0")}`
      );
    }

    const event = {
      summary: payload.summary,
      description: payload.description,
      start: {
        dateTime: startDateTimeStr,
        timeZone: eventTimeZone,
      },
      end: {
        dateTime: endDateTimeStr,
        timeZone: eventTimeZone,
      },
    };

    const response = await calendar.events.patch({
      calendarId: "primary",
      eventId,
      requestBody: event,
    });

    return response.data;
  }

  const startDate = new Date(payload.date);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 1);

  const event = {
    summary: payload.summary,
    description: payload.description,
    start: {
      date: payload.date,
    },
    end: {
      date: endDate.toISOString().split("T")[0],
    },
  };

  const response = await calendar.events.patch({
    calendarId: "primary",
    eventId,
    requestBody: event,
  });

  return response.data;
};
