import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

interface CalendarEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (startTime: string, endTime: string) => void;
  taskText: string;
  day: string;
  initialStartTime?: string;
  initialEndTime?: string;
  isEditMode?: boolean;
}

export const CalendarEventModal: React.FC<CalendarEventModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  taskText,
  day,
  initialStartTime,
  initialEndTime,
  isEditMode = false,
}) => {
  const [startTime, setStartTime] = useState(initialStartTime || "09:00");
  const [endTime, setEndTime] = useState(initialEndTime || "10:00");
  const [isAllDay, setIsAllDay] = useState(!initialStartTime && !initialEndTime);
  
  // Update state when initial values change (when modal opens with different task)
  useEffect(() => {
    if (isOpen) {
      setStartTime(initialStartTime || "09:00");
      setEndTime(initialEndTime || "10:00");
      setIsAllDay(!initialStartTime && !initialEndTime);
    }
  }, [isOpen, initialStartTime, initialEndTime]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAllDay) {
      // Pass empty strings for all-day events (will be converted to undefined in handler)
      onConfirm("", "");
    } else {
      onConfirm(startTime, endTime);
    }
    onClose();
  };

  const handleAllDayChange = (checked: boolean) => {
    setIsAllDay(checked);
    if (checked) {
      // Reset times when switching to all-day
      setStartTime("09:00");
      setEndTime("10:00");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
      <div className="glass-panel rounded-2xl shadow-2xl border border-border-subtle/60 w-full max-w-md mx-4 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-subtle/60">
          <h2 className="text-xl font-bold text-text-primary">
            {isEditMode ? "Edit Event in Google Calendar" : "Create Event in Google Calendar"}
          </h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors p-1 rounded hover:bg-bg-main/70"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Task Info */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Task
            </label>
            <p className="text-text-primary bg-bg-main/70 p-3 rounded-xl border border-border-subtle/60">
              {taskText}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Day
            </label>
            <p className="text-text-primary bg-bg-main/70 p-3 rounded-xl border border-border-subtle/60">
              {day}
            </p>
          </div>

          {/* All-day Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="allDay"
              checked={isAllDay}
              onChange={(e) => handleAllDayChange(e.target.checked)}
              className="w-5 h-5 text-sapphire-600 rounded focus:ring-sapphire-500 cursor-pointer accent-sky-500"
            />
            <label
              htmlFor="allDay"
              className="text-text-primary font-medium cursor-pointer"
            >
              All-day event
            </label>
          </div>

          {/* Time Selection (only if not all-day) */}
          {!isAllDay && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="startTime"
                  className="block text-sm font-medium text-text-secondary mb-2"
                >
                  Start time
                </label>
                <input
                  type="time"
                  id="startTime"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required={!isAllDay}
                  className="w-full p-3 border border-border-subtle rounded-xl focus:outline-none focus:border-border-brand transition-colors bg-bg-surface/80 text-text-primary"
                />
              </div>
              <div>
                <label
                  htmlFor="endTime"
                  className="block text-sm font-medium text-text-secondary mb-2"
                >
                  End time
                </label>
                <input
                  type="time"
                  id="endTime"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required={!isAllDay}
                  className="w-full p-3 border border-border-subtle rounded-xl focus:outline-none focus:border-border-brand transition-colors bg-bg-surface/80 text-text-primary"
                />
              </div>
            </div>
          )}

          {/* Validation: End time should be after start time */}
          {!isAllDay && startTime >= endTime && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-600 dark:text-red-400">
              ⚠️ End time must be after start time
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:flex-1 px-4 py-3 bg-bg-main/70 text-text-primary rounded-xl font-medium hover:bg-bg-sidebar transition-colors border border-border-subtle/60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isAllDay && startTime >= endTime}
              className="w-full sm:flex-1 px-4 py-3 bg-gradient-to-r from-sapphire-500 to-cyan-500 text-white rounded-xl font-medium hover:shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEditMode ? "Update Event" : "Create Event"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
