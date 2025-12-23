import { useState, useEffect, useRef, useCallback } from "react";
import { saveTasks, subscribeToTasks } from "@/lib/firebase"; // Ensure this internal path works or use relative
import { Task, Day, Priority, TasksByDay } from "@/types";

export const DAYS: Day[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const useWeeklyTasks = () => {
  // State
  const [tasks, setTasks] = useState<TasksByDay>({});
  const [isClient, setIsClient] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());
  const [syncStatus, setSyncStatus] = useState<
    "synced" | "connecting" | "error"
  >("connecting");
  const isLocalChange = useRef(false);

  // Initialize client-side state
  useEffect(() => {
    setIsClient(true);

    // Subscribe to Firebase
    const unsubscribe = subscribeToTasks((data) => {
      if (isLocalChange.current) {
        isLocalChange.current = false;
        return;
      }

      if (data) {
        setTasks(data);
        setSyncStatus("synced");
      } else {
        // Initialize empty state if DB is empty
        const initialTasks: TasksByDay = {};
        DAYS.forEach((day) => (initialTasks[day] = []));
        setTasks(initialTasks);
        setSyncStatus("synced");
      }
    });

    return () => unsubscribe(); // Cleanup subscription if possible (depends on implementation)
  }, []);

  // Helper to update tasks and sync to Firebase
  const updateTasks = useCallback(
    (updater: (prev: TasksByDay) => TasksByDay) => {
      isLocalChange.current = true;
      setTasks((prev) => {
        const newTasks = updater(prev);
        saveTasks(newTasks)
          .then((success) => setSyncStatus(success ? "synced" : "error"))
          .catch(() => setSyncStatus("error"));
        return newTasks;
      });
      setSyncStatus("connecting");
    },
    []
  );

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
    updateTasks((prev) => ({
      ...prev,
      [day]: (prev[day] || []).filter((t) => t.id !== id),
    }));
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
    calendarEvent: { date: string; startTime?: string; endTime?: string } | null
  ) => {
    updateTasks((prev) => ({
      ...prev,
      [day]: (prev[day] || []).map((t) =>
        t.id === id ? { ...t, calendarEvent: calendarEvent || undefined } : t
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
    if (!window.confirm(`Delete ${selectedIds.size} task(s)?`)) return;

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
    const priorityEmoji = { high: "🔴", medium: "🟠", low: "🟢" };
    let text = "📋 *Weekly Task Organizer*\n\n";

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
      version: "1.0",
      exportDate: new Date().toISOString(),
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
