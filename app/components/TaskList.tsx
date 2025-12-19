import React from "react";
import { Task, Day } from "@/types";
import { TaskItem } from "./TaskItem";

interface TaskListProps {
  day: Day;
  tasks: Task[];
  groupByPriority: boolean;
  isAdmin: boolean;
  selectedTasks?: Set<number>;
  onToggleSelection?: (id: number) => void;
  onToggleComplete?: (day: Day, id: number) => void;
  onEdit?: (day: Day, id: number, text: string, priority: any) => void;
  onDragStart?: (task: Task, index: number, day: Day) => void;
  onDrop?: (targetDay: Day, targetIndex: number) => void;
  editingTaskId: number | null;
  setEditingTaskId?: (id: number | null) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  day,
  tasks,
  groupByPriority,
  isAdmin,
  selectedTasks,
  onToggleSelection,
  onToggleComplete,
  onEdit,
  onDragStart,
  onDrop,
  editingTaskId,
  setEditingTaskId,
}) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center text-gray-400 py-12 italic">
        No tasks for this day
      </div>
    );
  }

  // Common props for TaskItem
  const commonProps = {
    day,
    isAdmin,
    onToggleSelection,
    onToggleComplete,
    onEdit,
    onDragStart,
    onDrop,
    editingTaskId,
    setEditingTaskId,
  };

  if (groupByPriority) {
    const groups: Record<string, { task: Task; index: number }[]> = {
      high: [],
      medium: [],
      low: [],
    };
    
    tasks.forEach((task, index) => {
      if (groups[task.priority]) {
        groups[task.priority].push({ task, index });
      } else {
        groups.medium.push({ task, index });
      }
    });

    const priorities = [
      { key: "high", label: "🔴 High Priority" },
      { key: "medium", label: "🟠 Medium Priority" },
      { key: "low", label: "🟢 Low Priority" },
    ];

    return (
      <div className="space-y-6">
        {priorities.map((p) => {
          const groupTasks = groups[p.key];
          if (groupTasks.length === 0) return null;
          return (
            <div key={p.key}>
              <h4 className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">
                {p.label}
              </h4>
              <ul className="space-y-2">
                {groupTasks.map(({ task, index }) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    index={index}
                    isSelected={selectedTasks?.has(task.id)}
                    groupByPriority={true}
                    {...commonProps}
                  />
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {tasks.map((task, index) => (
        <TaskItem
          key={task.id}
          task={task}
          index={index}
          isSelected={selectedTasks?.has(task.id)}
          groupByPriority={false}
          {...commonProps}
        />
      ))}
    </ul>
  );
};
