import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AdminView } from "./AdminView";
import { getPriorityMenuPlacement } from "./AddTaskComposer";
import WeeklyTaskOrganizer from "./WeeklyTaskOrganizer";
import type { Day, TasksByDay } from "@/types";

const {
  addTaskMock,
  exportToWhatsAppMock,
  useWeeklyTasksMock,
  getGoogleConnectionStatusMock,
  createTaskEventForRamonMock,
  onValueMock,
  refMock,
  routerPushMock,
  sendDailySummaryAutoMock,
} = vi.hoisted(() => ({
  addTaskMock: vi.fn(),
  exportToWhatsAppMock: vi.fn(),
  useWeeklyTasksMock: vi.fn(),
  getGoogleConnectionStatusMock: vi.fn(),
  createTaskEventForRamonMock: vi.fn(),
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

const days: Day[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const tasks: TasksByDay = {
  Wednesday: [
    {
      id: "task-1",
      text: "Prepare weekly report",
      completed: true,
      priority: "high",
    },
    {
      id: "task-2",
      text: "Schedule client review",
      completed: false,
      priority: "medium",
      calendarEvent: {
        eventId: "event-2",
        date: "2026-06-17",
        startTime: "10:00",
        endTime: "11:00",
      },
    },
  ],
  Thursday: [
    {
      id: "task-3",
      text: "Publish notes",
      completed: false,
      priority: "low",
    },
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

describe("AdminView", () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    window.localStorage.setItem("theme", "light");
    getGoogleConnectionStatusMock.mockResolvedValue(false);
    createTaskEventForRamonMock.mockResolvedValue({ eventId: "event-1" });
    sendDailySummaryAutoMock.mockResolvedValue({ skipped: true });
    onValueMock.mockImplementation((_ref, onData) => {
      onData({ exists: () => false, val: () => null });

      return vi.fn();
    });
    refMock.mockReturnValue({});
    useWeeklyTasksMock.mockImplementation(() => ({
      tasks: {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: [],
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
      ioOperations: { exportToWhatsApp: exportToWhatsAppMock },
      stats: { total: 0, completed: 0 },
    }));
  });

  it("shows the selected day, date context, counts, tasks, and schedule rail", () => {
    render(<AdminView {...createProps()} />);

    expect(
      screen.getByRole("heading", { name: "Wednesday command center" })
    ).toBeInTheDocument();
    expect(screen.getByText("Wed, Jun 17")).toBeInTheDocument();
    expect(screen.getAllByText("Prepare weekly report").length).toBeGreaterThan(0);
    expect(
      screen.getByRole("heading", { name: "Schedule context" })
    ).toBeInTheDocument();
  });

  it("renders the dashboard eyebrow as blue text without a pill surface", () => {
    render(<AdminView {...createProps()} />);

    const eyebrow = screen.getByText("Admin dashboard");

    expect(eyebrow).toHaveClass("text-sapphire-500");
    expect(eyebrow).not.toHaveClass(
      "rounded-full",
      "border",
      "bg-sapphire-500/10",
      "dark:bg-sapphire-500/15"
    );
  });

  it("submits the composer from Enter and the Add Task button", () => {
    const props = createProps();
    render(<AdminView {...props} />);

    fireEvent.keyDown(screen.getByRole("textbox", { name: "New task" }), {
      key: "Enter",
    });
    fireEvent.click(screen.getByRole("button", { name: "Add Task" }));

    expect(props.onAddTask).toHaveBeenCalledTimes(2);
  });

  it("renders the reference task composer controls without Add Tag", () => {
    render(<AdminView {...createProps()} />);

    expect(screen.getByRole("textbox", { name: "New task" })).toHaveValue(
      "Draft agenda"
    );
    expect(screen.getByLabelText("Task date")).toHaveValue("2026-06-17");
    expect(screen.getByRole("combobox", { name: "Task priority" })).toBeInTheDocument();
    expect(screen.getByLabelText("Start time")).toBeInTheDocument();
    expect(screen.getByLabelText("End time")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add Task" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /add tag/i })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/tag/i)).not.toBeInTheDocument();
  });

  it("shows Today and Medium defaults in the task composer", () => {
    const today = new Date();
    render(<AdminView {...createProps()} selectedDate={today} newTaskText="" />);
    const composer = screen.getByRole("region", { name: "Task composer" });

    expect(within(composer).getByText("Today")).toBeInTheDocument();
    expect(within(composer).getByRole("combobox", { name: "Task priority" })).toHaveAttribute(
      "data-value",
      "medium"
    );
  });

  it("renders priority as a dropdown menu with selected and option flags", () => {
    render(<AdminView {...createProps()} />);
    const composer = screen.getByRole("region", { name: "Task composer" });

    // Should NOT have radiogroup
    expect(screen.queryByRole("radiogroup", { name: "Task priority" })).not.toBeInTheDocument();

    const priorityTrigger = within(composer).getByRole("combobox", { name: "Task priority" });
    expect(priorityTrigger).toBeInTheDocument();
    expect(priorityTrigger).toHaveAttribute("aria-expanded", "false");
    expect(priorityTrigger).toHaveTextContent("Medium");
    expect(priorityTrigger).toHaveAttribute("data-value", "medium");
    expect(within(composer).getByLabelText("Medium priority flag")).toHaveClass("text-orange-500");

    fireEvent.click(priorityTrigger);

    expect(priorityTrigger).toHaveAttribute("aria-expanded", "true");
    const listbox = screen.getByRole("listbox", { name: "Priority options" });
    const options = within(listbox).getAllByRole("option");
    expect(options).toHaveLength(3);
    expect(options[0]).toHaveTextContent("High");
    expect(options[1]).toHaveTextContent("Medium");
    expect(options[2]).toHaveTextContent("Low");
    expect(within(listbox).getByLabelText("High priority option flag")).toHaveClass(
      "text-red-500",
      "admin-task-composer__priority-flag--high"
    );
    expect(within(listbox).getByLabelText("Medium priority option flag")).toHaveClass(
      "text-orange-500",
      "admin-task-composer__priority-flag--medium"
    );
    expect(within(listbox).getByLabelText("Low priority option flag")).toHaveClass(
      "text-green-500",
      "admin-task-composer__priority-flag--low"
    );
    expect(options[1]).toHaveAttribute("aria-selected", "true");
    expect(options[1]).toHaveAttribute("data-state", "selected");
    expect(options[1]).toHaveAttribute("data-highlight", "theme-aware");
    expect(options[1]).toHaveClass("is-selected");
  });

  it("chooses priority menu placement from available viewport space", () => {
    expect(
      getPriorityMenuPlacement({ top: 120, bottom: 164 } as DOMRect, 130, 720)
    ).toBe("bottom");
    expect(
      getPriorityMenuPlacement({ top: 520, bottom: 564 } as DOMRect, 130, 600)
    ).toBe("top");
    expect(
      getPriorityMenuPlacement({ top: 80, bottom: 124 } as DOMRect, 130, 240)
    ).toBe("bottom");
  });

  it.each([
    ["high", "High", "text-red-500"],
    ["medium", "Medium", "text-orange-500"],
    ["low", "Low", "text-green-500"],
  ] as const)("renders the %s priority flag color", (priority, label, colorClass) => {
    render(<AdminView {...createProps()} priority={priority} />);
    const composer = screen.getByRole("region", { name: "Task composer" });

    expect(within(composer).getByLabelText(`${label} priority flag`)).toHaveClass(colorClass);
  });

  it("renders start and end time inputs with type time and default empty", () => {
    render(<AdminView {...createProps()} />);
    const composer = screen.getByRole("region", { name: "Task composer" });

    const startTimeInput = within(composer).getByLabelText("Start time");
    const endTimeInput = within(composer).getByLabelText("End time");
    expect(startTimeInput).toHaveAttribute("type", "time");
    expect(endTimeInput).toHaveAttribute("type", "time");
    expect(startTimeInput).toHaveValue("");
    expect(endTimeInput).toHaveValue("");
  });

  it("shows Start Time and End Time labels when the composer times are empty", () => {
    render(<AdminView {...createProps()} />);
    const composer = screen.getByRole("region", { name: "Task composer" });

    expect(within(composer).getByText("Start Time")).toBeInTheDocument();
    expect(within(composer).getByText("End Time")).toBeInTheDocument();
  });

  it("opens the native date picker when the date segment is clicked", () => {
    render(<AdminView {...createProps()} />);
    const dateInput = screen.getByLabelText("Task date") as HTMLInputElement & {
      showPicker: ReturnType<typeof vi.fn>;
    };
    const showPicker = vi.fn();
    dateInput.showPicker = showPicker;

    fireEvent.click(dateInput.closest(".admin-task-composer__segment")!);

    expect(showPicker).toHaveBeenCalledOnce();
    expect(dateInput).toHaveFocus();
  });

  it("opens the native time pickers when each time segment is clicked", () => {
    render(<AdminView {...createProps()} />);
    const startTimeInput = screen.getByLabelText("Start time") as HTMLInputElement & {
      showPicker: ReturnType<typeof vi.fn>;
    };
    const endTimeInput = screen.getByLabelText("End time") as HTMLInputElement & {
      showPicker: ReturnType<typeof vi.fn>;
    };
    const showStartPicker = vi.fn();
    const showEndPicker = vi.fn();
    startTimeInput.showPicker = showStartPicker;
    endTimeInput.showPicker = showEndPicker;

    fireEvent.click(startTimeInput.closest(".admin-task-composer__segment")!);
    expect(showStartPicker).toHaveBeenCalledOnce();
    expect(startTimeInput).toHaveFocus();

    fireEvent.click(endTimeInput.closest(".admin-task-composer__segment")!);
    expect(showEndPicker).toHaveBeenCalledOnce();
    expect(endTimeInput).toHaveFocus();
  });

  it("keeps one visible leading icon per time segment", () => {
    render(<AdminView {...createProps()} />);

    const startTimeSegment = screen.getByLabelText("Start time").closest(".admin-task-composer__segment")!;
    const endTimeSegment = screen.getByLabelText("End time").closest(".admin-task-composer__segment")!;

    expect(startTimeSegment.querySelectorAll('[data-slot="time-leading-icon"]')).toHaveLength(1);
    expect(endTimeSegment.querySelectorAll('[data-slot="time-leading-icon"]')).toHaveLength(1);
    expect(screen.getByLabelText("Start time")).toHaveClass(
      "admin-task-composer__time-input--native-hidden"
    );
    expect(screen.getByLabelText("End time")).toHaveClass(
      "admin-task-composer__time-input--native-hidden"
    );
  });

  it("changes composer date and priority before submission", () => {
    const props = createProps();
    render(<AdminView {...props} />);

    fireEvent.change(screen.getByLabelText("Task date"), {
      target: { value: "2026-06-18" },
    });
    fireEvent.click(screen.getByRole("combobox", { name: "Task priority" }));
    fireEvent.click(screen.getByRole("option", { name: /High/ }));
    fireEvent.click(screen.getByRole("combobox", { name: "Task priority" }));
    fireEvent.click(screen.getByRole("option", { name: /Low/ }));
    fireEvent.change(screen.getByLabelText("Start time"), {
      target: { value: "09:30" },
    });
    fireEvent.change(screen.getByLabelText("End time"), {
      target: { value: "10:30" },
    });

    expect(props.onDateChange).toHaveBeenCalledWith(new Date(2026, 5, 18, 12));
    expect(props.setPriority).toHaveBeenNthCalledWith(1, "high");
    expect(props.setPriority).toHaveBeenNthCalledWith(2, "low");
    expect(props.setTaskStartTime).toHaveBeenCalledWith("09:30");
    expect(props.setTaskEndTime).toHaveBeenCalledWith("10:30");
  });

  it("blocks invalid composer time ranges with accessible feedback", () => {
    const props = createProps();
    render(<AdminView {...props} taskStartTime="11:00" taskEndTime="10:30" />);

    fireEvent.click(screen.getByRole("button", { name: "Add Task" }));

    expect(screen.getByRole("alert")).toHaveTextContent("End time must be after start time.");
    expect(props.onAddTask).not.toHaveBeenCalled();
  });

  it("keeps the organizer header full-width while preserving the main content max width", async () => {
    render(<WeeklyTaskOrganizer />);

    await screen.findByText("Operations Week");

    const headerShell = document.querySelector("div.fixed.top-0.left-0.right-0.z-50");
    expect(headerShell).toBeInTheDocument();
    expect(headerShell).not.toHaveClass("px-3", "sm:px-4");

    const header = headerShell?.querySelector("header.admin-topbar") as HTMLElement | null;
    expect(header).toHaveClass("admin-topbar", "w-full", "rounded-none");
    expect(header).not.toHaveClass("max-w-[800px]", "rounded-2xl");

    const mainContent = document.querySelector('[class*="max-w-[1500px]"]');
    expect(mainContent).toBeInTheDocument();
  });

  it("uses the weekly WhatsApp clipboard export from the Copy Tasks action", async () => {
    render(<WeeklyTaskOrganizer />);

    fireEvent.click(await screen.findByRole("button", { name: "Copy Tasks" }));

    expect(exportToWhatsAppMock).toHaveBeenCalledOnce();
  });

  it("blocks empty composer submissions with accessible feedback", () => {
    const props = createProps();
    render(<AdminView {...props} newTaskText="   " />);

    const addButton = screen.getByRole("button", { name: "Add Task" });
    fireEvent.click(addButton);
    fireEvent.keyDown(screen.getByRole("textbox", { name: "New task" }), {
      key: "Enter",
    });

    expect(addButton).toBeDisabled();
    expect(screen.getByText("Task text is required.")).toBeInTheDocument();
    expect(props.onAddTask).not.toHaveBeenCalled();
  });

  it("blocks composer submissions while a task is being added", () => {
    const props = createProps();
    render(<AdminView {...props} isAddingTask />);

    const addButton = screen.getByRole("button", { name: "Add Task" });
    fireEvent.click(addButton);
    fireEvent.keyDown(screen.getByRole("textbox", { name: "New task" }), {
      key: "Enter",
    });

    expect(addButton).toBeDisabled();
    expect(screen.getByRole("textbox", { name: "New task" })).toBeDisabled();
    expect(props.onAddTask).not.toHaveBeenCalled();
  });

  it("keeps composer controls in logical keyboard focus order with visible focus hooks", () => {
    render(<AdminView {...createProps()} />);

    const composer = screen.getByRole("region", { name: "Task composer" });
    const newTaskInput = within(composer).getByRole("textbox", { name: "New task" });
    const dateInput = within(composer).getByLabelText("Task date");
    const startTimeInput = within(composer).getByLabelText("Start time");
    const endTimeInput = within(composer).getByLabelText("End time");
    const priorityTrigger = within(composer).getByRole("combobox", { name: "Task priority" });
    const addTaskButton = within(composer).getByRole("button", { name: "Add Task" });
    const focusableControls = Array.from(
      composer.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLButtonElement>("input, select, button")
    );

    expect(focusableControls).toEqual([
      newTaskInput,
      dateInput,
      startTimeInput,
      endTimeInput,
      priorityTrigger,
      addTaskButton,
    ]);

    for (const control of focusableControls) {
      control.focus();
      expect(control).toHaveFocus();
    }

    expect(newTaskInput).toHaveClass("admin-task-composer__input");
    expect(newTaskInput).toHaveAttribute("data-focus-style", "subtle");
    expect(newTaskInput).not.toHaveClass("border-b-2", "focus:border-blue-500", "focus:ring-blue-500");
    expect(dateInput.closest(".admin-task-composer__segment")).toBeInTheDocument();
    expect(dateInput).toHaveAttribute("data-focus-style", "subtle");
    expect(dateInput).toHaveClass("admin-task-composer__native-picker-input");
    expect(dateInput).not.toHaveClass("focus:border-blue-500", "focus:ring-blue-500", "focus-visible:ring-border-brand");
    expect(startTimeInput.closest(".admin-task-composer__segment")).toBeInTheDocument();
    expect(startTimeInput).toHaveAttribute("data-focus-style", "subtle");
    expect(startTimeInput).toHaveClass("admin-task-composer__native-picker-input");
    expect(startTimeInput).not.toHaveClass("focus:border-blue-500", "focus:ring-blue-500", "focus-visible:ring-border-brand");
    expect(endTimeInput.closest(".admin-task-composer__segment")).toBeInTheDocument();
    expect(endTimeInput).toHaveAttribute("data-focus-style", "subtle");
    expect(endTimeInput).toHaveClass("admin-task-composer__native-picker-input");
    expect(endTimeInput).not.toHaveClass("focus:border-blue-500", "focus:ring-blue-500", "focus-visible:ring-border-brand");
    expect(priorityTrigger).toHaveClass("admin-task-composer__priority-trigger");
    expect(priorityTrigger).toHaveAttribute("data-focus-style", "subtle");
    expect(addTaskButton).toHaveClass("admin-task-composer__submit");
  });

  it("uses the selected composer date, day, and priority when the owner submits and clears text", async () => {
    render(<WeeklyTaskOrganizer />);

    const newTaskInput = await screen.findByRole("textbox", { name: "New task" });
    fireEvent.change(newTaskInput, {
      target: { value: "Plan cross-week review" },
    });
    fireEvent.change(screen.getByLabelText("Task date"), {
      target: { value: "2026-06-18" },
    });
    fireEvent.click(screen.getByRole("combobox", { name: "Task priority" }));
    fireEvent.click(screen.getByRole("option", { name: /High/ }));
    fireEvent.click(screen.getByRole("button", { name: "Add Task" }));

    expect(addTaskMock).toHaveBeenCalledWith(
      "Thursday",
      "Plan cross-week review",
      "high",
      undefined
    );
    expect(newTaskInput).toHaveValue("");
    await waitFor(() => {
      expect(useWeeklyTasksMock).toHaveBeenCalledWith(
        new Date(2026, 5, 18, 12),
        "user-123"
      );
    });
  });

  it("creates a Google Calendar payload with selected start and end times", async () => {
    getGoogleConnectionStatusMock.mockResolvedValue(true);

    render(<WeeklyTaskOrganizer />);

    const newTaskInput = await screen.findByRole("textbox", { name: "New task" });
    await waitFor(() => {
      expect(getGoogleConnectionStatusMock).toHaveBeenCalled();
    });

    fireEvent.change(newTaskInput, {
      target: { value: "Plan partner call" },
    });
    fireEvent.change(screen.getByLabelText("Task date"), {
      target: { value: "2026-06-18" },
    });
    fireEvent.change(screen.getByLabelText("Start time"), {
      target: { value: "14:30" },
    });
    fireEvent.change(screen.getByLabelText("End time"), {
      target: { value: "15:45" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add Task" }));

    await waitFor(() => {
      expect(createTaskEventForRamonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          summary: "Plan partner call",
          date: "2026-06-18",
          startTime: "14:30",
          endTime: "15:45",
          timeZone: expect.any(String),
        })
      );
    });
    expect(addTaskMock).toHaveBeenCalledWith(
      "Thursday",
      "Plan partner call",
      "medium",
      expect.objectContaining({
        eventId: "event-1",
        date: "2026-06-18",
        startTime: "14:30",
        endTime: "15:45",
      })
    );
    expect(newTaskInput).toHaveValue("");
    expect(screen.getByLabelText("Start time")).toHaveValue("");
    expect(screen.getByLabelText("End time")).toHaveValue("");
  });

  it("uses the existing calendar default duration when start time has no end time", async () => {
    getGoogleConnectionStatusMock.mockResolvedValue(true);

    render(<WeeklyTaskOrganizer />);

    const newTaskInput = await screen.findByRole("textbox", { name: "New task" });
    fireEvent.change(newTaskInput, {
      target: { value: "Plan default-duration call" },
    });
    fireEvent.change(screen.getByLabelText("Task date"), {
      target: { value: "2026-06-18" },
    });
    fireEvent.change(screen.getByLabelText("Start time"), {
      target: { value: "09:15" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add Task" }));

    await waitFor(() => {
      expect(createTaskEventForRamonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          summary: "Plan default-duration call",
          date: "2026-06-18",
          startTime: "09:15",
          endTime: undefined,
        })
      );
    });
    expect(addTaskMock).toHaveBeenCalledWith(
      "Thursday",
      "Plan default-duration call",
      "medium",
      expect.objectContaining({
        startTime: "09:15",
        endTime: null,
      })
    );
  });

  it("prevents duplicate timed submissions while calendar creation is pending", async () => {
    getGoogleConnectionStatusMock.mockResolvedValue(true);
    let resolveCalendarEvent!: (value: { eventId: string }) => void;
    createTaskEventForRamonMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveCalendarEvent = resolve;
        })
    );

    render(<WeeklyTaskOrganizer />);

    const newTaskInput = await screen.findByRole("textbox", { name: "New task" });
    await waitFor(() => {
      expect(getGoogleConnectionStatusMock).toHaveBeenCalled();
    });

    fireEvent.change(newTaskInput, {
      target: { value: "Plan duplicate-safe call" },
    });
    fireEvent.change(screen.getByLabelText("Task date"), {
      target: { value: "2026-06-18" },
    });
    fireEvent.change(screen.getByLabelText("Start time"), {
      target: { value: "13:00" },
    });

    const addButton = screen.getByRole("button", { name: "Add Task" });
    fireEvent.click(addButton);
    fireEvent.keyDown(newTaskInput, { key: "Enter" });
    fireEvent.click(addButton);

    expect(addButton).toBeDisabled();
    expect(createTaskEventForRamonMock).toHaveBeenCalledTimes(1);
    expect(addTaskMock).not.toHaveBeenCalled();

    resolveCalendarEvent({ eventId: "event-dedupe" });

    await waitFor(() => {
      expect(addTaskMock).toHaveBeenCalledTimes(1);
    });
    expect(createTaskEventForRamonMock).toHaveBeenCalledTimes(1);
    expect(addTaskMock).toHaveBeenCalledWith(
      "Thursday",
      "Plan duplicate-safe call",
      "medium",
      expect.objectContaining({
        eventId: "event-dedupe",
        date: "2026-06-18",
        startTime: "13:00",
        endTime: null,
      })
    );
  });

  it("blocks invalid time ranges before creating calendar events or tasks", async () => {
    getGoogleConnectionStatusMock.mockResolvedValue(true);

    render(<WeeklyTaskOrganizer />);

    const newTaskInput = await screen.findByRole("textbox", { name: "New task" });
    fireEvent.change(newTaskInput, {
      target: { value: "Broken schedule" },
    });
    fireEvent.change(screen.getByLabelText("Start time"), {
      target: { value: "11:00" },
    });
    fireEvent.change(screen.getByLabelText("End time"), {
      target: { value: "10:30" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add Task" }));

    expect(screen.getByRole("alert")).toHaveTextContent("End time must be after start time.");
    expect(createTaskEventForRamonMock).not.toHaveBeenCalled();
    expect(addTaskMock).not.toHaveBeenCalled();
  });

  it("navigates weeks and weekdays through the existing callbacks", () => {
    const props = createProps();
    render(<AdminView {...props} />);

    fireEvent.click(screen.getByRole("button", { name: "Previous week" }));
    fireEvent.click(screen.getByRole("button", { name: "Next week" }));
    fireEvent.click(screen.getByRole("button", { name: "Show Thursday tasks" }));

    expect(props.onDateChange.mock.calls[0][0]).toEqual(
      new Date(2026, 5, 10, 12)
    );
    expect(props.onDateChange.mock.calls[1][0]).toEqual(
      new Date(2026, 5, 24, 12)
    );
    expect(props.onDayChange).toHaveBeenCalledWith("Thursday");
  });

  it("renders the selected week as one seven-day calendar strip", () => {
    render(<AdminView {...createProps()} />);

    const group = screen.getByRole("group", { name: "Week days" });
    const buttons = within(group).getAllByRole("button");

    expect(group).toHaveAttribute("data-slot", "week-day-strip");
    expect(buttons).toHaveLength(7);
    expect(buttons.map((button) => button.textContent)).toEqual([
      "MonJun 150/0",
      "TueJun 160/0",
      "WedJun 171/2",
      "ThuJun 180/1",
      "FriJun 190/0",
      "SatJun 200/0",
      "SunJun 210/0",
    ]);
    expect(
      buttons.filter((button) => button.getAttribute("aria-pressed") === "true")
    ).toHaveLength(1);
    expect(buttons[2]).toHaveAttribute("aria-pressed", "true");
    expect(buttons[2].querySelector('[data-slot="week-day-date"]')).toHaveTextContent(
      "Jun 17"
    );
    expect(buttons[2].querySelector('[data-slot="week-day-count"]')).toHaveTextContent(
      "1/2"
    );
  });

  it("runs every management action and exposes selection actions only when selected", () => {
    const props = createProps();
    const { rerender } = render(<AdminView {...props} />);

    fireEvent.click(screen.getByRole("button", { name: "Send Daily Summary" }));
    fireEvent.click(screen.getByRole("button", { name: "Bulk Add" }));
    fireEvent.click(screen.getByRole("button", { name: "Copy Tasks" }));
    fireEvent.click(screen.getByRole("button", { name: "Hide Completed" }));

    expect(props.quickActions.onSendDailySummary).toHaveBeenCalledOnce();
    expect(props.quickActions.onBulkAdd).toHaveBeenCalledOnce();
    expect(props.quickActions.onExportWhatsApp).toHaveBeenCalledOnce();
    expect(props.onCopyClick).not.toHaveBeenCalled();
    expect(props.quickActions.onClearCompleted).not.toHaveBeenCalled();
    expect(screen.queryByText("Prepare weekly report")).not.toBeInTheDocument();
    expect(screen.getAllByText("Schedule client review").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Show Completed" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByRole("button", { name: "Delete" })).not.toBeInTheDocument();

    rerender(
      <AdminView {...props} selectedTasks={new Set(["task-1"])} />
    );
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    fireEvent.click(screen.getByRole("button", { name: "Move" }));
    fireEvent.click(screen.getByRole("button", { name: "Copy" }));

    expect(props.onDeleteSelected).toHaveBeenCalledOnce();
    expect(props.onMoveClick).toHaveBeenCalledOnce();
    expect(props.onCopyClick).toHaveBeenCalledOnce();
  });

  it("does not expose a task view mode selector anymore", () => {
    render(<AdminView {...createProps()} />);

    expect(screen.queryByRole("group", { name: "Task view mode" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "List" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Timeline" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Both" })).not.toBeInTheDocument();
    expect(window.localStorage.getItem("weekly-task-organizer:view-mode-admin")).toBeNull();
  });

  it("places today's schedule beside the command panel and keeps the task area to two panes", () => {
    const { container } = render(<AdminView {...createProps()} />);
    const commandLayout = container.querySelector(".admin-command-grid");
    const layout = container.querySelector(".admin-content-grid--both");

    expect(commandLayout).toBeInTheDocument();
    expect(layout).toBeInTheDocument();
    expect(layout).not.toHaveAttribute("data-view-mode");

    const commandPanel = commandLayout?.querySelector(".admin-command-panel");
    const cardsWrapper = commandLayout?.children[1] as HTMLElement;
    const todaySchedule = commandLayout?.querySelector(".admin-command-schedule");
    const scheduleCards = commandLayout?.querySelectorAll(".admin-schedule-card");
    const priorityBreakdown = scheduleCards?.[1];
    const quickActionsCard = scheduleCards?.[2];
    const commandChildren = Array.from(commandLayout?.children ?? []);
    const panes = Array.from(layout?.children ?? []);

    // Grid children: header + wrapper div (containing TodaySchedule, PriorityBreakdown, QuickActionsCard)
    expect(commandChildren).toHaveLength(2);
    expect(commandChildren[0]).toBe(commandPanel);
    expect(commandChildren[1]).toBe(cardsWrapper);
    expect(commandPanel).toBeInTheDocument();
    expect(todaySchedule).toHaveClass("admin-command-schedule", "rounded-[7px]");
    expect(within(todaySchedule as HTMLElement).getByRole("heading", { name: "Today's Schedule" })).toBeInTheDocument();
    expect(within(todaySchedule as HTMLElement).getByText("Schedule client review")).toBeInTheDocument();
    expect(within(todaySchedule as HTMLElement).queryByText(/^Unscheduled/i)).not.toBeInTheDocument();
    expect(layout?.querySelector(".admin-command-schedule")).not.toBeInTheDocument();
    expect(panes).toHaveLength(2);
    expect(panes[0]).toHaveClass("admin-work-pane");
    expect(panes[1]).toHaveClass("admin-agenda-pane");
    expect(within(panes[0] as HTMLElement).getByRole("button", { name: "Select All" })).toBeInTheDocument();
    expect(within(panes[1] as HTMLElement).getByRole("heading", { name: "Schedule context" })).toBeInTheDocument();
    expect(within(panes[0] as HTMLElement).getByText("Prepare weekly report")).toBeInTheDocument();
    expect(within(panes[1] as HTMLElement).getByText("Schedule client review")).toBeInTheDocument();
  });

  it("uses a desktop two-column command row that stacks by default", () => {
    const styles = readFileSync("app/globals.css", "utf8");
    const commandGridRule = styles.match(/\.admin-command-grid\s*\{([^}]*)\}/)?.[1] ?? "";

    expect(commandGridRule).toContain("display: grid");
    expect(commandGridRule).not.toContain("grid-template-columns");
    expect(styles).toMatch(/@media \(min-width: 1024px\)[\s\S]*?\.admin-command-grid\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0, 2fr\) minmax\(300px, 1fr\);[\s\S]*?align-items:\s*start;/);
  });

  it("defines quiet theme-aware surfaces for the fixed admin topbar", () => {
    const styles = readFileSync("app/globals.css", "utf8");
    const topbarRule = styles.match(/\.admin-topbar\s*\{([^}]*)\}/)?.[1] ?? "";

    expect(styles).toMatch(/--admin-topbar-surface:\s*rgba\(255,\s*255,\s*255,/);
    expect(styles).toMatch(/\.dark \.admin-shell\.admin-mode\s*\{[\s\S]*?--admin-topbar-surface:\s*rgba\(10,\s*21,\s*35,/);
    expect(topbarRule).toContain("background: var(--admin-topbar-surface)");
    expect(topbarRule).toContain("border-bottom: 1px solid var(--admin-topbar-separator)");
    expect(topbarRule).not.toContain("background: transparent");
  });
});
