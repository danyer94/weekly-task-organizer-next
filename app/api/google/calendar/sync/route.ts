import { NextRequest, NextResponse } from "next/server";
import { getGoogleCalendarEvent } from "@/lib/googleCalendar";
import { database } from "@/lib/firebase";
import { ref, get } from "firebase/database";

const RAMON_USER_ID = "ramon";

/**
 * Sync endpoint that checks if calendar events still exist in Google Calendar
 * and returns sync status for each event.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      events: Array<{ eventId: string; taskId: number; day: string }>;
    };

    if (!body.events || !Array.isArray(body.events)) {
      return NextResponse.json(
        { error: "Missing or invalid events array" },
        { status: 400 }
      );
    }

    const syncResults = await Promise.all(
      body.events.map(async ({ eventId, taskId, day }) => {
        try {
          const event = await getGoogleCalendarEvent(RAMON_USER_ID, eventId);
          
          if (!event) {
            // Event was deleted from Google Calendar
            return {
              eventId,
              taskId,
              day,
              exists: false,
              deleted: true,
            };
          }

          // Event exists, check if it was modified
          const lastModified = event.updated
            ? new Date(event.updated).getTime()
            : null;

          // Extract time information from event
          let startTime: string | undefined;
          let endTime: string | undefined;
          let date: string;

          if (event.start?.dateTime) {
            // Timed event
            const start = new Date(event.start.dateTime);
            const end = event.end?.dateTime ? new Date(event.end.dateTime) : null;
            
            date = start.toISOString().split("T")[0];
            startTime = `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`;
            if (end) {
              endTime = `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`;
            }
          } else if (event.start?.date) {
            // All-day event
            date = event.start.date;
            startTime = undefined;
            endTime = undefined;
          } else {
            return {
              eventId,
              taskId,
              day,
              exists: true,
              error: "Invalid event format",
            };
          }

          return {
            eventId,
            taskId,
            day,
            exists: true,
            deleted: false,
            updated: {
              date,
              startTime,
              endTime,
              lastModified,
            },
          };
        } catch (error: any) {
          return {
            eventId,
            taskId,
            day,
            exists: false,
            error: error.message || "Failed to check event",
          };
        }
      })
    );

    return NextResponse.json({ results: syncResults });
  } catch (error) {
    console.error("Failed to sync calendar events", error);
    return NextResponse.json(
      { error: "Failed to sync calendar events" },
      { status: 500 }
    );
  }
}

