import React from "react";
import { Day } from "@/types";
import { QuickActions } from "./QuickActions";
import { TaskStats } from "./TaskStats";
import { DatePicker } from "./DatePicker";

interface SidebarProps {
  days: Day[];
  currentDay: Day;
  onDayChange: (day: Day) => void;
  tasks: any;
  stats: { total: number; completed: number };
  quickActionsProps: any;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  days,
  currentDay,
  onDayChange,
  tasks,
  stats,
  quickActionsProps,
  selectedDate,
  onDateChange,
}) => {
  return (
    <div className="space-y-6">
      {/* Date Selection */}
      <DatePicker 
        selectedDate={selectedDate} 
        onChange={onDateChange} 
      />

      {/* Days Navigation */}
      <div className="glass-panel rounded-2xl p-4 font-sans border border-border-subtle/60">
        <h4 className="font-bold text-text-brand mb-3 px-2 uppercase tracking-[0.3em] text-xs">
          Days
        </h4>
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
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all hover:-translate-y-0.5 ${
                  isActive
                    ? "bg-gradient-to-r from-sapphire-500 to-cyan-500 text-white shadow-lg"
                    : "bg-bg-main/70 text-text-primary hover:bg-sapphire-100/80 dark:hover:bg-sapphire-800/60 hover:text-sapphire-700 dark:hover:text-white"
                }`}
              >
                <span className="font-medium">{day}</span>
                <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                  isActive ? "bg-white/90 text-sapphire-600" : "bg-gray-200/80 text-gray-700 dark:bg-gray-700/80 dark:text-gray-200"
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
      <div className="glass-panel rounded-2xl p-6 border border-border-subtle/60">
        <QuickActions {...quickActionsProps} />
      </div>
    </div>
  );
};
