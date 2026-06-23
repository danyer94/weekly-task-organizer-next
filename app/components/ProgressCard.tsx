import React from "react";

interface ProgressCardProps {
  completed: number;
  total: number;
  label?: string;
  className?: string;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({
  completed,
  total,
  label = "This Week",
  className = "",
}) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className={`admin-progress-card relative w-fit overflow-hidden rounded-2xl p-5 ${className}`}
    >
      <div className="flex items-start">
        <div className="flex flex-col items-start gap-1">
          <span className="text-sm font-semibold text-text-secondary">
            Progress
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-tertiary">
            {label}
          </span>
          <div className="relative mt-2 flex h-20 w-20 items-center justify-center">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-gray-200 dark:text-gray-700"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="text-sapphire-500 transition-[stroke-dashoffset] duration-500 ease-out"
              />
            </svg>
            <strong className="absolute inset-0 flex items-center justify-center text-xl font-bold tabular-nums text-text-primary">
              {percentage}%
            </strong>
          </div>
          <span className="text-sm text-text-secondary">
            {completed} of {total} tasks completed
          </span>
        </div>
      </div>
    </div>
  );
};
