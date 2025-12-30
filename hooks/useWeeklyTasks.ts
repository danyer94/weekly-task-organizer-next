import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  saveTasks,
  subscribeToTasks,
  getLegacyTasks,
  fetchTasksOnce,
} from "@/lib/firebase"; // Ensure this internal path works or use relative
import { Task, Day, Priority, TasksByDay } from "@/types";
import { getWeekPath } from "@/lib/calendarMapper";
import { format, startOfWeek, endOfWeek, addDays } from "date-fns";

export const DAYS: Day[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const CARRY_OVER_STORAGE_KEY = "weekly-task-organizer:lastCarryOverDate";
const toDayName = (date: Date): Day => DAYS[(date.getDay() + 6) % 7];
const toDateKey = (date: Date): string => format(date, "yyyy-MM-dd");
const parseDateKey = (key: string): Date => new Date(`${key}T00:00:00`);
const normalizeTasksByDay = (data?: TasksByDay | null): TasksByDay => {
  const normalized: TasksByDay = {};
  DAYS.forEach((day) => {
    const list = data?.[day];
    normalized[day] = Array.isArray(list) ? list : [];
  });
  return normalized;
};

export const useWeeklyTasks = (selectedDate: Date = new Date()) => {
  // Path for current selection
  const currentPath = useMemo(() => getWeekPath(selectedDate), [selectedDate]);

  // State
  const [tasks, setTasks] = useState<TasksByDay>({});
  const [isClient, setIsClient] = useState(false);
  const [syncStatus, setSyncStatus] = useState<
    "synced" | "connecting" | "error"
  >("connecting");
  const isLocalChange = useRef(false);
  const hasMigrated = useRef(false);
  const lastCarryOverDateRef = useRef<string | null>(null);
  const isCarryingOverRef = useRef(false);
  const latestTasksRef = useRef<TasksByDay>({});
  const lastLocalUpdateRef = useRef<number>(0);

  // No migration needed anymore as it's overwriting data on reload
  const setIsClientOnce = useRef(false);
  useEffect(() => {
    if (!setIsClientOnce.current) {
      setIsClient(true);
      setIsClientOnce.current = true;
    }
  }, []);

  // Subscribe to Firebase at current path
  useEffect(() => {
    setSyncStatus("connecting");
    const unsubscribe = subscribeToTasks((data) => {
      // Shield local state from Firebase updates for 2 seconds after a manual local change
      // This prevents "stale" events or "ack" events from overwriting the latest local truth
      const now = performance.now();
      const lastLocalUpdate = lastLocalUpdateRef.current;
      if (lastLocalUpdate > 0 && now - lastLocalUpdate < 2000) {
        return;
      }

      if (data) {
        const normalized = normalizeTasksByDay(data);
        latestTasksRef.current = normalized;
        setTasks(normalized);
        setSyncStatus("synced");
      } else {
        const normalized = normalizeTasksByDay();
        latestTasksRef.current = normalized;
        setTasks(normalized);
        setSyncStatus("synced");
      }
    }, currentPath);

    return () => unsubscribe();
  }, [currentPath]);

  // Helper to update tasks and sync to Firebase
  const updateTasks = useCallback(
    async (updater: (prev: TasksByDay) => TasksByDay) => {
      setSyncStatus("connecting");

      // Update protection timestamp
      lastLocalUpdateRef.current = performance.now();

      // Use the ref as the synchronous source of truth for the update
      const nextTasks = updater(latestTasksRef.current);

      // Update both ref and state
      latestTasksRef.current = nextTasks;
      setTasks(nextTasks);

      try {
        const success = await saveTasks(nextTasks, currentPath);
        if (success) {
          setSyncStatus("synced");
        } else {
          setSyncStatus("error");
        }
      } catch (error) {
        console.error("Failed to persist tasks:", error);
        setSyncStatus("error");
      }
    },
    [currentPath]
  );

  const persistLastCarryOverDate = useCallback((dateKey: string) => {
    lastCarryOverDateRef.current = dateKey;
    if (typeof window !== "undefined") {
      localStorage.setItem(CARRY_OVER_STORAGE_KEY, dateKey);
    }
  }, []);

  const applyLocalTasks = useCallback((data: TasksByDay) => {
    latestTasksRef.current = data;
    setTasks(data);
  }, []);

  const moveIncompleteTasksForward = useCallback(
    async (fromDate: Date, toDate: Date) => {
      const sourcePath = getWeekPath(fromDate);
      const targetPath = getWeekPath(toDate);
      const sourceDay = toDayName(fromDate);
      const targetDay = toDayName(toDate);

      // Always fetch fresh data for carry-over to avoid stale state issues
      const [sourceSnapshot, targetSnapshot] = await Promise.all([
        fetchTasksOnce(sourcePath),
        sourcePath === targetPath ? null : fetchTasksOnce(targetPath),
      ]);

      const normalizedSource = normalizeTasksByDay(
        sourceSnapshot as TasksByDay
      );
      const tasksToMove = (normalizedSource[sourceDay] || []).filter(
        (t) => !t.completed
      );

      if (tasksToMove.length === 0) return;

      const sanitizedCopies = tasksToMove.map((task) => ({
        ...task,
        id: Date.now() + Math.random(),
        completed: false,
        calendarEvent: null,
      }));

      if (sourcePath === targetPath) {
        const updatedWeek: TasksByDay = {
          ...normalizedSource,
          [targetDay]: [
            ...(normalizedSource[targetDay] || []),
            ...sanitizedCopies,
          ],
        };

        const ok = await saveTasks(updatedWeek, sourcePath);
        if (sourcePath === currentPath) {
          // If update is for current week, also update local protection and state
          lastLocalUpdateRef.current = performance.now();
          applyLocalTasks(updatedWeek);
          setSyncStatus(ok ? "synced" : "error");
        }
        return;
      }

      const normalizedTarget = normalizeTasksByDay(
        targetSnapshot as TasksByDay
      );

      const updatedTarget: TasksByDay = {
        ...normalizedTarget,
        [targetDay]: [
          ...(normalizedTarget[targetDay] || []),
          ...sanitizedCopies,
        ],
      };

      const ok = await saveTasks(updatedTarget, targetPath);

      if (targetPath === currentPath) {
        // If update is for current week, also update local protection and state
        lastLocalUpdateRef.current = performance.now();
        applyLocalTasks(updatedTarget);
        setSyncStatus(ok ? "synced" : "error");
      }
    },
    [applyLocalTasks, currentPath]
  );

  const ensureCarryOver = useCallback(async () => {
    if (typeof window === "undefined") return;
    if (isCarryingOverRef.current) return;

    isCarryingOverRef.current = true;
    try {
      if (!lastCarryOverDateRef.current) {
        lastCarryOverDateRef.current = localStorage.getItem(
          CARRY_OVER_STORAGE_KEY
        );
      }

      const today = new Date();
      const todayKey = toDateKey(today);

      if (!lastCarryOverDateRef.current) {
        const yesterday = addDays(today, -1);
        await moveIncompleteTasksForward(yesterday, today);
        persistLastCarryOverDate(todayKey);
        return;
      }

      let cursor = addDays(parseDateKey(lastCarryOverDateRef.current), 1);
      while (toDateKey(cursor) <= todayKey) {
        const fromDate = addDays(cursor, -1);
        await moveIncompleteTasksForward(fromDate, cursor);
        persistLastCarryOverDate(toDateKey(cursor));
        cursor = addDays(cursor, 1);
      }
    } catch (error) {
      console.error(
        "Failed to carry over incomplete tasks automatically",
        error
      );
    } finally {
      isCarryingOverRef.current = false;
    }
  }, [moveIncompleteTasksForward, persistLastCarryOverDate]);

  useEffect(() => {
    if (!isClient) return;
    ensureCarryOver();
    const interval = window.setInterval(() => {
      ensureCarryOver();
    }, 60 * 1000);
    return () => window.clearInterval(interval);
  }, [ensureCarryOver, isClient]);

  // --- Task Operations ---

  const addTask = (day: Day, text: string, priority: Priority) => {
    if (!text.trim()) return;
    updateTasks((prev) => ({
      ...prev,
      [day]: [
        ...(prev[day] || []),
        {
          id: Date.now(),
          text,
          completed: false,
          priority,
        },
      ],
    }));
  };

  const deleteTask = (day: Day, id: number) => {
    updateTasks((prev) => {
      const dayTasks = prev[day] || [];
      const newDayTasks = dayTasks.filter((t) => t.id !== id);
      return {
        ...prev,
        [day]: newDayTasks,
      };
    });
  };

  const toggleComplete = (day: Day, id: number) => {
    updateTasks((prev) => ({
      ...prev,
      [day]: (prev[day] || []).map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ),
    }));
  };

  const editTask = (
    day: Day,
    id: number,
    newText: string,
    newPriority?: Priority
  ) => {
    updateTasks((prev) => ({
      ...prev,
      [day]: (prev[day] || []).map((t) =>
        t.id === id
          ? { ...t, text: newText, priority: newPriority || t.priority }
          : t
      ),
    }));
  };

  const updateTaskCalendarEvent = (
    day: Day,
    id: number,
    calendarEvent: {
      eventId: string;
      date: string;
      startTime?: string;
      endTime?: string;
    } | null
  ) => {
    updateTasks((prev) => ({
      ...prev,
      [day]: (prev[day] || []).map((t) =>
        t.id === id
          ? {
              ...t,
              calendarEvent: calendarEvent
                ? {
                    eventId: calendarEvent.eventId,
                    date: calendarEvent.date,
                    startTime: calendarEvent.startTime ?? null,
                    endTime: calendarEvent.endTime ?? null,
                    lastSynced: Date.now(),
                  }
                : null,
            }
          : t
      ),
    }));
  };

  const reorderTasks = (day: Day, fromIndex: number, toIndex: number) => {
    updateTasks((prev) => {
      const newDayTasks = [...(prev[day] || [])];
      const [movedTask] = newDayTasks.splice(fromIndex, 1);
      newDayTasks.splice(toIndex, 0, movedTask);
      return { ...prev, [day]: newDayTasks };
    });
  };

  // --- Bulk Operations ---

  const deleteSelected = (currentDay: Day, selectedIds: Set<number>) => {
    if (selectedIds.size === 0) return;

    updateTasks((prev) => ({
      ...prev,
      [currentDay]: (prev[currentDay] || []).filter(
        (t) => !selectedIds.has(t.id)
      ),
    }));
  };

  const clearCompleted = () => {
    if (!window.confirm("Clear all completed tasks from all days?")) return;
    updateTasks((prev) => {
      const newTasks: any = {};
      Object.keys(prev).forEach((key) => {
        const day = key as Day;
        newTasks[day] = (prev[day] || []).filter((t) => !t.completed);
      });
      return newTasks;
    });
  };

  const moveOrCopyTasks = (
    currentDay: Day,
    selectedIds: Set<number>,
    targetDays: Day[],
    isMove: boolean
  ) => {
    const currentDayTasks = tasks[currentDay] || [];
    const tasksToProcess = currentDayTasks.filter((t) => selectedIds.has(t.id));

    updateTasks((prev) => {
      const newTasks = { ...prev };

      targetDays.forEach((day) => {
        const currentTargetTasks = [...(newTasks[day] || [])];
        const tasksToAdd = tasksToProcess.map((task) => ({
          ...task,
          id: Date.now() + Math.random(),
          completed: false,
        }));
        newTasks[day] = [...currentTargetTasks, ...tasksToAdd];
      });

      if (isMove) {
        newTasks[currentDay] = (newTasks[currentDay] || []).filter(
          (t) => !selectedIds.has(t.id)
        );
      }

      return newTasks;
    });
  };

  const bulkAddTasks = (day: Day, textBlock: string) => {
    const lines = textBlock.split("\n").filter((l) => l.trim());
    if (lines.length === 0) return;

    updateTasks((prev) => ({
      ...prev,
      [day]: [
        ...(prev[day] || []),
        ...lines.map((line) => ({
          id: Date.now() + Math.random(),
          text: line.trim(),
          completed: false,
          priority: "medium" as Priority,
        })),
      ],
    }));
  };

  // --- Import / Export ---

  const exportToWhatsApp = () => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
    const priorityEmoji = { high: "🔴", medium: "🟠", low: "🟢" };
    let text = `📋 *Weekly Task Organizer (${format(
      weekStart,
      "MMM d"
    )} - ${format(weekEnd, "MMM d")})*\n\n`;

    DAYS.forEach((day) => {
      const dayTasks = tasks[day] || [];
      if (dayTasks.length > 0) {
        text += `*${day}*\n`;
        dayTasks.forEach((task) => {
          const status = task.completed ? "✅" : "⬜";
          const pri = priorityEmoji[task.priority] || "🟠";
          text += `${status} ${pri} ${task.text}\n`;
        });
        text += "\n";
      }
    });

    navigator.clipboard
      .writeText(text)
      .then(() => alert("✅ Tasks copied to clipboard!"))
      .catch(() => alert("❌ Failed to copy (check browser permissions)"));
  };

  const exportToJSON = () => {
    const exportData = {
      version: "1.1",
      exportDate: new Date().toISOString(),
      weekPath: currentPath,
      tasks,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `weekly-tasks-backup-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importFromJSON = async (file: File) => {
    const text = await file.text();
    try {
      const importData = JSON.parse(text);
      if (!importData.tasks || typeof importData.tasks !== "object") {
        throw new Error("Invalid format");
      }

      const normalizedTasks: TasksByDay = {};
      DAYS.forEach((day) => {
        normalizedTasks[day] = Array.isArray(importData.tasks[day])
          ? importData.tasks[day]
          : [];
      });

      if (window.confirm("⚠️ Replace ALL current tasks?")) {
        updateTasks(() => normalizedTasks);
        alert("✅ Imported successfully!");
      }
    } catch (e) {
      alert("❌ Invalid file format");
    }
  };

  const getTotalTasks = () =>
    Object.values(tasks).reduce((sum, list) => sum + (list?.length || 0), 0);
  const getCompletedTasks = () =>
    Object.values(tasks).reduce(
      (sum, list) => sum + (list?.filter((t) => t.completed).length || 0),
      0
    );

  return {
    tasks,
    isClient,
    syncStatus,
    addTask,
    deleteTask,
    itemOperations: { toggleComplete, editTask, updateTaskCalendarEvent }, // grouping for cleaner props
    reorderTasks,
    bulkOperations: {
      deleteSelected,
      clearCompleted,
      moveOrCopyTasks,
      bulkAddTasks,
    },
    ioOperations: { exportToWhatsApp, exportToJSON, importFromJSON },
    stats: { total: getTotalTasks(), completed: getCompletedTasks() },
  };
};
