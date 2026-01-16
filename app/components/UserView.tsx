import React from "react";
import { Day } from "@/types";
import { TaskList } from "./TaskList";
import { Layers, Sparkles } from "lucide-react";
import { DatePicker } from "./DatePicker";

interface UserViewProps {
  currentDay: Day;
  days: Day[];
  onDayChange: (day: Day) => void;
  tasks: any;
  onToggleComplete: (day: Day, id: string) => void;
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
  groupByPriority,
  setGroupByPriority,
  selectedDate,
  onDateChange,
  displayName,
}) => {
  return (
    <div className="lg:col-span-9 space-y-6">
      <div className="glass-panel rounded-2xl border border-border-subtle/60 p-4 glow-border sm:p-6">
        <div className="mb-8 text-center">
          <h2 className="flex items-center justify-center gap-2 text-2xl font-bold text-text-brand sm:text-3xl">
            <span className="truncate">Hey {displayName || 'there'}!</span>
            <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-amber-400 animate-pulse" />
          </h2>
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
                className={`flex w-24 snap-start flex-shrink-0 flex-col rounded-xl border px-2 py-2 transition-all hover:-translate-y-0.5 sm:w-32 sm:p-3 ${
                  currentDay === day
                    ? "border-border-brand bg-bg-main/70 shadow-lg"
                    : "border-border-subtle bg-bg-surface/70 text-text-secondary hover:border-border-hover"
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


        <div className="min-h-[320px] rounded-2xl border border-border-subtle/60 bg-bg-main/70 p-4 sm:min-h-[400px] sm:p-6">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-xl font-bold text-text-primary sm:text-2xl">{currentDay}</h3>
            
            {/* View Toggle */}
            <button
              onClick={() => setGroupByPriority(!groupByPriority)}
              className="flex items-center gap-1.5 self-start rounded-full bg-gradient-to-r from-sapphire-500/10 to-cyan-500/10 px-3 py-2 sm:py-1 text-xs font-bold text-text-brand transition-colors hover:bg-sapphire-100/80 dark:hover:bg-sapphire-800/60 sm:self-auto"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{groupByPriority ? "Grouped by Priority" : "Custom Order"}</span>
            </button>

          </div>

          <TaskList
            day={currentDay}
            tasks={tasks[currentDay] || []}
            groupByPriority={groupByPriority}
            isAdmin={false}
            onToggleComplete={onToggleComplete}
            editingTaskId={null}
          />
        </div>
      </div>
    </div>
  );
};
