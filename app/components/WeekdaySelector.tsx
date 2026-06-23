import type { Day, TasksByDay } from "@/types";
import { getDateForDayInWeek } from "@/lib/calendarMapper";

interface WeekdaySelectorProps {
  days: Day[];
  selectedDay: Day;
  selectedDate: Date;
  tasks: TasksByDay;
  onDayChange: (day: Day) => void;
}

export const WeekdaySelector: React.FC<WeekdaySelectorProps> = ({
  days,
  selectedDay,
  selectedDate,
  tasks,
  onDayChange,
}) => (
  <div className="admin-week-strip-wrap">
    <div
      className="admin-week-strip"
      role="group"
      aria-label="Week days"
      data-slot="week-day-strip"
    >
      {days.map((day) => {
        const tasksForDay = tasks[day] || [];
        const completedCount = tasksForDay.filter((task) => task.completed).length;
        const isActive = selectedDay === day;
        const dateForDay = getDateForDayInWeek(selectedDate, day);

        return (
          <button
            key={day}
            type="button"
            aria-label={`Show ${day} tasks`}
            aria-pressed={isActive}
            title={day}
            onClick={() => onDayChange(day)}
            data-slot="week-day-cell"
            className={`admin-week-day ${isActive ? "is-active" : ""}`}
          >
            <span className="admin-week-day__label">{day.slice(0, 3)}</span>
            <span className="admin-week-day__date" data-slot="week-day-date">
              {dateForDay.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
            <span className="admin-week-day__count" data-slot="week-day-count">
              {completedCount}/{tasksForDay.length}
            </span>
          </button>
        );
      })}
    </div>
  </div>
);
