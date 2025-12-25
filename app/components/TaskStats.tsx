import React from "react";

interface TaskStatsProps {
  total: number;
  completed: number;
}

export const TaskStats: React.FC<TaskStatsProps> = ({ total, completed }) => {
  return (
    <div className="mt-6 glass-panel rounded-2xl p-4 hidden lg:block border border-border-subtle/60">
      <h4 className="font-bold text-text-brand mb-3 uppercase tracking-[0.3em] text-xs">
        Week Stats
      </h4>
      <div className="grid grid-cols-2 gap-2">
        <div className="text-center p-3 bg-bg-main/70 rounded-xl border border-border-subtle/60">
          <div className="text-2xl font-bold text-text-brand">{total}</div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-text-secondary">Total</div>
        </div>
        <div className="text-center p-3 bg-bg-main/70 rounded-xl border border-emerald-300/40 dark:border-emerald-900/60">
          <div className="text-2xl font-bold text-emerald-500 dark:text-emerald-400">{completed}</div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-text-secondary">Done</div>
        </div>
      </div>
    </div>
  );
};
