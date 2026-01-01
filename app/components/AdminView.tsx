import React from "react";
import { Day, Priority, Task } from "@/types";
import { TaskList } from "./TaskList";
import { PrioritySelector } from "./PrioritySelector";
import { 
  Plus, 
  Trash2, 
  ArrowRight, 
  Copy, 
  SquareCheck, 
  SquareX, 
  Layers 
} from "lucide-react";

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
  onCreateCalendarEvent,
  onDeleteCalendarEvent,
}) => {
  return (
    <div className="lg:col-span-9 space-y-6">
      <div className="glass-panel rounded-2xl p-6 border border-border-subtle/60 glow-border">
        <div className="flex justify-between items-center mb-6">
          <div>
             <h2 className="text-2xl font-bold text-text-primary">{currentDay}</h2>
             <p className="text-text-brand font-medium">Mission Control · Weekly Overview</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-2 mb-6">
          <PrioritySelector 
            priority={priority} 
            setPriority={setPriority} 
            className="min-w-[180px]"
          />
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onAddTask()}
            placeholder="Add new task..."
            className="flex-1 p-3 border border-border-subtle rounded-xl focus:outline-none focus:border-border-brand transition-colors bg-bg-surface/80 text-text-primary placeholder-text-secondary shadow-inner"
          />
          <button
            onClick={onAddTask}
            className="bg-gradient-to-r from-sapphire-500 via-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all transform active:scale-95 flex items-center gap-2 hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            <span>Add Task</span>
          </button>
        </div>

        {/* Selection Actions Toolbar */}
        {selectedTasks.size > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 p-2 bg-bg-main/70 rounded-lg animate-fade-in border border-border-subtle/60">
            <span className="flex items-center text-sm font-bold text-text-brand mr-2">
              {selectedTasks.size} selected
            </span>
            <button
              onClick={onDeleteSelected}
              className="px-3 py-1 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg text-sm flex items-center gap-1.5 hover:-translate-y-0.5 transition-transform"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
            <button
              onClick={onMoveClick}
              className="px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg text-sm flex items-center gap-1.5 hover:-translate-y-0.5 transition-transform"
            >
              <ArrowRight className="w-4 h-4" />
              <span>Move</span>
            </button>
            <button
              onClick={onCopyClick}
              className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg text-sm flex items-center gap-1.5 hover:-translate-y-0.5 transition-transform"
            >
              <Copy className="w-4 h-4" />
              <span>Copy</span>
            </button>
          </div>
        )}

        {/* Task List Header with Options */}
        <div className="flex justify-between items-center mb-2">
           {/* Select All / Deselect All Button */}
           <button
            onClick={onSelectAll}
            className="text-xs font-bold text-text-secondary hover:text-text-brand bg-bg-main/70 px-3 py-1 rounded-full transition-colors border border-transparent hover:border-border-hover flex items-center gap-1.5"
          >
            {(tasks[currentDay] || []).length > 0 && (tasks[currentDay] || []).every((t: any) => selectedTasks.has(t.id)) 
              ? <><SquareX className="w-3.5 h-3.5" /> Unselect All</>
              : <><SquareCheck className="w-3.5 h-3.5" /> Select All</>}
          </button>

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
      </div>
    </div>
  );
};
