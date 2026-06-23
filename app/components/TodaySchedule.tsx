import React from "react";
import { Task } from "@/types";
import { Calendar } from "lucide-react";

interface TodayScheduleProps {
  tasks: Task[];
  className?: string;
}

interface ScheduledTask {
  task: Task;
  startTime: string;
  endTime?: string | null;
  durationMinutes: number;
}

const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = ((hours + 11) % 12) + 1;
  return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
};

const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

const toMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const DOT_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-orange-400",
  "bg-sapphire-500",
  "bg-gray-400",
];

export const TodaySchedule: React.FC<TodayScheduleProps> = ({
  tasks,
  className = "",
}) => {
  const scheduledTasks: ScheduledTask[] = tasks
    .filter((task) => task.calendarEvent?.startTime)
    .map((task) => {
      const startTime = task.calendarEvent!.startTime!;
      const endTime = task.calendarEvent?.endTime;
      const startMinutes = toMinutes(startTime);
      const endMinutes = endTime ? toMinutes(endTime) : startMinutes + 60;
      const durationMinutes = Math.max(endMinutes - startMinutes, 15);

      return {
        task,
        startTime,
        endTime,
        durationMinutes,
      };
    })
    .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));

  return (
    <div className={`admin-schedule-card relative overflow-hidden rounded-[7px] p-5 ${className}`}>
      <div className="mb-5 flex items-center gap-2">
        <Calendar className="h-5 w-5 text-sapphire-500" />
        <h3 className="text-lg font-semibold text-text-primary">
          Today&apos;s Schedule
        </h3>
      </div>

      {scheduledTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Calendar className="mb-3 h-10 w-10 text-text-tertiary" />
          <p className="text-sm font-medium text-text-secondary">
            No scheduled tasks
          </p>
          <p className="mt-1 text-xs text-text-tertiary">
            Add start times to see your schedule here
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {scheduledTasks.map(({ task, startTime, durationMinutes }, index) => {
            const isLastScheduledTask = index === scheduledTasks.length - 1;

            return (
              <div
                key={task.id}
                className="group flex items-center gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <span className="w-20 shrink-0 text-sm font-medium text-text-secondary">
                  {formatTime(startTime)}
                </span>

                <div className="relative flex items-center">
                  <div
                    className={`h-3 w-3 rounded-full ${DOT_COLORS[index % DOT_COLORS.length]} ring-2 ring-white dark:ring-gray-900`}
                  />
                  {!isLastScheduledTask && (
                    <div className="absolute left-1/2 top-full h-4 w-px -translate-x-1/2 bg-gray-200 dark:bg-gray-700" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate text-sm font-semibold ${
                      task.completed
                        ? "text-text-tertiary line-through"
                        : "text-text-primary"
                    }`}
                  >
                    {task.text}
                  </p>
                </div>

                <span className="shrink-0 text-xs font-medium text-text-tertiary">
                  {formatDuration(durationMinutes)}
                </span>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
