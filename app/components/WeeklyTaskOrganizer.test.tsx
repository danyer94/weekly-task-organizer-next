import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi, beforeAll } from "vitest";

import WeeklyTaskOrganizer from "./WeeklyTaskOrganizer";

// Mock window.matchMedia
beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

// Mock dependencies similar to AdminView.test.tsx
const {
  useWeeklyTasksMock,
  getGoogleConnectionStatusMock,
  onValueMock,
  refMock,
  routerPushMock,
  sendDailySummaryAutoMock,
} = vi.hoisted(() => ({
  useWeeklyTasksMock: vi.fn(),
  getGoogleConnectionStatusMock: vi.fn(),
  onValueMock: vi.fn(),
  refMock: vi.fn(),
  routerPushMock: vi.fn(),
  sendDailySummaryAutoMock: vi.fn(),
}));

vi.mock("@/hooks/useWeeklyTasks", () => ({
  DAYS: [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ],
  useWeeklyTasks: useWeeklyTasksMock,
}));

vi.mock("./AuthProvider", () => ({
  useAuth: () => ({
    user: {
      uid: "user-123",
      displayName: "Ramon",
      email: "ramon@example.com",
      photoURL: null,
    },
    loading: false,
    logout: vi.fn().mockResolvedValue(undefined),
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPushMock }),
}));

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={typeof props.alt === "string" ? props.alt : ""} {...props} />
  ),
}));

vi.mock("@/lib/calendarClient", () => ({
  connectGoogleCalendar: vi.fn().mockResolvedValue(undefined),
  createTaskEventForRamon: vi.fn().mockResolvedValue(undefined),
  deleteTaskEventForRamon: vi.fn().mockResolvedValue(undefined),
  getGoogleConnectionStatus: getGoogleConnectionStatusMock,
  syncCalendarEvents: vi.fn().mockResolvedValue({ results: [] }),
  updateTaskEventForRamon: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/notificationsClient", () => ({
  sendDailySummary: vi.fn().mockResolvedValue(undefined),
  sendDailySummaryAuto: sendDailySummaryAutoMock,
}));

vi.mock("@/lib/firebase", () => ({
  database: {},
  getUserPath: vi.fn((_uid: string, path: string) => `users/user-123/${path}`),
}));

vi.mock("firebase/database", () => ({
  onValue: onValueMock,
  ref: refMock,
}));

describe("WeeklyTaskOrganizer", () => {
  it("renders the outer div with id='main-content' for skip link target", () => {
    // Set up mock return values
    useWeeklyTasksMock.mockReturnValue({
      tasks: {},
      isClient: true,
      syncStatus: "synced",
      addTask: vi.fn(),
      deleteTask: vi.fn(),
      itemOperations: {
        toggleComplete: vi.fn(),
        editTask: vi.fn(),
        updateTaskCalendarEvent: vi.fn(),
        setTaskCalendarEventForDate: vi.fn(),
      },
      reorderTasks: vi.fn(),
      bulkOperations: {
        deleteSelected: vi.fn(),
        clearCompleted: vi.fn(),
        moveOrCopyTasks: vi.fn(),
        moveOrCopyTasksToDate: vi.fn(),
        bulkAddTasks: vi.fn(),
      },
      ioOperations: { exportToWhatsApp: vi.fn() },
      stats: { total: 0, completed: 0, pending: 0, completionRate: 0 },
    });

    getGoogleConnectionStatusMock.mockResolvedValue(false);
    onValueMock.mockReturnValue(vi.fn());
    refMock.mockReturnValue({});
    sendDailySummaryAutoMock.mockResolvedValue({ skipped: true });

    const { container } = render(<WeeklyTaskOrganizer />);

    // The outer div with class admin-shell should have id="main-content"
    const outerDiv = container.querySelector(".admin-shell");
    expect(outerDiv).toBeInTheDocument();
    expect(outerDiv).toHaveAttribute("id", "main-content");
  });
});