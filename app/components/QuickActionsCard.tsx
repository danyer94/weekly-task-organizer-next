import React from "react";
import { FilePlus2, Bell, Clock, StickyNote } from "lucide-react";

interface QuickActionsCardProps {
  className?: string;
}

const ACTIONS = [
  { label: "Create Task", icon: FilePlus2 },
  { label: "Add Reminder", icon: Bell },
  { label: "Time Block", icon: Clock },
  { label: "Add Note", icon: StickyNote },
];

export const QuickActionsCard: React.FC<QuickActionsCardProps> = ({
  className = "",
}) => {
  return (
    <div className={`admin-schedule-card relative overflow-hidden rounded-[7px] p-5 ${className}`}>
      <h3 className="mb-4 text-sm font-semibold text-text-primary">
        Quick Actions
      </h3>
      <div className="space-y-0.5">
        {ACTIONS.map(({ label, icon: Icon }) => (
          <button
            key={label}
            type="button"
            className="flex w-full cursor-default items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-gray-50 active:scale-[0.98] dark:hover:bg-gray-800/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40"
          >
            <Icon className="h-4 w-4 shrink-0 text-text-secondary" />
            <span className="text-xs font-semibold text-text-primary">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
