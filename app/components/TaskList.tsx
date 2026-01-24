import React from "react";
import { Task, Day } from "@/types";
import { TaskItem } from "./TaskItem";
import { Circle } from "lucide-react";

interface TaskListProps {
  day: Day;
  tasks: Task[];
  groupByPriority: boolean;
  isAdmin: boolean;
  selectedTasks?: Set<string>;
  onToggleSelection?: (id: string) => void;
  onToggleComplete?: (day: Day, id: string) => void;
  onEdit?: (day: Day, id: string, text: string, priority: any) => void;
  onDragStart?: (task: Task, index: number, day: Day) => void;
  onDrop?: (targetDay: Day, targetIndex: number) => void;
  editingTaskId: string | null;
  setEditingTaskId?: (id: string | null) => void;
   onCreateCalendarEvent?: (day: Day, task: Task) => void;
   onDeleteCalendarEvent?: (day: Day, task: Task) => void;
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
  onCreateCalendarEvent,
  onDeleteCalendarEvent,
}) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center text-text-tertiary py-12 italic">
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
  onCreateCalendarEvent,
  onDeleteCalendarEvent,
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
      { key: "high", label: "High Priority", color: "text-rose-400" },
      { key: "medium", label: "Medium Priority", color: "text-amber-400" },
      { key: "low", label: "Low Priority", color: "text-emerald-400" },
    ];

    return (
      <div className="space-y-6">
        {priorities.map((p) => {
          const groupTasks = groups[p.key];
          if (groupTasks.length === 0) return null;
          return (
            <div key={p.key}>
              <h4 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-[0.3em] flex items-center gap-2">
                <Circle className={`w-3 h-3 fill-current ${p.color}`} />
                <span>{p.label}</span>
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
