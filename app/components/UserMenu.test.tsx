import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { UserMenu } from "./UserMenu";

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={typeof props.alt === "string" ? props.alt : ""} {...props} />
  ),
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("UserMenu", () => {
  const createProps = () => ({
    displayName: "Danyer",
    email: "danyer@example.com",
    photoURL: null,
    onLogout: vi.fn().mockResolvedValue(undefined),
    onOpenSettings: vi.fn(),
    isAdmin: true,
    isGoogleConnected: false,
    isCheckingGoogle: false,
    onConnectGoogle: vi.fn(),
    onSyncCalendar: vi.fn(),
  });

  it("renders the desktop account trigger flat with a circular avatar and name-first hierarchy", () => {
    const { container } = render(<UserMenu {...createProps()} />);

    const trigger = screen.getByRole("button", { name: /open account menu/i });
    const avatar = trigger.querySelector('[data-slot="account-avatar"]');
    const identity = trigger.querySelector('[data-slot="account-identity"]');
    const labels = identity?.querySelectorAll("span");

    expect(trigger).toHaveClass(
      "min-h-10",
      "border-0",
      "rounded-none",
      "focus-visible:outline-none",
      "focus-visible:ring-2"
    );
    expect(trigger).not.toHaveClass("rounded-xl");
    expect(trigger).not.toHaveClass("glass-control");
    expect(avatar).toHaveClass("rounded-full");
    expect(labels?.[0]).toHaveTextContent("Danyer");
    expect(labels?.[1]).toHaveTextContent("Account");
    expect(container.querySelector('[role="menu"]')).toBeNull();
  });

  it("renders the dropdown menu as a floating overlay anchored to the trigger", async () => {
    const props = createProps();
    vi.spyOn(HTMLDivElement.prototype, "getBoundingClientRect").mockReturnValue({
      x: 220,
      y: 24,
      width: 80,
      height: 40,
      top: 24,
      right: 300,
      bottom: 64,
      left: 220,
      toJSON: () => undefined,
    } as DOMRect);
    const { container } = render(<UserMenu {...props} />);

    fireEvent.click(screen.getByRole("button", { name: /open account menu/i }));

    const menu = await screen.findByRole("menu");
    expect(menu).toBeInTheDocument();
    expect(container.querySelector('[role="menu"]')).toBeNull();
    expect(document.body.querySelector('[role="menu"]')).toBe(menu);
    expect(menu).toHaveClass("fixed");
    expect(menu).toHaveStyle({ top: "76px", left: "16px", width: "288px" });
  });

  it("closes the dropdown when clicking outside", async () => {
    const props = createProps();
    render(<UserMenu {...props} />);

    fireEvent.click(screen.getByRole("button", { name: /open account menu/i }));
    expect(await screen.findByRole("menu")).toBeInTheDocument();

    fireEvent.mouseDown(document.body);

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
