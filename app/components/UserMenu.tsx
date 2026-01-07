"use client";
import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, Settings, User as UserIcon } from "lucide-react";

interface UserMenuProps {
  displayName: string;
  email?: string | null;
  photoURL?: string | null;
  onLogout: () => Promise<void>;
  onOpenSettings: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  displayName,
  email,
  photoURL,
  onLogout,
  onOpenSettings,
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const handleClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
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

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-3 px-3 py-2 rounded-xl bg-bg-main/70 border border-border-subtle hover:border-border-hover transition-colors"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {photoURL ? (
          <img
            src={photoURL}
            alt="User"
            className="w-10 h-10 rounded-xl border border-border-hover shadow-lg object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center text-sky-400 shadow-lg">
            <UserIcon className="w-5 h-5" />
          </div>
        )}
        <div className="hidden sm:flex flex-col items-start min-w-0">
          <span className="text-[10px] uppercase tracking-[0.3em] text-text-tertiary">Account</span>
          <span className="text-sm font-semibold text-text-primary truncate max-w-[140px]">
            {displayName}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-text-secondary transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-64 glass-panel rounded-xl border border-border-subtle/60 shadow-2xl overflow-hidden z-50 animate-fade-in"
          role="menu"
        >
          <div className="px-4 py-3 border-b border-border-subtle/60">
            <div className="text-xs uppercase tracking-[0.3em] text-text-tertiary">Signed in</div>
            <div className="text-sm font-semibold text-text-primary">{displayName}</div>
            {email && <div className="text-xs text-text-secondary truncate">{email}</div>}
          </div>
          <div className="flex flex-col p-2 gap-1">
            <button
              onClick={() => {
                setOpen(false);
                onOpenSettings();
              }}
              className="w-full px-3 py-2 rounded-lg text-sm font-semibold text-text-primary hover:bg-bg-main/70 transition-colors flex items-center gap-2"
              role="menuitem"
            >
              <Settings className="w-4 h-4 text-sky-400" />
              <span>Manage account</span>
            </button>
            <button
              onClick={() => {
                setOpen(false);
                handleLogout();
              }}
              className="w-full px-3 py-2 rounded-lg text-sm font-semibold text-red-300 hover:bg-red-500/10 transition-colors flex items-center gap-2"
              role="menuitem"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
