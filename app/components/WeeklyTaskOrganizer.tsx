"use client";
import React, { useState, useEffect } from "react";
import { useWeeklyTasks, DAYS } from "@/hooks/useWeeklyTasks";
import { Day, Priority, Task } from "@/types";
import { AdminView } from "./AdminView";
import { UserView } from "./UserView";
import { Sidebar } from "./Sidebar";
import { ThemeToggle } from "./ThemeToggle"; // Correctly imported
import { DaySelectionModal } from "./DaySelectionModal";
import { BulkAddModal } from "./BulkAddModal";
import { CalendarEventModal } from "./CalendarEventModal";
import { ShieldCheck, User, RefreshCw } from "lucide-react";
import { taskToCalendarEvent } from "@/lib/calendarMapper";
import {
  connectGoogleCalendar,
  createTaskEventForRamon,
  deleteTaskEventForRamon,
  getGoogleConnectionStatus,
  syncCalendarEvents,
  type SyncEvent,
} from "@/lib/calendarClient";

const WeeklyTaskOrganizer: React.FC = () => {
  // Logic Hook
  const {
    tasks,
    isClient,
    syncStatus,
    addTask,
    deleteTask,
    itemOperations: { toggleComplete, editTask, updateTaskCalendarEvent },
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
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isCheckingGoogle, setIsCheckingGoogle] = useState(true);

  // Modal State
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedTaskForCalendar, setSelectedTaskForCalendar] = useState<{
    day: Day;
    task: Task;
  } | null>(null);

  // Check Google Calendar connection status on mount
  useEffect(() => {
    let active = true;
    const checkStatus = async () => {
      try {
        const connected = await getGoogleConnectionStatus();
        if (active) {
          setIsGoogleConnected(connected);
        }
      } finally {
        if (active) setIsCheckingGoogle(false);
      }
    };
    checkStatus();
    return () => {
      active = false;
    };
  }, []);

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
    
    const allSelected = ids.length > 0 && ids.every((id) => selectedTasks.has(id));

    if (allSelected) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(ids));
    }
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

  const handleCreateCalendarEvent = (day: Day, task: Task) => {
    if (!isGoogleConnected) {
      alert("Please connect Google Calendar first.");
      return;
    }
    setSelectedTaskForCalendar({ day, task });
    setShowCalendarModal(true);
  };

  const handleConfirmCalendarEvent = async (
    startTime: string,
    endTime: string
  ) => {
    if (!selectedTaskForCalendar) return;

    try {
      const { day, task } = selectedTaskForCalendar;
      // If both times are empty strings, it's an all-day event (pass undefined)
      // Otherwise, use the provided times
      const payload = taskToCalendarEvent(
        day,
        task,
        startTime.trim() || undefined,
        endTime.trim() || undefined
      );
      
      // If editing and event exists, delete old event first
      if (task.calendarEvent?.eventId) {
        try {
          await deleteTaskEventForRamon(task.calendarEvent.eventId);
        } catch (error) {
          console.warn("Failed to delete old event, continuing with creation", error);
        }
      }
      
      const { eventId } = await createTaskEventForRamon(payload);
      
      // Update the task with calendar event information
      updateTaskCalendarEvent(day, task.id, {
        eventId,
        date: payload.date,
        startTime: payload.startTime,
        endTime: payload.endTime,
      });
      
      alert("✅ Calendar event created for this task!");
    } catch (error) {
      console.error(error);
      alert("❌ Failed to create calendar event. Check the console for details.");
    } finally {
      setShowCalendarModal(false);
      setSelectedTaskForCalendar(null);
    }
  };

  const handleDeleteCalendarEvent = async (day: Day, task: Task) => {
    if (!task.calendarEvent?.eventId) return;

    if (!window.confirm("Are you sure you want to delete this event from Google Calendar?")) {
      return;
    }

    try {
      await deleteTaskEventForRamon(task.calendarEvent.eventId);
      updateTaskCalendarEvent(day, task.id, null);
      alert("✅ Calendar event deleted!");
    } catch (error) {
      console.error(error);
      alert("❌ Failed to delete calendar event. Check the console for details.");
    }
  };

  const handleSyncCalendar = async () => {
    if (!isGoogleConnected) {
      alert("Please connect Google Calendar first.");
      return;
    }

    try {
      // Collect all tasks with calendar events
      const eventsToSync: SyncEvent[] = [];
      Object.entries(tasks).forEach(([day, dayTasks]) => {
        dayTasks?.forEach((task) => {
          if (task.calendarEvent?.eventId) {
            eventsToSync.push({
              eventId: task.calendarEvent.eventId,
              taskId: task.id,
              day: day as Day,
            });
          }
        });
      });

      if (eventsToSync.length === 0) {
        alert("No calendar events to sync.");
        return;
      }

      const { results } = await syncCalendarEvents(eventsToSync);

      let deletedCount = 0;
      let updatedCount = 0;

      // Process sync results
      results.forEach((result) => {
        const day = result.day as Day;

        if (result.deleted) {
          // Event was deleted from Google Calendar, remove from task
          updateTaskCalendarEvent(day, result.taskId, null);
          deletedCount++;
        } else if (result.updated && result.exists) {
          // Event was modified, update task
          const task = tasks[day]?.find((t) => t.id === result.taskId);
          if (task && result.updated) {
            // Only update if the event was modified after last sync
            const lastSynced = task.calendarEvent?.lastSynced || 0;
            const eventModified = result.updated.lastModified || 0;

            if (eventModified > lastSynced) {
              updateTaskCalendarEvent(day, result.taskId, {
                eventId: result.eventId,
                date: result.updated.date,
                startTime: result.updated.startTime,
                endTime: result.updated.endTime,
              });
              updatedCount++;
            }
          }
        }
      });

      if (deletedCount > 0 || updatedCount > 0) {
        alert(
          `✅ Sync complete! ${deletedCount} event(s) deleted, ${updatedCount} event(s) updated.`
        );
      } else {
        alert("✅ Sync complete! All events are up to date.");
      }
    } catch (error) {
      console.error(error);
      alert("❌ Failed to sync calendar events. Check the console for details.");
    }
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
        <header className="sticky top-0 z-50 flex justify-between items-center mb-8 bg-bg-surface/80 backdrop-blur-md p-4 rounded-xl shadow-sm border border-border-subtle">
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

            {isAdmin && (
              <>
                <button
                  onClick={() => connectGoogleCalendar().catch(() => {
                    alert("❌ Failed to start Google Calendar connection.");
                  })}
                  className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
                    isGoogleConnected
                      ? "bg-emerald-500 text-white shadow-md"
                      : "bg-bg-main text-text-secondary hover:bg-bg-sidebar border border-transparent hover:border-border-subtle"
                  }`}
                >
                  <span>
                    {isCheckingGoogle
                      ? "Checking Google..."
                      : isGoogleConnected
                      ? "Google Connected"
                      : "Connect Google Calendar"}
                  </span>
                </button>
                {isGoogleConnected && (
                  <button
                    onClick={handleSyncCalendar}
                    className="px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 bg-sapphire-500 text-white shadow-md hover:bg-sapphire-600"
                    title="Sync calendar events"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Sync Calendar</span>
                  </button>
                )}
              </>
            )}

            <button
              onClick={() => setIsAdmin(true)}
              className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
                isAdmin
                  ? "bg-sapphire-500 text-white shadow-md"
                  : "bg-bg-main text-text-secondary hover:bg-bg-sidebar border border-transparent hover:border-border-subtle"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Administrator</span>
            </button>
            <button
              onClick={() => setIsAdmin(false)}
              className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
                !isAdmin
                  ? "bg-sapphire-500 text-white shadow-md"
                  : "bg-bg-main text-text-secondary hover:bg-bg-sidebar border border-transparent hover:border-border-subtle"
              }`}
            >
              <User className="w-4 h-4" />
              <span>Ramon</span>
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
                onCreateCalendarEvent={handleCreateCalendarEvent}
                onDeleteCalendarEvent={handleDeleteCalendarEvent}
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
      {selectedTaskForCalendar && (
        <CalendarEventModal
          isOpen={showCalendarModal}
          onClose={() => {
            setShowCalendarModal(false);
            setSelectedTaskForCalendar(null);
          }}
          onConfirm={handleConfirmCalendarEvent}
          taskText={selectedTaskForCalendar.task.text}
          day={selectedTaskForCalendar.day}
          initialStartTime={selectedTaskForCalendar.task.calendarEvent?.startTime}
          initialEndTime={selectedTaskForCalendar.task.calendarEvent?.endTime}
          isEditMode={!!selectedTaskForCalendar.task.calendarEvent}
        />
      )}
    </div>
  );
};

export default WeeklyTaskOrganizer;
