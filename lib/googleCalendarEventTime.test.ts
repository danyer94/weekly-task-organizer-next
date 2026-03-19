import { describe, expect, it } from "vitest";

import { buildTimedEventRange } from "./googleCalendarEventTime";

describe("buildTimedEventRange", () => {
  it("rolls the default end time into the next day when needed", () => {
    expect(buildTimedEventRange("2026-03-18", "23:30")).toEqual({
      startDateTime: "2026-03-18T23:30:00",
      endDateTime: "2026-03-19T00:30:00",
    });
  });

  it("keeps explicit same-day end times unchanged", () => {
    expect(buildTimedEventRange("2026-03-18", "09:00", "10:15")).toEqual({
      startDateTime: "2026-03-18T09:00:00",
      endDateTime: "2026-03-18T10:15:00",
    });
  });
});
