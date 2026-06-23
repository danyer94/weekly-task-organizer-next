import type { Task } from "@/types";

const priorityOrder: Record<string, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export function sortTasks(tasks: Task[], sortMode: "priority" | "alphabetical" | "date"): Task[] {
  if (sortMode === "priority") {
    return [...tasks].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }
  if (sortMode === "alphabetical") {
    return [...tasks].sort((a, b) => a.text.localeCompare(b.text));
  }
  // date: preserve original order
  return [...tasks];
}