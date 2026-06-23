"use client";
import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useWeeklyTasks, DAYS } from "@/hooks/useWeeklyTasks";
import type { DailySummarySettings } from "@/types";
import { Day, Priority, Task } from "@/types";
import { AdminView } from "./AdminView";
import { UserView } from "./UserView";
import { ThemeToggle } from "./ThemeToggle";
import { DaySelectionModal, type DaySelectionResult } from "./DaySelectionModal";
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
import { upsertCalendarEvent } from "@/lib/calendarEventMutations";

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
    itemOperations: {
      toggleComplete,
      editTask,
      updateTaskCalendarEvent,
      setTaskCalendarEventForDate,
    },
    reorderTasks,
    bulkOperations: {
      deleteSelected,
      clearCompleted,
      moveOrCopyTasks,
      moveOrCopyTasksToDate,
      bulkAddTasks,
    },
    ioOperations: { exportToWhatsApp },
    stats,
  } = useWeeklyTasks(selectedDate, user?.uid);

  // UI State
  const [isAdmin, setIsAdmin] = useState(true);
  const [currentAdminDay, setCurrentAdminDay] = useState<Day>("Monday");
  const [currentUserDay, setCurrentUserDay] = useState<Day>("Monday");

  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskStartTime, setNewTaskStartTime] = useState("");
  const [newTaskEndTime, setNewTaskEndTime] = useState("");
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
  const [isAddingTask, setIsAddingTask] = useState(false);
  const isAddingTaskRef = useRef(false);
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
    targetDate?: Date;
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
        setHeaderOffset(18);
        setMinHeaderHeight(96);
      } else if (width < 1024) {
        setHeaderOffset(22);
        setMinHeaderHeight(96);
      } else {
        setHeaderOffset(12);
        setMinHeaderHeight(88);
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

  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";

  // Handlers
  const handleAddTask = async () => {
    if (isAddingTaskRef.current) return;
    if (!newTaskText.trim()) return;
    const startTime = newTaskStartTime.trim();
    const endTime = newTaskEndTime.trim();

    if (endTime && !startTime) {
      alert("Select a start time before adding an end time.");
      return;
    }

    if (startTime && endTime && endTime <= startTime) {
      alert("End time must be after start time.");
      return;
    }

    let calendarEvent: Task['calendarEvent'] = undefined;

    isAddingTaskRef.current = true;
    setIsAddingTask(true);

    try {
      // If time is selected and Google Calendar is connected, try to create calendar event
      if (startTime && isGoogleConnected) {
        try {
          const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          const draftTask: Task = {
            id: "temp",
            text: newTaskText,
            completed: false,
            priority,
          };
          const payload = taskToCalendarEvent(
            currentAdminDay,
            draftTask,
            startTime,
            endTime || undefined,
            selectedDate,
            userTimeZone
          );
          const { eventId } = await createTaskEventForRamon(payload);
          calendarEvent = {
            eventId,
            date: payload.date,
            startTime: payload.startTime ?? null,
            endTime: payload.endTime ?? null,
          };
        } catch (error) {
          console.error("Failed to create calendar event", error);
          alert("Calendar event creation failed. Task was still created.");
        }
      }

      addTask(currentAdminDay, newTaskText, priority, calendarEvent);
      setNewTaskText("");
      setNewTaskStartTime("");
      setNewTaskEndTime("");
    } finally {
      isAddingTaskRef.current = false;
      setIsAddingTask(false);
    }
  };

  const handleComposerDateChange = (date: Date) => {
    setSelectedDate(date);
    setCurrentAdminDay(DAYS[(date.getDay() + 6) % 7]);
  };

  const handleToggleSelection = (id: string) => {
    setSelectedTasks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handleSelectAll = (filteredIds?: string[]) => {
    const ids = filteredIds ?? (tasks[currentAdminDay] || []).map((t) => t.id);

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

  const handleMoveOrCopy = (result: DaySelectionResult, isMove: boolean) => {
    if (result.type === "other") {
      setPendingMoveOrCopy({ targetDays: [], isMove, targetDate: result.date });
    } else {
      setPendingMoveOrCopy({ targetDays: result.days, isMove });
    }
    setShowScheduleConfirm(true);
    setShowMoveModal(false);
    setShowCopyModal(false);
  };

  const handleScheduleDecision = async (keepSchedule: boolean) => {
    if (!pendingMoveOrCopy) return;

    const isOtherDay = !!pendingMoveOrCopy.targetDate;
    const isMove = pendingMoveOrCopy.isMove;
    let createdTasks: Array<{ day: Day; task: Task }>;

    try {
      if (isOtherDay && pendingMoveOrCopy.targetDate) {
        const result = await moveOrCopyTasksToDate(
          currentAdminDay,
          selectedTasks,
          pendingMoveOrCopy.targetDate,
          isMove,
          keepSchedule
        );
        createdTasks = result.createdTasks;
      } else {
        const result = moveOrCopyTasks(
          currentAdminDay,
          selectedTasks,
          pendingMoveOrCopy.targetDays,
          isMove,
          keepSchedule
        );
        createdTasks = result.createdTasks;
      }
    } catch (error) {
      console.error(error);
      alert("Error: Failed to move/copy tasks.");
      return;
    }

    setSelectedTasks(new Set<string>());
    setPendingMoveOrCopy(null);
    setShowScheduleConfirm(false);

    if (!keepSchedule) return;

    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const tasksWithSchedule = createdTasks.filter(
      (created) => created.task.calendarEvent
    );

    if (tasksWithSchedule.length === 0) return;

    const contextDate = selectedDate ?? new Date();
    const eventDateOverride = (task: Task) =>
      task.calendarEvent?.date ?? undefined;
    const getTaskDate = (task: Task, day: Day) =>
      task.calendarEvent?.date
        ? new Date(`${task.calendarEvent.date}T12:00:00`)
        : getDateForDayInWeek(contextDate, day);

    try {
      if (isMove) {
        await Promise.all(
          tasksWithSchedule.map(async ({ day, task }) => {
            if (!task.calendarEvent?.eventId) return;

            const payload = taskToCalendarEvent(
              day,
              task,
              task.calendarEvent.startTime ?? undefined,
              task.calendarEvent.endTime ?? undefined,
              contextDate,
              userTimeZone,
              eventDateOverride(task)
            );

            await updateTaskEventForRamon(task.calendarEvent.eventId, payload);
            const calendarEvent = {
              eventId: task.calendarEvent.eventId,
              date: payload.date,
              startTime: payload.startTime ?? null,
              endTime: payload.endTime ?? null,
            };
            if (isOtherDay) {
              await setTaskCalendarEventForDate(
                getTaskDate(task, day),
                day,
                task.id,
                calendarEvent
              );
            } else {
              updateTaskCalendarEvent(day, task.id, calendarEvent);
            }
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
              contextDate,
              userTimeZone,
              eventDateOverride(task)
            );
            const { eventId } = await createTaskEventForRamon(payload);
            const calendarEvent = {
              eventId,
              date: payload.date,
              startTime: payload.startTime ?? null,
              endTime: payload.endTime ?? null,
            };
            if (isOtherDay) {
              await setTaskCalendarEventForDate(
                getTaskDate(task, day),
                day,
                task.id,
                calendarEvent
              );
            } else {
              updateTaskCalendarEvent(day, task.id, calendarEvent);
            }
          })
        );
      }
    } catch (error) {
      console.error(error);
      alert("Error: Failed to update Google Calendar for moved/copied tasks.");
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
      const { eventId } = await upsertCalendarEvent({
        existingEventId: task.calendarEvent?.eventId,
        payload,
        createEvent: createTaskEventForRamon,
        updateEvent: updateTaskEventForRamon,
      });

      // Update the task with calendar event information
      updateTaskCalendarEvent(day, task.id, {
        eventId,
        date: payload.date,
        startTime: payload.startTime,
        endTime: payload.endTime,
      });

      alert("Success: Calendar event created for this task.");
    } catch (error) {
      console.error(error);
      alert("Error: Failed to create calendar event. Check the console for details.");
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
      alert("Success: Calendar event deleted.");
    } catch (error) {
      console.error(error);
      alert("Error: Failed to delete calendar event. Check the console for details.");
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
          `Sync complete. ${deletedCount} event(s) deleted, ${updatedCount} event(s) updated.`
        );
      } else {
        alert("Sync complete. All events are up to date.");
      }
    } catch (error) {
      console.error(error);
      alert("Error: Failed to sync calendar events. Check the console for details.");
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


  if (!isClient || authLoading || !user || !selectedDate) return null;

  return (
    <div
      id="main-content"
      className={`admin-shell ${isAdmin ? "admin-mode" : "user-mode"} relative min-h-screen overflow-x-hidden p-3 font-sans transition-colors duration-200 sm:p-4`}
    >
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="w-full">
          <header
            ref={headerRef}
            className="admin-topbar w-full rounded-none px-3 py-2 sm:px-4 sm:py-3"
          >
            <div className="relative z-10 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center justify-between gap-2 min-w-0 sm:flex-1">
                <div className="flex items-center gap-2 min-w-0">
                  <Image
                    src="/images/calendar-icon-no-background.png"
                    alt="Calendar"
                    width={40}
                    height={40}
                    className="w-8 h-8 sm:w-10 sm:h-10 object-contain shrink-0"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="hidden text-[10px] uppercase tracking-[0.26em] text-text-tertiary sm:block">
                      Operations Week
                    </span>
                    <div className="flex items-center gap-2 min-w-0">
                      <h1 className="truncate text-base font-semibold leading-tight text-text-primary sm:text-xl md:text-2xl">
                        <span className="sm:hidden">Weekly Tasks</span>
                        <span className="hidden sm:inline">Weekly Task Organizer</span>
                      </h1>
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full sm:h-2.5 sm:w-2.5 ${getSyncColor()}`}
                        role="status"
                        aria-label={`Calendar sync status: ${syncStatus}`}
                      ></span>
                    </div>
                    <div className="mt-1 hidden h-px w-16 bg-gradient-to-r from-border-brand/70 via-border-brand/30 to-transparent sm:block"></div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:hidden">
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

              <div className="flex items-center gap-2 min-w-0 sm:justify-end">
                <nav
                  className="admin-header-nav flex flex-1 items-center justify-end gap-1.5 sm:flex-none"
                  aria-label="Workspace views"
                >
                  <button
                    onClick={() => setIsAdmin(true)}
                    aria-pressed={isAdmin}
                    className={`admin-header-nav__item flex min-h-10 items-center justify-center gap-1.5 px-3 text-xs font-semibold transition-[background-color,border-color,color,box-shadow,opacity,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand active:scale-[0.96] sm:gap-2 sm:text-sm ${
                      isAdmin
                        ? "is-active text-text-primary"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>Admin</span>
                  </button>
                  <button
                    onClick={() => setIsAdmin(false)}
                    aria-pressed={!isAdmin}
                    className={`admin-header-nav__item flex min-h-10 items-center justify-center gap-1.5 px-3 text-xs font-semibold transition-[background-color,border-color,color,box-shadow,opacity,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand active:scale-[0.96] sm:gap-2 sm:text-sm ${
                      !isAdmin
                        ? "is-active text-text-primary"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <UserIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="max-w-[90px] truncate sm:max-w-[140px]">{displayName}</span>
                  </button>
                </nav>
                <div className="hidden items-center gap-2 shrink-0 sm:flex">
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
            </div>
          </header>
        </div>
      </div>


      <div
        className="relative z-10 mx-auto max-w-[1500px]"
        style={{ paddingTop: Math.max(headerHeight, minHeaderHeight) + headerOffset }}
      >

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
          {isAdmin ? (
            <AdminView
                currentDay={currentAdminDay}
                days={DAYS}
                onDayChange={setCurrentAdminDay}
                selectedDate={selectedDate}
                onDateChange={handleComposerDateChange}
                newTaskText={newTaskText}
                setNewTaskText={setNewTaskText}
                taskStartTime={newTaskStartTime}
                setTaskStartTime={setNewTaskStartTime}
                taskEndTime={newTaskEndTime}
                setTaskEndTime={setNewTaskEndTime}
                priority={priority}
                setPriority={setPriority}
                onAddTask={handleAddTask}
                isAddingTask={isAddingTask}
                groupByPriority={groupByPriority}
                setGroupByPriority={setGroupByPriority}
                selectedTasks={selectedTasks}
                tasks={tasks}
                weeklyStats={stats}
                dailyStats={{
                  total: (tasks[currentAdminDay] || []).length,
                  completed: (tasks[currentAdminDay] || []).filter(t => t.completed).length,
                }}
                quickActions={{
                  onClearCompleted: clearCompleted,
                  onBulkAdd: () => setShowBulkModal(true),
                  onExportWhatsApp: exportToWhatsApp,
                  onSendDailySummary: handleSendDailySummary,
                  isSendingDailySummary: isSendingSummary,
                }}
                onToggleSelection={handleToggleSelection}
                onToggleComplete={toggleComplete}
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
        baseDate={selectedDate ?? new Date()}
        onClose={() => setShowMoveModal(false)}
        onConfirm={(result) => handleMoveOrCopy(result, true)}
      />
      <DaySelectionModal
        show={showCopyModal}
        title="Copy to..."
        days={DAYS}
        baseDate={selectedDate ?? new Date()}
        onClose={() => setShowCopyModal(false)}
        onConfirm={(result) => handleMoveOrCopy(result, false)}
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
          key={`${selectedTaskForCalendar.task.id}:${selectedTaskForCalendar.task.calendarEvent?.eventId ?? "new"}`}
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
