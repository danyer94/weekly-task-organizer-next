import React, { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { Task } from "@/types";
import { Calendar, Clock, Sparkles } from "lucide-react";

const DEFAULT_EVENT_DURATION_MINUTES = 60;
const DAY_START_MINUTES = 0;
const DAY_END_MINUTES = 24 * 60;

interface TimedTaskBlock {
  task: Task;
  startMinutes: number;
  endMinutes: number;
  column: number;
  columns: number;
}

interface TaskTimelineProps {
  tasks: Task[];
  className?: string;
  onScheduleChange?: (task: Task, startTime: string, endTime: string) => void;
}

const toMinutes = (time: string) => {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
};

const toTimeString = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
};

const formatHourLabel = (hour: number) => {
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = ((hour + 11) % 12) + 1;
  return `${hour12}:00 ${period}`;
};

const MIN_RESIZE_MINUTES = 5;
const MINUTE_STEP = 5;
const BASE_HOUR_HEIGHT = 80;
const MIN_TIMED_BLOCK_HEIGHT = 44;

const buildTimedBlocks = (tasks: Task[]): TimedTaskBlock[] => {
  const timed = tasks
    .filter((task) => task.calendarEvent?.startTime)
    .map((task) => {
      const start = toMinutes(task.calendarEvent!.startTime!);
      const end = task.calendarEvent?.endTime
        ? toMinutes(task.calendarEvent.endTime)
        : start + DEFAULT_EVENT_DURATION_MINUTES;
      return {
        task,
        startMinutes: start,
        endMinutes: Math.max(end, start + MIN_RESIZE_MINUTES),
      };
    })
    .sort((a, b) => a.startMinutes - b.startMinutes);

  if (timed.length === 0) return [];

  const groups: Array<typeof timed> = [];
  let currentGroup: typeof timed = [];
  let currentEnd = -1;

  timed.forEach((item) => {
    if (currentGroup.length === 0) {
      currentGroup = [item];
      currentEnd = item.endMinutes;
      return;
    }

    if (item.startMinutes < currentEnd) {
      currentGroup.push(item);
      currentEnd = Math.max(currentEnd, item.endMinutes);
      return;
    }

    groups.push(currentGroup);
    currentGroup = [item];
    currentEnd = item.endMinutes;
  });

  if (currentGroup.length > 0) groups.push(currentGroup);

  const blocks: TimedTaskBlock[] = [];

  groups.forEach((group) => {
    const sortedByStart = [...group].sort(
      (a, b) => a.startMinutes - b.startMinutes
    );
    const columns: Array<number> = [];

    sortedByStart.forEach((item) => {
      let colIndex = columns.findIndex((end) => end <= item.startMinutes);
      if (colIndex === -1) {
        colIndex = columns.length;
        columns.push(item.endMinutes);
      } else {
        columns[colIndex] = item.endMinutes;
      }

      blocks.push({
        task: item.task,
        startMinutes: item.startMinutes,
        endMinutes: item.endMinutes,
        column: colIndex,
        columns: 1,
      });
    });

    const groupColumnCount = columns.length;
    blocks.forEach((block) => {
      if (group.some((item) => item.task.id === block.task.id)) {
        block.columns = groupColumnCount;
      }
    });
  });

  return blocks;
};

const TaskCard: React.FC<{
  task: Task;
  timeLabel?: string;
  isTimed?: boolean;
  compact?: boolean;
}> = ({ task, timeLabel, isTimed = false, compact = false }) => {
  return (
    <div
      className={`flex h-full min-h-0 flex-col rounded-2xl border shadow-sm transition-colors ${
        isTimed
          ? "border-border-brand/30 bg-sapphire-50/75 shadow-[0_10px_22px_rgba(59,130,246,0.12)] dark:border-border-brand/50 dark:bg-sapphire-900/35 dark:shadow-[0_16px_30px_rgba(2,6,23,0.55)]"
          : "border-border-subtle/60 bg-bg-surface/85"
      } ${compact ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm"} ${
        task.completed ? "opacity-60" : ""
      }`}
    >
      <div className="flex min-h-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`font-semibold text-text-primary ${compact ? "truncate" : "truncate"}`}>
            {task.text}
          </p>
          <div
            className={`mt-1 flex items-center gap-2 uppercase tracking-[0.18em] text-text-tertiary ${
              compact ? "text-[10px]" : "text-[11px]"
            }`}
          >
            {isTimed ? (
              <Clock className="w-3 h-3" />
            ) : (
              <Calendar className="w-3 h-3" />
            )}
            <span>{timeLabel}</span>
          </div>
        </div>
        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold ${
            task.priority === "high"
              ? "border-rose-200/80 bg-rose-50/70 text-rose-500"
              : task.priority === "medium"
                ? "border-amber-200/80 bg-amber-50/70 text-amber-500"
                : "border-emerald-200/80 bg-emerald-50/70 text-emerald-500"
          }`}
        >
          {task.priority[0].toUpperCase()}
        </div>
      </div>
    </div>
  );
};


export const TaskTimeline: React.FC<TaskTimelineProps> = ({
  tasks,
  className = "",
  onScheduleChange,
}) => {
  const allDayTasks = tasks.filter(
    (task) => task.calendarEvent && !task.calendarEvent.startTime
  );
  const timedTasks = tasks.filter((task) => task.calendarEvent?.startTime);
  const unscheduledTasks = tasks.filter((task) => !task.calendarEvent);
  const hasScheduled = timedTasks.length > 0;

  const blocks = useMemo(() => buildTimedBlocks(timedTasks), [timedTasks]);

  const [dragState, setDragState] = useState<{
    task: Task;
    mode: "move" | "resize-top" | "resize-bottom";
    pointerStartMinutes: number;
    startMinutes: number;
    endMinutes: number;
  } | null>(null);
  const [previewTimes, setPreviewTimes] = useState<
    Record<string, { startMinutes: number; endMinutes: number }>
  >({});
  const previewRef = useRef(previewTimes);
  const timelineRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    previewRef.current = previewTimes;
  }, [previewTimes]);

  const timelineRangeStart = Math.min(
    DAY_START_MINUTES,
    ...blocks.map((block) => block.startMinutes)
  );
  const timelineRangeEnd = Math.max(
    DAY_END_MINUTES,
    ...blocks.map((block) => block.endMinutes)
  );
  const timelinePadding = 16;
  const hourHeights = useMemo(() => {
    const startHour = Math.floor(timelineRangeStart / 60);
    const endHour = Math.ceil(timelineRangeEnd / 60);
    const heights = new Map<number, number>();

    for (let hour = startHour; hour < endHour; hour += 1) {
      const hourStart = hour * 60;
      const hourEnd = hourStart + 60;
      const overlaps = blocks
        .map((block) => {
          const overlap = Math.min(block.endMinutes, hourEnd) - Math.max(block.startMinutes, hourStart);
          return overlap > 0 ? overlap : 0;
        })
        .filter((overlap) => overlap > 0);

      if (overlaps.length === 0) {
        heights.set(hour, BASE_HOUR_HEIGHT);
        continue;
      }

      const minOverlap = Math.min(...overlaps);
      const requiredByDuration =
        (MIN_TIMED_BLOCK_HEIGHT * 60) / Math.max(minOverlap, MIN_RESIZE_MINUTES);
      const requiredByCount = overlaps.length * MIN_TIMED_BLOCK_HEIGHT;

      heights.set(hour, Math.max(BASE_HOUR_HEIGHT, requiredByDuration, requiredByCount));
    }

    return heights;
  }, [blocks, timelineRangeStart, timelineRangeEnd]);

  const hourSlots = useMemo(() => {
    const startHour = Math.floor(timelineRangeStart / 60);
    const endHour = Math.ceil(timelineRangeEnd / 60);
    let offset = timelinePadding;
    const slots: Array<{ hour: number; height: number; offset: number }> = [];

    for (let hour = startHour; hour < endHour; hour += 1) {
      const height = hourHeights.get(hour) ?? BASE_HOUR_HEIGHT;
      slots.push({ hour, height, offset });
      offset += height;
    }

    return slots;
  }, [hourHeights, timelineRangeStart, timelineRangeEnd, timelinePadding]);

  const hourSlotMap = useMemo(() => {
    const map = new Map<number, { height: number; offset: number }>();
    hourSlots.forEach((slot) => {
      map.set(slot.hour, { height: slot.height, offset: slot.offset });
    });
    return map;
  }, [hourSlots]);

  const timelineContainerHeight = hourSlots.length > 0
    ? hourSlots[hourSlots.length - 1].offset +
      hourSlots[hourSlots.length - 1].height +
      timelinePadding
    : timelinePadding * 2;

  const minuteToPx = useCallback(
    (minute: number) => {
      const clampedMinute = Math.min(Math.max(minute, timelineRangeStart), timelineRangeEnd);
      if (hourSlots.length === 0) {
        return timelinePadding;
      }
      if (clampedMinute === timelineRangeEnd && clampedMinute % 60 === 0) {
        const lastSlot = hourSlots[hourSlots.length - 1];
        return lastSlot ? lastSlot.offset + lastSlot.height : timelinePadding;
      }
      const hour = Math.floor(clampedMinute / 60);
      const slot = hourSlotMap.get(hour) ?? hourSlots[0];

      if (!slot) {
        return timelinePadding;
      }

      const withinHour = clampedMinute - hour * 60;
      return slot.offset + (withinHour / 60) * slot.height;
    },
    [hourSlotMap, hourSlots, timelinePadding, timelineRangeEnd, timelineRangeStart]
  );

  const pxToMinute = useCallback(
    (y: number) => {
      if (hourSlots.length === 0) return timelineRangeStart;

      const clampedY = Math.min(
        Math.max(y, timelinePadding),
        timelineContainerHeight - timelinePadding
      );

      const slot =
        hourSlots.find((item) => clampedY < item.offset + item.height) ??
        hourSlots[hourSlots.length - 1];

      const within = Math.min(Math.max(clampedY - slot.offset, 0), slot.height);
      return slot.hour * 60 + (within / slot.height) * 60;
    },
    [hourSlots, timelineContainerHeight, timelinePadding, timelineRangeStart]
  );

  const clampMinutes = useCallback(
    (value: number, min: number, max: number) => Math.min(Math.max(value, min), max),
    []
  );

  const getPointerMinutes = useCallback(
    (clientY: number) => {
      const container = timelineRef.current;
      if (!container) return null;
      const rect = container.getBoundingClientRect();
      return pxToMinute(clientY - rect.top);
    },
    [pxToMinute]
  );

  const handlePointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
    block: TimedTaskBlock,
    mode: "move" | "resize-top" | "resize-bottom"
  ) => {
    if (!onScheduleChange) return;
    event.preventDefault();
    event.stopPropagation();
    const pointerMinutes = getPointerMinutes(event.clientY);
    if (pointerMinutes === null) return;
    setDragState({
      task: block.task,
      mode,
      pointerStartMinutes: pointerMinutes,
      startMinutes: block.startMinutes,
      endMinutes: block.endMinutes,
    });
  };

  useEffect(() => {
    if (!dragState) return;

    const handlePointerMove = (event: PointerEvent) => {
      const pointerMinutes = getPointerMinutes(event.clientY);
      if (pointerMinutes === null) return;
      const rawDeltaMinutes = pointerMinutes - dragState.pointerStartMinutes;
      const deltaMinutes =
        Math.round(rawDeltaMinutes / MINUTE_STEP) * MINUTE_STEP;
      let nextStart = dragState.startMinutes;
      let nextEnd = dragState.endMinutes;

      if (dragState.mode === "move") {
        const duration = dragState.endMinutes - dragState.startMinutes;
        nextStart = clampMinutes(
          dragState.startMinutes + deltaMinutes,
          DAY_START_MINUTES,
          DAY_END_MINUTES - duration
        );
        nextEnd = nextStart + duration;
      } else if (dragState.mode === "resize-top") {
        nextStart = clampMinutes(
          dragState.startMinutes + deltaMinutes,
          DAY_START_MINUTES,
          dragState.endMinutes - MIN_RESIZE_MINUTES
        );
        nextEnd = dragState.endMinutes;
      } else {
        nextStart = dragState.startMinutes;
        nextEnd = clampMinutes(
          dragState.endMinutes + deltaMinutes,
          dragState.startMinutes + MIN_RESIZE_MINUTES,
          DAY_END_MINUTES
        );
      }

      setPreviewTimes((prev) => ({
        ...prev,
        [dragState.task.id]: {
          startMinutes: nextStart,
          endMinutes: nextEnd,
        },
      }));
    };

    const handlePointerUp = () => {
      const preview = previewRef.current[dragState.task.id];
      const finalStart = preview?.startMinutes ?? dragState.startMinutes;
      const finalEnd = preview?.endMinutes ?? dragState.endMinutes;
      setPreviewTimes((prev) => {
        const next = { ...prev };
        delete next[dragState.task.id];
        return next;
      });
      setDragState(null);
      if (onScheduleChange) {
        onScheduleChange(
          dragState.task,
          toTimeString(finalStart),
          toTimeString(finalEnd)
        );
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [clampMinutes, dragState, getPointerMinutes, onScheduleChange]);

  const renderEmpty = (label: string, description: string) => (

    <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border-subtle/70 bg-bg-main/50 px-4 py-3 text-sm text-text-tertiary">
      <Sparkles className="h-4 w-4 text-text-tertiary" />
      <div>
        <p className="font-semibold text-text-secondary">{label}</p>
        <p className="text-xs text-text-tertiary">{description}</p>
      </div>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-[0.28em] text-text-tertiary">
            All-day
          </h4>
          <span className="text-xs text-text-tertiary">
            {allDayTasks.length} task{allDayTasks.length === 1 ? "" : "s"}
          </span>
        </div>
        {allDayTasks.length === 0
          ? renderEmpty("No all-day tasks", "Add a calendar time to see them here.")
          : (
            <div className="grid gap-3 sm:grid-cols-2">
              {allDayTasks.map((task) => (
                <TaskCard key={task.id} task={task} timeLabel="All day" />
              ))}
            </div>
          )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-[0.28em] text-text-tertiary">
            Scheduled
          </h4>
          <span className="text-xs text-text-tertiary">
            {timedTasks.length} task{timedTasks.length === 1 ? "" : "s"}
          </span>
        </div>
        {!hasScheduled ? (
          renderEmpty("No scheduled tasks", "Add start times to build your timeline.")
        ) : (
          <div className="rounded-3xl border border-border-subtle/60 bg-bg-surface/80 px-4 py-6 sm:px-6">
            <div className="max-h-[520px] overflow-y-auto pr-2">
              <div className="grid gap-4 sm:gap-6 sm:grid-cols-[96px_1fr]">
                <div className="relative" style={{ height: `${timelineContainerHeight}px` }}>
                  {Array.from(
                    { length: Math.ceil((timelineRangeEnd - timelineRangeStart) / 60) + 1 },
                    (_, index) => timelineRangeStart + index * 60
                  ).map((minuteMark) => {
                    const top = minuteToPx(minuteMark);
                    const hourLabel = formatHourLabel(Math.floor(minuteMark / 60));
                    return (
                      <div
                        key={`hour-${minuteMark}`}
                        className="absolute right-0 pr-3 text-xs font-semibold text-text-tertiary font-mono"
                        style={{
                          top: `${top}px`,
                          transform: "translateY(-50%)",
                        }}
                      >
                        {hourLabel}
                      </div>
                    );
                  })}
                </div>
                <div ref={timelineRef} className="relative pl-4 pr-2" style={{ height: `${timelineContainerHeight}px` }}>
                  <div className="pointer-events-none absolute left-1 top-0 bottom-0 w-px bg-border-subtle/80" />
                  {Array.from(
                    { length: Math.ceil((timelineRangeEnd - timelineRangeStart) / 60) + 1 },
                    (_, index) => timelineRangeStart + index * 60
                  ).map((minuteMark) => {
                    const top = minuteToPx(minuteMark);
                    return (
                      <div
                        key={`grid-${minuteMark}`}
                        className="pointer-events-none absolute left-1 right-0 border-t border-border-subtle/30"
                        style={{
                          top: `${top}px`,
                        }}
                      />
                    );
                  })}
                  {blocks.map((block) => {
                    const preview = previewTimes[block.task.id];
                    const startMinutes = preview?.startMinutes ?? block.startMinutes;
                    const endMinutes = preview?.endMinutes ?? block.endMinutes;
                    const top = minuteToPx(startMinutes);
                    const bottom = minuteToPx(endMinutes);
                    const height = Math.max(bottom - top, 8);
                    const columnWidth = 100 / block.columns;
                    const left = columnWidth * block.column;
                    const width = block.columns === 1
                      ? "100%"
                      : `calc(${columnWidth}% - 10px)`;
                    const leftPos = block.columns === 1 ? "0%" : `calc(${left}% + 5px)`;
                    const compact = height < 60;

                    return (
                      <div
                        key={block.task.id}
                        className="absolute select-none touch-none"
                        style={{
                          left: leftPos,
                          width,
                          top: `${top}px`,
                          height: `${height}px`,
                        }}
                        onPointerDown={onScheduleChange ? (event) => {
                          const rect = event.currentTarget.getBoundingClientRect();
                          const relativeY = event.clientY - rect.top;
                          const totalHeight = rect.height;
                          const handleZone = Math.min(10, Math.max(4, totalHeight * 0.35));
                          
                          if (relativeY <= handleZone) {
                            // Top 10px - resize top
                            event.stopPropagation();
                            event.preventDefault();
                            handlePointerDown(event, block, "resize-top");
                          } else if (relativeY >= totalHeight - handleZone) {
                            // Bottom 10px - resize bottom
                            event.stopPropagation();
                            event.preventDefault();
                            handlePointerDown(event, block, "resize-bottom");
                          } else {
                            // Center area - move
                            event.stopPropagation();
                            event.preventDefault();
                            handlePointerDown(event, block, "move");
                          }
                        } : undefined}
                        onMouseMove={onScheduleChange ? (event) => {
                          const rect = event.currentTarget.getBoundingClientRect();
                          const relativeY = event.clientY - rect.top;
                          const totalHeight = rect.height;
                          const handleZone = Math.min(10, Math.max(4, totalHeight * 0.35));
                          
                          if (relativeY <= handleZone) {
                            event.currentTarget.style.cursor = 'ns-resize';
                          } else if (relativeY >= totalHeight - handleZone) {
                            event.currentTarget.style.cursor = 'ns-resize';
                          } else {
                            event.currentTarget.style.cursor = 'grab';
                          }
                        } : undefined}
                        onMouseLeave={onScheduleChange ? (event) => {
                          event.currentTarget.style.cursor = '';
                        } : undefined}
                      >
                        {/* TaskCard - visual only */}
                        <div className="relative h-full pointer-events-none">
                          <TaskCard
                            task={block.task}
                            timeLabel={`${toTimeString(startMinutes)} - ${toTimeString(endMinutes)}`}
                            isTimed
                            compact={compact}
                          />
                        </div>
                        {onScheduleChange && (
                          <>
                            {/* Top resize handle indicator - visual only */}
                            <div className="resize-handle group absolute left-0 right-0 top-0 z-30 h-[10px] pointer-events-none">
                              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-1.5 h-1.5 rounded-full bg-border-brand" />
                                <div className="w-1.5 h-1.5 rounded-full bg-border-brand" />
                                <div className="w-1.5 h-1.5 rounded-full bg-border-brand" />
                              </div>
                              <div className="absolute inset-x-0 top-0 h-[10px] bg-border-brand/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl" />
                            </div>
                            {/* Bottom resize handle indicator - visual only */}
                            <div className="resize-handle group absolute left-0 right-0 bottom-0 z-30 h-[10px] pointer-events-none">
                              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-1.5 h-1.5 rounded-full bg-border-brand" />
                                <div className="w-1.5 h-1.5 rounded-full bg-border-brand" />
                                <div className="w-1.5 h-1.5 rounded-full bg-border-brand" />
                              </div>
                              <div className="absolute inset-x-0 bottom-0 h-[10px] bg-border-brand/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-b-2xl" />
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-[0.3em] text-text-tertiary">
            Unscheduled
          </h4>
          <span className="text-xs text-text-tertiary">
            {unscheduledTasks.length} task{unscheduledTasks.length === 1 ? "" : "s"}
          </span>
        </div>
        {unscheduledTasks.length === 0
          ? renderEmpty("No unscheduled tasks", "Every task already has a time.")
          : (
            <div className="grid gap-3 sm:grid-cols-2">
              {unscheduledTasks.map((task) => (
                <TaskCard key={task.id} task={task} timeLabel="No time" />
              ))}
            </div>
          )}
      </section>
    </div>
  );
};
