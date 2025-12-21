import React, { useState, useEffect } from "react";
import { Task, Day, Priority } from "@/types";
import { PrioritySelector } from "./PrioritySelector";
import { Pencil, Save, X, GripVertical, Check } from "lucide-react";

interface TaskItemProps {
  task: Task;
  day: Day;
  index: number;
  isAdmin: boolean;
  isSelected?: boolean;
  groupByPriority?: boolean;
  onToggleSelection?: (id: number) => void;
  onToggleComplete?: (day: Day, id: number) => void;
  onEdit?: (day: Day, id: number, text: string, priority: Priority) => void;
  onDragStart?: (task: Task, index: number, day: Day) => void;
  onDrop?: (targetDay: Day, targetIndex: number) => void;
  editingTaskId?: number | null;
  setEditingTaskId?: (id: number | null) => void;
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
    high: "border-l-red-500",
    medium: "border-l-orange-500",
    low: "border-l-green-500",
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

  return (
    <li
      draggable={!isEditing && isAdmin} // Only draggable if admin and not editing
      onDragStart={handleDragStart}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className={`flex items-center justify-between p-4 rounded-lg mb-2 border-l-4 transition-all hover:shadow-md ${
        task.completed
          ? "bg-green-50 dark:bg-green-900/20 " + priorityColors[task.priority]
          : "bg-bg-surface border-border-subtle " + priorityColors[task.priority]
      } ${isSelected ? "ring-2 ring-border-brand" : ""} ${
        isAdmin ? "hover:bg-bg-main cursor-move" : ""
      }`}
    >
      <div className="flex items-center flex-1 gap-3">
        {isAdmin && onToggleSelection && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelection(task.id)}
              className="w-5 h-5 text-text-brand rounded focus:ring-border-brand cursor-pointer"
            />
            <GripVertical className="w-4 h-4 text-text-secondary cursor-grab" />
          </div>
        )}
        {!isAdmin && onToggleComplete && (
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => onToggleComplete(day, task.id)}
            className="w-6 h-6 text-green-600 rounded focus:ring-green-500 cursor-pointer mr-2"
          />
        )}
        {isEditing && setEditingTaskId ? (
          <div className="flex-1 flex gap-2 animate-fade-in items-center">
            <PrioritySelector 
              priority={editPriority} 
              setPriority={setEditPriority} 
              isSmall 
              className="min-w-[110px]"
            />
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleEditSubmit();
                if (e.key === "Escape") setEditingTaskId(null);
              }}
              className="flex-1 p-2 border-2 border-sapphire-600 rounded-lg focus:outline-none"
              autoFocus
            />
            <button
              onClick={handleEditSubmit}
              className="px-3 py-1 bg-sapphire-600 text-white rounded-lg text-sm hover:bg-sapphire-700 transition-colors"
              title="Save"
            >
              <Save className="w-4 h-4" />
            </button>
            <button
              onClick={() => setEditingTaskId(null)}
              className="px-3 py-1 bg-gray-400 text-white rounded-lg text-sm hover:bg-gray-500 transition-colors"
              title="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex-1">
            <span
              className={`text-lg ${
                task.completed ? "line-through text-text-secondary" : "text-text-primary"
              }`}
            >
              {task.text}
            </span>
          </div>
        )}
      </div>

      {isAdmin && !isEditing && setEditingTaskId && (
        <button
          onClick={() => setEditingTaskId(task.id)}
          className="text-gray-400 hover:text-sapphire-600 p-2 transition-colors"
          title="Edit"
        >
          <Pencil className="w-4 h-4" />
        </button>
      )}
    </li>
  );
};
