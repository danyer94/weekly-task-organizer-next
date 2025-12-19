import React from "react";
import { Day } from "@/types";
import { QuickActions } from "./QuickActions";
import { TaskStats } from "./TaskStats";

interface SidebarProps {
  days: Day[];
  currentDay: Day;
  onDayChange: (day: Day) => void;
  tasks: any;
  stats: { total: number; completed: number };
  quickActionsProps: any; // Passing through props for QuickActions
}

export const Sidebar: React.FC<SidebarProps> = ({
  days,
  currentDay,
  onDayChange,
  tasks,
  stats,
  quickActionsProps,
}) => {
  return (
    <div className="space-y-6">
      {/* Days Navigation */}
      <div className="bg-bg-surface rounded-xl shadow-lg p-4 font-sans border border-border-subtle">
        <h4 className="font-bold text-text-brand mb-3 px-2">Days</h4>
        <div className="space-y-2">
          {days.map((day) => {
            const dayTasks = tasks[day] || [];
            const completedCount = dayTasks.filter((t: any) => t.completed).length;
            const totalCount = dayTasks.length;
            
            const isActive = currentDay === day;
            
            return (
              <button
                key={day}
                onClick={() => onDayChange(day)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-sapphire-500 text-white shadow-md"
                    : "bg-bg-main text-text-primary hover:bg-sapphire-100 dark:hover:bg-sapphire-800 hover:text-sapphire-700 dark:hover:text-white"
                }`}
              >
                <span className="font-medium">{day}</span>
                <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                  isActive ? "bg-white text-sapphire-600" : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                }`}>
                  {completedCount}/{totalCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <TaskStats total={stats.total} completed={stats.completed} />

      {/* Quick Actions */}
      <div className="bg-bg-surface rounded-xl shadow-lg p-6 border border-border-subtle">
        <QuickActions {...quickActionsProps} />
      </div>
    </div>
  );
};
