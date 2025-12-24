import { google } from "googleapis";
import type { OAuth2Client } from "google-auth-library";
import { database } from "@/lib/firebase";
import { ref, get, set } from "firebase/database";
import { CalendarEventPayload } from "@/types";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

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
  ref(database, `googleAuth/${userId}`);

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

export const getAuthUrl = (): string => {
  const client = getOAuthClient();
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: GOOGLE_SCOPES,
  });
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
  return snapshot.val() as GoogleAuthInfo;
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
    } catch (error) {
      console.error("Failed to refresh Google access token", error);
      // We still return the client with old credentials; the caller can handle errors.
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
    // Parse the date string (YYYY-MM-DD) into local date components
    // This avoids UTC interpretation issues when creating the Date object
    const [year, month, day] = payload.date.split("-").map(Number);

    // Parse the time
    const [hours, minutes] = payload.startTime.split(":").map(Number);

    // Create date in local timezone (month is 0-indexed in Date constructor)
    const startDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);

    // Calculate end time (default to 1 hour after start if not provided)
    let endDateTime: Date;
    if (payload.endTime) {
      const [endHours, endMinutes] = payload.endTime.split(":").map(Number);
      // Create end date in local timezone
      endDateTime = new Date(year, month - 1, day, endHours, endMinutes, 0, 0);
    } else {
      endDateTime = new Date(startDateTime);
      endDateTime.setHours(startDateTime.getHours() + 1);
    }

    const event = {
      summary: payload.summary,
      description: payload.description,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
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
