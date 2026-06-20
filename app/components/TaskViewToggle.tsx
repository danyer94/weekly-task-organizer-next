import React from "react";

export type TaskViewMode = "list" | "timeline" | "timeline-list";

interface TaskViewToggleProps {
	value: TaskViewMode;
	onChange: (value: TaskViewMode) => void;
	className?: string;
}

const OPTIONS: Array<{ value: TaskViewMode; label: string }> = [
	{ value: "list", label: "List" },
	{ value: "timeline", label: "Timeline" },
	{ value: "timeline-list", label: "Both" },
];

export const TaskViewToggle: React.FC<TaskViewToggleProps> = ({
	value,
	onChange,
	className = "",
}) => {
	return (
		<div
			className={`admin-view-tabs rounded-2xl p-1.5 ${className}`}
			aria-label="Task view mode"
		>
			<div className="grid grid-cols-3 gap-1">
				{OPTIONS.map((option) => {
					const isActive = value === option.value;
					return (
						<button
							key={option.value}
							type="button"
							onClick={() => onChange(option.value)}
							aria-pressed={isActive}
							className={`admin-view-tab rounded-xl px-2 py-2 text-xs font-semibold text-text-secondary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40 sm:px-3 sm:text-sm ${
								isActive
									? "is-active text-text-primary"
									: "hover:text-text-primary"
							}`}
						>
							{option.label}
						</button>
					);
				})}
			</div>
		</div>
	);
};
