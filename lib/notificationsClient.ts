import type { NotificationChannel } from "@/types";

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
}

export const sendDailySummary = async (
  date?: string,
  channels?: NotificationChannel[],
  force: boolean = true
): Promise<DailySummaryResponse> => {
  const res = await fetch("/api/notifications/daily", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
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
