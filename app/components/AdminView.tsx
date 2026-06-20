import React, { useEffect, useState } from "react";
import { Day, Priority, Task } from "@/types";
import { TaskList } from "./TaskList";
import { PrioritySelector } from "./PrioritySelector";
import { TaskTimeline } from "./TaskTimeline";
import { TaskViewMode } from "./TaskViewToggle";
import { DatePicker } from "./DatePicker";
import { WeekdaySelector } from "./WeekdaySelector";
import {
	Plus,
	Trash2,
	ArrowRight,
	Copy,
	SquareCheck,
	SquareX,
	Layers,
	Bell,
	FilePlus2,
	MessageCircle,
} from "lucide-react";

const readAdminViewMode = (): TaskViewMode => {
	if (typeof window === "undefined") return "timeline-list";

	const stored = window.localStorage.getItem(
		"weekly-task-organizer:view-mode-admin",
	);

	return stored === "list" ||
		stored === "timeline" ||
		stored === "timeline-list"
		? stored
		: "timeline-list";
};

const viewModeOptions: Array<{ value: TaskViewMode; label: string }> = [
	{ value: "list", label: "List" },
	{ value: "timeline", label: "Timeline" },
	{ value: "timeline-list", label: "Both" },
];
interface AdminViewProps {
	currentDay: Day;
	days: Day[];
	onDayChange: (day: Day) => void;
	selectedDate: Date;
	onDateChange: (date: Date) => void;
	newTaskText: string;
	setNewTaskText: (text: string) => void;
	priority: Priority;
	setPriority: (priority: Priority) => void;
	onAddTask: () => void;
	groupByPriority: boolean;
	setGroupByPriority: (val: boolean) => void;
	selectedTasks: Set<string>;
	tasks: any;
	stats: { total: number; completed: number };
	quickActions: {
		onClearCompleted: () => void;
		onBulkAdd: () => void;
		onExportWhatsApp: () => void;
		onSendDailySummary: () => void;
		isSendingDailySummary?: boolean;
	};
	// Handlers passed down to TaskList
	onToggleSelection: (id: string) => void;
	onToggleComplete: (day: Day, id: string) => void;
	onEdit: (day: Day, id: string, text: string, priority: Priority) => void;
	onDragStart: (task: any, index: number, day: Day) => void;
	onDrop: (targetDay: Day, targetIndex: number) => void;
	onDeleteSelected: () => void;
	onSelectAll: () => void;
	onMoveClick: () => void;
	onCopyClick: () => void;
	editingTaskId: string | null;
	setEditingTaskId: (id: string | null) => void;
	onCreateCalendarEvent?: (day: Day, task: Task) => void;
	onDeleteCalendarEvent?: (day: Day, task: Task) => void;
	onTimelineScheduleChange?: (
		day: Day,
		task: Task,
		startTime: string,
		endTime: string,
	) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
	currentDay,
	days,
	onDayChange,
	selectedDate,
	onDateChange,
	newTaskText,
	setNewTaskText,
	priority,
	setPriority,
	onAddTask,
	groupByPriority,
	setGroupByPriority,
	selectedTasks,
	tasks,
	stats,
	quickActions,
	onToggleSelection,
	onToggleComplete,
	onEdit,
	onDragStart,
	onDrop,
	onDeleteSelected,
	onSelectAll,
	onMoveClick,
	onCopyClick,
	editingTaskId,
	setEditingTaskId,
	onCreateCalendarEvent,
	onDeleteCalendarEvent,
	onTimelineScheduleChange,
}) => {
	const [viewMode, setViewMode] = useState<TaskViewMode>(readAdminViewMode);
	const dayTasks = tasks[currentDay] || [];
	const dayCompleted = dayTasks.filter((task: any) => task.completed).length;
	const dayOpen = Math.max(dayTasks.length - dayCompleted, 0);
	const weekOpen = Math.max(stats.total - stats.completed, 0);
	const dayProgress =
		dayTasks.length > 0
			? Math.round((dayCompleted / dayTasks.length) * 100)
			: 0;
	const formattedSelectedDate = selectedDate.toLocaleDateString("en-US", {
		weekday: "short",
		month: "short",
		day: "numeric",
	});
	const showList = viewMode === "list" || viewMode === "timeline-list";
	const showTimeline = viewMode === "timeline" || viewMode === "timeline-list";
	const layoutMode = viewMode === "timeline-list" ? "both" : viewMode;

	useEffect(() => {
		if (typeof window === "undefined") return;
		window.localStorage.setItem(
			"weekly-task-organizer:view-mode-admin",
			viewMode,
		);
	}, [viewMode]);

	return (
		<div
			className={`admin-dashboard-grid admin-dashboard-grid--${layoutMode} order-1 lg:col-span-12`}
			data-view-mode={viewMode}
		>
			<main className="admin-operational-stack">
				<header className="admin-command-panel rounded-xl p-4 sm:p-5">
					<div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
						<div className="max-w-2xl">
							<div className="mb-3 flex flex-wrap items-center gap-2">
								<span className="rounded-full border border-border-brand/30 bg-sapphire-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-sapphire-500 dark:bg-sapphire-500/15 dark:text-blue-200">
									Admin dashboard
								</span>
								<span className="rounded-full border border-white/60 bg-white/60 px-3 py-1 text-xs font-semibold text-text-secondary dark:border-white/10 dark:bg-white/10 dark:text-text-tertiary">
									{formattedSelectedDate}
								</span>
								{selectedTasks.size > 0 && (
									<span className="rounded-full border border-amber-300/60 bg-amber-50/80 px-3 py-1 text-xs font-semibold text-amber-700 dark:border-amber-300/30 dark:bg-amber-300/10 dark:text-amber-100">
										{selectedTasks.size} selected
									</span>
								)}
							</div>
							<h2 className="text-3xl font-medium leading-none tracking-[-0.045em] text-text-primary sm:text-4xl">
								{currentDay} command center
							</h2>
							<p className="mt-3 max-w-xl text-sm font-medium leading-6 text-text-secondary sm:text-base">
								Create, schedule, move, and broadcast the week&apos;s work from
								one focused admin surface.
							</p>
						</div>

						<div className="grid grid-cols-3 gap-2 xl:min-w-[360px]">
							<div className="admin-command-metric rounded-2xl p-3">
								<span className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-tertiary">
									Today
								</span>
								<strong className="mt-1 block text-2xl font-semibold tabular-nums text-text-primary">
									{dayTasks.length}
								</strong>
							</div>
							<div className="admin-command-metric admin-command-metric--success rounded-2xl p-3">
								<span className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-200">
									Done
								</span>
								<strong className="mt-1 block text-2xl font-semibold tabular-nums text-emerald-700 dark:text-emerald-100">
									{dayCompleted}
								</strong>
							</div>
							<div className="admin-command-metric rounded-2xl p-3">
								<span className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-tertiary">
									Open
								</span>
								<strong className="mt-1 block text-2xl font-semibold tabular-nums text-text-primary">
									{dayOpen}
								</strong>
							</div>
						</div>
					</div>

					<div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)] lg:items-center">
						<div className="admin-progress-surface rounded-2xl p-3">
							<div className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold text-text-secondary">
								<span>Day completion</span>
								<span className="tabular-nums">{dayProgress}%</span>
							</div>
							<div className="admin-progress-track h-2 overflow-hidden rounded-full">
								<div
									className="h-full rounded-full bg-sapphire-500 transition-all duration-300"
									style={{ width: `${dayProgress}%` }}
								/>
							</div>
							<p className="mt-2 text-xs text-text-tertiary">
								Week open:{" "}
								<span className="font-semibold tabular-nums text-text-secondary">
									{weekOpen}
								</span>
							</p>
						</div>

						<div
							className="admin-view-tabs rounded-2xl p-1.5"
							aria-label="Task view mode"
						>
							<div className="grid grid-cols-3 gap-1">
								{viewModeOptions.map((option) => {
									const isActive = viewMode === option.value;

									return (
										<button
											key={option.value}
											type="button"
											onClick={() => setViewMode(option.value)}
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
					</div>
				</header>

				<div className="admin-compose grid gap-3 md:grid-cols-[188px_1fr_auto]">
					<PrioritySelector
						priority={priority}
						setPriority={setPriority}
						className="w-full min-w-[180px]"
					/>
					<input
						type="text"
						value={newTaskText}
						onChange={(e) => setNewTaskText(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && onAddTask()}
						placeholder="Add new task…"
						name="newTask"
						autoComplete="off"
						aria-label="New task"
						className="admin-input w-full rounded-xl p-3 text-text-primary placeholder-text-tertiary transition-colors focus:border-border-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/30"
					/>
					<button
						onClick={onAddTask}
						className="admin-primary-action flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold text-white transition-colors transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand md:w-auto"
					>
						<Plus className="w-5 h-5" />
						<span>Add Task</span>
					</button>
				</div>

				<section className="admin-ops-strip rounded-xl p-3 sm:p-4">
					<div className="flex flex-col gap-3">
						<div className="grid gap-3 xl:grid-cols-[minmax(250px,0.74fr)_minmax(0,1.26fr)] xl:items-center">
							<div className="admin-ops-card rounded-2xl p-3">
								<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between xl:flex-col xl:items-stretch">
									<div>
										<p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-tertiary">
											Management
										</p>
										<p className="mt-1 text-sm font-semibold text-text-primary">
											{selectedDate.toLocaleDateString("en-US", {
												month: "short",
												day: "numeric",
												year: "numeric",
											})}
										</p>
									</div>
									<DatePicker
										selectedDate={selectedDate}
										onChange={onDateChange}
									/>
								</div>
							</div>

							<div className="grid grid-cols-3 gap-2">
								<div className="admin-stat-chip rounded-xl px-3 py-2.5">
									<span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-tertiary">
										Total
									</span>
									<strong className="block text-lg text-text-primary sm:text-xl">
										{stats.total}
									</strong>
								</div>
								<div className="admin-stat-chip rounded-xl px-3 py-2.5">
									<span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-tertiary">
										Done
									</span>
									<strong className="block text-lg text-emerald-500 dark:text-emerald-400 sm:text-xl">
										{stats.completed}
									</strong>
								</div>
								<div className="admin-stat-chip rounded-xl px-3 py-2.5">
									<span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-tertiary">
										Open
									</span>
									<strong className="block text-lg text-text-primary sm:text-xl">
										{Math.max(stats.total - stats.completed, 0)}
									</strong>
								</div>
							</div>
						</div>

						<WeekdaySelector
							days={days}
							selectedDay={currentDay}
							selectedDate={selectedDate}
							tasks={tasks}
							onDayChange={onDayChange}
						/>

						<div className="grid gap-2 lg:grid-cols-[minmax(220px,0.8fr)_minmax(0,1.2fr)_auto] lg:items-center">
							<button
								type="button"
								onClick={quickActions.onSendDailySummary}
								disabled={quickActions.isSendingDailySummary}
								className={`admin-action-button admin-action-button--notice ${
									quickActions.isSendingDailySummary ? "is-disabled" : ""
								}`}
							>
								<Bell className="h-4 w-4" />
								<span>
									{quickActions.isSendingDailySummary
										? "Sending..."
										: "Send Daily Summary"}
								</span>
							</button>
							<div className="grid grid-cols-2 gap-2">
								<button
									type="button"
									onClick={quickActions.onBulkAdd}
									className="admin-action-button text-[13px] sm:text-sm"
								>
									<FilePlus2 className="h-4 w-4" />
									<span>Bulk Add</span>
								</button>
								<button
									type="button"
									onClick={quickActions.onExportWhatsApp}
									className="admin-action-button admin-action-button--export"
								>
									<MessageCircle className="h-4 w-4" />
									<span>WhatsApp</span>
								</button>
							</div>
							<button
								type="button"
								onClick={quickActions.onClearCompleted}
								className="admin-action-button border-red-300/60 bg-red-50/70 text-red-700 hover:bg-red-50 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-200"
							>
								<Trash2 className="h-4 w-4" />
								<span className="whitespace-nowrap text-[12px] sm:text-sm">
									Clear Completed
								</span>
							</button>
						</div>
					</div>
				</section>

				{/* Selection Actions Toolbar */}
				{selectedTasks.size > 0 && (
					<div className="admin-toolbar flex flex-wrap gap-2 mb-4 p-2 rounded-xl animate-fade-in motion-reduce:animate-none">
						<span className="flex items-center text-sm font-semibold text-text-secondary mr-2 w-full sm:w-auto">
							{selectedTasks.size} selected
						</span>
						<button
							onClick={onDeleteSelected}
							className="w-full sm:w-auto justify-center px-3 py-2 rounded-lg text-sm flex items-center gap-1.5 border border-red-300/60 bg-white/45 text-red-700 hover:bg-red-50/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
						>
							<Trash2 className="w-4 h-4" />
							<span>Delete</span>
						</button>
						<button
							onClick={onMoveClick}
							className="glass-control w-full sm:w-auto justify-center px-3 py-2 rounded-lg text-sm flex items-center gap-1.5 text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40"
						>
							<ArrowRight className="w-4 h-4" />
							<span>Move</span>
						</button>
						<button
							onClick={onCopyClick}
							className="glass-control w-full sm:w-auto justify-center px-3 py-2 rounded-lg text-sm flex items-center gap-1.5 text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40"
						>
							<Copy className="w-4 h-4" />
							<span>Copy</span>
						</button>
					</div>
				)}

				<div className={`admin-content-grid admin-content-grid--${layoutMode}`}>
					{showList && (
						<section className="admin-work-pane min-h-[260px] rounded-xl p-3 sm:p-4">
							<div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
								<button
									onClick={onSelectAll}
									className="glass-pill text-xs font-semibold text-text-secondary hover:text-text-primary px-3 py-2 sm:py-1 rounded-full transition-colors flex items-center gap-1.5 justify-center w-full sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40"
								>
									{dayTasks.length > 0 &&
									dayTasks.every((t: any) => selectedTasks.has(t.id)) ? (
										<>
											<SquareX className="w-3.5 h-3.5" /> Unselect All
										</>
									) : (
										<>
											<SquareCheck className="w-3.5 h-3.5" /> Select All
										</>
									)}
								</button>

								<button
									onClick={() => setGroupByPriority(!groupByPriority)}
									className="glass-pill text-xs font-semibold text-text-primary px-3 py-2 sm:py-1 rounded-full transition-colors flex items-center gap-1.5 justify-center w-full sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40"
								>
									<Layers className="w-3.5 h-3.5" />
									<span>
										{groupByPriority ? "Grouped by Priority" : "Custom Order"}
									</span>
								</button>
							</div>

							<TaskList
								day={currentDay}
								tasks={dayTasks}
								groupByPriority={groupByPriority}
								isAdmin={true}
								selectedTasks={selectedTasks}
								onToggleSelection={onToggleSelection}
								onToggleComplete={onToggleComplete}
								onEdit={onEdit}
								onDragStart={onDragStart}
								onDrop={onDrop}
								editingTaskId={editingTaskId}
								setEditingTaskId={setEditingTaskId}
								onCreateCalendarEvent={onCreateCalendarEvent}
								onDeleteCalendarEvent={onDeleteCalendarEvent}
							/>
						</section>
					)}

					{showTimeline && (
						<aside
							className="admin-agenda-pane rounded-xl p-4 sm:p-5"
							aria-label="Schedule context"
						>
							<div className="mb-7">
								<p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-tertiary">
									Time plan
								</p>
								<h3 className="mt-2 text-xl font-semibold text-text-primary">
									Schedule context
								</h3>
							</div>
							<TaskTimeline
								tasks={dayTasks}
								onScheduleChange={
									onTimelineScheduleChange
										? (task, startTime, endTime) =>
												onTimelineScheduleChange(
													currentDay,
													task,
													startTime,
													endTime,
												)
										: undefined
								}
							/>
						</aside>
					)}
				</div>
			</main>
		</div>
	);
};
