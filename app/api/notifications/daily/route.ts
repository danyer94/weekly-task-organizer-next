import { NextRequest, NextResponse } from "next/server";
import { fetchTasksOnce } from "@/lib/firebase";
import { getWeekPath } from "@/lib/calendarMapper";
import { sendNotification } from "@/lib/notifications";
import type { Day, NotificationChannel, TasksByDay, Task } from "@/types";

export const runtime = "nodejs";

const TIME_ZONE = process.env.NOTIFICATIONS_TIME_ZONE || "America/New_York";
const NOTIFY_EMAIL_TO = process.env.NOTIFY_EMAIL_TO || "";
const NOTIFY_SMS_TO = process.env.NOTIFY_SMS_TO || "";
const NOTIFY_WHATSAPP_TO = process.env.NOTIFY_WHATSAPP_TO || "";

const DATE_PARAM_RE = /^\d{4}-\d{2}-\d{2}$/;

const getZonedDateInfo = (date: Date, timeZone: string) => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(date);
  const map: Record<string, string> = {};
  parts.forEach((part) => {
    if (part.type !== "literal") map[part.type] = part.value;
  });

  const dateKey = `${map.year}-${map.month}-${map.day}`;
  return {
    dateKey,
    weekday: map.weekday as Day,
  };
};

const parseDateParam = (value?: string | null) => {
  if (!value) return null;
  if (!DATE_PARAM_RE.test(value)) return null;
  return new Date(`${value}T12:00:00Z`);
};

const formatDailyMessage = (
  dayLabel: string,
  dateKey: string,
  tasks: Task[]
) => {
  if (!tasks.length) {
    return `Daily summary - ${dayLabel}, ${dateKey}\nNo tasks scheduled for today.`;
  }

  const completedCount = tasks.filter((task) => task.completed).length;
  const header = `Daily summary - ${dayLabel}, ${dateKey}`;
  const totals = `Total: ${tasks.length} | Completed: ${completedCount}`;

  const lines = tasks.map((task) => {
    const status = task.completed ? "[x]" : "[ ]";
    return `- ${status} (${task.priority}) ${task.text}`;
  });

  return [header, totals, "", ...lines].join("\n");
};

const getRecipients = () => {
  const recipients: { channel: NotificationChannel; to: string }[] = [];
  if (NOTIFY_EMAIL_TO) recipients.push({ channel: "email", to: NOTIFY_EMAIL_TO });
  if (NOTIFY_WHATSAPP_TO)
    recipients.push({ channel: "whatsapp", to: NOTIFY_WHATSAPP_TO });
  if (NOTIFY_SMS_TO) recipients.push({ channel: "sms", to: NOTIFY_SMS_TO });
  return recipients;
};

const parseChannelFilter = (value: unknown): NotificationChannel[] | null => {
  if (!value) return null;
  const raw =
    Array.isArray(value) ? value : String(value).split(",").map((s) => s.trim());
  const channels = raw.filter(Boolean);
  if (!channels.length) return null;
  return channels.filter((channel) =>
    ["email", "whatsapp", "sms"].includes(channel)
  ) as NotificationChannel[];
};

const sendDailySummary = async (params?: {
  date?: string | null;
  channels?: NotificationChannel[] | null;
}) => {
  const dateCandidate = params?.date
    ? parseDateParam(params.date)
    : null;
  const targetDate = dateCandidate || new Date();

  const { dateKey, weekday } = getZonedDateInfo(targetDate, TIME_ZONE);
  const weekDate = new Date(`${dateKey}T12:00:00Z`);
  const weekPath = getWeekPath(weekDate);
  const snapshot = (await fetchTasksOnce(weekPath)) as TasksByDay | null;
  const dayTasks = Array.isArray(snapshot?.[weekday])
    ? (snapshot?.[weekday] as Task[])
    : [];

  const message = formatDailyMessage(weekday, dateKey, dayTasks);
  const recipients = getRecipients();

  if (!recipients.length) {
    throw new Error("No notification recipients are configured");
  }

  const filter = params?.channels?.length ? params.channels : null;
  const selectedRecipients = filter
    ? recipients.filter((recipient) => filter.includes(recipient.channel))
    : recipients;

  if (!selectedRecipients.length) {
    throw new Error("No matching notification channels are configured");
  }

  const results = await Promise.all(
    selectedRecipients.map(async (recipient) => {
      const result = await sendNotification({
        channel: recipient.channel,
        to: recipient.to,
        message,
        subject: `Daily Summary - ${weekday} ${dateKey}`,
      });
      return {
        channel: recipient.channel,
        to: recipient.to,
        provider: result.provider,
        messageId: result.messageId,
      };
    })
  );

  return {
    dateKey,
    weekday,
    total: dayTasks.length,
    completed: dayTasks.filter((task) => task.completed).length,
    results,
  };
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const channels = parseChannelFilter(searchParams.get("channels"));
    const payload = await sendDailySummary({ date, channels });
    return NextResponse.json({ success: true, ...payload });
  } catch (error) {
    console.error("Failed to send daily summary", error);
    return NextResponse.json(
      { error: "Failed to send daily summary" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      date?: string;
      channels?: NotificationChannel[] | string;
    };

    const channels = parseChannelFilter(body?.channels);
    const payload = await sendDailySummary({
      date: body?.date,
      channels,
    });

    return NextResponse.json({ success: true, ...payload });
  } catch (error) {
    console.error("Failed to send daily summary", error);
    return NextResponse.json(
      { error: "Failed to send daily summary" },
      { status: 500 }
    );
  }
}
