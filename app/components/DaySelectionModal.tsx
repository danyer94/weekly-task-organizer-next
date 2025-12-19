import React, { useState } from "react";
import { Day } from "@/types";

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-96 transform transition-all scale-100">
        <h3 className="text-xl font-bold text-sapphire-700 mb-4">{title}</h3>
        <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
          {days.map((day) => (
            <label
              key={day}
              className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                selectedDays.includes(day)
                  ? "border-sapphire-600 bg-sapphire-50"
                  : "border-gray-200 hover:border-sapphire-300"
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
                className="mr-2 text-sapphire-600 focus:ring-sapphire-600 border-gray-300 rounded"
              />
              <span className="text-gray-700">{day}</span>
            </label>
          ))}
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm(selectedDays);
              setSelectedDays([]);
            }}
            className="px-4 py-2 bg-sapphire-600 text-white rounded-lg hover:bg-sapphire-700 font-medium transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
