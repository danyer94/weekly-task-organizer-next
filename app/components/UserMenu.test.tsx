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

  it("renders the dropdown menu as an anchored dropdown", async () => {
    const props = createProps();
    const { container } = render(<UserMenu {...props} />);

    fireEvent.click(screen.getByRole("button", { name: /open account menu/i }));

    const menu = await screen.findByRole("menu");
    expect(menu).toBeInTheDocument();
    expect(container.querySelector('[role="menu"]')).toBe(menu);
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
