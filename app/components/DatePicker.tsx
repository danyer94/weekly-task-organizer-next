"use client";
import React, { useState, useRef, useEffect } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameDay, isSameMonth, addMonths, subMonths, getISOWeek, getISOWeekYear, addWeeks } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

interface DatePickerProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
  className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({ selectedDate, onChange, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date(selectedDate));
  const containerRef = useRef<HTMLDivElement>(null);
  const isoWeek = getISOWeek(selectedDate);
  const isoWeekYear = getISOWeekYear(selectedDate);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update viewDate when selectedDate changes from outside (and picker is closed)
  useEffect(() => {
    if (!isOpen) {
      setViewDate(new Date(selectedDate));
    }
  }, [selectedDate, isOpen]);

  const togglePicker = () => setIsOpen(!isOpen);

  const handleDateSelect = (date: Date) => {
    onChange(date);
    setIsOpen(false);
  };

  const shiftWeek = (direction: number) => {
    const nextDate = addWeeks(selectedDate, direction);
    onChange(nextDate);
    setViewDate(nextDate);
  };

  const nextMonth = () => setViewDate(addMonths(viewDate, 1));
  const prevMonth = () => setViewDate(subMonths(viewDate, 1));

  const renderDays = () => {
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows = [];
    let days = [];
    let day = startDate;

    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const header = (
      <div className="grid grid-cols-7 mb-2" key="header">
        {dayNames.map((d) => (
          <div key={d} className="text-[10px] uppercase font-bold text-text-tertiary text-center">
            {d}
          </div>
        ))}
      </div>
    );
    rows.push(header);

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const currentDay = day;
        const isSelected = isSameDay(currentDay, selectedDate);
        const isCurrentMonth = isSameMonth(currentDay, monthStart);
        const isToday = isSameDay(currentDay, new Date());

        days.push(
          <button
            key={currentDay.toString()}
            onClick={() => handleDateSelect(currentDay)}
            className={`
              h-9 w-9 rounded-lg text-xs transition-colors flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40
              ${!isCurrentMonth ? "text-text-tertiary opacity-30" : "text-text-secondary"}
              ${isSelected ? "bg-border-brand text-white font-semibold shadow-sm" : "hover:bg-bg-main/60 hover:text-text-primary"}
              ${isToday && !isSelected ? "border border-border-brand/60 text-border-brand" : ""}
            `}
          >
            {format(currentDay, "d")}
          </button>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 gap-1" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return rows;
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div className="flex items-center gap-2 w-full">
        <button
          onClick={() => shiftWeek(-1)}
          className="h-11 w-11 rounded-xl bg-bg-surface/80 border border-border-subtle hover:border-border-hover text-text-secondary hover:text-text-primary transition-colors flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40"
          aria-label="Previous week"
          type="button"
        >
          <ChevronLeft className="w-4 h-4 sm:w-4 sm:h-4" />
        </button>

        <button
          onClick={togglePicker}
          className="flex-1 flex items-center justify-between gap-3 px-3 sm:px-4 py-3 bg-bg-surface/80 rounded-xl border border-border-subtle hover:border-border-hover transition-colors group shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40"
          type="button"
        >

          <div className="flex items-center gap-2 overflow-hidden">
            <CalendarIcon className="w-4 h-4 text-text-tertiary group-hover:text-text-primary shrink-0" />
            <div className="flex flex-col items-start truncate">
              <span className="text-xs font-semibold text-text-primary whitespace-nowrap truncate max-w-[140px] sm:max-w-none">
                {format(selectedDate, "EEEE, MMMM d")}
              </span>
              <span className="text-[10px] text-text-tertiary uppercase tracking-wider font-bold">
                Week {isoWeek}, {isoWeekYear}
              </span>
            </div>

          </div>
          <ChevronRight className={`w-4 h-4 text-text-tertiary transition-transform ${isOpen ? "rotate-90" : ""}`} />
        </button>
        <button
          onClick={() => shiftWeek(1)}
          className="h-11 w-11 rounded-xl bg-bg-surface/80 border border-border-subtle hover:border-border-hover text-text-secondary hover:text-text-primary transition-colors flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40"
          aria-label="Next week"
          type="button"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-bg-surface/90 rounded-2xl border border-border-subtle shadow-xl z-[100] animate-in fade-in zoom-in duration-200 motion-reduce:animate-none motion-reduce:transition-none backdrop-blur-md max-w-[calc(100vw-2rem)]">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonth}
              className="p-1 hover:bg-bg-main/60 rounded-lg text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40"
              aria-label="Previous month"
              type="button"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-sm font-semibold text-text-primary">
              {format(viewDate, "MMMM yyyy")}
            </div>
            <button
              onClick={nextMonth}
              className="p-1 hover:bg-bg-main/60 rounded-lg text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40"
              aria-label="Next month"
              type="button"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex flex-col gap-1">
            {renderDays()}
          </div>

          <button 
            onClick={() => handleDateSelect(new Date())}
            className="w-full mt-4 py-2 bg-border-brand/10 text-border-brand text-xs font-semibold rounded-lg hover:bg-border-brand/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40"
          >
            Today
          </button>
        </div>
      )}
    </div>
  );
};
