import React from "react";

interface TaskStatsProps {
  total: number;
  completed: number;
}

export const TaskStats: React.FC<TaskStatsProps> = ({ total, completed }) => {
  return (
    <div className="mt-6 bg-white rounded-lg p-4 hidden lg:block">
      <h4 className="font-bold text-purple-600 mb-3">Week Stats</h4>
      <div className="grid grid-cols-2 gap-2">
        <div className="text-center p-2 bg-purple-50 rounded">
          <div className="text-xl font-bold text-purple-600">{total}</div>
          <div className="text-xs text-gray-600">Total</div>
        </div>
        <div className="text-center p-2 bg-green-50 rounded">
          <div className="text-xl font-bold text-green-600">{completed}</div>
          <div className="text-xs text-gray-600">Done</div>
        </div>
      </div>
    </div>
  );
};
