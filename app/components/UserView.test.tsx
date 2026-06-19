import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { UserView } from "./UserView";
import type { Day, TasksByDay } from "@/types";

const days: Day[] = ["Monday", "Tuesday", "Wednesday"];

const tasks: TasksByDay = {
  Monday: [
    {
      id: "task-1",
      text: "Review weekly plan",
      completed: false,
      priority: "medium",
    },
  ],
  Tuesday: [],
  Wednesday: [],
};

const createProps = () => ({
  currentDay: "Monday" as Day,
  days,
  onDayChange: vi.fn(),
  tasks,
  onToggleComplete: vi.fn(),
  onTimelineScheduleChange: vi.fn(),
  groupByPriority: true,
  setGroupByPriority: vi.fn(),
  selectedDate: new Date(2026, 5, 15, 12),
  onDateChange: vi.fn(),
  displayName: "Ramon",
});

describe("UserView", () => {
  afterEach(cleanup);

  beforeEach(() => {
    window.localStorage.clear();
  });

  it("exposes the selected weekday with pressed-button semantics", () => {
    const props = createProps();
    render(<UserView {...props} />);

    const mondayButton = screen.getByRole("button", {
      name: /^Monday 0\/1 tasks$/i,
    });
    const tuesdayButton = screen.getByRole("button", {
      name: /^Tuesday 0\/0 tasks$/i,
    });

    expect(mondayButton).toHaveAttribute("aria-pressed", "true");
    expect(tuesdayButton).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(tuesdayButton);
    expect(props.onDayChange).toHaveBeenCalledWith("Tuesday");
  });

  it("scopes Admin-only timeline selectors to Admin mode", () => {
    const css = readFileSync(resolve(process.cwd(), "app/globals.css"), "utf8");
    const adminTimelineSelector =
      /\.admin-timeline-(?:empty|task--timed)\b/;
    const selectorLists = Array.from(css.matchAll(/([^{}]+)\{/g), ([, list]) =>
      list.replace(/\/\*[\s\S]*?\*\//g, "").trim(),
    );
    const matchingSelectors = selectorLists.flatMap((list) =>
      list
        .split(",")
        .map((selector) => selector.trim())
        .filter((selector) => adminTimelineSelector.test(selector)),
    );

    expect(matchingSelectors.length).toBeGreaterThan(0);
    const isAdminModeDescendant = (selector: string) => {
      const timelineIndex = selector.search(adminTimelineSelector);
      const ancestorPath = selector.slice(0, timelineIndex);

      return (
        /^\.admin-shell\.admin-mode\s+/.test(ancestorPath) &&
        !/[+~>]/.test(ancestorPath)
      );
    };

    expect(
      [
        ".admin-shell.admin-mode + .admin-timeline-empty",
        ".admin-shell.admin-mode ~ .admin-timeline-empty",
        ".admin-shell.admin-mode > .admin-timeline-empty",
      ].some(isAdminModeDescendant),
    ).toBe(false);
    expect(matchingSelectors.filter((selector) => !isAdminModeDescendant(selector))).toEqual([]);
  });
});
