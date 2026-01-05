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
      <div className="glass-panel rounded-2xl p-6 border border-border-subtle/60 glow-border">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-text-brand mb-2 flex items-center justify-center gap-2">
            <span>Hey {displayName || 'there'}!</span>
            <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
          </h2>
          <p className="text-text-secondary mb-6">Here are your tasks for today.</p>
          
          <div className="max-w-xs mx-auto">
            <DatePicker selectedDate={selectedDate} onChange={onDateChange} />
          </div>
        </div>

        <div className="flex overflow-x-auto pb-4 gap-3 mb-6">
          {days.map((day) => {
             const dayTasks = tasks[day] || [];
             const completed = dayTasks.filter((t: any) => t.completed).length;
             
             return (
              <button
                key={day}
                onClick={() => onDayChange(day)}
                className={`flex-shrink-0 w-32 p-3 rounded-xl border transition-all hover:-translate-y-0.5 ${
                  currentDay === day
                    ? "border-border-brand bg-bg-main/70 shadow-lg"
                    : "border-border-subtle bg-bg-surface/70 text-text-secondary hover:border-border-hover"
                }`}
              >
                <div className="font-bold mb-1 text-text-primary">{day}</div>
                <div className="text-xs text-text-secondary">
                  {completed}/{dayTasks.length} tasks
                </div>
              </button>
             );
          })}
        </div>

        <div className="bg-bg-main/70 rounded-2xl p-6 min-h-[400px] border border-border-subtle/60">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-text-primary">{currentDay}</h3>
            
            {/* View Toggle */}
            <button
              onClick={() => setGroupByPriority(!groupByPriority)}
              className="text-xs font-bold text-text-brand bg-gradient-to-r from-sapphire-500/10 to-cyan-500/10 px-3 py-1 rounded-full hover:bg-sapphire-100/80 dark:hover:bg-sapphire-800/60 transition-colors flex items-center gap-1.5"
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
