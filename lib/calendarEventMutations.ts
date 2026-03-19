import type { CalendarEventPayload } from "@/types";

type CreateCalendarEvent = (
  payload: CalendarEventPayload
) => Promise<{ eventId: string }>;

type UpdateCalendarEvent = (
  eventId: string,
  payload: CalendarEventPayload
) => Promise<unknown>;

export const upsertCalendarEvent = async ({
  existingEventId,
  payload,
  createEvent,
  updateEvent,
}: {
  existingEventId?: string | null;
  payload: CalendarEventPayload;
  createEvent: CreateCalendarEvent;
  updateEvent: UpdateCalendarEvent;
}) => {
  if (existingEventId) {
    await updateEvent(existingEventId, payload);
    return { eventId: existingEventId };
  }

  return createEvent(payload);
};
