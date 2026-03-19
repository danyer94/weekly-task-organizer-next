import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { UserSettingsModal } from "./UserSettingsModal";

const mockUpdateDisplayName = vi.fn();
const mockUpdateUserPassword = vi.fn();
const mockGet = vi.fn();
const mockRef = vi.fn();

vi.mock("./AuthProvider", () => ({
  useAuth: () => ({
    updateDisplayName: mockUpdateDisplayName,
    updateUserPassword: mockUpdateUserPassword,
    user: { uid: "user-1" },
  }),
}));

vi.mock("@/lib/firebase", () => ({
  database: {},
  getUserPath: vi.fn(() => "users/user-1/settings/notifications/dailySummary"),
}));

vi.mock("firebase/database", () => ({
  get: (...args: unknown[]) => mockGet(...args),
  ref: (...args: unknown[]) => mockRef(...args),
  update: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("UserSettingsModal", () => {
  it("renders a dialog with a dedicated scroll region", async () => {
    mockGet.mockResolvedValue({
      exists: () => false,
    });

    render(
      <UserSettingsModal
        isOpen
        onClose={vi.fn()}
        initialDisplayName="Danyer"
        email="danyer@example.com"
      />
    );

    expect(await screen.findByRole("dialog", { name: /user settings/i })).toHaveClass(
      "overflow-hidden",
      "flex",
      "flex-col"
    );
    expect(screen.getByTestId("user-settings-scroll-region")).toHaveClass(
      "min-h-0",
      "overflow-y-auto"
    );
    expect(screen.getByLabelText("Display name")).toBeInTheDocument();
    expect(screen.getByLabelText("Summary delivery email")).toBeInTheDocument();
  });
});
