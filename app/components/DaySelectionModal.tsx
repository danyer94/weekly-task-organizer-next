import React, { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
} from "date-fns";
import { Day } from "@/types";
import { Calendar, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, XCircle } from "lucide-react";

export type DaySelectionResult =
  | { type: "week"; days: Day[] }
  | { type: "other"; date: Date };

interface DaySelectionModalProps {
  show: boolean;
  title: string;
  days: Day[];
  /** Base date for "other day" calendar (e.g. current week start). */
  baseDate?: Date;
  onClose: () => void;
  onConfirm: (result: DaySelectionResult) => void;
}

export const DaySelectionModal: React.FC<DaySelectionModalProps> = ({
  show,
  onClose,
  onConfirm,
  title,
  days,
  baseDate = new Date(),
}) => {
  const [selectedDays, setSelectedDays] = useState<Day[]>([]);
  const [showOtherDay, setShowOtherDay] = useState(false);
  const [otherDate, setOtherDate] = useState<Date | null>(null);
  const [viewMonth, setViewMonth] = useState<Date>(() => new Date(baseDate));

  useEffect(() => {
    if (show) {
      setSelectedDays([]);
      setShowOtherDay(false);
      setOtherDate(null);
      setViewMonth(new Date(baseDate));
    }
  }, [show, baseDate]);

  if (!show) return null;

  const hasSelection = selectedDays.length > 0 || otherDate !== null;

  const handleConfirm = () => {
    if (otherDate) {
      onConfirm({ type: "other", date: otherDate });
    } else {
      onConfirm({ type: "week", days: selectedDays });
    }
  };

  const toggleOtherDay = () => {
    const next = !showOtherDay;
    setShowOtherDay(next);
    if (next) setSelectedDays([]);
    else setOtherDate(null);
  };

  const handleDayCheck = (day: Day, checked: boolean) => {
    if (checked) {
      setOtherDate(null);
      setSelectedDays([...selectedDays, day]);
    } else {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    }
  };

  const handleOtherDateSelect = (date: Date) => {
    setOtherDate(date);
    setSelectedDays([]);
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(viewMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const rows: React.ReactNode[] = [];
    let cells: React.ReactNode[] = [];
    let day = startDate;

    rows.push(
      <div className="grid grid-cols-7 gap-1 mb-1" key="header">
        {dayNames.map((d) => (
          <div
            key={d}
            className="text-[10px] uppercase font-bold text-text-tertiary text-center"
          >
            {d}
          </div>
        ))}
      </div>
    );

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const currentDay = new Date(day);
        const isSelected = otherDate ? isSameDay(currentDay, otherDate) : false;
        const isCurrentMonth = isSameMonth(currentDay, monthStart);

        cells.push(
          <button
            key={currentDay.toISOString()}
            type="button"
            onClick={() => handleOtherDateSelect(currentDay)}
            className={`
              h-8 w-8 rounded-lg text-xs transition-colors flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40
              ${!isCurrentMonth ? "text-text-tertiary opacity-50" : "text-text-secondary"}
              ${isSelected ? "bg-border-brand text-white font-semibold" : "hover:bg-bg-main/60 hover:text-text-primary"}
            `}
          >
            {format(currentDay, "d")}
          </button>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 gap-1" key={`cal-row-${rows.length}`}>
          {cells}
        </div>
      );
      cells = [];
    }
    return rows;
  };

  return (
    <div className="fixed inset-0 bg-slate-950/50 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in motion-reduce:animate-none overscroll-contain p-4">
      <div className="glass-panel p-6 rounded-2xl shadow-2xl w-full max-w-md border border-border-subtle/70 border-l-2 border-l-border-brand max-h-[85vh] flex flex-col min-h-0">
        <div className="flex items-center gap-2 mb-4 text-text-primary shrink-0">
          <Calendar className="w-6 h-6 text-border-brand" />
          <h3 className="text-xl font-bold">{title}</h3>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto space-y-2 mb-4 pr-1">
          {days.map((day) => (
            <label
              key={day}
              className={`flex items-center p-3 rounded-xl border cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-border-brand/30 ${
                selectedDays.includes(day)
                  ? "border-border-brand bg-bg-main/60"
                  : "border-border-subtle bg-bg-surface/70 hover:border-border-hover"
              } ${showOtherDay ? "opacity-60 pointer-events-none" : ""}`}
            >
              <input
                type="checkbox"
                checked={selectedDays.includes(day)}
                onChange={(e) => handleDayCheck(day, e.target.checked)}
                className="mr-2 text-border-brand focus:ring-border-brand border-border-subtle rounded accent-sky-600"
              />
              <span className="text-text-primary font-medium">{day}</span>
            </label>
          ))}

          <div className="border border-border-subtle rounded-xl overflow-visible bg-bg-surface/70">
            <button
              type="button"
              onClick={toggleOtherDay}
              className={`w-full flex items-center justify-between p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/30 ${
                showOtherDay || otherDate
                  ? "border-border-brand bg-bg-main/60"
                  : "hover:border-border-hover"
              }`}
            >
              <span className="text-text-primary font-medium">Other Day</span>
              {showOtherDay ? (
                <ChevronUp className="w-4 h-4 text-text-secondary" />
              ) : (
                <ChevronDown className="w-4 h-4 text-text-secondary" />
              )}
            </button>
            {showOtherDay && (
              <div className="p-3 border-t border-border-subtle bg-bg-surface/70 rounded-b-xl">
                <div className="flex items-center justify-between mb-3">
                  <button
                    type="button"
                    onClick={() => setViewMonth((m) => subMonths(m, 1))}
                    className="p-1 hover:bg-bg-main/60 rounded-lg text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40"
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-semibold text-text-primary">
                    {format(viewMonth, "MMMM yyyy")}
                  </span>
                  <button
                    type="button"
                    onClick={() => setViewMonth((m) => addMonths(m, 1))}
                    className="p-1 hover:bg-bg-main/60 rounded-lg text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40"
                    aria-label="Next month"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-col gap-1">{renderCalendar()}</div>
                {otherDate && (
                  <p className="mt-2 text-xs text-text-tertiary">
                    Selected: {format(otherDate, "EEEE, MMMM d, yyyy")}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end shrink-0 pt-2">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 bg-bg-main/60 text-text-primary border border-border-subtle rounded-xl hover:bg-bg-main/80 font-medium transition-colors flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40"
          >
            <XCircle className="w-4 h-4" />
            <span>Cancel</span>
          </button>
          <button
            onClick={handleConfirm}
            disabled={!hasSelection}
            className="w-full sm:w-auto px-4 py-2 bg-sapphire-700 text-white rounded-xl hover:bg-sapphire-600 font-medium transition-colors flex items-center justify-center gap-2 transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40 disabled:opacity-50 disabled:pointer-events-none"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm</span>
          </button>
        </div>
      </div>
    </div>
  );
};
