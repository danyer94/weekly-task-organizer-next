import { cleanup, render, screen, within } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it } from "vitest";

import { PriorityBreakdown } from "./PriorityBreakdown";
import type { Task } from "@/types";

const makeTask = (priority: Task["priority"]): Task => ({
  id: `task-${Math.random()}`,
  text: "Test task",
  completed: false,
  priority,
});

describe("PriorityBreakdown", () => {
  afterEach(cleanup);

  it("renders correct counts for mixed priorities", () => {
    const tasks: Task[] = [
      makeTask("high"),
      makeTask("high"),
      makeTask("medium"),
      makeTask("medium"),
      makeTask("medium"),
      makeTask("low"),
    ];

    const { container } = render(<PriorityBreakdown tasks={tasks} />);

    expect(screen.getByText("Priority Breakdown")).toBeInTheDocument();

    // Each row is a flex container with justify-between
    const rows = container.querySelectorAll(".flex.items-center.justify-between");
    expect(rows).toHaveLength(3);

    // High: 2, Medium: 3, Low: 1
    expect(within(rows[0] as HTMLElement).getByText("2")).toBeInTheDocument();
    expect(within(rows[1] as HTMLElement).getByText("3")).toBeInTheDocument();
    expect(within(rows[2] as HTMLElement).getByText("1")).toBeInTheDocument();
  });

  it("shows all zeros when no tasks exist", () => {
    render(<PriorityBreakdown tasks={[]} />);

    expect(screen.getByText("Priority Breakdown")).toBeInTheDocument();

    const counts = screen.getAllByText("0");
    expect(counts).toHaveLength(3);
  });

  it("renders colored dots for each priority level", () => {
    const { container } = render(
      <PriorityBreakdown tasks={[makeTask("high"), makeTask("medium"), makeTask("low")]} />
    );

    // Dots are small colored circles inside the row containers
    const rows = container.querySelectorAll(".flex.items-center.justify-between");
    const dot0 = rows[0].querySelector(".rounded-full");
    const dot1 = rows[1].querySelector(".rounded-full");
    const dot2 = rows[2].querySelector(".rounded-full");

    expect(dot0).toHaveClass("bg-rose-500");
    expect(dot1).toHaveClass("bg-amber-500");
    expect(dot2).toHaveClass("bg-emerald-500");
  });
});
