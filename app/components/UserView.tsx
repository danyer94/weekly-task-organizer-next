import React from "react";
import { Day } from "@/types";
import { TaskList } from "./TaskList";

interface UserViewProps {
  currentDay: Day;
  days: Day[];
  onDayChange: (day: Day) => void;
  tasks: any;
  onToggleComplete: (day: Day, id: number) => void;
  groupByPriority: boolean;
  setGroupByPriority: (val: boolean) => void;
}

export const UserView: React.FC<UserViewProps> = ({
  currentDay,
  days,
  onDayChange,
  tasks,
  onToggleComplete,
  groupByPriority,
  setGroupByPriority,
}) => {
  return (
    <div className="lg:col-span-9 space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple-600">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-purple-800 mb-2">
            Hey Ramon! 👋
          </h2>
          <p className="text-gray-600">Here are your tasks for today.</p>
        </div>

        <div className="flex overflow-x-auto pb-4 gap-3 mb-6">
          {days.map((day) => {
             const dayTasks = tasks[day] || [];
             const completed = dayTasks.filter((t: any) => t.completed).length;
             
             return (
              <button
                key={day}
                onClick={() => onDayChange(day)}
                className={`flex-shrink-0 w-32 p-3 rounded-xl border-2 transition-all ${
                  currentDay === day
                    ? "border-purple-600 bg-purple-50 shadow-md"
                    : "border-gray-100 bg-white text-gray-400 hover:border-purple-200"
                }`}
              >
                <div className="font-bold mb-1">{day}</div>
                <div className="text-xs">
                  {completed}/{dayTasks.length} tasks
                </div>
              </button>
             );
          })}
        </div>

        <div className="bg-purple-50 rounded-xl p-6 min-h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800">{currentDay}</h3>
            
            {/* View Toggle */}
            <button
              onClick={() => setGroupByPriority(!groupByPriority)}
              className="text-xs font-bold text-purple-600 bg-purple-100 px-3 py-1 rounded-full hover:bg-purple-200 transition-colors"
            >
              {groupByPriority ? "🗂️ Grouped by Priority" : "🔢 Custom Order"}
            </button>
          </div>

          <TaskList
            day={currentDay}
            tasks={tasks[currentDay] || []}
            groupByPriority={groupByPriority}
            isAdmin={false}
            onToggleComplete={onToggleComplete}
            editingTaskId={null}
          />
        </div>
      </div>
    </div>
  );
};
