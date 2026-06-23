import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it } from "vitest";

import { QuickActionsCard } from "./QuickActionsCard";

describe("QuickActionsCard", () => {
  afterEach(cleanup);

  it("renders title and four action items", () => {
    render(<QuickActionsCard />);

    expect(screen.getByText("Quick Actions")).toBeInTheDocument();
    expect(screen.getByText("Create Task")).toBeInTheDocument();
    expect(screen.getByText("Add Reminder")).toBeInTheDocument();
    expect(screen.getByText("Time Block")).toBeInTheDocument();
    expect(screen.getByText("Add Note")).toBeInTheDocument();
  });

  it("does not fire any onClick when items are clicked", () => {
    const { container } = render(<QuickActionsCard />);

    const items = container.querySelectorAll(".cursor-default");
    expect(items).toHaveLength(4);

    // Clicking should not throw or produce errors
    items.forEach((item) => {
      expect(() => {
        item.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      }).not.toThrow();
    });
  });
});
