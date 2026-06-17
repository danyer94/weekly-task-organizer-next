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
  Bell,
  FilePlus2,
  MessageCircle,
} from "lucide-react";

const readAdminViewMode = (): TaskViewMode => {
  if (typeof window === "undefined") return "timeline-list";

  const stored = window.localStorage.getItem(
    "weekly-task-organizer:view-mode-admin"
  );

  return stored === "list" || stored === "timeline" || stored === "timeline-list"
    ? stored
    : "timeline-list";
};
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
  stats: { total: number; completed: number };
  quickActions: {
    onClearCompleted: () => void;
    onBulkAdd: () => void;
    onExportWhatsApp: () => void;
    onSendDailySummary: () => void;
    isSendingDailySummary?: boolean;
  };
  // Handlers passed down to TaskList
  onToggleSelection: (id: string) => void;
  onToggleComplete: (day: Day, id: string) => void;
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
  stats,
  quickActions,
  onToggleSelection,
  onToggleComplete,
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
  const [viewMode, setViewMode] = useState<TaskViewMode>(readAdminViewMode);
  const dayTasks = tasks[currentDay] || [];
  const showList = viewMode === "list" || viewMode === "timeline-list";
  const showTimeline = viewMode === "timeline" || viewMode === "timeline-list";

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("weekly-task-organizer:view-mode-admin", viewMode);
  }, [viewMode]);

  return (
    <div className="order-1 space-y-4 lg:col-span-12 lg:space-y-5">

      <div className="admin-board rounded-2xl p-4 sm:p-6">
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.24em] text-text-tertiary">
              Today&apos;s command center
            </p>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-text-primary sm:text-4xl">{currentDay}</h2>
            <p className="mt-1 text-sm font-medium text-text-secondary sm:text-base">Operations Board - Weekly overview</p>
          </div>
          <div className="w-full md:max-w-xl">
            <TaskViewToggle value={viewMode} onChange={setViewMode} />
          </div>
        </div>

        <section className="admin-ops-strip mb-5 rounded-2xl p-3 sm:p-4">
          <div className="grid gap-3 xl:grid-cols-[minmax(280px,0.85fr)_minmax(360px,1.15fr)_minmax(300px,0.95fr)] xl:items-stretch">
            <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-1">
              <div className="admin-ops-card rounded-2xl p-3">
                <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-[0.24em] text-text-tertiary">
                  Calendar
                </p>
                <DatePicker selectedDate={selectedDate} onChange={onDateChange} />
              </div>

              <div className="admin-ops-card rounded-2xl p-3">
                <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-[0.24em] text-text-tertiary">
                  Weekly stats
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="admin-stat-chip rounded-xl px-3 py-4">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-tertiary">Total</span>
                    <strong className="block text-2xl text-text-primary">{stats.total}</strong>
                  </div>
                  <div className="admin-stat-chip rounded-xl px-3 py-4">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-tertiary">Done</span>
                    <strong className="block text-2xl text-emerald-500 dark:text-emerald-400">{stats.completed}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-ops-card min-w-0 rounded-2xl p-3 xl:self-start">
              <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-[0.24em] text-text-tertiary">
                Week days
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {days.map((day) => {
                  const tasksForDay = tasks[day] || [];
                  const completedCount = tasksForDay.filter((task: any) => task.completed).length;
                  const isActive = currentDay === day;

                  return (
                    <button
                      key={day}
                      type="button"
                      aria-label={`Show ${day} tasks`}
                      title={day}
                      onClick={() => onDayChange(day)}
                      className={`admin-week-chip min-h-14 rounded-xl px-3 py-2.5 text-left transition-colors transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40 ${
                        isActive ? "is-active" : ""
                      }`}
                    >
                      <span className="block text-base font-semibold text-text-primary">{day.slice(0, 3)}</span>
                      <span className="text-xs text-text-tertiary">{completedCount}/{tasksForDay.length}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="admin-ops-card rounded-2xl p-3 xl:flex xl:flex-col">
              <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-[0.24em] text-text-tertiary">
                Admin actions
              </p>
              <div className="grid grid-cols-2 gap-2 xl:flex xl:flex-1 xl:flex-col">
                <button
                  type="button"
                  onClick={quickActions.onSendDailySummary}
                  disabled={quickActions.isSendingDailySummary}
                  className={`admin-action-button admin-action-button--notice col-span-2 ${
                    quickActions.isSendingDailySummary ? "is-disabled" : ""
                  }`}
                >
                  <Bell className="h-4 w-4" />
                  <span>{quickActions.isSendingDailySummary ? "Sending..." : "Send Daily Summary"}</span>
                </button>
                <button
                  type="button"
                  onClick={quickActions.onBulkAdd}
                  className="admin-action-button text-[13px] sm:text-sm"
                >
                  <FilePlus2 className="h-4 w-4" />
                  <span>Bulk Add</span>
                </button>
                <button
                  type="button"
                  onClick={quickActions.onClearCompleted}
                  className="admin-action-button"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="whitespace-nowrap text-[12px] sm:text-sm">Clear Completed</span>
                </button>
                <button
                  type="button"
                  onClick={quickActions.onExportWhatsApp}
                  className="admin-action-button admin-action-button--export col-span-2 xl:mt-auto"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="admin-compose mb-5 grid gap-3 md:grid-cols-[180px_1fr_auto]">
          <PrioritySelector 
            priority={priority} 
            setPriority={setPriority} 
            className="w-full min-w-[180px]"
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
            className="admin-input w-full rounded-xl p-3 text-text-primary placeholder-text-tertiary transition-colors focus:border-border-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/30"
          />
          <button
            onClick={onAddTask}
            className="admin-primary-action flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold text-text-primary transition-colors transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand active:scale-95 md:w-auto"
          >
            <Plus className="w-5 h-5" />
            <span>Add Task</span>
          </button>
        </div>

        {/* Selection Actions Toolbar */}
        {selectedTasks.size > 0 && (
          <div className="admin-toolbar flex flex-wrap gap-2 mb-4 p-2 rounded-xl animate-fade-in motion-reduce:animate-none">
            <span className="flex items-center text-sm font-semibold text-text-secondary mr-2 w-full sm:w-auto">
              {selectedTasks.size} selected
            </span>
            <button
              onClick={onDeleteSelected}
              className="w-full sm:w-auto justify-center px-3 py-2 rounded-lg text-sm flex items-center gap-1.5 border border-red-300/60 bg-white/45 text-red-700 hover:bg-red-50/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
            <button
              onClick={onMoveClick}
              className="glass-control w-full sm:w-auto justify-center px-3 py-2 rounded-lg text-sm flex items-center gap-1.5 text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40"
            >
              <ArrowRight className="w-4 h-4" />
              <span>Move</span>
            </button>
            <button
              onClick={onCopyClick}
              className="glass-control w-full sm:w-auto justify-center px-3 py-2 rounded-lg text-sm flex items-center gap-1.5 text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40"
            >
              <Copy className="w-4 h-4" />
              <span>Copy</span>
            </button>
          </div>
        )}


        <div
          className={
            showList && showTimeline
              ? "grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.72fr)]"
              : "grid gap-4"
          }
        >
          {showList && (
            <section className="admin-work-pane rounded-2xl p-3 sm:p-4">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  onClick={onSelectAll}
                  className="glass-pill text-xs font-semibold text-text-secondary hover:text-text-primary px-3 py-2 sm:py-1 rounded-full transition-colors flex items-center gap-1.5 justify-center w-full sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40"
                >
                  {dayTasks.length > 0 && dayTasks.every((t: any) => selectedTasks.has(t.id))
                    ? <><SquareX className="w-3.5 h-3.5" /> Unselect All</>
                    : <><SquareCheck className="w-3.5 h-3.5" /> Select All</>}
                </button>

                <button
                  onClick={() => setGroupByPriority(!groupByPriority)}
                  className="glass-pill text-xs font-semibold text-text-primary px-3 py-2 sm:py-1 rounded-full transition-colors flex items-center gap-1.5 justify-center w-full sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40"
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
                onToggleComplete={onToggleComplete}
                onEdit={onEdit}
                onDragStart={onDragStart}
                onDrop={onDrop}
                editingTaskId={editingTaskId}
                setEditingTaskId={setEditingTaskId}
                onCreateCalendarEvent={onCreateCalendarEvent}
                onDeleteCalendarEvent={onDeleteCalendarEvent}
              />
            </section>
          )}

          {showTimeline && (
            <aside className="admin-agenda-pane rounded-2xl p-3 sm:p-4">
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-tertiary">
                  Time plan
                </p>
                <h3 className="mt-1 text-lg font-semibold text-text-primary">
                  Schedule context
                </h3>
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
    </div>
  );
};
