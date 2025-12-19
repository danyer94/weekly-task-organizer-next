import React, { useState, useEffect } from "react";
import { Task, Day, Priority } from "@/types";

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
    if (onEdit) onEdit(day, task.id, editText, editPriority);
  };

  return (
    <li
      draggable={!isEditing && isAdmin} // Only draggable if admin and not editing
      onDragStart={handleDragStart}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className={`flex items-center justify-between p-4 rounded-lg mb-2 border-l-4 transition-all hover:shadow-md ${
        task.completed
          ? "bg-green-50 " + priorityColors[task.priority]
          : "bg-sapphire-50 " + priorityColors[task.priority]
      } ${isSelected ? "ring-2 ring-sapphire-600" : ""} ${
        isAdmin ? "hover:bg-sapphire-100 cursor-move" : ""
      }`}
    >
      <div className="flex items-center flex-1 gap-3">
        {isAdmin && onToggleSelection && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelection(task.id)}
              className="w-5 h-5 text-sapphire-600 rounded focus:ring-sapphire-500 cursor-pointer"
            />
            <span className="text-gray-400 cursor-grab">⋮⋮</span>
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
          <div className="flex-1 flex gap-2">
            <select
              value={editPriority}
              onChange={(e) => setEditPriority(e.target.value as Priority)}
              className="p-2 border-2 border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-sapphire-600"
            >
              <option value="low">🟢 Low</option>
              <option value="medium">🟠 Medium</option>
              <option value="high">🔴 High</option>
            </select>
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
              className="px-3 py-1 bg-sapphire-600 text-white rounded-lg text-sm hover:bg-sapphire-700"
            >
              💾
            </button>
            <button
              onClick={() => setEditingTaskId(null)}
              className="px-3 py-1 bg-gray-400 text-white rounded-lg text-sm hover:bg-gray-500"
            >
              ✖
            </button>
          </div>
        ) : (
          <div className="flex-1">
            <span
              className={`text-lg ${
                task.completed ? "line-through text-gray-500" : "text-gray-800"
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
        >
          ✏️
        </button>
      )}
    </li>
  );
};
