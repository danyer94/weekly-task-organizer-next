import React, { useState } from "react";
import { Day } from "@/types";
import { Calendar, CheckCircle2, XCircle } from "lucide-react";

interface DaySelectionModalProps {
  show: boolean;
  title: string;
  days: Day[];
  onClose: () => void;
  onConfirm: (selectedDays: Day[]) => void;
}

export const DaySelectionModal: React.FC<DaySelectionModalProps> = ({
  show,
  onClose,
  onConfirm,
  title,
  days,
}) => {
  const [selectedDays, setSelectedDays] = useState<Day[]>([]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/50 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in motion-reduce:animate-none overscroll-contain">
      <div className="glass-panel p-6 rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-border-subtle/70 border-l-2 border-l-border-brand">
        <div className="flex items-center gap-2 mb-4 text-text-primary">
          <Calendar className="w-6 h-6 text-border-brand" />
          <h3 className="text-xl font-bold">{title}</h3>
        </div>
        <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
          {days.map((day) => (
            <label
              key={day}
              className={`flex items-center p-3 rounded-xl border cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-border-brand/30 ${
                selectedDays.includes(day)
                  ? "border-border-brand bg-bg-main/60"
                  : "border-border-subtle bg-bg-surface/70 hover:border-border-hover"
              }`}
            >
              <input
                type="checkbox"
                checked={selectedDays.includes(day)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedDays([...selectedDays, day]);
                  } else {
                    setSelectedDays(selectedDays.filter((d) => d !== day));
                  }
                }}
                className="mr-2 text-border-brand focus:ring-border-brand border-border-subtle rounded accent-sky-600"
              />
              <span className="text-text-primary font-medium">{day}</span>
            </label>
          ))}
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 bg-bg-main/60 text-text-primary border border-border-subtle rounded-xl hover:bg-bg-main/80 font-medium transition-colors flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40"
          >
            <XCircle className="w-4 h-4" />
            <span>Cancel</span>
          </button>
          <button
            onClick={() => {
              onConfirm(selectedDays);
              setSelectedDays([]);
            }}
            className="w-full sm:w-auto px-4 py-2 bg-sapphire-700 text-white rounded-xl hover:bg-sapphire-600 font-medium transition-colors flex items-center justify-center gap-2 transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm</span>
          </button>
        </div>

      </div>
    </div>
  );
};
