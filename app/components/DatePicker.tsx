"use client";
import React, { useState, useRef, useEffect } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameDay, isSameMonth, addMonths, subMonths, getYear, setYear, setMonth } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from "lucide-react";

interface DatePickerProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
  className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({ selectedDate, onChange, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date(selectedDate));
  const containerRef = useRef<HTMLDivElement>(null);

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
              h-8 w-8 rounded-lg text-xs transition-all flex items-center justify-center
              ${!isCurrentMonth ? "text-text-tertiary opacity-30" : "text-text-secondary"}
              ${isSelected ? "bg-sapphire-500 text-white font-bold shadow-sm" : "hover:bg-bg-main hover:text-text-brand"}
              ${isToday && !isSelected ? "border border-sapphire-500/50 text-sapphire-500" : ""}
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
      <button
        onClick={togglePicker}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-bg-surface/80 rounded-xl border border-border-subtle hover:border-border-hover transition-all group shadow-sm hover:-translate-y-0.5"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <CalendarIcon className="w-4 h-4 text-text-tertiary group-hover:text-text-brand shrink-0" />
          <div className="flex flex-col items-start truncate">
            <span className="text-xs font-semibold text-text-brand whitespace-nowrap">
              {format(selectedDate, "EEEE, MMMM d")}
            </span>
            <span className="text-[10px] text-text-tertiary uppercase tracking-wider font-bold">
              Week {format(selectedDate, "w")}, {getYear(selectedDate)}
            </span>
          </div>
        </div>
        <ChevronRight className={`w-4 h-4 text-text-tertiary transition-transform ${isOpen ? "rotate-90" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-bg-surface/90 rounded-2xl border border-border-subtle shadow-xl z-[100] animate-in fade-in zoom-in duration-200 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-1 hover:bg-bg-main rounded-lg text-text-secondary">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-sm font-bold text-text-brand">
              {format(viewDate, "MMMM yyyy")}
            </div>
            <button onClick={nextMonth} className="p-1 hover:bg-bg-main rounded-lg text-text-secondary">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex flex-col gap-1">
            {renderDays()}
          </div>

          <button 
            onClick={() => handleDateSelect(new Date())}
            className="w-full mt-4 py-2 bg-sapphire-500/10 text-sapphire-500 text-xs font-bold rounded-lg hover:bg-sapphire-500/20 transition-colors"
          >
            Today
          </button>
        </div>
      )}
    </div>
  );
};
