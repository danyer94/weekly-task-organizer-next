import React, { useState, useEffect } from "react";
import { Task, Day, Priority } from "@/types";
import { PrioritySelector } from "./PrioritySelector";
import { Pencil, Save, X, GripVertical, Check, CalendarPlus, CalendarCheck, Trash2 } from "lucide-react";

interface TaskItemProps {
  task: Task;
  day: Day;
  index: number;
  isAdmin: boolean;
  isSelected?: boolean;
  groupByPriority?: boolean;
  onToggleSelection?: (id: string) => void;
  onToggleComplete?: (day: Day, id: string) => void;
  onEdit?: (day: Day, id: string, text: string, priority: Priority) => void;
  onDragStart?: (task: Task, index: number, day: Day) => void;
  onDrop?: (targetDay: Day, targetIndex: number) => void;
  editingTaskId?: string | null;
  setEditingTaskId?: (id: string | null) => void;
  onCreateCalendarEvent?: (day: Day, task: Task) => void;
  onDeleteCalendarEvent?: (day: Day, task: Task) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  day,
  index,
  isAdmin,
  isSelected = false,
  groupByPriority = false,
  onToggleSelection,
  onToggleComplete,
  onEdit,
  onDragStart,
  onDrop,
  editingTaskId,
  setEditingTaskId,
  onCreateCalendarEvent,
  onDeleteCalendarEvent,
}) => {
  const [editText, setEditText] = useState(task.text);
  const [editPriority, setEditPriority] = useState<Priority>(task.priority);
  
  const isEditing = editingTaskId === task.id;

  // Sync state with task when not editing
  useEffect(() => {
    if (!isEditing) {
      setEditText(task.text);
      setEditPriority(task.priority);
    }
  }, [isEditing, task]);

  const priorityColors: Record<Priority, string> = {
    high: "border-l-rose-400",
    medium: "border-l-amber-400",
    low: "border-l-emerald-400",
  };

  const handleDragStart = () => {
    if (onDragStart) onDragStart(task, index, day);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (onDrop) onDrop(day, index);
  };

  const handleEditSubmit = () => {
    if (onEdit) {
      onEdit(day, task.id, editText, editPriority);
      if (setEditingTaskId) setEditingTaskId(null);
    }
  };

  const hasCalendarEvent = !!task.calendarEvent?.eventId;

  return (
    <li
      draggable={!isEditing && isAdmin} // Only draggable if admin and not editing
      onDragStart={handleDragStart}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className={`group flex flex-col gap-3 rounded-2xl border-l-2 p-4 transition-colors transition-shadow transition-transform hover:shadow-sm hover:-translate-y-0.5 sm:flex-row sm:items-center sm:justify-between ${
        task.completed
          ? "bg-bg-main/60 text-text-tertiary border-border-subtle " + priorityColors[task.priority]
          : "bg-bg-surface/80 border border-border-subtle/60 " + priorityColors[task.priority]
      } ${isSelected ? "ring-2 ring-border-brand glow-ring" : ""} ${
        isAdmin ? "hover:bg-bg-main/70 cursor-move" : ""
      }`}
    >
      <div className="flex flex-1 items-start gap-3 min-w-0 sm:items-center">
        {isAdmin && onToggleSelection && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelection(task.id)}
              aria-label={`Select task: ${task.text}`}
              className="w-5 h-5 text-text-brand rounded focus:ring-border-brand cursor-pointer accent-sky-600"
            />
            <GripVertical className="w-4 h-4 text-text-tertiary cursor-grab hidden sm:inline-flex" />
          </div>
        )}

        {!isAdmin && onToggleComplete && (
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => onToggleComplete(day, task.id)}
            aria-label={`Mark task as ${task.completed ? "incomplete" : "complete"}: ${task.text}`}
            className="w-6 h-6 text-emerald-500 rounded focus:ring-emerald-500 cursor-pointer mr-2"
          />
        )}
        {isEditing && setEditingTaskId ? (
          <div className="flex flex-1 flex-col gap-2 animate-fade-in motion-reduce:animate-none items-stretch sm:flex-row sm:items-center">
            <PrioritySelector 
              priority={editPriority} 
              setPriority={setEditPriority} 
              isSmall 
              className="w-full min-w-[110px] sm:w-auto"
            />
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleEditSubmit();
                if (e.key === "Escape") setEditingTaskId(null);
              }}
              name="taskText"
              autoComplete="off"
              aria-label="Edit task text"
              className="w-full flex-1 p-2 border border-border-brand/40 rounded-lg focus:outline-none bg-bg-main/70 focus-visible:ring-2 focus-visible:ring-border-brand/30"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleEditSubmit}
                className="px-3 py-1 bg-sapphire-700 text-white rounded-lg text-sm hover:bg-sapphire-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40"
                title="Save"
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={() => setEditingTaskId(null)}
                className="px-3 py-1 bg-bg-main text-text-secondary border border-border-subtle rounded-lg text-sm hover:bg-bg-main/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col gap-2 min-w-0 sm:flex-row sm:items-center sm:gap-4">
            <span
              className={`text-base leading-relaxed break-words sm:text-lg sm:leading-normal ${
                task.completed
                  ? "line-through text-text-secondary dark:text-gray-300"
                  : "text-text-primary"
              }`}
            >
              {task.text}
            </span>
            {task.calendarEvent && (
              <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                <button
                  onClick={() => onCreateCalendarEvent?.(day, task)}
                  className="flex max-w-full items-center gap-1.5 rounded-full border border-emerald-200/70 bg-emerald-50/70 px-2 py-1 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100/80 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300 dark:hover:bg-emerald-900/30 sm:text-sm"
                  title="Click to edit event time"
                >
                  {hasCalendarEvent ? (
                    <CalendarCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <CalendarPlus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  )}
                  <span className="truncate max-w-[160px] sm:max-w-none">
                    {task.calendarEvent.startTime
                      ? `${task.calendarEvent.startTime}${task.calendarEvent.endTime ? ` - ${task.calendarEvent.endTime}` : ""}`
                      : "All day"}
                  </span>
                </button>
                {onDeleteCalendarEvent && hasCalendarEvent && (
                  <button
                    onClick={() => onDeleteCalendarEvent(day, task)}
                    aria-label="Delete calendar event"
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50/80 dark:hover:bg-red-900/20 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/60"
                    title="Delete from calendar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>

        )}
      </div>

      {isAdmin && !isEditing && setEditingTaskId && (
        <div className="flex flex-wrap items-center gap-1 opacity-70 transition-opacity group-hover:opacity-100 sm:self-center">
          {onCreateCalendarEvent && (
            <button
              onClick={() => onCreateCalendarEvent(day, task)}
              aria-label={hasCalendarEvent ? "Edit calendar event" : "Create calendar event"}
              className={`p-2.5 rounded-full transition-colors ${
                hasCalendarEvent
                  ? "text-emerald-600 hover:text-emerald-700"
                  : "text-gray-400 hover:text-emerald-600"
              }`}
              title={
                hasCalendarEvent
                  ? `Calendar event: ${task.calendarEvent?.startTime || "All day"}`
                  : "Create calendar event"
              }
            >
              {hasCalendarEvent ? (
                <CalendarCheck className="w-4 h-4" />
              ) : (
                <CalendarPlus className="w-4 h-4" />
              )}
            </button>
          )}
          <button
            onClick={() => setEditingTaskId(task.id)}
            aria-label="Edit task"
            className="text-text-tertiary hover:text-text-primary p-2.5 rounded-full transition-colors"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>
      )}

    </li>
  );
};
