import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it } from "vitest";

import { ProgressCard } from "./ProgressCard";

describe("ProgressCard", () => {
  afterEach(cleanup);

  it("centers each percentage inside its progress ring", () => {
    const { container } = render(
      <>
        <ProgressCard completed={3} total={4} label="This Week" />
        <ProgressCard completed={1} total={2} label="Today" />
      </>
    );

    const cards = container.querySelectorAll(".admin-progress-card");
    expect(cards).toHaveLength(2);

    cards.forEach((card) => {
      expect(card).toHaveClass("w-fit");

      const ring = card.querySelector("[data-progress-ring]");
      expect(ring).toHaveClass("relative", "items-center", "justify-center");

      const percentage = ring?.querySelector("strong");
      expect(percentage).toHaveClass("absolute", "inset-0", "items-baseline", "justify-center", "tabular-nums");
      const percentSign = percentage.querySelector("span:last-child");
      expect(percentSign).toHaveTextContent("%");
      expect(percentSign).toHaveClass("text-[20px]", "leading-none");
    });

    expect(screen.getByText("3 of 4 tasks completed")).toBeInTheDocument();
  });
});
