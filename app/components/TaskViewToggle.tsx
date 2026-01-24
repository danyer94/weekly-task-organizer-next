import React from "react";

export type TaskViewMode = "list" | "timeline" | "timeline-list";

interface TaskViewToggleProps {
  value: TaskViewMode;
  onChange: (value: TaskViewMode) => void;
  className?: string;
}

const OPTIONS: Array<{ value: TaskViewMode; label: string }> = [
  { value: "list", label: "List" },
  { value: "timeline", label: "Timeline" },
  { value: "timeline-list", label: "List & Timeline" },
];

export const TaskViewToggle: React.FC<TaskViewToggleProps> = ({
  value,
  onChange,
  className = "",
}) => {
  return (
    <div
      className={`flex w-full flex-col gap-1 rounded-2xl border border-border-subtle/60 bg-bg-main/50 p-1 sm:flex-row ${className}`}
      role="tablist"
      aria-label="Task view mode"
    >
      {OPTIONS.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={isActive}
            className={`flex-1 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40 sm:text-sm ${
              isActive
                ? "bg-bg-surface/90 text-text-primary shadow-sm border-border-subtle/60"
                : "border-transparent text-text-secondary hover:text-text-primary hover:border-border-subtle/40"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
