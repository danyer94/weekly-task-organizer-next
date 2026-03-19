// @vitest-environment node

import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  authMock,
  databaseMock,
  getUidFromRequestMock,
  sendNotificationMock,
  getWeekPathMock,
} = vi.hoisted(() => ({
  authMock: vi.fn(),
  databaseMock: vi.fn(),
  getUidFromRequestMock: vi.fn(),
  sendNotificationMock: vi.fn(),
  getWeekPathMock: vi.fn(),
}));

vi.mock("firebase-admin", () => ({
  auth: authMock,
  database: databaseMock,
}));

vi.mock("@/lib/firebaseAdmin", () => ({
  getUidFromRequest: getUidFromRequestMock,
}));

vi.mock("@/lib/notifications", () => ({
  sendNotification: sendNotificationMock,
}));

vi.mock("@/lib/calendarMapper", () => ({
  getWeekPath: getWeekPathMock,
}));

const routePath = "./route";

const createSnapshot = (value: unknown) => ({
  exists: () => value !== null && value !== undefined,
  val: () => value,
});

describe("GET /api/notifications/daily", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.NOTIFICATIONS_TIME_ZONE = "America/New_York";
    process.env.NOTIFY_DAILY_HOUR = "9";
    process.env.NOTIFY_DAILY_MINUTE = "0";
    process.env.NOTIFY_DAILY_WEEKDAYS = "1,2,3,4,5";
    process.env.CRON_SECRET = "cron-secret";
    getWeekPathMock.mockReturnValue("weeks/2026/12");
  });

  afterEach(() => {
    delete process.env.CRON_SECRET;
  });

  it("rejects unauthenticated non-cron requests", async () => {
    getUidFromRequestMock.mockResolvedValue(null);

    const { GET } = await import(routePath);
    const response = await GET(
      new NextRequest("http://localhost/api/notifications/daily", {
        method: "GET",
      })
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
  });

  it("processes every enabled user for authorized cron requests", async () => {
    authMock.mockReturnValue({
      listUsers: vi.fn().mockResolvedValue({
        users: [{ uid: "user-a" }, { uid: "user-b" }],
        pageToken: undefined,
      }),
      getUser: vi.fn().mockImplementation(async (uid: string) => ({
        uid,
        email: `${uid}@example.com`,
      })),
    });

    const databaseEntries = new Map<string, unknown>([
      [
        "users/user-a/settings/notifications/dailySummary",
        {
          enabled: true,
          email: "user-a@example.com",
        },
      ],
      [
        "users/user-a/weeks/2026/12",
        {
          Wednesday: [
            {
              id: "task-1",
              text: "Review ops board",
              completed: false,
              priority: "high",
            },
          ],
        },
      ],
      [
        "users/user-b/settings/notifications/dailySummary",
        {
          enabled: false,
          email: "user-b@example.com",
        },
      ],
    ]);

    databaseMock.mockReturnValue({
      ref: (path: string) => ({
        get: async () => createSnapshot(databaseEntries.get(path)),
        update: async (value: Record<string, unknown>) => {
          const current = (databaseEntries.get(path) ?? {}) as Record<
            string,
            unknown
          >;
          databaseEntries.set(path, { ...current, ...value });
        },
      }),
    });

    sendNotificationMock.mockResolvedValue({
      provider: "smtp",
      messageId: "msg-1",
    });

    const { GET } = await import(routePath);
    const response = await GET(
      new NextRequest(
        "http://localhost/api/notifications/daily?date=2026-03-18",
        {
          method: "GET",
          headers: {
            authorization: "Bearer cron-secret",
          },
        }
      )
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      cron: true,
      processed: 1,
      sent: 1,
      skipped: 0,
      failed: 0,
    });
    expect(getUidFromRequestMock).not.toHaveBeenCalled();
    expect(sendNotificationMock).toHaveBeenCalledTimes(1);
    expect(sendNotificationMock).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: "email",
        to: "user-a@example.com",
        subject: "Daily Summary - Wednesday 2026-03-18",
      })
    );
  });
});
