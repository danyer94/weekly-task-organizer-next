import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AdminView } from "./AdminView";
import type { Day, TasksByDay } from "@/types";

const {
  addTaskMock,
  useWeeklyTasksMock,
  getGoogleConnectionStatusMock,
  createTaskEventForRamonMock,
  onValueMock,
  refMock,
  routerPushMock,
  sendDailySummaryAutoMock,
} = vi.hoisted(() => ({
  addTaskMock: vi.fn(),
  useWeeklyTasksMock: vi.fn(),
  getGoogleConnectionStatusMock: vi.fn(),
  createTaskEventForRamonMock: vi.fn(),
  onValueMock: vi.fn(),
  refMock: vi.fn(),
  routerPushMock: vi.fn(),
  sendDailySummaryAutoMock: vi.fn(),
}));

vi.mock("@/hooks/useWeeklyTasks", () => ({
  DAYS: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  useWeeklyTasks: useWeeklyTasksMock,
}));

vi.mock("./AuthProvider", () => ({
  useAuth: () => ({
    user: { uid: "user-123", displayName: "Ramon", email: "ramon@example.com", photoURL: null },
    loading: false,
    logout: vi.fn().mockResolvedValue(undefined),
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPushMock }),
}));

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img alt={typeof props.alt === "string" ? props.alt : ""} {...props} />
  ),
}));

vi.mock("@/lib/calendarClient", () => ({
  connectGoogleCalendar: vi.fn().mockResolvedValue(undefined),
  createTaskEventForRamon: createTaskEventForRamonMock,
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

const days: Day[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const tasks: TasksByDay = {
  Wednesday: [
    { id: "task-1", text: "Prepare report", completed: true, priority: "high" },
    { id: "task-2", text: "Schedule review", completed: false, priority: "medium" },
    { id: "task-3", text: "Write docs", completed: false, priority: "low" },
  ],
};

const createProps = () => ({
  currentDay: "Wednesday" as Day,
  days,
  onDayChange: vi.fn(),
  selectedDate: new Date(2026, 5, 17, 12),
  onDateChange: vi.fn(),
  newTaskText: "Draft agenda",
  setNewTaskText: vi.fn(),
  taskStartTime: "",
  setTaskStartTime: vi.fn(),
  taskEndTime: "",
  setTaskEndTime: vi.fn(),
  priority: "medium" as const,
  setPriority: vi.fn(),
  onAddTask: vi.fn(),
  groupByPriority: true,
  setGroupByPriority: vi.fn(),
  selectedTasks: new Set<string>(),
  tasks,
  weeklyStats: { total: 3, completed: 1 },
  dailyStats: { total: 3, completed: 1 },
  quickActions: {
    onClearCompleted: vi.fn(),
    onBulkAdd: vi.fn(),
    onExportWhatsApp: vi.fn(),
    onSendDailySummary: vi.fn(),
  },
  onToggleSelection: vi.fn(),
  onToggleComplete: vi.fn(),
  onEdit: vi.fn(),
  onDragStart: vi.fn(),
  onDrop: vi.fn(),
  onDeleteSelected: vi.fn(),
  onSelectAll: vi.fn(),
  onMoveClick: vi.fn(),
  onCopyClick: vi.fn(),
  editingTaskId: null,
  setEditingTaskId: vi.fn(),
  onCreateCalendarEvent: vi.fn(),
  onDeleteCalendarEvent: vi.fn(),
  onTimelineScheduleChange: vi.fn(),
});

describe("AdminView dashboard polish integration", () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    window.localStorage.setItem("theme", "light");
    getGoogleConnectionStatusMock.mockResolvedValue(false);
    createTaskEventForRamonMock.mockResolvedValue({ eventId: "event-1" });
    sendDailySummaryAutoMock.mockResolvedValue({ skipped: true });
    onValueMock.mockImplementation((_ref: unknown, onData: (snap: { exists: () => boolean; val: () => null }) => void) => {
      onData({ exists: () => false, val: () => null });
      return vi.fn();
    });
    refMock.mockReturnValue({});
    useWeeklyTasksMock.mockImplementation(() => ({
      tasks: {
        Monday: [], Tuesday: [], Wednesday: [], Thursday: [],
        Friday: [], Saturday: [], Sunday: [],
      },
      isClient: true,
      syncStatus: "synced",
      addTask: addTaskMock,
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
        moveOrCopyTasks: vi.fn().mockReturnValue({ createdTasks: [] }),
        moveOrCopyTasksToDate: vi.fn().mockResolvedValue({ createdTasks: [] }),
        bulkAddTasks: vi.fn(),
      },
      ioOperations: { exportToWhatsApp: vi.fn() },
      stats: { total: 0, completed: 0 },
    }));
  });

  it("renders PriorityBreakdown below TodaySchedule", () => {
    const { container } = render(<AdminView {...createProps()} />);

    expect(screen.getByText("Priority Breakdown")).toBeInTheDocument();

    // Scope to the PriorityBreakdown card
    const breakdown = container.querySelectorAll(".admin-schedule-card");
    // TodaySchedule + PriorityBreakdown = 2 admin-schedule-cards in command grid
    const priorityCard = Array.from(breakdown).find((card) =>
      card.textContent?.includes("Priority Breakdown")
    );
    expect(priorityCard).toBeInTheDocument();
    expect(priorityCard!.textContent).toContain("High");
    expect(priorityCard!.textContent).toContain("Medium");
    expect(priorityCard!.textContent).toContain("Low");
  });

  it("shows correct priority counts from tasks", () => {
    const { container } = render(<AdminView {...createProps()} />);

    // 1 high, 1 medium, 1 low
    const breakdownCards = container.querySelectorAll(".admin-schedule-card");
    const priorityCard = Array.from(breakdownCards).find((card) =>
      card.textContent?.includes("Priority Breakdown")
    )!;

    // Each row has a count span
    const countSpans = priorityCard.querySelectorAll(".text-text-secondary");
    const counts = Array.from(countSpans).map((s) => s.textContent);
    expect(counts).toEqual(["1", "1", "1"]);
  });

  it("renders QuickActionsCard in the agenda pane", () => {
    render(<AdminView {...createProps()} />);

    expect(screen.getByText("Quick Actions")).toBeInTheDocument();
    expect(screen.getByText("Create Task")).toBeInTheDocument();
    expect(screen.getByText("Add Reminder")).toBeInTheDocument();
    expect(screen.getByText("Time Block")).toBeInTheDocument();
    expect(screen.getByText("Add Note")).toBeInTheDocument();
  });

  it("does not render Bulk Add in the ops strip", () => {
    const { container } = render(<AdminView {...createProps()} />);

    const opsStrip = container.querySelector(".admin-ops-strip");
    const bulkAddInOps = opsStrip?.querySelectorAll("button");
    const bulkAddButtons = Array.from(bulkAddInOps ?? []).filter(
      (btn) => btn.textContent?.includes("Bulk Add")
    );
    expect(bulkAddButtons).toHaveLength(0);
  });

  it("renders Bulk Add in the task section header", () => {
    render(<AdminView {...createProps()} />);

    const bulkButton = screen.getByRole("button", { name: "Bulk Add" });
    expect(bulkButton).toBeInTheDocument();

    // Should be inside the work pane header area
    const workPane = document.querySelector(".admin-work-pane");
    expect(workPane?.contains(bulkButton)).toBe(true);
  });

  it("wires Bulk Add button to quickActions.onBulkAdd from task header", () => {
    const props = createProps();
    render(<AdminView {...props} />);

    fireEvent.click(screen.getByRole("button", { name: "Bulk Add" }));
    expect(props.quickActions.onBulkAdd).toHaveBeenCalledOnce();
  });

  it("renders sort dropdown button in task header", () => {
    render(<AdminView {...createProps()} />);

    const sortButton = screen.getByRole("button", { name: /Sort/ });
    expect(sortButton).toBeInTheDocument();
    expect(sortButton).toHaveTextContent("Sort: Priority");
  });

  it("opens sort dropdown on click and shows options", () => {
    render(<AdminView {...createProps()} />);

    const sortButton = screen.getByRole("button", { name: /Sort/ });
    fireEvent.click(sortButton);

    expect(screen.getByText("Priority")).toBeInTheDocument();
    expect(screen.getByText("Alphabetical")).toBeInTheDocument();
    expect(screen.getByText("Date Added")).toBeInTheDocument();
  });

  it("selects a sort option and closes the dropdown", () => {
    render(<AdminView {...createProps()} />);

    const sortButton = screen.getByRole("button", { name: /Sort/ });
    fireEvent.click(sortButton);
    fireEvent.click(screen.getByText("Alphabetical"));

    // Dropdown should close
    expect(screen.queryByText("Date Added")).not.toBeInTheDocument();
    // Button label should update
    expect(sortButton).toHaveTextContent("Sort: Alphabetical");
  });
});
