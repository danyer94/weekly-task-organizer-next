import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { TasksByDay } from "@/types";

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
});
