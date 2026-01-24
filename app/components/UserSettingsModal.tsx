"use client";
import React, { useEffect, useState } from "react";
import { KeyRound, MailCheck, User, XCircle } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { getAuthErrorMessage } from "@/lib/errors";
import { database, getUserPath } from "@/lib/firebase";
import { get, ref, update } from "firebase/database";
import type { DailySummarySettings } from "@/types";

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDisplayName?: string;
  email?: string | null;
}

type Notice = { type: "success" | "error"; message: string } | null;

export const UserSettingsModal: React.FC<UserSettingsModalProps> = ({
  isOpen,
  onClose,
  initialDisplayName,
  email,
}) => {
  const { updateDisplayName, updateUserPassword, user } = useAuth();
  const [displayName, setDisplayName] = useState(initialDisplayName || "");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [nameNotice, setNameNotice] = useState<Notice>(null);
  const [passwordNotice, setPasswordNotice] = useState<Notice>(null);
  const [dailySummaryEnabled, setDailySummaryEnabled] = useState(false);
  const [dailySummaryEmail, setDailySummaryEmail] = useState(email || "");
  const [savingDailySummary, setSavingDailySummary] = useState(false);
  const [dailySummaryNotice, setDailySummaryNotice] = useState<Notice>(null);
  const [dailySummaryLoading, setDailySummaryLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setDisplayName(initialDisplayName || "");
    setPassword("");
    setPasswordConfirm("");
    setNameNotice(null);
    setPasswordNotice(null);
    setDailySummaryNotice(null);
  }, [isOpen, initialDisplayName]);

  useEffect(() => {
    if (!isOpen || !user) return;
    const loadSettings = async () => {
      setDailySummaryLoading(true);
      setDailySummaryNotice(null);
      try {
        const settingsRef = ref(
          database,
          getUserPath(user.uid, "settings/notifications/dailySummary")
        );
        const snapshot = await get(settingsRef);
        if (!snapshot.exists()) {
          setDailySummaryEnabled(false);
          setDailySummaryEmail(email || "");
          return;
        }
        const settings = snapshot.val() as DailySummarySettings;
        setDailySummaryEnabled(Boolean(settings?.enabled));
        setDailySummaryEmail(
          settings?.email ?? email ?? ""
        );
      } catch (error) {
        console.error("Failed to load daily summary settings", error);
        setDailySummaryNotice({
          type: "error",
          message: "We couldn't load daily summary settings.",
        });
      } finally {
        setDailySummaryLoading(false);
      }
    };

    loadSettings();
  }, [email, isOpen, user]);

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

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
      setNameNotice({ type: "error", message: getAuthErrorMessage(error, "We couldn't update your name.") });
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
      setPasswordNotice({
        type: "error",
        message: getAuthErrorMessage(error, "We couldn't update your password. Please try again."),
      });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSaveDailySummary = async () => {
    if (!user) {
      setDailySummaryNotice({
        type: "error",
        message: "You must be signed in to update notifications.",
      });
      return;
    }

    const trimmedEmail = dailySummaryEmail.trim();
    if (dailySummaryEnabled) {
      if (!trimmedEmail) {
        setDailySummaryNotice({
          type: "error",
          message: "Please provide an email for the daily summary.",
        });
        return;
      }
      if (!isValidEmail(trimmedEmail)) {
        setDailySummaryNotice({
          type: "error",
          message: "Please enter a valid email address.",
        });
        return;
      }
    }

    setSavingDailySummary(true);
    setDailySummaryNotice(null);
    try {
      const settingsRef = ref(
        database,
        getUserPath(user.uid, "settings/notifications/dailySummary")
      );
      const payload: DailySummarySettings = {
        enabled: dailySummaryEnabled,
        email: trimmedEmail || null,
        updatedAt: Date.now(),
      };
      await update(settingsRef, payload);
      setDailySummaryNotice({
        type: "success",
        message: "Daily summary preferences saved.",
      });
    } catch (error) {
      console.error("Failed to save daily summary settings", error);
      setDailySummaryNotice({
        type: "error",
        message: "We couldn't save your daily summary settings.",
      });
    } finally {
      setSavingDailySummary(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/50 flex items-start sm:items-center justify-center z-50 backdrop-blur-sm animate-fade-in motion-reduce:animate-none overflow-y-auto px-4 py-6 overscroll-contain">
      <div className="glass-panel rounded-2xl shadow-2xl border border-border-subtle/70 w-full max-w-lg p-5 sm:p-6 max-h-[92vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-6 gap-3">
          <div>
            <h3 className="text-xl font-bold text-text-primary">User settings</h3>
            <p className="text-sm text-text-secondary">
              Update your profile and security settings.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40"
            aria-label="Close user settings"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-border-subtle/60 bg-bg-surface/60 p-4">
            <div className="flex items-center gap-2 mb-4 text-text-primary">
              <User className="w-4 h-4 text-border-brand" />
              <h4 className="text-sm font-bold uppercase tracking-[0.2em]">Profile</h4>
            </div>
            <label className="text-xs font-semibold text-text-secondary block mb-2">Display name</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Your display name"
                name="displayName"
                autoComplete="name"
                className="flex-1 px-4 py-3 rounded-xl border border-border-subtle bg-bg-surface/80 text-text-primary focus:outline-none focus:border-border-brand focus-visible:ring-2 focus-visible:ring-border-brand/30 transition-colors"
              />
              <button
                onClick={handleUpdateName}
                disabled={savingName}
                className="w-full sm:w-auto px-4 py-3 rounded-xl font-semibold text-sm bg-sapphire-700 text-white shadow-sm hover:bg-sapphire-600 transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40"
                type="button"
              >
                {savingName ? "Saving…" : "Save name"}
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
                role="status"
                aria-live="polite"
              >
                {nameNotice.message}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border-subtle/60 bg-bg-surface/60 p-4">
            <div className="flex items-center gap-2 mb-4 text-text-primary">
              <KeyRound className="w-4 h-4 text-border-brand" />
              <h4 className="text-sm font-bold uppercase tracking-[0.2em]">Security</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="New password"
                aria-label="New password"
                name="newPassword"
                autoComplete="new-password"
                className="px-4 py-3 rounded-xl border border-border-subtle bg-bg-surface/80 text-text-primary focus:outline-none focus:border-border-brand focus-visible:ring-2 focus-visible:ring-border-brand/30 transition-colors"
              />
              <input
                type="password"
                value={passwordConfirm}
                onChange={(event) => setPasswordConfirm(event.target.value)}
                placeholder="Confirm password"
                aria-label="Confirm password"
                name="confirmPassword"
                autoComplete="new-password"
                className="px-4 py-3 rounded-xl border border-border-subtle bg-bg-surface/80 text-text-primary focus:outline-none focus:border-border-brand focus-visible:ring-2 focus-visible:ring-border-brand/30 transition-colors"
              />
            </div>
            <button
              onClick={handleUpdatePassword}
              disabled={savingPassword}
              className="mt-3 w-full sm:w-auto px-4 py-3 rounded-xl font-semibold text-sm bg-slate-800 text-white shadow-sm hover:bg-slate-700 transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40"
              type="button"
            >
              {savingPassword ? "Updating…" : "Update password"}
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
                role="status"
                aria-live="polite"
              >
                {passwordNotice.message}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border-subtle/60 bg-bg-surface/60 p-4">
            <div className="flex items-center gap-2 mb-4 text-text-primary">
              <MailCheck className="w-4 h-4 text-border-brand" />
              <h4 className="text-sm font-bold uppercase tracking-[0.2em]">Daily summary</h4>
            </div>
            <p className="text-xs text-text-tertiary mb-4">
              Get a daily recap of your tasks delivered to the email you choose.
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border-subtle/60 bg-bg-surface/60 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-text-primary">
                  Email daily summary
                </p>
                <p className="text-xs text-text-tertiary">
                  Turn this on to receive your scheduled summary.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={dailySummaryEnabled}
                onClick={() => setDailySummaryEnabled((prev) => !prev)}
                className={`relative inline-flex h-8 w-14 items-center rounded-full border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40 ${
                  dailySummaryEnabled
                    ? "bg-border-brand border-transparent"
                    : "bg-bg-main/80 border-border-subtle/60"
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                    dailySummaryEnabled ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-start">
              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-2">
                  Summary delivery email
                </label>
                <input
                  type="email"
                  value={dailySummaryEmail}
                  onChange={(event) => setDailySummaryEmail(event.target.value)}
                  placeholder="name@company.com"
                  disabled={!dailySummaryEnabled}
                  name="dailySummaryEmail"
                  autoComplete="email"
                  spellCheck={false}
                  className={`w-full px-4 py-3 rounded-xl border border-border-subtle bg-bg-surface/80 text-text-primary focus:outline-none focus:border-border-brand focus-visible:ring-2 focus-visible:ring-border-brand/30 transition-colors ${
                    !dailySummaryEnabled ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                />
              </div>
              <button
                onClick={handleSaveDailySummary}
                disabled={savingDailySummary || dailySummaryLoading}
                className="h-12 w-full sm:w-auto mt-2 sm:mt-7 px-4 py-3 rounded-xl font-semibold text-sm bg-sapphire-700 text-white shadow-sm hover:bg-sapphire-600 transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40"
                type="button"
              >
                {savingDailySummary
                  ? "Saving…"
                  : dailySummaryLoading
                    ? "Loading…"
                    : "Save preferences"}
              </button>

            </div>
            {dailySummaryNotice && (
              <div
                className={`mt-3 text-xs rounded-lg px-3 py-2 border ${
                  dailySummaryNotice.type === "success"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-red-500/10 text-red-400 border-red-500/30"
                }`}
                role="status"
                aria-live="polite"
              >
                {dailySummaryNotice.message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
