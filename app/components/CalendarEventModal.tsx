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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-bg-surface rounded-xl shadow-2xl border border-border-subtle w-full max-w-md mx-4 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-subtle">
          <h2 className="text-xl font-bold text-text-primary">
            {isEditMode ? "Edit Event in Google Calendar" : "Create Event in Google Calendar"}
          </h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors p-1 rounded hover:bg-bg-main"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Task Info */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Tarea
            </label>
            <p className="text-text-primary bg-bg-main p-3 rounded-lg border border-border-subtle">
              {taskText}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Día
            </label>
            <p className="text-text-primary bg-bg-main p-3 rounded-lg border border-border-subtle">
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
              className="w-5 h-5 text-sapphire-600 rounded focus:ring-sapphire-500 cursor-pointer"
            />
            <label
              htmlFor="allDay"
              className="text-text-primary font-medium cursor-pointer"
            >
              Evento de día completo
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
                  Hora de inicio
                </label>
                <input
                  type="time"
                  id="startTime"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required={!isAllDay}
                  className="w-full p-3 border-2 border-border-subtle rounded-lg focus:outline-none focus:border-border-brand transition-colors bg-bg-surface text-text-primary"
                />
              </div>
              <div>
                <label
                  htmlFor="endTime"
                  className="block text-sm font-medium text-text-secondary mb-2"
                >
                  Hora de fin
                </label>
                <input
                  type="time"
                  id="endTime"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required={!isAllDay}
                  className="w-full p-3 border-2 border-border-subtle rounded-lg focus:outline-none focus:border-border-brand transition-colors bg-bg-surface text-text-primary"
                />
              </div>
            </div>
          )}

          {/* Validation: End time should be after start time */}
          {!isAllDay && startTime >= endTime && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-600 dark:text-red-400">
              ⚠️ La hora de fin debe ser posterior a la hora de inicio
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-bg-main text-text-primary rounded-lg font-medium hover:bg-bg-sidebar transition-colors border border-border-subtle"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!isAllDay && startTime >= endTime}
              className="flex-1 px-4 py-3 bg-sapphire-500 text-white rounded-lg font-medium hover:bg-sapphire-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEditMode ? "Actualizar Evento" : "Crear Evento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

