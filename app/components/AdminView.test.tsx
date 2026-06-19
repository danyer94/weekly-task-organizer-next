import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AdminView } from "./AdminView";
import type { Day, TasksByDay } from "@/types";

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
  priority: "medium" as const,
  setPriority: vi.fn(),
  onAddTask: vi.fn(),
  groupByPriority: true,
  setGroupByPriority: vi.fn(),
  selectedTasks: new Set<string>(),
  tasks,
  stats: { total: 3, completed: 1 },
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
    window.localStorage.clear();
  });

  it("shows the selected day, date context, counts, tasks, and schedule rail", () => {
    render(<AdminView {...createProps()} />);

    expect(
      screen.getByRole("heading", { name: "Wednesday command center" })
    ).toBeInTheDocument();
    expect(screen.getByText("Wed, Jun 17")).toBeInTheDocument();
    expect(screen.getByText("Jun 17, 2026")).toBeInTheDocument();
    expect(screen.getAllByText("Prepare weekly report").length).toBeGreaterThan(0);
    expect(
      screen.getByRole("heading", { name: "Schedule context" })
    ).toBeInTheDocument();
    expect(screen.getByText("Week open:").parentElement).toHaveTextContent("2");
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

  it("runs every management action and exposes selection actions only when selected", () => {
    const props = createProps();
    const { rerender } = render(<AdminView {...props} />);

    fireEvent.click(screen.getByRole("button", { name: "Send Daily Summary" }));
    fireEvent.click(screen.getByRole("button", { name: "Bulk Add" }));
    fireEvent.click(screen.getByRole("button", { name: "WhatsApp" }));
    fireEvent.click(screen.getByRole("button", { name: "Clear Completed" }));

    expect(props.quickActions.onSendDailySummary).toHaveBeenCalledOnce();
    expect(props.quickActions.onBulkAdd).toHaveBeenCalledOnce();
    expect(props.quickActions.onExportWhatsApp).toHaveBeenCalledOnce();
    expect(props.quickActions.onClearCompleted).toHaveBeenCalledOnce();
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

  it("exposes selected weekdays and view modes with pressed-button semantics", () => {
    render(<AdminView {...createProps()} />);

    expect(screen.getByRole("button", { name: "Show Wednesday tasks" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: "Show Thursday tasks" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );

    const group = screen.getByRole("group", { name: "Task view mode" });
    const listButton = screen.getByRole("button", { name: "List" });
    const timelineButton = screen.getByRole("button", { name: "Timeline" });
    const bothButton = screen.getByRole("button", { name: "Both" });

    expect(group).toContainElement(bothButton);
    expect(listButton).toHaveAttribute("aria-pressed", "false");
    expect(timelineButton).toHaveAttribute("aria-pressed", "false");
    expect(bothButton).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    expect(screen.queryAllByRole("tab")).toHaveLength(0);
  });

  it("keeps every view mode button in the ordinary keyboard tab order", () => {
    render(<AdminView {...createProps()} />);

    const viewButtons = ["List", "Timeline", "Both"].map((name) =>
      screen.getByRole("button", { name })
    );

    for (const button of viewButtons) {
      expect(button).toHaveProperty("tabIndex", 0);
    }
  });

  it("exposes explicit layout hooks for both, list, and timeline modes", () => {
    const { container } = render(<AdminView {...createProps()} />);
    const dashboard = container.querySelector(".admin-dashboard-grid");

    expect(dashboard).toHaveAttribute("data-view-mode", "timeline-list");
    expect(dashboard).toHaveClass("admin-dashboard-grid--both");

    fireEvent.click(screen.getByRole("button", { name: "List" }));
    expect(dashboard).toHaveAttribute("data-view-mode", "list");
    expect(dashboard).toHaveClass("admin-dashboard-grid--list");
    expect(screen.getByRole("button", { name: "Select All" })).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Schedule context" })
    ).not.toBeInTheDocument();
    expect(window.localStorage.getItem("weekly-task-organizer:view-mode-admin")).toBe(
      "list"
    );

    fireEvent.click(screen.getByRole("button", { name: "Timeline" }));
    expect(dashboard).toHaveAttribute("data-view-mode", "timeline");
    expect(dashboard).toHaveClass("admin-dashboard-grid--timeline");
    expect(
      screen.getByRole("heading", { name: "Schedule context" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Select All" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Both" }));
    expect(dashboard).toHaveAttribute("data-view-mode", "timeline-list");
    expect(dashboard).toHaveClass("admin-dashboard-grid--both");
    expect(screen.getByRole("button", { name: "Select All" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Schedule context" })
    ).toBeInTheDocument();
  });
});
