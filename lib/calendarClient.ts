import { auth } from "@/lib/firebase";
import { CalendarEventPayload } from "@/types";

// Lightweight client used in client components to
// talk to the API routes related to Google Calendar.

const getAuthHeaders = async () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }
  const token = await user.getIdToken();
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export const connectGoogleCalendar = async () => {
  const headers = await getAuthHeaders();
  const res = await fetch("/api/google/auth/url", { headers });
  if (!res.ok) {
    throw new Error("Failed to get Google auth URL");
  }
  const data = (await res.json()) as { url: string };
  if (!data.url) {
    throw new Error("No auth URL returned");
  }
  window.location.href = data.url;
};

export const getGoogleConnectionStatus = async (): Promise<boolean> => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch("/api/google/status", { headers });
    if (!res.ok) return false;
    const data = (await res.json()) as { connected: boolean };
    return !!data.connected;
  } catch {
    return false;
  }
};

export const createTaskEventForRamon = async (
  payload: CalendarEventPayload
): Promise<{ eventId: string }> => {
  const headers = await getAuthHeaders();
  const res = await fetch("/api/google/calendar/events", {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to create calendar event");
  }

  const data = (await res.json()) as { event: { id: string } };
  return { eventId: data.event.id };
};

export const deleteTaskEventForRamon = async (
  eventId: string
): Promise<void> => {
  const headers = await getAuthHeaders();
  const res = await fetch(
    `/api/google/calendar/events?eventId=${encodeURIComponent(eventId)}`,
    {
      method: "DELETE",
      headers,
    }
  );

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to delete calendar event");
  }
};

export const updateTaskEventForRamon = async (
  eventId: string,
  payload: CalendarEventPayload
): Promise<{ eventId: string }> => {
  const headers = await getAuthHeaders();
  const res = await fetch("/api/google/calendar/events", {
    method: "PATCH",
    headers,
    body: JSON.stringify({ eventId, ...payload }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to update calendar event");
  }

  const data = (await res.json()) as { event: { id: string } };
  return { eventId: data.event.id };
};

export interface SyncEvent {
  eventId: string;
  taskId: string;
  day: string;
}

export interface SyncResult {
  eventId: string;
  taskId: string;
  day: string;
  exists: boolean;
  deleted?: boolean;
  updated?: {
    date: string;
    startTime?: string;
    endTime?: string;
    lastModified: number | null;
  };
  error?: string;
}

export const syncCalendarEvents = async (
  events: SyncEvent[]
): Promise<{ results: SyncResult[] }> => {
  const headers = await getAuthHeaders();
  const res = await fetch("/api/google/calendar/sync", {
    method: "POST",
    headers,
    body: JSON.stringify({ events }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to sync calendar events");
  }

  return await res.json();
};
