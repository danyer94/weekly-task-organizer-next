import { NextRequest, NextResponse } from "next/server";
import { CalendarEventPayload } from "@/types";
import { createGoogleCalendarEventForUser } from "@/lib/googleCalendar";

// Usuario fijo para este proyecto
const RAMON_USER_ID = "ramon";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<CalendarEventPayload>;

    if (!body || !body.summary || !body.date) {
      return NextResponse.json(
        { error: "Missing required fields: summary, date" },
        { status: 400 }
      );
    }

    const payload: CalendarEventPayload = {
      summary: body.summary,
      description: body.description,
      date: body.date,
      startTime: body.startTime,
      endTime: body.endTime,
    };

    const event = await createGoogleCalendarEventForUser(
      RAMON_USER_ID,
      payload
    );

    return NextResponse.json({ event });
  } catch (error) {
    console.error("Failed to create Google Calendar event", error);
    return NextResponse.json(
      { error: "Failed to create Google Calendar event" },
      { status: 500 }
    );
  }
}
