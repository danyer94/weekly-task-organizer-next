import { cleanup, render, screen, within } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it } from "vitest";

import { TodaySchedule } from "./TodaySchedule";
import type { Task } from "@/types";

const makeTask = (id: string, priority: Task["priority"], startTime: string): Task => ({
  id,
  text: `Task ${id}`,
  completed: false,
  priority,
  calendarEvent: {
    eventId: `event-${id}`,
    date: "2026-06-17",
    startTime,
    endTime: null,
  },
});

describe("TodaySchedule", () => {
  afterEach(cleanup);

  it("cycles dot colors by index regardless of priority", () => {
    const tasks: Task[] = [
      makeTask("1", "high", "09:00"),
      makeTask("2", "high", "10:00"),
      makeTask("3", "medium", "11:00"),
      makeTask("4", "low", "12:00"),
      makeTask("5", "high", "13:00"),
    ];

    const { container } = render(<TodaySchedule tasks={tasks} />);
    const dots = container.querySelectorAll(".h-3.w-3.rounded-full");

    expect(dots).toHaveLength(5);
    expect(dots[0]).toHaveClass("bg-blue-500");
    expect(dots[1]).toHaveClass("bg-emerald-500");
    expect(dots[2]).toHaveClass("bg-orange-400");
    expect(dots[3]).toHaveClass("bg-sapphire-500");
    expect(dots[4]).toHaveClass("bg-gray-400");
  });

  it("wraps colors after 5 tasks using modulo", () => {
    const tasks: Task[] = [
      makeTask("1", "low", "09:00"),
      makeTask("2", "low", "10:00"),
      makeTask("3", "low", "11:00"),
      makeTask("4", "low", "12:00"),
      makeTask("5", "low", "13:00"),
      makeTask("6", "low", "14:00"),
    ];

    const { container } = render(<TodaySchedule tasks={tasks} />);
    const dots = container.querySelectorAll(".h-3.w-3.rounded-full");

    expect(dots).toHaveLength(6);
    // 6th dot wraps to first color
    expect(dots[5]).toHaveClass("bg-blue-500");
  });

  it("shows fewer colors when fewer tasks exist", () => {
    const tasks: Task[] = [
      makeTask("1", "high", "09:00"),
      makeTask("2", "medium", "10:00"),
      makeTask("3", "low", "11:00"),
    ];

    const { container } = render(<TodaySchedule tasks={tasks} />);
    const dots = container.querySelectorAll(".h-3.w-3.rounded-full");

    expect(dots).toHaveLength(3);
    expect(dots[0]).toHaveClass("bg-blue-500");
    expect(dots[1]).toHaveClass("bg-emerald-500");
    expect(dots[2]).toHaveClass("bg-orange-400");
  });
});
