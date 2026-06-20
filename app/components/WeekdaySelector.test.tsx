import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { WeekdaySelector } from "./WeekdaySelector";
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

describe("WeekdaySelector", () => {
  afterEach(cleanup);

  it("renders the Monday-Sunday dates and completion counts", () => {
    render(
      <WeekdaySelector
        days={days}
        selectedDay="Wednesday"
        selectedDate={new Date(2026, 5, 17, 12)}
        tasks={tasks}
        onDayChange={vi.fn()}
      />,
    );

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
  });

  it("exposes one selected day with accessible native button semantics", () => {
    render(
      <WeekdaySelector
        days={days}
        selectedDay="Wednesday"
        selectedDate={new Date(2026, 5, 17, 12)}
        tasks={tasks}
        onDayChange={vi.fn()}
      />,
    );

    const buttons = days.map((day) =>
      screen.getByRole("button", { name: `Show ${day} tasks` }),
    );

    expect(
      buttons.filter((button) => button.getAttribute("aria-pressed") === "true"),
    ).toHaveLength(1);
    expect(buttons[2]).toHaveAttribute("aria-pressed", "true");

    for (const [index, button] of buttons.entries()) {
      expect(button).toHaveAttribute("title", days[index]);
      expect(button).toHaveProperty("tabIndex", 0);
    }
  });

  it("calls onDayChange with the clicked day", () => {
    const onDayChange = vi.fn();
    render(
      <WeekdaySelector
        days={days}
        selectedDay="Wednesday"
        selectedDate={new Date(2026, 5, 17, 12)}
        tasks={tasks}
        onDayChange={onDayChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Show Thursday tasks" }));

    expect(onDayChange).toHaveBeenCalledOnce();
    expect(onDayChange).toHaveBeenCalledWith("Thursday");
  });
});
