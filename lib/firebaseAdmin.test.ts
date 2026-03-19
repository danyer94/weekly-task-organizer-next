// @vitest-environment node

import { describe, expect, it, vi } from "vitest";

describe("firebaseAdmin", () => {
  it("does not crash the module when Firebase Admin initialization fails", async () => {
    vi.resetModules();
    vi.doMock("firebase-admin", () => ({
      apps: [],
      initializeApp: vi.fn(() => {
        throw new Error("bad private key");
      }),
      credential: {
        cert: vi.fn(() => ({})),
      },
      auth: vi.fn(),
      database: vi.fn(),
    }));

    const firebaseAdminModule = await import("./firebaseAdmin");

    await expect(
      firebaseAdminModule.getUidFromRequest(
        new Request("http://localhost", {
          headers: {
            Authorization: "Bearer token",
          },
        })
      )
    ).resolves.toBeNull();
    expect(() => firebaseAdminModule.getAdminDb()).toThrow(
      "Firebase Admin is not configured"
    );
  });
});
