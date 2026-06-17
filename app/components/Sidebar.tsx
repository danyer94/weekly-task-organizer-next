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
    <div className="space-y-4 sm:space-y-5">
      {/* Date Selection */}
      <DatePicker 
        selectedDate={selectedDate} 
        onChange={onDateChange} 
      />

      {/* Days Navigation */}
      <div className="admin-rail-card rounded-2xl p-3 sm:p-4 font-sans relative">
        <h4 className="font-semibold text-text-secondary mb-3 px-2 uppercase tracking-[0.24em] text-xs">
          Days
        </h4>
        <div className="space-y-2 relative">
          {days.map((day) => {
            const dayTasks = tasks[day] || [];
            const completedCount = dayTasks.filter((t: any) => t.completed).length;
            const totalCount = dayTasks.length;
            
            const isActive = currentDay === day;
            
            return (
              <button
                key={day}
                onClick={() => onDayChange(day)}
                className={`w-full flex items-center justify-between px-3 py-2 sm:p-3 rounded-xl transition-colors transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40 ${
                  isActive
                    ? "admin-day-button is-active text-text-primary"
                    : "admin-day-button text-text-primary"
                }`}
              >
                <span className="font-medium text-sm sm:text-base">{day}</span>
                <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-semibold ${
                  isActive ? "admin-count-pill text-text-secondary" : "admin-count-pill text-text-tertiary"
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
      <div className="admin-rail-card rounded-2xl p-4 sm:p-5">
        <QuickActions {...quickActionsProps} />
      </div>
    </div>
  );
};

