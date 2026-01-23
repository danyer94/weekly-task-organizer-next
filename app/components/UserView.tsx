import React, { useEffect, useState } from "react";
import { Day, Task } from "@/types";
import { TaskList } from "./TaskList";
import { TaskTimeline } from "./TaskTimeline";
import { TaskViewToggle, TaskViewMode } from "./TaskViewToggle";
import { Layers, Sparkles } from "lucide-react";
import { DatePicker } from "./DatePicker";


interface UserViewProps {
  currentDay: Day;
  days: Day[];
  onDayChange: (day: Day) => void;
  tasks: any;
  onToggleComplete: (day: Day, id: string) => void;
  onTimelineScheduleChange?: (day: Day, task: Task, startTime: string, endTime: string) => void;
  groupByPriority: boolean;
  setGroupByPriority: (val: boolean) => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  displayName?: string;
}

export const UserView: React.FC<UserViewProps> = ({
  currentDay,
  days,
  onDayChange,
  tasks,
  onToggleComplete,
  onTimelineScheduleChange,
  groupByPriority,
  setGroupByPriority,
  selectedDate,
  onDateChange,
  displayName,
}) => {
  const [viewMode, setViewMode] = useState<TaskViewMode>("timeline-list");
  const dayTasks = tasks[currentDay] || [];

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("weekly-task-organizer:view-mode-user");
    if (stored === "list" || stored === "timeline" || stored === "timeline-list") {
      setViewMode(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("weekly-task-organizer:view-mode-user", viewMode);
  }, [viewMode]);

  return (
    <div className="lg:col-span-9 space-y-6">

      <div className="glass-panel rounded-2xl border border-border-subtle/70 p-4 glow-border sm:p-6">
        <div className="mb-8 text-center">
          <div className="mb-6 flex flex-col items-center gap-4">
            <h2 className="flex items-center justify-center gap-2 text-2xl font-semibold text-text-primary sm:text-3xl">
              <span className="truncate">Hey {displayName || "there"}!</span>
              <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400" />
            </h2>
            <TaskViewToggle
              value={viewMode}
              onChange={setViewMode}
              className="max-w-xl"
            />
          </div>
          <p className="text-text-secondary mb-6">Here are your tasks for today.</p>

          <div className="mx-auto w-full max-w-xs">
            <DatePicker selectedDate={selectedDate} onChange={onDateChange} />
          </div>
        </div>



        <div className="-mx-2 mb-6 flex snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-visible px-2 pb-4 pt-1">
          {days.map((day) => {
             const dayTasks = tasks[day] || [];
             const completed = dayTasks.filter((t: any) => t.completed).length;
             
             return (
              <button
                key={day}
                onClick={() => onDayChange(day)}
                className={`flex w-28 snap-start flex-shrink-0 flex-col rounded-xl border px-3 py-2.5 transition-colors transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40 sm:w-32 sm:p-3 ${
                  currentDay === day
                    ? "border-border-brand bg-bg-main/60 shadow-sm"
                    : "border-border-subtle bg-bg-surface/80 text-text-secondary hover:border-border-hover"
                }`}
              >
                <div className="mb-1 text-sm font-bold text-text-primary sm:text-base truncate">{day}</div>
                <div className="text-[0.7rem] text-text-secondary sm:text-xs">
                  {completed}/{dayTasks.length} tasks
                </div>
              </button>
             );
          })}
        </div>


        <div className="min-h-[320px] rounded-2xl border border-border-subtle/60 bg-bg-surface/70 p-4 sm:min-h-[400px] sm:p-6">
          {(viewMode === "list" || viewMode === "timeline-list") && (
            <>
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-xl font-bold text-text-primary sm:text-2xl">{currentDay}</h3>

                {/* View Toggle */}
                <button
                  onClick={() => setGroupByPriority(!groupByPriority)}
                  className="flex items-center gap-1.5 self-start rounded-full bg-bg-surface/80 border border-border-subtle/60 px-3 py-2 sm:py-1 text-xs font-semibold text-text-primary transition-colors hover:border-border-hover sm:self-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{groupByPriority ? "Grouped by Priority" : "Custom Order"}</span>
                </button>
              </div>

              <TaskList
                day={currentDay}
                tasks={dayTasks}
                groupByPriority={groupByPriority}
                isAdmin={false}
                onToggleComplete={onToggleComplete}
                editingTaskId={null}
              />
            </>
          )}

          {(viewMode === "timeline" || viewMode === "timeline-list") && (
            <div className={viewMode === "timeline-list" ? "mt-8" : ""}>
              <TaskTimeline
                tasks={dayTasks}
                onScheduleChange={
                  onTimelineScheduleChange
                    ? (task, startTime, endTime) =>
                        onTimelineScheduleChange(currentDay, task, startTime, endTime)
                    : undefined
                }
              />
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
