import { CalendarEventPayload } from "@/types";

// Cliente ligero que se usa en componentes de cliente para
// hablar con las rutas API relacionadas con Google Calendar.

export const connectGoogleCalendar = async () => {
  const res = await fetch("/api/google/auth/url");
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
    const res = await fetch("/api/google/status");
    if (!res.ok) return false;
    const data = (await res.json()) as { connected: boolean };
    return !!data.connected;
  } catch {
    return false;
  }
};

export const createTaskEventForRamon = async (
  payload: CalendarEventPayload
): Promise<void> => {
  const res = await fetch("/api/google/calendar/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to create calendar event");
  }
};


