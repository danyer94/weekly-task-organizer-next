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
      <div className="bg-white rounded-xl shadow-lg p-4">
        <h4 className="font-bold text-purple-600 mb-3 px-2">Days</h4>
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
                    ? "bg-purple-600 text-white shadow-md"
                    : "bg-purple-50 text-purple-700 hover:bg-purple-100"
                }`}
              >
                <span className="font-medium">{day}</span>
                <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                  isActive ? "bg-white text-purple-600" : "bg-black text-white"
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
      <div className="bg-white rounded-xl shadow-lg p-6">
        <QuickActions {...quickActionsProps} />
      </div>
    </div>
  );
};
