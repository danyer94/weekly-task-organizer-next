import React, { useEffect, useState } from "react";
import { Day, Priority, Task } from "@/types";
import { TaskList } from "./TaskList";
import { PrioritySelector } from "./PrioritySelector";
import { TaskTimeline } from "./TaskTimeline";
import { TaskViewToggle, TaskViewMode } from "./TaskViewToggle";
import { DatePicker } from "./DatePicker";
import {
  Plus,
  Trash2,
  ArrowRight,
  Copy,
  SquareCheck,
  SquareX,
  Layers,
} from "lucide-react";



interface AdminViewProps {
  currentDay: Day;
  days: Day[];
  onDayChange: (day: Day) => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  newTaskText: string;
  setNewTaskText: (text: string) => void;
  priority: Priority;
  setPriority: (priority: Priority) => void;
  onAddTask: () => void;
  groupByPriority: boolean;
  setGroupByPriority: (val: boolean) => void;
  selectedTasks: Set<string>;
  tasks: any;
  // Handlers passed down to TaskList
  onToggleSelection: (id: string) => void;
  onEdit: (day: Day, id: string, text: string, priority: Priority) => void;
  onDragStart: (task: any, index: number, day: Day) => void;
  onDrop: (targetDay: Day, targetIndex: number) => void;
  onDeleteSelected: () => void;
  onSelectAll: () => void;
  onMoveClick: () => void;
  onCopyClick: () => void;
  editingTaskId: string | null;
  setEditingTaskId: (id: string | null) => void;
  onCreateCalendarEvent?: (day: Day, task: Task) => void;
  onDeleteCalendarEvent?: (day: Day, task: Task) => void;
  onTimelineScheduleChange?: (day: Day, task: Task, startTime: string, endTime: string) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  currentDay,
  days,
  onDayChange,
  selectedDate,
  onDateChange,
  newTaskText,
  setNewTaskText,
  priority,
  setPriority,
  onAddTask,
  groupByPriority,
  setGroupByPriority,
  selectedTasks,
  tasks,
  onToggleSelection,
  onEdit,
  onDragStart,
  onDrop,
  onDeleteSelected,
  onSelectAll,
  onMoveClick,
  onCopyClick,
  editingTaskId,
  setEditingTaskId,
  onCreateCalendarEvent,
  onDeleteCalendarEvent,
  onTimelineScheduleChange,
}) => {
  const [viewMode, setViewMode] = useState<TaskViewMode>("timeline-list");
  const dayTasks = tasks[currentDay] || [];

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("weekly-task-organizer:view-mode-admin");
    if (stored === "list" || stored === "timeline" || stored === "timeline-list") {
      setViewMode(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("weekly-task-organizer:view-mode-admin", viewMode);
  }, [viewMode]);

  return (
    <div className="lg:col-span-9 space-y-6">

      <div className="glass-panel rounded-2xl border border-border-subtle/70 p-4 glow-border sm:p-6">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-text-primary sm:text-3xl">{currentDay}</h2>
            <p className="text-text-secondary font-medium">Operations Board - Weekly overview</p>
          </div>
          <div className="w-full max-w-xl">
            <TaskViewToggle value={viewMode} onChange={setViewMode} />
          </div>
        </div>


        <div className="mb-6 flex flex-col gap-3 md:flex-row">
          <PrioritySelector 
            priority={priority} 
            setPriority={setPriority} 
            className="w-full min-w-[180px] md:w-auto"
          />
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onAddTask()}
            placeholder="Add new task…"
            name="newTask"
            autoComplete="off"
            aria-label="New task"
            className="w-full flex-1 rounded-xl border border-border-subtle bg-bg-surface/80 p-3 text-text-primary placeholder-text-tertiary shadow-inner transition-colors focus:border-border-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/30"
          />
          <button
            onClick={onAddTask}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-sapphire-700 px-6 py-3 font-semibold text-white transition-colors transition-transform hover:bg-sapphire-600 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand active:scale-95 md:w-auto"
          >
            <Plus className="w-5 h-5" />
            <span>Add Task</span>
          </button>
        </div>

        {/* Selection Actions Toolbar */}
        {selectedTasks.size > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 p-2 bg-bg-main/60 rounded-xl animate-fade-in motion-reduce:animate-none border border-border-subtle/60">
            <span className="flex items-center text-sm font-semibold text-text-secondary mr-2 w-full sm:w-auto">
              {selectedTasks.size} selected
            </span>
            <button
              onClick={onDeleteSelected}
              className="w-full sm:w-auto justify-center px-3 py-2 rounded-lg text-sm flex items-center gap-1.5 border border-red-300/60 text-red-600 hover:bg-red-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
            <button
              onClick={onMoveClick}
              className="w-full sm:w-auto justify-center px-3 py-2 rounded-lg text-sm flex items-center gap-1.5 border border-border-subtle text-text-primary hover:bg-bg-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40"
            >
              <ArrowRight className="w-4 h-4" />
              <span>Move</span>
            </button>
            <button
              onClick={onCopyClick}
              className="w-full sm:w-auto justify-center px-3 py-2 rounded-lg text-sm flex items-center gap-1.5 border border-border-subtle text-text-primary hover:bg-bg-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40"
            >
              <Copy className="w-4 h-4" />
              <span>Copy</span>
            </button>
          </div>
        )}


        {(viewMode === "list" || viewMode === "timeline-list") && (
          <>
            {/* Task List Header with Options */}
            <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Select All / Deselect All Button */}
              <button
                onClick={onSelectAll}
                className="text-xs font-semibold text-text-secondary hover:text-text-primary bg-bg-main/60 px-3 py-2 sm:py-1 rounded-full transition-colors border border-border-subtle/50 hover:border-border-hover flex items-center gap-1.5 justify-center w-full sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40"
              >
                {dayTasks.length > 0 && dayTasks.every((t: any) => selectedTasks.has(t.id))
                  ? <><SquareX className="w-3.5 h-3.5" /> Unselect All</>
                  : <><SquareCheck className="w-3.5 h-3.5" /> Select All</>}
              </button>

              {/* View Toggle */}
              <button
                onClick={() => setGroupByPriority(!groupByPriority)}
                className="text-xs font-semibold text-text-primary bg-bg-surface/80 px-3 py-2 sm:py-1 rounded-full border border-border-subtle/60 hover:border-border-hover transition-colors flex items-center gap-1.5 justify-center w-full sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{groupByPriority ? "Grouped by Priority" : "Custom Order"}</span>
              </button>
            </div>

            <TaskList
              day={currentDay}
              tasks={dayTasks}
              groupByPriority={groupByPriority}
              isAdmin={true}
              selectedTasks={selectedTasks}
              onToggleSelection={onToggleSelection}
              onEdit={onEdit}
              onDragStart={onDragStart}
              onDrop={onDrop}
              editingTaskId={editingTaskId}
              setEditingTaskId={setEditingTaskId}
              onCreateCalendarEvent={onCreateCalendarEvent}
              onDeleteCalendarEvent={onDeleteCalendarEvent}
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
  );
};
