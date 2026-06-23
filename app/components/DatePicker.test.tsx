import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DatePicker } from "./DatePicker";

describe("DatePicker", () => {
  afterEach(cleanup);

  it("renders the calendar icon at 30px while keeping the selected-day styling", async () => {
    const onChange = vi.fn();
    render(<DatePicker selectedDate={new Date(2026, 5, 17, 12)} onChange={onChange} />);

    const trigger = screen.getByRole("button", { name: /Wednesday, June 17/i });
    const icon = trigger.querySelector("svg");

    expect(icon).toHaveClass("h-[30px]", "w-[30px]");

    fireEvent.click(trigger);

    const selectedDay = await screen.findByRole("button", { name: "17" });
    expect(selectedDay).toHaveClass("bg-border-brand", "text-white");
  });

  it("shows text beside the week navigation icons without changing their labels", () => {
    render(
      <DatePicker
        selectedDate={new Date(2026, 5, 17, 12)}
        onChange={vi.fn()}
      />
    );

    const previous = screen.getByRole("button", { name: "Previous week" });
    const next = screen.getByRole("button", { name: "Next week" });

    expect(previous).toHaveTextContent("Previous");
    expect(previous.querySelector("svg")).toBeInTheDocument();
    expect(next).toHaveTextContent("Next");
    expect(next.querySelector("svg")).toBeInTheDocument();
  });
});
