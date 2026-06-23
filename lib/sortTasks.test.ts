import { describe, expect, it } from "vitest";
import { sortTasks } from "./sortTasks";
import type { Task } from "@/types";

const createTask = (id: string, text: string, priority: Task["priority"]): Task => ({
  id,
  text,
  completed: false,
  priority,
});

describe("sortTasks", () => {
  const tasks: Task[] = [
    createTask("1", "Banana", "medium"),
    createTask("2", "Apple", "high"),
    createTask("3", "Cherry", "low"),
  ];

  it("sorts by priority high → medium → low", () => {
    const sorted = sortTasks(tasks, "priority");
    expect(sorted.map((t) => t.id)).toEqual(["2", "1", "3"]);
  });

  it("sorts alphabetically A → Z", () => {
    const sorted = sortTasks(tasks, "alphabetical");
    expect(sorted.map((t) => t.text)).toEqual(["Apple", "Banana", "Cherry"]);
  });

  it("preserves original order for date sort", () => {
    const sorted = sortTasks(tasks, "date");
    expect(sorted.map((t) => t.id)).toEqual(["1", "2", "3"]);
  });
});