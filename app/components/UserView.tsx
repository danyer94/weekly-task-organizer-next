import React, { useEffect, useState } from "react";
import { Day, Task } from "@/types";
import { TaskList } from "./TaskList";
import { TaskTimeline } from "./TaskTimeline";
import { TaskViewToggle, TaskViewMode } from "./TaskViewToggle";
import { Layers, Sparkles } from "lucide-react";
import { DatePicker } from "./DatePicker";

const readUserViewMode = (): TaskViewMode => {
  if (typeof window === "undefined") return "timeline-list";

  const stored = window.localStorage.getItem(
    "weekly-task-organizer:view-mode-user"
  );

  return stored === "list" || stored === "timeline" || stored === "timeline-list"
    ? stored
    : "timeline-list";
};

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
  const [viewMode, setViewMode] = useState<TaskViewMode>(readUserViewMode);
  const dayTasks = tasks[currentDay] || [];
  const completedToday = dayTasks.filter((task: any) => task.completed).length;
  const showList = viewMode === "list" || viewMode === "timeline-list";
  const showTimeline = viewMode === "timeline" || viewMode === "timeline-list";

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("weekly-task-organizer:view-mode-user", viewMode);
  }, [viewMode]);

  return (
    <div className="lg:col-span-12 space-y-4 lg:space-y-5">
      <div className="admin-board rounded-2xl p-4 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(300px,420px)] lg:items-start">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.24em] text-text-tertiary">
              Personal execution
            </p>
            <h2 className="flex items-center gap-2 text-3xl font-semibold tracking-[-0.04em] text-text-primary sm:text-4xl">
              <span className="truncate">Hey {displayName || "there"}!</span>
              <Sparkles className="w-6 h-6 text-amber-400 sm:w-7 sm:h-7" />
            </h2>
            <p className="mt-1 text-sm font-medium text-text-secondary sm:text-base">
              {completedToday}/{dayTasks.length} tasks complete for {currentDay}.
            </p>
          </div>

          <div className="grid gap-3">
            <DatePicker selectedDate={selectedDate} onChange={onDateChange} />
            <TaskViewToggle value={viewMode} onChange={setViewMode} />
          </div>
        </div>

        <div className="-mx-2 mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-visible px-2 pb-3 pt-1">
          {days.map((day) => {
             const dayTasks = tasks[day] || [];
             const completed = dayTasks.filter((t: any) => t.completed).length;
             
             return (
              <button
                key={day}
                onClick={() => onDayChange(day)}
                className={`flex w-28 snap-start flex-shrink-0 flex-col rounded-xl px-3 py-2.5 transition-colors transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40 sm:w-32 sm:p-3 ${
                  currentDay === day
                    ? "admin-day-button is-active shadow-sm"
                    : "admin-day-button text-text-secondary"
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
      </div>

      <div
        className={
          showList && showTimeline
            ? "grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.72fr)]"
            : "grid gap-4"
        }
      >
        {showList && (
          <section className="admin-board rounded-2xl p-4 sm:p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-tertiary">
                  Today&apos;s focus
                </p>
                <h3 className="mt-1 text-2xl font-semibold text-text-primary">{currentDay}</h3>
              </div>

              <button
                onClick={() => setGroupByPriority(!groupByPriority)}
                className="glass-pill flex items-center gap-1.5 self-start rounded-full px-3 py-2 sm:py-1 text-xs font-semibold text-text-primary transition-colors sm:self-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40"
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
          </section>
        )}

        {showTimeline && (
          <aside className="admin-board rounded-2xl p-4 sm:p-6">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-tertiary">
                Day rhythm
              </p>
              <h3 className="mt-1 text-2xl font-semibold text-text-primary">Timeline</h3>
            </div>
            <TaskTimeline
              tasks={dayTasks}
              onScheduleChange={
                onTimelineScheduleChange
                  ? (task, startTime, endTime) =>
                      onTimelineScheduleChange(currentDay, task, startTime, endTime)
                  : undefined
              }
            />
          </aside>
        )}
      </div>
    </div>
  );
};
