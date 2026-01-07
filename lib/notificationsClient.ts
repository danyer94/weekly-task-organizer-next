import type { NotificationChannel } from "@/types";
import { auth } from "@/lib/firebase";

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

export interface DailySummaryResponse {
  success: boolean;
  dateKey: string;
  weekday: string;
  total: number;
  completed: number;
  results: Array<{
    channel: NotificationChannel;
    to: string;
    provider: string;
    messageId?: string;
  }>;
  skipped?: boolean;
  reason?: string;
}

export const sendDailySummary = async (
  date?: string,
  channels?: NotificationChannel[],
  force: boolean = true
): Promise<DailySummaryResponse> => {
  const headers = await getAuthHeaders();
  const res = await fetch("/api/notifications/daily", {
    method: "POST",
    headers,
    body: JSON.stringify({
      date,
      channels,
      force,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to send daily summary");
  }

  return (await res.json()) as DailySummaryResponse;
};

export const sendDailySummaryAuto = async (): Promise<DailySummaryResponse> => {
  const headers = await getAuthHeaders();
  const res = await fetch("/api/notifications/daily?force=false", {
    method: "GET",
    headers,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to send daily summary");
  }

  return (await res.json()) as DailySummaryResponse;
};
