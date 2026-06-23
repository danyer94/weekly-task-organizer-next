import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { TasksByDay } from "@/types";
import { getWeekPath } from "@/lib/calendarMapper";

const {
  saveTasksMock,
  subscribeToTasksMock,
  fetchTasksOnceMock,
  fetchLastCarryOverDateMock,
  advanceLastCarryOverDateMock,
  createTaskIdMock,
} = vi.hoisted(() => ({
  saveTasksMock: vi.fn(),
  subscribeToTasksMock: vi.fn(),
  fetchTasksOnceMock: vi.fn(),
  fetchLastCarryOverDateMock: vi.fn(),
  advanceLastCarryOverDateMock: vi.fn(),
  createTaskIdMock: vi.fn(),
}));

vi.mock("@/lib/firebase", () => ({
  saveTasks: saveTasksMock,
  subscribeToTasks: subscribeToTasksMock,
  getLegacyTasks: vi.fn(),
  fetchTasksOnce: fetchTasksOnceMock,
  fetchLastCarryOverDate: fetchLastCarryOverDateMock,
  advanceLastCarryOverDate: advanceLastCarryOverDateMock,
  createTaskId: createTaskIdMock,
  getUserPath: vi.fn(),
}));

import { useWeeklyTasks } from "./useWeeklyTasks";

const initialTasks: TasksByDay = {
  Monday: [
    {
      id: "task-1",
      text: "Finish report",
      completed: true,
      priority: "high",
    },
  ],
  Tuesday: [],
  Wednesday: [],
  Thursday: [],
  Friday: [],
  Saturday: [],
  Sunday: [],
};

describe("useWeeklyTasks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    saveTasksMock.mockResolvedValue(true);
    fetchTasksOnceMock.mockResolvedValue(initialTasks);
    fetchLastCarryOverDateMock.mockResolvedValue(
      new Date().toISOString().slice(0, 10)
    );
    advanceLastCarryOverDateMock.mockResolvedValue(undefined);
    createTaskIdMock.mockReturnValue("new-task-id");
    subscribeToTasksMock.mockImplementation((uid, onData) => {
      onData(initialTasks);
      return () => {
        void uid;
      };
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("treats same-day moves as a no-op", async () => {
    const selectedDate = new Date("2026-03-16T12:00:00Z");
    const { result } = renderHook(() =>
      useWeeklyTasks(selectedDate, "user-123")
    );

    await waitFor(() => {
      expect(result.current.tasks.Monday).toHaveLength(1);
    });

    await act(async () => {
      const outcome = result.current.bulkOperations.moveOrCopyTasks(
        "Monday",
        new Set(["task-1"]),
        ["Monday"],
        true
      );

      expect(outcome.createdTasks).toEqual([]);
    });

    expect(saveTasksMock).not.toHaveBeenCalled();
    expect(result.current.tasks.Monday).toEqual(initialTasks.Monday);
  });

  it("treats same-date moves as a no-op", async () => {
    const selectedDate = new Date("2026-03-16T12:00:00Z");
    const { result } = renderHook(() =>
      useWeeklyTasks(selectedDate, "user-123")
    );

    await waitFor(() => {
      expect(result.current.tasks.Monday).toHaveLength(1);
    });

    await act(async () => {
      const outcome = await result.current.bulkOperations.moveOrCopyTasksToDate(
        "Monday",
        new Set(["task-1"]),
        new Date("2026-03-16T12:00:00Z"),
        true
      );

      expect(outcome.createdTasks).toEqual([]);
    });

    expect(saveTasksMock).not.toHaveBeenCalled();
    expect(fetchTasksOnceMock).not.toHaveBeenCalled();
  });

  it("does not subscribe until a real selected date exists", () => {
    renderHook(() => useWeeklyTasks(null, "user-123"));

    expect(subscribeToTasksMock).not.toHaveBeenCalled();
  });

  it("uses the latest uid for task writes after auth changes", async () => {
    createTaskIdMock.mockImplementation((uid: string) => `task-for-${uid}`);

    const selectedDate = new Date("2026-03-16T12:00:00Z");
    const { result, rerender } = renderHook(
      ({ uid }: { uid: string }) => useWeeklyTasks(selectedDate, uid),
      {
        initialProps: { uid: "user-a" },
      }
    );

    await waitFor(() => {
      expect(result.current.tasks.Monday).toHaveLength(1);
    });

    rerender({ uid: "user-b" });

    await act(async () => {
      result.current.addTask("Monday", "New task", "medium");
    });

    await waitFor(() => {
      expect(saveTasksMock).toHaveBeenLastCalledWith(
        "user-b",
        expect.objectContaining({
          Monday: expect.arrayContaining([
            expect.objectContaining({
              id: "task-for-user-b",
              text: "New task",
            }),
          ]),
        }),
        expect.any(String)
      );
    });
    expect(createTaskIdMock).toHaveBeenCalledWith("user-b");
  });

  it("persists added tasks to the selected week and day path without schema changes", async () => {
    const selectedDate = new Date(2026, 5, 18, 12);
    const { result } = renderHook(() =>
      useWeeklyTasks(selectedDate, "user-123")
    );

    await waitFor(() => {
      expect(result.current.tasks.Monday).toHaveLength(1);
    });

    await act(async () => {
      result.current.addTask("Thursday", "Plan cross-week review", "high");
    });

    await waitFor(() => {
      expect(saveTasksMock).toHaveBeenLastCalledWith(
        "user-123",
        expect.objectContaining({
          Thursday: expect.arrayContaining([
            expect.objectContaining({
              id: "new-task-id",
              text: "Plan cross-week review",
              completed: false,
              priority: "high",
            }),
          ]),
        }),
        getWeekPath(selectedDate)
      );
    });

    const savedTasks = saveTasksMock.mock.lastCall?.[1] as TasksByDay;
    const savedTask = savedTasks.Thursday?.find(
      (task) => task.id === "new-task-id"
    );
    expect(savedTask).not.toHaveProperty("dueDate");
    expect(savedTask).not.toHaveProperty("tags");
  });

  it("persists addTask with optional calendarEvent metadata", async () => {
    const selectedDate = new Date(2026, 5, 18, 12);
    const { result } = renderHook(() =>
      useWeeklyTasks(selectedDate, "user-123")
    );

    await waitFor(() => {
      expect(result.current.tasks.Monday).toHaveLength(1);
    });

    const calendarEvent = {
      eventId: "event-123",
      date: "2026-06-18",
      startTime: "14:30",
      endTime: "15:30",
    };

    await act(async () => {
      result.current.addTask("Thursday", "Meeting with team", "high", calendarEvent);
    });

    await waitFor(() => {
      expect(saveTasksMock).toHaveBeenLastCalledWith(
        "user-123",
        expect.objectContaining({
          Thursday: expect.arrayContaining([
            expect.objectContaining({
              id: "new-task-id",
              text: "Meeting with team",
              completed: false,
              priority: "high",
              calendarEvent: expect.objectContaining({
                eventId: "event-123",
                date: "2026-06-18",
                startTime: "14:30",
                endTime: "15:30",
              }),
            }),
          ]),
        }),
        getWeekPath(selectedDate)
      );
    });
  });

  it("persists addTask without calendarEvent omits metadata", async () => {
    const selectedDate = new Date(2026, 5, 18, 12);
    const { result } = renderHook(() =>
      useWeeklyTasks(selectedDate, "user-123")
    );

    await waitFor(() => {
      expect(result.current.tasks.Monday).toHaveLength(1);
    });

    await act(async () => {
      result.current.addTask("Thursday", "Prepare report", "medium");
    });

    await waitFor(() => {
      expect(saveTasksMock).toHaveBeenLastCalledWith(
        "user-123",
        expect.objectContaining({
          Thursday: expect.arrayContaining([
            expect.objectContaining({
              id: "new-task-id",
              text: "Prepare report",
              completed: false,
              priority: "medium",
            }),
          ]),
        }),
        getWeekPath(selectedDate)
      );
    });

    const savedTasks = saveTasksMock.mock.lastCall?.[1] as TasksByDay;
    const savedTask = savedTasks.Thursday?.find(
      (task) => task.id === "new-task-id"
    );
    expect(savedTask).not.toHaveProperty("calendarEvent");
  });

  it("persists calendar event updates for tasks moved to another week", async () => {
    const selectedDate = new Date("2026-03-16T12:00:00Z");
    fetchTasksOnceMock.mockResolvedValueOnce({
      Monday: [
        {
          id: "copied-task",
          text: "Copied task",
          completed: false,
          priority: "medium",
          calendarEvent: {
            eventId: "",
            date: "2026-03-23",
            startTime: "09:00",
            endTime: "10:00",
            lastSynced: null,
          },
        },
      ],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: [],
    });

    const { result } = renderHook(() =>
      useWeeklyTasks(selectedDate, "user-123")
    );

    await waitFor(() => {
      expect(result.current.tasks.Monday).toHaveLength(1);
    });

    await act(async () => {
      await result.current.itemOperations.setTaskCalendarEventForDate(
        new Date("2026-03-23T12:00:00Z"),
        "Monday",
        "copied-task",
        {
          eventId: "event-99",
          date: "2026-03-23",
          startTime: "09:00",
          endTime: "10:00",
        }
      );
    });

    expect(saveTasksMock).toHaveBeenCalledWith(
      "user-123",
      expect.objectContaining({
        Monday: expect.arrayContaining([
          expect.objectContaining({
            id: "copied-task",
            calendarEvent: expect.objectContaining({
              eventId: "event-99",
              date: "2026-03-23",
            }),
          }),
        ]),
      }),
      expect.stringMatching(/^weeks\//)
    );
  });
});
