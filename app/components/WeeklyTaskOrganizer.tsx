"use client";
import React, { useState } from "react";
import { useWeeklyTasks, DAYS } from "@/hooks/useWeeklyTasks";
import { Day, Priority } from "@/types";
import { AdminView } from "./AdminView";
import { UserView } from "./UserView";
import { Sidebar } from "./Sidebar";
import { ThemeToggle } from "./ThemeToggle"; // Correctly imported
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
    <div className="min-h-screen bg-bg-main p-4 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8 bg-bg-surface p-4 rounded-xl shadow-sm border border-border-subtle">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-text-brand">
              Weekly Task Organizer
            </h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-bg-main rounded-full text-xs font-medium border border-border-subtle">
              <span className={`w-2 h-2 rounded-full ${getSyncColor()}`}></span>
              <span className="capitalize text-text-secondary">{syncStatus}</span>
            </div>
          </div>

          <div className="flex gap-2 items-center">
            <ThemeToggle />
            
            <button
              onClick={() => setIsAdmin(true)}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                isAdmin
                  ? "bg-sapphire-500 text-white shadow-md"
                  : "bg-bg-main text-text-secondary hover:bg-bg-sidebar border border-transparent hover:border-border-subtle"
              }`}
            >
              👨‍💼 Administrator
            </button>
            <button
              onClick={() => setIsAdmin(false)}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                !isAdmin
                  ? "bg-sapphire-500 text-white shadow-md"
                  : "bg-bg-main text-text-secondary hover:bg-bg-sidebar border border-transparent hover:border-border-subtle"
              }`}
            >
              👷 Ramon
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {isAdmin ? (
            <>
              {/* Sidebar (Left Column) */}
              <div className="lg:col-span-3">
                 <Sidebar
                   days={DAYS}
                   currentDay={currentAdminDay}
                   onDayChange={setCurrentAdminDay}
                   tasks={tasks}
                   stats={stats}
                   quickActionsProps={{
                      onClearCompleted: clearCompleted,
                      onBulkAdd: () => setShowBulkModal(true),
                      onExportWhatsApp: exportToWhatsApp,
                      onExportJSON: exportToJSON,
                      onImportJSON: (e: any) => {
                        if (e.target.files?.[0]) importFromJSON(e.target.files[0]);
                      }
                   }}
                 />
              </div>

              {/* Main Content (Right Column) */}
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
                    reorderTasks(targetDay, draggedTask.index, targetIndex);
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
            </>
          ) : (
            // User View (Full Width)
            <div className="lg:col-span-12">
               <UserView
                currentDay={currentUserDay}
                days={DAYS}
                onDayChange={setCurrentUserDay}
                tasks={tasks}
                onToggleComplete={toggleComplete}
                groupByPriority={groupByPriority}
                setGroupByPriority={setGroupByPriority}
              />
            </div>
          )}
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
