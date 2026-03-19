import { describe, expect, it, vi } from "vitest";

import type { CalendarEventPayload } from "@/types";

import { upsertCalendarEvent } from "./calendarEventMutations";

const payload: CalendarEventPayload = {
  summary: "Weekly review",
  date: "2026-03-18",
  startTime: "09:00",
  endTime: "10:00",
};

describe("upsertCalendarEvent", () => {
  it("updates existing events instead of recreating them", async () => {
    const createEvent = vi.fn();
    const updateEvent = vi.fn().mockResolvedValue(undefined);

    await expect(
      upsertCalendarEvent({
        existingEventId: "event-1",
        payload,
        createEvent,
        updateEvent,
      })
    ).resolves.toEqual({ eventId: "event-1" });

    expect(updateEvent).toHaveBeenCalledWith("event-1", payload);
    expect(createEvent).not.toHaveBeenCalled();
  });

  it("creates new events when the task has no linked event yet", async () => {
    const createEvent = vi.fn().mockResolvedValue({ eventId: "event-2" });
    const updateEvent = vi.fn();

    await expect(
      upsertCalendarEvent({
        payload,
        createEvent,
        updateEvent,
      })
    ).resolves.toEqual({ eventId: "event-2" });

    expect(createEvent).toHaveBeenCalledWith(payload);
    expect(updateEvent).not.toHaveBeenCalled();
  });
});
