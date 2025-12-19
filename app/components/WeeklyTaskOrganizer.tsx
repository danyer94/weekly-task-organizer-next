"use client";
import React, { useState } from "react";
import { useWeeklyTasks, DAYS } from "@/hooks/useWeeklyTasks";
import { Day, Priority } from "@/types";
import { AdminView } from "./AdminView";
import { UserView } from "./UserView";
import { QuickActions } from "./QuickActions";
import { TaskStats } from "./TaskStats";
import { DaySelectionModal } from "./DaySelectionModal";
import { BulkAddModal } from "./BulkAddModal";

const WeeklyTaskOrganizer: React.FC = () => {
  // Logic Hook
  const {
    tasks,
    isClient,
    syncStatus,
    addTask,
    deleteTask,
    itemOperations: { toggleComplete, editTask },
    reorderTasks,
    bulkOperations: {
      deleteSelected,
      clearCompleted,
      moveOrCopyTasks,
      bulkAddTasks,
    },
    ioOperations: { exportToWhatsApp, exportToJSON, importFromJSON },
    stats,
  } = useWeeklyTasks();

  // UI State
  const [isAdmin, setIsAdmin] = useState(true);
  const [currentAdminDay, setCurrentAdminDay] = useState<Day>("Monday");
  const [currentUserDay, setCurrentUserDay] = useState<Day>(
    DAYS[new Date().getDay() - 1] || "Monday"
  );
  const [newTaskText, setNewTaskText] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [groupByPriority, setGroupByPriority] = useState(true);
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [draggedTask, setDraggedTask] = useState<{ task: any; index: number; day: Day } | null>(null);

  // Modal State
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  if (!isClient) return null;

  // Handlers
  const handleAddTask = () => {
    addTask(currentAdminDay, newTaskText, priority);
    setNewTaskText("");
  };

  const handleToggleSelection = (id: number) => {
    setSelectedTasks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handleSelectAll = () => {
    const dayTasks = tasks[currentAdminDay] || [];
    const ids = dayTasks.map((t) => t.id);
    setSelectedTasks(new Set(ids));
  };

  const handleDeleteSelected = () => {
    deleteSelected(currentAdminDay, selectedTasks);
    setSelectedTasks(new Set());
  };

  const handleMoveOrCopy = (targetDays: Day[], isMove: boolean) => {
    moveOrCopyTasks(currentAdminDay, selectedTasks, targetDays, isMove);
    setSelectedTasks(new Set());
    setShowMoveModal(false);
    setShowCopyModal(false);
  };

  // Sync Indicator Color
  const getSyncColor = () => {
    if (syncStatus === "synced") return "bg-green-500";
    if (syncStatus === "connecting") return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              Weekly Task Organizer
            </h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-xs font-medium">
              <span className={`w-2 h-2 rounded-full ${getSyncColor()}`}></span>
              <span className="capitalize">{syncStatus}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setIsAdmin(true)}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                isAdmin
                  ? "bg-purple-600 text-white shadow-md"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
            >
              👨‍💼 Administrator
            </button>
            <button
              onClick={() => setIsAdmin(false)}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                !isAdmin
                  ? "bg-purple-600 text-white shadow-md"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
            >
              👷 Ramon
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content */}
          {isAdmin ? (
            <AdminView
              currentDay={currentAdminDay}
              days={DAYS}
              onDayChange={setCurrentAdminDay}
              newTaskText={newTaskText}
              setNewTaskText={setNewTaskText}
              priority={priority}
              setPriority={setPriority}
              onAddTask={handleAddTask}
              groupByPriority={groupByPriority}
              setGroupByPriority={setGroupByPriority}
              selectedTasks={selectedTasks}
              tasks={tasks}
              onToggleSelection={handleToggleSelection}
              onEdit={editTask}
              onDragStart={(task, index, day) => {
                setDraggedTask({ task, index, day });
              }}
              onDrop={(targetDay, targetIndex) => {
                if (draggedTask && draggedTask.day === targetDay) {
                  // If grouped, prevent cross-priority drops (optional check, TaskItem enforces it too but good to have)
                  if (groupByPriority && draggedTask.task.priority !== tasks[targetDay]?.[targetIndex]?.priority) {
                     // Note: Logic for priority grouping check might be complex here without passing strict filtered indices. 
                     // For now trust TaskList/TaskItem to handle visual restrictions, but business logic is:
                     reorderTasks(targetDay, draggedTask.index, targetIndex);
                  } else {
                     reorderTasks(targetDay, draggedTask.index, targetIndex);
                  }
                }
                setDraggedTask(null);
              }}
              onDeleteSelected={handleDeleteSelected}
              onSelectAll={handleSelectAll}
              onMoveClick={() => setShowMoveModal(true)}
              onCopyClick={() => setShowCopyModal(true)}
              editingTaskId={editingTaskId}
              setEditingTaskId={setEditingTaskId}
            />
          ) : (
            <UserView
              currentDay={currentUserDay}
              days={DAYS}
              onDayChange={setCurrentUserDay}
              tasks={tasks}
              onToggleComplete={toggleComplete}
              groupByPriority={groupByPriority}
              setGroupByPriority={setGroupByPriority}
            />
          )}

          {/* Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            <QuickActions
              onClearCompleted={clearCompleted}
              onBulkAdd={() => setShowBulkModal(true)}
              onExportWhatsApp={exportToWhatsApp}
              onExportJSON={exportToJSON}
              onImportJSON={(e) => {
                if (e.target.files?.[0]) importFromJSON(e.target.files[0]);
              }}
              className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple-600 sticky top-4"
            />
            {isAdmin && <TaskStats total={stats.total} completed={stats.completed} />}
          </div>
        </div>
      </div>

      {/* Modals */}
      <DaySelectionModal
        show={showMoveModal}
        title="Move to..."
        days={DAYS}
        onClose={() => setShowMoveModal(false)}
        onConfirm={(days) => handleMoveOrCopy(days, true)}
      />
      <DaySelectionModal
        show={showCopyModal}
        title="Copy to..."
        days={DAYS}
        onClose={() => setShowCopyModal(false)}
        onConfirm={(days) => handleMoveOrCopy(days, false)}
      />
      <BulkAddModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onConfirm={(text) => {
          bulkAddTasks(currentAdminDay, text);
          setShowBulkModal(false);
        }}
      />
    </div>
  );
};

export default WeeklyTaskOrganizer;
