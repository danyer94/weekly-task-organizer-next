// @vitest-environment node

import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const { getUidFromRequestMock, sendNotificationMock } = vi.hoisted(() => ({
  getUidFromRequestMock: vi.fn(),
  sendNotificationMock: vi.fn(),
}));

vi.mock("@/lib/firebaseAdmin", () => ({
  getUidFromRequest: getUidFromRequestMock,
}));

vi.mock("@/lib/notifications", () => ({
  sendNotification: sendNotificationMock,
}));

import { POST } from "./route";

const createRequest = (body: unknown, headers?: HeadersInit) =>
  new NextRequest("http://localhost/api/notifications", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json",
      ...headers,
    },
  });

describe("POST /api/notifications", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unauthenticated requests", async () => {
    getUidFromRequestMock.mockResolvedValue(null);

    const response = await POST(
      createRequest({
        channel: "email",
        to: "user@example.com",
        message: "hello",
      })
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
    expect(sendNotificationMock).not.toHaveBeenCalled();
  });

  it("sends notifications for authenticated requests", async () => {
    getUidFromRequestMock.mockResolvedValue("user-123");
    sendNotificationMock.mockResolvedValue({
      provider: "smtp",
      messageId: "msg-1",
    });

    const response = await POST(
      createRequest({
        channel: "email",
        to: "user@example.com",
        message: "hello",
        subject: "Subject",
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      provider: "smtp",
      messageId: "msg-1",
    });
    expect(sendNotificationMock).toHaveBeenCalledWith({
      channel: "email",
      to: "user@example.com",
      message: "hello",
      subject: "Subject",
    });
  });
});
