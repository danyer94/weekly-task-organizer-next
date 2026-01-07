import { NextRequest, NextResponse } from "next/server";
import { CalendarEventPayload } from "@/types";
import {
  createGoogleCalendarEventForUser,
  deleteGoogleCalendarEvent,
  updateGoogleCalendarEventForUser,
} from "@/lib/googleCalendar";

import { getUidFromRequest } from "@/lib/firebaseAdmin";

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        { error: "Missing eventId parameter" },
        { status: 400 }
      );
    }

    const uid = await getUidFromRequest(request);
    if (!uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await deleteGoogleCalendarEvent(uid, eventId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete Google Calendar event:", error);
    return NextResponse.json(
      { error: "Failed to delete Google Calendar event" },
      { status: 500 }
    );
  }
}

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
      timeZone: body.timeZone,
    };

    const uid = await getUidFromRequest(request);
    if (!uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const event = await createGoogleCalendarEventForUser(uid, payload);

    return NextResponse.json({ event });
  } catch (error) {
    console.error("Failed to create Google Calendar event:", error);
    return NextResponse.json(
      { error: "Failed to create Google Calendar event" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<CalendarEventPayload> & {
      eventId?: string;
    };

    if (!body || !body.eventId || !body.summary || !body.date) {
      return NextResponse.json(
        { error: "Missing required fields: eventId, summary, date" },
        { status: 400 }
      );
    }

    const payload: CalendarEventPayload = {
      summary: body.summary,
      description: body.description,
      date: body.date,
      startTime: body.startTime,
      endTime: body.endTime,
      timeZone: body.timeZone,
    };

    const uid = await getUidFromRequest(request);
    if (!uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const event = await updateGoogleCalendarEventForUser(
      uid,
      body.eventId,
      payload
    );

    return NextResponse.json({ event });
  } catch (error) {
    console.error("Failed to update Google Calendar event:", error);
    return NextResponse.json(
      { error: "Failed to update Google Calendar event" },
      { status: 500 }
    );
  }
}
