"use client";
import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { useWeeklyTasks, DAYS } from "@/hooks/useWeeklyTasks";
import type { DailySummarySettings } from "@/types";
import { Day, Priority, Task } from "@/types";
import { AdminView } from "./AdminView";
import { UserView } from "./UserView";
import { Sidebar } from "./Sidebar";
import { ThemeToggle } from "./ThemeToggle";
import { DaySelectionModal } from "./DaySelectionModal";
import { BulkAddModal } from "./BulkAddModal";
import { CalendarEventModal } from "./CalendarEventModal";
import { ShieldCheck, RefreshCw } from "lucide-react";
import { getDateForDayInWeek, taskToCalendarEvent } from "@/lib/calendarMapper";
import { ConfirmationModal } from "./ConfirmationModal";
import { ScheduleConfirmModal } from "./ScheduleConfirmModal";
import {
  connectGoogleCalendar,
  createTaskEventForRamon,
  deleteTaskEventForRamon,
  getGoogleConnectionStatus,
  syncCalendarEvents,
  updateTaskEventForRamon,
  type SyncEvent,
} from "@/lib/calendarClient";
import {
  sendDailySummary,
  sendDailySummaryAuto,
} from "@/lib/notificationsClient";
import { format } from "date-fns";
import { useAuth } from "./AuthProvider";
import { useRouter } from "next/navigation";
import { User as UserIcon } from "lucide-react";
import { UserMenu } from "./UserMenu";
import { UserSettingsModal } from "./UserSettingsModal";
import { database, getUserPath } from "@/lib/firebase";
import { onValue, ref } from "firebase/database";

const WeeklyTaskOrganizer: React.FC = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  // Date State
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);


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
  } = useWeeklyTasks(selectedDate, user?.uid);

  // UI State
  const [isAdmin, setIsAdmin] = useState(true);
  const [currentAdminDay, setCurrentAdminDay] = useState<Day>("Monday");
  const [currentUserDay, setCurrentUserDay] = useState<Day>("Monday");

  const [newTaskText, setNewTaskText] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [groupByPriority, setGroupByPriority] = useState(true);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(
    new Set<string>()
  );
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [draggedTask, setDraggedTask] = useState<{ task: any; index: number; day: Day } | null>(null);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isCheckingGoogle, setIsCheckingGoogle] = useState(true);
  const [isSendingSummary, setIsSendingSummary] = useState(false);
  const [showUserSettings, setShowUserSettings] = useState(false);
  const [dailySummaryEnabled, setDailySummaryEnabled] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [headerOffset, setHeaderOffset] = useState(0);
  const [minHeaderHeight, setMinHeaderHeight] = useState(0);


  // Modal State
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedTaskForCalendar, setSelectedTaskForCalendar] = useState<{
    day: Day;
    task: Task;
  } | null>(null);
  const [showScheduleConfirm, setShowScheduleConfirm] = useState(false);
  const [pendingMoveOrCopy, setPendingMoveOrCopy] = useState<{
    targetDays: Day[];
    isMove: boolean;
  } | null>(null);

  // Check Google Calendar connection status when user changes or on mount
  useEffect(() => {
    if (!user) {
      setIsGoogleConnected(false);
      setIsCheckingGoogle(false);
      return;
    }

    let active = true;
    const checkStatus = async () => {
      setIsCheckingGoogle(true);
      try {
        const connected = await getGoogleConnectionStatus();
        if (active) {
          setIsGoogleConnected(connected);
        }
      } catch (error) {
        console.error("Failed to check Google connection", error);
      } finally {
        if (active) setIsCheckingGoogle(false);
      }
    };

    checkStatus();

    // Handle redirect params
    const url = new URL(window.location.href);
    const googleParam = url.searchParams.get('google');
    const reason = url.searchParams.get('reason');
    const details = url.searchParams.get('details');

    if (googleParam === 'connected') {
      // Clear the param without refreshing
      window.history.replaceState({}, '', '/');
      // Re-check connection status
      checkStatus();
    } else if (googleParam) {
      // Handle errors
      let errorMessage = 'Failed to connect Google Calendar.';

      switch (googleParam) {
        case 'error':
          errorMessage = reason
            ? `Google OAuth error: ${reason}`
            : 'Google OAuth returned an error. Please try again.';
          break;
        case 'missing_info':
          errorMessage = 'Missing required information from Google. Please try again.';
          break;
        case 'invalid_state':
          errorMessage = 'Security validation failed. Please try connecting again.';
          break;
        case 'config_error':
          errorMessage = 'Google Calendar is not properly configured. Please contact support.';
          break;
        case 'redirect_mismatch':
          errorMessage = 'Redirect URI mismatch. Please verify the configuration.';
          break;
        case 'invalid_grant':
          errorMessage = 'Authorization expired or invalid. Please try connecting again.';
          break;
        case 'invalid_client':
          errorMessage = 'Invalid Google OAuth credentials. Please contact support.';
          break;
        case 'callback_error':
          errorMessage = details
            ? `Connection error: ${decodeURIComponent(details)}`
            : 'An error occurred during the connection process. Please try again.';
          break;
      }

      alert(errorMessage);
      // Clear the params
      window.history.replaceState({}, '', '/');
    }

    return () => {
      active = false;
    };
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

  useLayoutEffect(() => {
    if (!isClient || authLoading || !user) return;
    const header = headerRef.current;
    if (!header) return;

    const updateHeight = () => setHeaderHeight(header.offsetHeight || 0);
    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(header);
    return () => observer.disconnect();
  }, [isClient, authLoading, user]);

  useEffect(() => {
    if (!isClient) return;
    const updateOffsets = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setHeaderOffset(32);
        setMinHeaderHeight(140);
      } else if (width < 1024) {
        setHeaderOffset(28);
        setMinHeaderHeight(120);
      } else {
        setHeaderOffset(24);
        setMinHeaderHeight(104);
      }
    };

    updateOffsets();
    window.addEventListener("resize", updateOffsets);
    return () => window.removeEventListener("resize", updateOffsets);
  }, [isClient]);


  useEffect(() => {
    if (!isClient) return;
    const today = new Date();
    setSelectedDate(today);
    setCurrentAdminDay(DAYS[(today.getDay() + 6) % 7]);
    setCurrentUserDay(DAYS[(today.getDay() + 6) % 7]);
  }, [isClient]);


  useEffect(() => {
    if (!user) return;
    const settingsRef = ref(
      database,
      getUserPath(user.uid, "settings/notifications/dailySummary")
    );
    const unsubscribe = onValue(settingsRef, (snapshot) => {
      if (!snapshot.exists()) {
        setDailySummaryEnabled(false);
        return;
      }
      const settings = snapshot.val() as DailySummarySettings;
      setDailySummaryEnabled(Boolean(settings?.enabled));
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user || !dailySummaryEnabled) return;
    const storageKey = `dailySummaryLastSent:${user.uid}`;
    let active = true;

    const attemptAutoSend = async () => {
      if (!active) return;
      try {
        const lastSent = localStorage.getItem(storageKey);
        const today = new Date().toISOString().slice(0, 10);
        if (lastSent === today) return;

        const result = await sendDailySummaryAuto();
        if (!result?.skipped && result?.dateKey) {
          localStorage.setItem(storageKey, result.dateKey);
        }
      } catch (error) {
        console.warn("Daily summary auto send failed", error);
      }
    };

    attemptAutoSend();
    const interval = window.setInterval(attemptAutoSend, 5 * 60 * 1000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [dailySummaryEnabled, user]);

  if (!isClient || authLoading || !user || !selectedDate) return null;


  const displayName = user.displayName || user.email?.split("@")[0] || "User";

  // Handlers
  const handleAddTask = () => {
    addTask(currentAdminDay, newTaskText, priority);
    setNewTaskText("");
  };

  const handleToggleSelection = (id: string) => {
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
      setSelectedTasks(new Set<string>());
    } else {
      setSelectedTasks(new Set<string>(ids));
    }
  };

  const handleDeleteSelected = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    deleteSelected(currentAdminDay, selectedTasks);
    setSelectedTasks(new Set<string>());
    setShowDeleteConfirm(false);
  };

  const handleMoveOrCopy = (targetDays: Day[], isMove: boolean) => {
    setPendingMoveOrCopy({ targetDays, isMove });
    setShowScheduleConfirm(true);
    setShowMoveModal(false);
    setShowCopyModal(false);
  };

  const handleScheduleDecision = async (keepSchedule: boolean) => {
    if (!pendingMoveOrCopy) return;

    const { createdTasks } = moveOrCopyTasks(
      currentAdminDay,
      selectedTasks,
      pendingMoveOrCopy.targetDays,
      pendingMoveOrCopy.isMove,
      keepSchedule
    );
    setSelectedTasks(new Set<string>());
    setPendingMoveOrCopy(null);
    setShowScheduleConfirm(false);

    if (!keepSchedule) return;

    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const tasksWithSchedule = createdTasks.filter(
      (created) => created.task.calendarEvent
    );

    if (tasksWithSchedule.length === 0) return;

    try {
      if (pendingMoveOrCopy.isMove) {
        await Promise.all(
          tasksWithSchedule.map(async ({ day, task }) => {
            if (!task.calendarEvent?.eventId) return;

            const payload = taskToCalendarEvent(
              day,
              task,
              task.calendarEvent.startTime ?? undefined,
              task.calendarEvent.endTime ?? undefined,
              selectedDate,
              userTimeZone
            );

            await updateTaskEventForRamon(task.calendarEvent.eventId, payload);
            updateTaskCalendarEvent(day, task.id, {
              eventId: task.calendarEvent.eventId,
              date: payload.date,
              startTime: payload.startTime ?? null,
              endTime: payload.endTime ?? null,
            });
          })
        );
      } else {
        await Promise.all(
          tasksWithSchedule.map(async ({ day, task }) => {
            if (!task.calendarEvent) return;

            const payload = taskToCalendarEvent(
              day,
              task,
              task.calendarEvent.startTime ?? undefined,
              task.calendarEvent.endTime ?? undefined,
              selectedDate,
              userTimeZone
            );
            const { eventId } = await createTaskEventForRamon(payload);
            updateTaskCalendarEvent(day, task.id, {
              eventId,
              date: payload.date,
              startTime: payload.startTime ?? null,
              endTime: payload.endTime ?? null,
            });
          })
        );
      }
    } catch (error) {
      console.error(error);
      alert("❌ Failed to update Google Calendar for moved/copied tasks.");
    }
  };

  const handleScheduleCancel = () => {
    setPendingMoveOrCopy(null);
    setShowScheduleConfirm(false);
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

      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const payload = taskToCalendarEvent(
        day,
        task,
        startTime.trim() || undefined,
        endTime.trim() || undefined,
        selectedDate,
        userTimeZone
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

  const handleTimelineScheduleChange = useCallback(
    async (day: Day, task: Task, startTime: string, endTime: string) => {
      if (!task.calendarEvent?.eventId || !selectedDate) return;

      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const payload = taskToCalendarEvent(
        day,
        task,
        startTime.trim(),
        endTime.trim(),
        selectedDate,
        userTimeZone
      );

      updateTaskCalendarEvent(day, task.id, {
        eventId: task.calendarEvent.eventId,
        date: payload.date,
        startTime: payload.startTime ?? null,
        endTime: payload.endTime ?? null,
      });

      if (!isGoogleConnected) return;

      try {
        await updateTaskEventForRamon(task.calendarEvent.eventId, payload);
      } catch (error) {
        console.error("Failed to update calendar event from timeline", error);
      }
    },
    [isGoogleConnected, selectedDate, updateTaskCalendarEvent]
  );

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

  const handleSendDailySummary = async () => {
    try {
      setIsSendingSummary(true);
      const targetDate = format(
        getDateForDayInWeek(selectedDate, currentAdminDay),
        "yyyy-MM-dd"
      );
      await sendDailySummary(targetDate);
      alert("Daily summary sent.");
    } catch (error) {
      console.error("Failed to send daily summary", error);
      alert("Failed to send daily summary.");
    } finally {
      setIsSendingSummary(false);
    }
  };

  const handleConnectGoogle = async () => {
    try {
      await connectGoogleCalendar();
    } catch {
      alert("Failed to start Google Calendar connection.");
    }
  };

  // Sync Indicator Color
  const getSyncColor = () => {
    if (syncStatus === "synced") return "bg-green-500";
    if (syncStatus === "connecting") return "bg-yellow-500";
    return "bg-red-500";
  };


  return (
    <div className="min-h-screen bg-bg-main p-4 font-sans transition-colors duration-300 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_55%),radial-gradient(circle_at_20%_20%,_rgba(168,85,247,0.18),_transparent_50%),radial-gradient(circle_at_80%_10%,_rgba(14,165,233,0.2),_transparent_45%)]"></div>
      <div className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-30 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:80px_80px]"></div>
      <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-gradient-to-br from-sky-400/30 via-fuchsia-400/20 to-transparent blur-3xl animate-float-slow"></div>
      <div className="absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-gradient-to-tr from-cyan-400/25 via-blue-500/20 to-transparent blur-3xl animate-float-slow"></div>
      <div className="fixed top-0 left-0 right-0 z-50 px-4">
        <div className="max-w-7xl mx-auto">
          <header
            ref={headerRef}
            className="glass-panel rounded-2xl px-4 sm:px-6 py-4 border border-border-subtle/60 shadow-2xl"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex flex-wrap items-center gap-3 min-w-0 sm:flex-1 sm:flex-nowrap sm:overflow-x-auto scrollbar-hide">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src="/images/calendar-icon-no-background.png"
                      alt="Calendar"
                      className="w-10 h-10 sm:w-11 sm:h-11 object-contain shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs uppercase tracking-[0.4em] text-text-tertiary">Neon Ops</span>
                      <h1 className="text-lg sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-sky-400 via-blue-500 to-fuchsia-400 bg-clip-text text-transparent animate-gradient-pan leading-tight">
                        Weekly Task Organizer
                      </h1>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-bg-main/70 rounded-full text-xs font-medium border border-border-subtle glow-ring shrink-0">
                    <span className={`w-2 h-2 rounded-full ${getSyncColor()}`}></span>
                    <span className="capitalize text-text-secondary">{syncStatus}</span>
                  </div>
                </div>


                <div className="flex items-center gap-1 rounded-xl border border-border-subtle bg-bg-main/70 p-1 shrink-0">
                  <button
                    onClick={() => setIsAdmin(true)}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${isAdmin
                      ? "bg-gradient-to-r from-sapphire-500 to-cyan-500 text-white shadow-lg"
                      : "text-text-secondary hover:bg-bg-sidebar"
                      }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Administrator</span>
                  </button>
                  <button
                    onClick={() => setIsAdmin(false)}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${!isAdmin
                      ? "bg-gradient-to-r from-sapphire-500 to-cyan-500 text-white shadow-lg"
                      : "text-text-secondary hover:bg-bg-sidebar"
                      }`}
                  >
                    <UserIcon className="w-4 h-4" />
                    <span className="max-w-[140px] truncate">{displayName}</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <ThemeToggle />
                <UserMenu
                  displayName={displayName}
                  email={user.email}
                  photoURL={user.photoURL}
                  onLogout={logout}
                  onOpenSettings={() => setShowUserSettings(true)}
                  isAdmin={isAdmin}
                  isGoogleConnected={isGoogleConnected}
                  isCheckingGoogle={isCheckingGoogle}
                  onConnectGoogle={handleConnectGoogle}
                  onSyncCalendar={handleSyncCalendar}
                />
              </div>
            </div>
          </header>
        </div>
      </div>


      <div
        className="max-w-7xl mx-auto relative z-10"
        style={{ paddingTop: Math.max(headerHeight, minHeaderHeight) + headerOffset }}
      >

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
                    onSendDailySummary: handleSendDailySummary,
                    isSendingDailySummary: isSendingSummary,
                    onImportJSON: (e: any) => {
                      if (e.target.files?.[0]) importFromJSON(e.target.files[0]);
                    }
                  }}
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                />
              </div>

              {/* Main Content (Right Column) */}
              <AdminView
                currentDay={currentAdminDay}
                days={DAYS}
                onDayChange={setCurrentAdminDay}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
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
                onTimelineScheduleChange={handleTimelineScheduleChange}
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
                onTimelineScheduleChange={handleTimelineScheduleChange}
                groupByPriority={groupByPriority}
                setGroupByPriority={setGroupByPriority}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                displayName={displayName}
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
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Tasks"
        message={`Are you sure you want to delete ${selectedTasks.size} selected task(s)? This action cannot be undone.`}
      />
      <ScheduleConfirmModal
        isOpen={showScheduleConfirm}
        title={pendingMoveOrCopy?.isMove ? "Move Tasks" : "Copy Tasks"}
        message={
          pendingMoveOrCopy?.isMove
            ? "Keep the same schedule when moving these tasks?"
            : "Copy tasks with the same schedule?"
        }
        onYes={() => handleScheduleDecision(true)}
        onNo={() => handleScheduleDecision(false)}
        onCancel={handleScheduleCancel}
      />
      <UserSettingsModal
        isOpen={showUserSettings}
        onClose={() => setShowUserSettings(false)}
        initialDisplayName={displayName}
        email={user.email}
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
          isEditMode={!!selectedTaskForCalendar.task.calendarEvent?.eventId}
        />
      )}
    </div>
  );
};

export default WeeklyTaskOrganizer;
