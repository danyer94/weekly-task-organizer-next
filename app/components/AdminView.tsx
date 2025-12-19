import React from "react";
import { Day, Priority } from "@/types";
import { TaskList } from "./TaskList";

interface AdminViewProps {
  currentDay: Day;
  days: Day[];
  onDayChange: (day: Day) => void;
  newTaskText: string;
  setNewTaskText: (text: string) => void;
  priority: Priority;
  setPriority: (priority: Priority) => void;
  onAddTask: () => void;
  groupByPriority: boolean;
  setGroupByPriority: (val: boolean) => void;
  selectedTasks: Set<number>;
  tasks: any;
  // Handlers passed down to TaskList
  onToggleSelection: (id: number) => void;
  onEdit: (day: Day, id: number, text: string, priority: Priority) => void;
  onDragStart: (task: any, index: number, day: Day) => void;
  onDrop: (targetDay: Day, targetIndex: number) => void;
  onDeleteSelected: () => void;
  onSelectAll: () => void;
  onMoveClick: () => void;
  onCopyClick: () => void;
  editingTaskId: number | null;
  setEditingTaskId: (id: number | null) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  currentDay,
  days,
  onDayChange,
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
}) => {
  return (
    <div className="lg:col-span-9 space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-sapphire-600">
        <div className="flex justify-between items-center mb-6">
          <div>
             <h2 className="text-2xl font-bold text-gray-800">{currentDay}</h2>
             <p className="text-sapphire-600 font-medium">Weekly Overview</p>
          </div>
        </div>

        {/* Input Area */}
        <div className="flex gap-2 mb-6">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-sapphire-600 bg-white"
          >
            <option value="high">🔴 High</option>
            <option value="medium">🟠 Medium</option>
            <option value="low">🟢 Low</option>
          </select>
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onAddTask()}
            placeholder="Add new task..."
            className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-sapphire-600 transition-colors"
          />
          <button
            onClick={onAddTask}
            className="bg-sapphire-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-sapphire-700 hover:shadow-lg transition-all transform active:scale-95"
          >
            Add Task
          </button>
        </div>

        {/* Selection Actions Toolbar */}
        {selectedTasks.size > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 p-2 bg-sapphire-50 rounded-lg animate-fade-in">
            <span className="flex items-center text-sm font-bold text-sapphire-800 mr-2">
              {selectedTasks.size} selected
            </span>
            <button
              onClick={onDeleteSelected}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
            >
              🗑️ Delete
            </button>
            <button
              onClick={onMoveClick}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            >
              ➡️ Move
            </button>
            <button
              onClick={onCopyClick}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
            >
              📋 Copy
            </button>
          </div>
        )}

        {/* Task List Header with Options */}
        <div className="flex justify-between items-center mb-2">
           {/* Select All Button */}
           <button
            onClick={onSelectAll}
            className="text-xs font-bold text-gray-500 hover:text-sapphire-600 bg-gray-100 px-3 py-1 rounded-full hover:bg-sapphire-50 transition-colors"
          >
            ☑️ Select All
          </button>

          {/* View Toggle */}
          <button
            onClick={() => setGroupByPriority(!groupByPriority)}
            className="text-xs font-bold text-sapphire-600 bg-sapphire-100 px-3 py-1 rounded-full hover:bg-sapphire-200 transition-colors"
          >
            {groupByPriority ? "🗂️ Grouped by Priority" : "🔢 Custom Order"}
          </button>
        </div>

        <TaskList
          day={currentDay}
          tasks={tasks[currentDay] || []}
          groupByPriority={groupByPriority}
          isAdmin={true}
          selectedTasks={selectedTasks}
          onToggleSelection={onToggleSelection}
          onEdit={onEdit}
          onDragStart={onDragStart}
          onDrop={onDrop}
          editingTaskId={editingTaskId}
          setEditingTaskId={setEditingTaskId}
        />
      </div>
    </div>
  );
};
