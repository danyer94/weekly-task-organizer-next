export type Priority = "high" | "medium" | "low";

export type Day =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  /**
   * Optional calendar event information.
   * If present, indicates this task has been added to Google Calendar.
   */
  calendarEvent?: {
    eventId: string; // Google Calendar event ID
    date: string; // YYYY-MM-DD
    startTime?: string | null; // HH:mm format
    endTime?: string | null; // HH:mm format
    lastSynced?: number | null; // Timestamp of last sync
  } | null;
}

export type TasksByDay = {
  [key in Day]?: Task[];
};

export interface GroupedTasks {
  high: { task: Task; index: number }[];
  medium: { task: Task; index: number }[];
  low: { task: Task; index: number }[];
}

// Minimal payload used to create calendar events (Google Calendar or via MCP)
export interface CalendarEventPayload {
  /**
   * Human readable title for the event.
   * For now we will usually map this from a task text.
   */
  summary: string;
  /**
   * Optional longer description.
   */
  description?: string;
  /**
   * Event date in ISO format YYYY-MM-DD.
   */
  date: string;
  /**
   * Optional start time in HH:mm format (24-hour).
   * If provided, the event will have a specific time instead of being all-day.
   */
  startTime?: string;
  /**
   * Optional end time in HH:mm format (24-hour).
   * If not provided and startTime is set, defaults to 1 hour after startTime.
   */
  endTime?: string;
  /**
   * Optional timezone for the event (e.g., 'America/New_York').
   * If not provided, defaults to UTC on the server.
   */
  timeZone?: string;
}

export type NotificationChannel = "email" | "whatsapp" | "sms";

export interface NotificationRequest {
  channel: NotificationChannel;
  to: string;
  message: string;
  subject?: string;
}

export interface NotificationResult {
  provider: "smtp" | "twilio";
  messageId?: string;
}
