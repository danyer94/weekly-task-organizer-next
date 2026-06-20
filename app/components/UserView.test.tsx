import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { UserView } from "./UserView";
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

  it("renders the shared seven-day Admin strip contract", () => {
    const props = createProps();
    render(<UserView {...props} />);

    const group = screen.getByRole("group", { name: "Week days" });
    const buttons = within(group).getAllByRole("button");
    const mondayButton = screen.getByRole("button", { name: "Show Monday tasks" });
    const tuesdayButton = screen.getByRole("button", { name: "Show Tuesday tasks" });

    expect(group).toHaveAttribute("data-slot", "week-day-strip");
    expect(buttons).toHaveLength(7);
    expect(buttons.map((button) => button.textContent)).toEqual([
      "MonJun 150/1",
      "TueJun 160/0",
      "WedJun 170/0",
      "ThuJun 180/0",
      "FriJun 190/0",
      "SatJun 200/0",
      "SunJun 210/0",
    ]);
    expect(mondayButton.querySelector('[data-slot="week-day-date"]')).toHaveTextContent(
      "Jun 15",
    );
    expect(mondayButton.querySelector('[data-slot="week-day-count"]')).toHaveTextContent(
      "0/1",
    );
    expect(mondayButton).toHaveAttribute("aria-pressed", "true");
    expect(tuesdayButton).toHaveAttribute("aria-pressed", "false");
    expect(
      buttons.filter((button) => button.getAttribute("aria-pressed") === "true"),
    ).toHaveLength(1);

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
