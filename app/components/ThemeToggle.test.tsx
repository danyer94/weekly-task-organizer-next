import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ThemeToggle } from "./ThemeToggle";

const matchMediaMock = vi.fn();

beforeEach(() => {
  window.localStorage.clear();
  matchMediaMock.mockReturnValue({
    matches: false,
    media: "(prefers-color-scheme: dark)",
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  });
  vi.stubGlobal("matchMedia", matchMediaMock);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("ThemeToggle", () => {
  it("shows both theme icons and toggles the active theme", () => {
    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: "Toggle Theme" });
    const icons = button.querySelectorAll<HTMLElement>("[data-theme-icon]");

    expect(icons).toHaveLength(2);
    expect(document.documentElement).not.toHaveClass("dark");
    expect(window.localStorage.getItem("theme")).toBe("light");
    expect(icons[0]).toHaveClass(
      "top-1/2",
      "-translate-y-1/2",
      "left-0.5",
      "scale-100",
      "opacity-100",
      "rounded-full",
      "bg-bg-surface",
    );
    expect(icons[0]).not.toHaveClass("left-1/2", "-translate-x-1/2");
    expect(icons[1]).toHaveClass(
      "right-1.5",
      "scale-75",
      "opacity-40",
      "blur-0",
    );
    expect(icons[1]).not.toHaveClass(
      "border",
      "bg-bg-surface",
      "shadow-sm",
      "blur-[4px]",
    );

    fireEvent.click(button);

    expect(document.documentElement).toHaveClass("dark");
    expect(window.localStorage.getItem("theme")).toBe("dark");
    expect(icons[0]).toHaveClass("scale-75", "opacity-40", "blur-0");
    expect(icons[0]).toHaveClass("left-1.5");
    expect(icons[0]).not.toHaveClass(
      "border",
      "bg-bg-surface",
      "shadow-sm",
      "blur-[4px]",
    );
    expect(icons[1]).toHaveClass(
      "top-1/2",
      "-translate-y-1/2",
      "right-0.5",
      "scale-100",
      "opacity-100",
      "rounded-full",
      "bg-bg-surface",
    );
    expect(icons[1]).not.toHaveClass("right-1/2", "translate-x-1/2");
  });

  it("keeps the icon layers non-interactive and toggles from the visible icon area", () => {
    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: "Toggle Theme" });
    const icons = button.querySelectorAll<HTMLElement>("[data-theme-icon]");

    expect(icons).toHaveLength(2);
    expect(icons[0]).toHaveClass("pointer-events-none");
    expect(icons[1]).toHaveClass("pointer-events-none");

    fireEvent.click(icons[0]);

    expect(document.documentElement).toHaveClass("dark");
    expect(window.localStorage.getItem("theme")).toBe("dark");
  });
});
