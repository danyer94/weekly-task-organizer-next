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
    <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel p-6 rounded-2xl shadow-2xl w-96 transform transition-all scale-100 border border-border-subtle/60 border-l-4 border-l-sapphire-500">
        <div className="flex items-center gap-2 mb-4 text-text-primary">
          <Calendar className="w-6 h-6 text-sapphire-500" />
          <h3 className="text-xl font-bold">{title}</h3>
        </div>
        <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
          {days.map((day) => (
            <label
              key={day}
              className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${
                selectedDays.includes(day)
                  ? "border-sapphire-500 bg-sapphire-50/80 dark:bg-sapphire-900/30"
                  : "border-border-subtle bg-bg-surface/70 hover:border-sapphire-400 dark:hover:border-sapphire-500"
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
                className="mr-2 text-sapphire-600 focus:ring-sapphire-600 border-border-subtle rounded accent-sky-500"
              />
              <span className="text-text-primary font-medium">{day}</span>
            </label>
          ))}
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-400/20 text-text-primary border border-border-subtle rounded-xl hover:bg-gray-400/30 font-medium transition-colors flex items-center gap-2"
          >
            <XCircle className="w-4 h-4" />
            <span>Cancel</span>
          </button>
          <button
            onClick={() => {
              onConfirm(selectedDays);
              setSelectedDays([]);
            }}
            className="px-4 py-2 bg-gradient-to-r from-sapphire-500 to-cyan-500 text-white rounded-xl hover:shadow-lg font-medium transition-colors flex items-center gap-2 transform active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm</span>
          </button>
        </div>
      </div>
    </div>
  );
};
