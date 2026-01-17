import React from "react";
import { Task } from "@/types";
import { Calendar, Clock, Sparkles } from "lucide-react";

const DEFAULT_EVENT_DURATION_MINUTES = 60;
const DAY_START_MINUTES = 6 * 60;
const DAY_END_MINUTES = 22 * 60;

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
}

const toMinutes = (time: string) => {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
};

const toDisplayTime = (time?: string | null) => {
  if (!time) return "All day";
  return time;
};


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
        endMinutes: Math.max(end, start + 15),
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

const formatTimeRange = (task: Task) => {
  const start = task.calendarEvent?.startTime;
  const end = task.calendarEvent?.endTime;
  if (!start) return "All day";
  if (!end) return start;
  return `${start} – ${end}`;
};

const TaskCard: React.FC<{
  task: Task;
  timeLabel?: string;
  isTimed?: boolean;
  compact?: boolean;
}> = ({ task, timeLabel, isTimed = false, compact = false }) => {
  return (
    <div
      className={`rounded-2xl border border-border-subtle/60 bg-bg-surface/80 px-4 py-3 shadow-sm transition-all ${
        compact ? "text-xs" : "text-sm"
      } ${task.completed ? "opacity-60" : ""}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-text-primary truncate">{task.text}</p>
          <div className="mt-1 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-text-tertiary">
            {isTimed ? (
              <Clock className="w-3 h-3" />
            ) : (
              <Calendar className="w-3 h-3" />
            )}
            <span>{timeLabel}</span>
          </div>
        </div>
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full border text-[10px] font-semibold ${
              task.priority === "high"
                ? "border-red-200/80 bg-red-50/70 text-red-500"
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
}) => {
  const allDayTasks = tasks.filter(
    (task) => task.calendarEvent && !task.calendarEvent.startTime
  );
  const timedTasks = tasks.filter((task) => task.calendarEvent?.startTime);
  const unscheduledTasks = tasks.filter((task) => !task.calendarEvent);
  const hasScheduled = timedTasks.length > 0;

  const blocks = buildTimedBlocks(timedTasks);

  const timelineRangeStart = Math.min(
    DAY_START_MINUTES,
    ...blocks.map((block) => block.startMinutes)
  );
  const timelineRangeEnd = Math.max(
    DAY_END_MINUTES,
    ...blocks.map((block) => block.endMinutes)
  );
  const timelineDuration = Math.max(timelineRangeEnd - timelineRangeStart, 1);

  const renderEmpty = (label: string, description: string) => (
    <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border-subtle/70 bg-bg-main/40 px-4 py-3 text-sm text-text-tertiary">
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
          <h4 className="text-xs font-semibold uppercase tracking-[0.3em] text-text-tertiary">
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
          <h4 className="text-xs font-semibold uppercase tracking-[0.3em] text-text-tertiary">
            Scheduled
          </h4>
          <span className="text-xs text-text-tertiary">
            {timedTasks.length} task{timedTasks.length === 1 ? "" : "s"}
          </span>
        </div>
        {!hasScheduled ? (
          renderEmpty("No scheduled tasks", "Add start times to build your timeline.")
        ) : (
          <div className="rounded-3xl border border-border-subtle/60 bg-bg-surface/70 px-4 py-6 sm:px-6">
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-[96px_1fr]">
              <div className="relative min-h-[260px] sm:min-h-[320px]">
                {blocks.map((block) => {
                  const top = ((block.startMinutes - timelineRangeStart) / timelineDuration) * 100;
                  return (
                    <div
                      key={`label-${block.task.id}`}
                      className="absolute right-0 pr-3 text-xs font-semibold text-text-tertiary"
                      style={{
                        top: `${top}%`,
                        transform: "translateY(-10%)",
                      }}
                    >
                      {formatTimeRange(block.task)}
                    </div>
                  );
                })}
              </div>
              <div className="relative min-h-[260px] sm:min-h-[320px] pl-4 pr-2">
                <div className="pointer-events-none absolute left-1 top-0 bottom-0 w-px bg-border-subtle/80" />
                {blocks.map((block) => {
                  const top = ((block.startMinutes - timelineRangeStart) / timelineDuration) * 100;
                  const height = ((block.endMinutes - block.startMinutes) / timelineDuration) * 100;
                  const columnWidth = 100 / block.columns;
                  const left = columnWidth * block.column;
                  const width = block.columns === 1
                    ? "100%"
                    : `calc(${columnWidth}% - 10px)`;
                  const leftPos = block.columns === 1 ? "0%" : `calc(${left}% + 5px)`;

                  return (
                    <div
                      key={block.task.id}
                      className="absolute"
                      style={{
                        left: leftPos,
                        width,
                        top: `${top}%`,
                        height: `${Math.max(height, 6)}%`,
                      }}
                    >
                      <TaskCard
                        task={block.task}
                        timeLabel={toDisplayTime(block.task.calendarEvent?.startTime)}
                        isTimed
                        compact
                      />
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-text-tertiary">
              <span>{`${Math.floor(timelineRangeStart / 60)}:00`}</span>
              <span>{`${Math.ceil(timelineRangeEnd / 60)}:00`}</span>
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
