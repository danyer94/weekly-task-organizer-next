import React from "react";
import { Task } from "@/types";

interface PriorityBreakdownProps {
  tasks: Task[];
  className?: string;
}

const PRIORITY_CONFIG = [
  { key: "high" as const, label: "High", dotClass: "bg-rose-500", darkRing: "ring-rose-500/30" },
  { key: "medium" as const, label: "Medium", dotClass: "bg-amber-500", darkRing: "ring-amber-500/30" },
  { key: "low" as const, label: "Low", dotClass: "bg-emerald-500", darkRing: "ring-emerald-500/30" },
];

export const PriorityBreakdown: React.FC<PriorityBreakdownProps> = ({
  tasks,
  className = "",
}) => {
  const counts = {
    high: tasks.filter((t) => t.priority === "high").length,
    medium: tasks.filter((t) => t.priority === "medium").length,
    low: tasks.filter((t) => t.priority === "low").length,
  };

  return (
    <div className={`admin-schedule-card relative overflow-hidden rounded-[7px] p-5 ${className}`}>
      <h3 className="mb-4 text-sm font-semibold text-text-primary">
        Priority Breakdown
      </h3>
      <div className="space-y-3">
        {PRIORITY_CONFIG.map(({ key, label, dotClass, darkRing }) => (
          <div key={key} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className={`h-2.5 w-2.5 rounded-full ring-4 dark:ring-3 ${dotClass} ${darkRing}`} />
              <span className="text-xs font-semibold text-text-primary">{label}</span>
            </div>
            <span className="text-xs font-medium text-text-secondary">{counts[key]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
