"use client";
import React, { useEffect, useState } from "react";
import { KeyRound, User, XCircle } from "lucide-react";
import { useAuth } from "./AuthProvider";

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDisplayName?: string;
  email?: string | null;
}

type Notice = { type: "success" | "error"; message: string } | null;

const getAuthMessage = (error: any, fallback: string) => {
  const code = error?.code;
  if (code === "auth/requires-recent-login") {
    return "Please log out and sign in again to update sensitive info.";
  }
  if (code === "auth/weak-password") {
    return "Password should be at least 6 characters.";
  }
  return error?.message || fallback;
};

export const UserSettingsModal: React.FC<UserSettingsModalProps> = ({
  isOpen,
  onClose,
  initialDisplayName,
  email,
}) => {
  const { updateDisplayName, updateUserPassword } = useAuth();
  const [displayName, setDisplayName] = useState(initialDisplayName || "");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [nameNotice, setNameNotice] = useState<Notice>(null);
  const [passwordNotice, setPasswordNotice] = useState<Notice>(null);

  useEffect(() => {
    if (!isOpen) return;
    setDisplayName(initialDisplayName || "");
    setPassword("");
    setPasswordConfirm("");
    setNameNotice(null);
    setPasswordNotice(null);
  }, [isOpen, initialDisplayName]);

  const handleUpdateName = async () => {
    const trimmed = displayName.trim();
    if (!trimmed) {
      setNameNotice({ type: "error", message: "Display name is required." });
      return;
    }

    setSavingName(true);
    setNameNotice(null);
    try {
      await updateDisplayName(trimmed);
      setNameNotice({ type: "success", message: "Display name updated." });
    } catch (error) {
      setNameNotice({ type: "error", message: getAuthMessage(error, "Failed to update name.") });
    } finally {
      setSavingName(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (password.length < 6) {
      setPasswordNotice({ type: "error", message: "Password should be at least 6 characters." });
      return;
    }
    if (password !== passwordConfirm) {
      setPasswordNotice({ type: "error", message: "Passwords do not match." });
      return;
    }

    setSavingPassword(true);
    setPasswordNotice(null);
    try {
      await updateUserPassword(password);
      setPassword("");
      setPasswordConfirm("");
      setPasswordNotice({ type: "success", message: "Password updated." });
    } catch (error) {
      setPasswordNotice({ type: "error", message: getAuthMessage(error, "Failed to update password.") });
    } finally {
      setSavingPassword(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel rounded-2xl shadow-2xl border border-border-subtle/60 w-full max-w-lg mx-4 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-text-primary">User settings</h3>
            <p className="text-sm text-text-secondary">
              Update your profile and security settings.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Close user settings"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-border-subtle/60 bg-bg-main/50 p-4">
            <div className="flex items-center gap-2 mb-4 text-text-primary">
              <User className="w-4 h-4 text-sky-400" />
              <h4 className="text-sm font-bold uppercase tracking-[0.2em]">Profile</h4>
            </div>
            <label className="text-xs font-semibold text-text-secondary block mb-2">Display name</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Your display name"
                className="flex-1 px-4 py-3 rounded-xl border border-border-subtle bg-bg-surface/80 text-text-primary focus:outline-none focus:border-border-brand transition-colors"
              />
              <button
                onClick={handleUpdateName}
                disabled={savingName}
                className="px-4 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-sapphire-500 to-cyan-500 text-white shadow-lg hover:-translate-y-0.5 transition-transform disabled:opacity-60"
                type="button"
              >
                {savingName ? "Saving..." : "Save name"}
              </button>
            </div>
            {email && (
              <p className="mt-3 text-xs text-text-tertiary">
                Signed in as <span className="text-text-secondary">{email}</span>
              </p>
            )}
            {nameNotice && (
              <div
                className={`mt-3 text-xs rounded-lg px-3 py-2 border ${
                  nameNotice.type === "success"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-red-500/10 text-red-400 border-red-500/30"
                }`}
              >
                {nameNotice.message}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border-subtle/60 bg-bg-main/50 p-4">
            <div className="flex items-center gap-2 mb-4 text-text-primary">
              <KeyRound className="w-4 h-4 text-sky-400" />
              <h4 className="text-sm font-bold uppercase tracking-[0.2em]">Security</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="New password"
                className="px-4 py-3 rounded-xl border border-border-subtle bg-bg-surface/80 text-text-primary focus:outline-none focus:border-border-brand transition-colors"
              />
              <input
                type="password"
                value={passwordConfirm}
                onChange={(event) => setPasswordConfirm(event.target.value)}
                placeholder="Confirm password"
                className="px-4 py-3 rounded-xl border border-border-subtle bg-bg-surface/80 text-text-primary focus:outline-none focus:border-border-brand transition-colors"
              />
            </div>
            <button
              onClick={handleUpdatePassword}
              disabled={savingPassword}
              className="mt-3 px-4 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg hover:-translate-y-0.5 transition-transform disabled:opacity-60"
              type="button"
            >
              {savingPassword ? "Updating..." : "Update password"}
            </button>
            <p className="mt-2 text-xs text-text-tertiary">
              Password updates may require a recent sign-in.
            </p>
            {passwordNotice && (
              <div
                className={`mt-3 text-xs rounded-lg px-3 py-2 border ${
                  passwordNotice.type === "success"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-red-500/10 text-red-400 border-red-500/30"
                }`}
              >
                {passwordNotice.message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
