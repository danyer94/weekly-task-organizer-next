"use client";
import React, { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Calendar, ChevronDown, LogOut, Settings, User as UserIcon } from "lucide-react";

interface UserMenuProps {
  displayName: string;
  email?: string | null;
  photoURL?: string | null;
  onLogout: () => Promise<void>;
  onOpenSettings: () => void;
  isAdmin: boolean;
  isGoogleConnected: boolean;
  isCheckingGoogle: boolean;
  onConnectGoogle: () => void;
  onSyncCalendar: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  displayName,
  email,
  photoURL,
  onLogout,
  onOpenSettings,
  isAdmin,
  isGoogleConnected,
  isCheckingGoogle,
  onConnectGoogle,
  onSyncCalendar,
}) => {
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    right: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (!open) return;

    const updateMenuPosition = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 8,
        right: Math.max(window.innerWidth - rect.right, 16),
      });
    };

    updateMenuPosition();

    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const handleLogout = async () => {
    try {
      await onLogout();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const menu = open && menuPosition
    ? createPortal(
        <div
          ref={menuRef}
          className="fixed w-64 max-w-[calc(100vw-2rem)] glass-panel rounded-xl shadow-2xl overflow-hidden z-[120] animate-fade-in motion-reduce:animate-none"
          style={{
            top: menuPosition.top,
            right: menuPosition.right,
          }}
          role="menu"
        >
          <div className="px-4 py-3 border-b border-border-subtle/60">
            <div className="text-xs uppercase tracking-[0.3em] text-text-tertiary">Signed in</div>
            <div className="text-sm font-semibold text-text-primary">{displayName}</div>
            {email && <div className="text-xs text-text-secondary truncate">{email}</div>}
          </div>
          <div className="flex flex-col p-2 gap-2">
            {isAdmin && (
              <div className="glass-subpanel flex flex-col gap-1 rounded-lg p-2">
                <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-bg-sidebar/70 text-[10px] uppercase tracking-[0.3em] text-text-tertiary">
                  <Calendar className="w-3 h-3 text-emerald-300" />
                  <span>Calendar</span>
                </div>
                <button
                  onClick={() => {
                    setOpen(false);
                    onConnectGoogle();
                  }}
                  className={`w-full px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/40 ${
                    isGoogleConnected
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-200"
                      : "text-text-primary hover:bg-bg-main/70"
                  }`}
                  role="menuitem"
                >
                  <span>
                    {isCheckingGoogle
                      ? "Checking Google..."
                      : isGoogleConnected
                      ? "Google Connected"
                      : "Connect Google Calendar"}
                  </span>
                </button>
                {isGoogleConnected && (
                  <button
                    onClick={() => {
                      setOpen(false);
                      onSyncCalendar();
                    }}
                    className="w-full px-3 py-2 rounded-lg text-sm font-semibold text-text-primary hover:bg-bg-main/70 transition-colors flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40"
                    role="menuitem"
                  >
                    <span>Sync Calendar</span>
                  </button>
                )}
              </div>
            )}
            <div className="glass-subpanel flex flex-col gap-1 rounded-lg p-2">
              <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-bg-sidebar/70 text-[10px] uppercase tracking-[0.3em] text-text-tertiary">
                <UserIcon className="w-3 h-3 text-sky-300" />
                <span>Account</span>
              </div>
              <button
                onClick={() => {
                  setOpen(false);
                  onOpenSettings();
                }}
                className="w-full px-3 py-2 rounded-lg text-sm font-semibold text-text-primary hover:bg-bg-main/70 transition-colors flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40"
                role="menuitem"
              >
                <Settings className="w-4 h-4 text-border-brand" />
                <span>Manage account</span>
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  handleLogout();
                }}
                className="w-full px-3 py-2 rounded-lg text-sm font-semibold text-red-300 hover:bg-red-500/10 transition-colors flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/50"
                role="menuitem"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <div className="relative" ref={containerRef}>
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="glass-control flex items-center gap-3 px-2 sm:px-3 py-2 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40"
          aria-haspopup="menu"
          aria-expanded={open}
        >
          {photoURL ? (
            <Image
              src={photoURL}
              alt="User"
              width={40}
              height={40}
              unoptimized
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-border-hover shadow-lg object-cover"
            />
          ) : (
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-bg-sidebar border border-border-subtle flex items-center justify-center text-text-tertiary shadow-sm">
              <UserIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          )}
          <div className="hidden sm:flex flex-col items-start min-w-0">
            <span className="text-[10px] uppercase tracking-[0.3em] text-text-tertiary">Account</span>
            <span className="text-sm font-semibold text-text-primary truncate max-w-[140px]">
              {displayName}
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 sm:w-4 sm:h-4 text-text-secondary transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>
      {menu}
    </>
  );
};
