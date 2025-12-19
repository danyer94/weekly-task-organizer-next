import React from "react";

interface TaskStatsProps {
  total: number;
  completed: number;
}

export const TaskStats: React.FC<TaskStatsProps> = ({ total, completed }) => {
  return (
    <div className="mt-6 bg-bg-surface rounded-lg p-4 hidden lg:block border border-border-subtle">
      <h4 className="font-bold text-text-brand mb-3">Week Stats</h4>
      <div className="grid grid-cols-2 gap-2">
        <div className="text-center p-2 bg-bg-main rounded border border-border-subtle">
          <div className="text-xl font-bold text-text-brand">{total}</div>
          <div className="text-xs text-text-secondary">Total</div>
        </div>
        <div className="text-center p-2 bg-bg-main rounded border border-green-200 dark:border-green-900/50">
          <div className="text-xl font-bold text-green-600 dark:text-green-400">{completed}</div>
          <div className="text-xs text-text-secondary">Done</div>
        </div>
      </div>
    </div>
  );
};
