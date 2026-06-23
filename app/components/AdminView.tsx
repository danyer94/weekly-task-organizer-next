import React, { useState, useRef, useEffect } from "react";
import { Day, Priority, Task, TasksByDay } from "@/types";
import { TaskList } from "./TaskList";
import { TaskTimeline } from "./TaskTimeline";
import { TodaySchedule } from "./TodaySchedule";
import { PriorityBreakdown } from "./PriorityBreakdown";
import { QuickActionsCard } from "./QuickActionsCard";
import { DatePicker } from "./DatePicker";
import { WeekdaySelector } from "./WeekdaySelector";
import { AddTaskComposer } from "./AddTaskComposer";
import { ProgressCard } from "./ProgressCard";
import {
	Trash2,
	ArrowRight,
	Copy,
	SquareCheck,
	SquareX,
	Layers,
	Bell,
	FilePlus2,
	Eye,
	EyeOff,
	ArrowUpDown,
} from "lucide-react";

interface AdminViewProps {
	currentDay: Day;
	days: Day[];
	onDayChange: (day: Day) => void;
	selectedDate: Date;
	onDateChange: (date: Date) => void;
	newTaskText: string;
	setNewTaskText: (text: string) => void;
	taskStartTime: string;
	setTaskStartTime: (time: string) => void;
	taskEndTime: string;
	setTaskEndTime: (time: string) => void;
	priority: Priority;
	setPriority: (priority: Priority) => void;
	onAddTask: () => void;
	isAddingTask?: boolean;
	groupByPriority: boolean;
	setGroupByPriority: (val: boolean) => void;
	selectedTasks: Set<string>;
	tasks: TasksByDay;
	weeklyStats: { total: number; completed: number };
	dailyStats: { total: number; completed: number };
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
	onDragStart: (task: Task, index: number, day: Day) => void;
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
	taskStartTime,
	setTaskStartTime,
	taskEndTime,
	setTaskEndTime,
	priority,
	setPriority,
	onAddTask,
	isAddingTask = false,
	groupByPriority,
	setGroupByPriority,
	selectedTasks,
	tasks,
	weeklyStats,
	dailyStats,
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
	const [hideCompletedTasks, setHideCompletedTasks] = useState(false);
	const [sortMode, setSortMode] = useState<"priority" | "alphabetical" | "date">("priority");
	const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
	const sortDropdownRef = useRef<HTMLDivElement>(null);
	const dayTasks = tasks[currentDay] || [];
	const visibleDayTasks = hideCompletedTasks
		? dayTasks.filter((task) => !task.completed)
		: dayTasks;
	const formattedSelectedDate = selectedDate.toLocaleDateString("en-US", {
		weekday: "short",
		month: "short",
		day: "numeric",
	});
	const showList = true;
	const showTimeline = true;
	const layoutMode = "both";

	useEffect(() => {
		if (!sortDropdownOpen) return;
		const handleClickOutside = (e: MouseEvent) => {
			if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target as Node)) {
				setSortDropdownOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [sortDropdownOpen]);

	return (
		<div
			className={`admin-dashboard-grid admin-dashboard-grid--${layoutMode} order-1 lg:col-span-12`}
			data-view-mode="timeline-list"
		>
			<main className="admin-operational-stack">
				<div className="admin-command-grid">
					<header className="admin-command-panel mr-auto w-full p-4 sm:p-5">
						<div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-start xl:gap-8">
							<div className="max-w-2xl">
							<div className="mb-3 flex flex-wrap items-center gap-2">
								<span className="text-[11px] font-bold uppercase tracking-[0.22em] text-sapphire-500 dark:text-blue-200">
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
						</div>
						{/* Progress Cards */}
						<div className="mt-5 flex flex-wrap items-start gap-4">
							<ProgressCard
								completed={weeklyStats.completed}
								total={weeklyStats.total}
								label="This Week"
							/>
							<ProgressCard
								completed={dailyStats.completed}
								total={dailyStats.total}
								label="Today"
							/>
						</div>
					</header>

				<div className="flex flex-col gap-[14px]">
					<TodaySchedule
						tasks={visibleDayTasks}
						className="admin-command-schedule"
					/>

					<PriorityBreakdown tasks={visibleDayTasks} />

					<QuickActionsCard />
				</div>
				</div>

				<section className="admin-ops-strip mr-auto w-full rounded-[5px] p-3 sm:p-4">
					<div className="flex flex-col gap-3">
						<div className="flex flex-wrap items-stretch gap-3">
							<div className="admin-management-card admin-ops-card w-full max-w-[300px] rounded-[5px] p-3">
								<div className="flex flex-col gap-3">
									<DatePicker
										selectedDate={selectedDate}
										onChange={onDateChange}
									/>
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
							<button
								type="button"
								onClick={quickActions.onExportWhatsApp}
								className="admin-action-button text-[13px] sm:text-sm"
							>
								<Copy className="h-4 w-4" />
								<span>Copy Tasks</span>
							</button>
							<button
								type="button"
								onClick={() => setHideCompletedTasks((isHidden) => !isHidden)}
								aria-pressed={hideCompletedTasks}
								className="admin-action-button border-amber-300/60 bg-amber-50/70 text-amber-800 hover:bg-amber-50 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-100"
							>
								{hideCompletedTasks ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
								<span className="whitespace-nowrap text-[12px] sm:text-sm">
									{hideCompletedTasks ? "Show Completed" : "Hide Completed"}
								</span>
							</button>
						</div>
					</div>
				</section>

				<AddTaskComposer
					taskText={newTaskText}
					onTaskTextChange={setNewTaskText}
					selectedDate={selectedDate}
					onDateChange={onDateChange}
					startTime={taskStartTime}
					onStartTimeChange={setTaskStartTime}
					endTime={taskEndTime}
					onEndTimeChange={setTaskEndTime}
					priority={priority}
					onPriorityChange={setPriority}
					onSubmit={onAddTask}
					isSubmitting={isAddingTask}
				/>

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
						<div className="min-w-0">
							<div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
								<div className="flex flex-wrap items-center gap-2">
									<button
										onClick={onSelectAll}
										className="glass-pill text-xs font-semibold text-text-secondary hover:text-text-primary px-3 py-2 sm:py-1 rounded-[7px] transition-colors flex items-center gap-1.5 justify-center w-full sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40"
									>
										{visibleDayTasks.length > 0 &&
										visibleDayTasks.every((t) => selectedTasks.has(t.id)) ? (
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
										className="glass-pill text-xs font-semibold text-text-primary px-3 py-2 sm:py-1 rounded-[7px] transition-colors flex items-center gap-1.5 justify-center w-full sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40"
									>
										<Layers className="w-3.5 h-3.5" />
										<span>
											{groupByPriority ? "Grouped by Priority" : "Custom Order"}
										</span>
									</button>
								</div>

								<div className="flex flex-wrap items-center gap-2" ref={sortDropdownRef}>
									<div className="relative">
										<button
											type="button"
											onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
											className="glass-pill text-xs font-semibold text-text-secondary hover:text-text-primary px-3 py-2 sm:py-1 rounded-[7px] transition-colors flex items-center gap-1.5 justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40"
											aria-haspopup="menu"
											aria-expanded={sortDropdownOpen}
										>
											<ArrowUpDown className="w-3.5 h-3.5" />
											<span>Sort: {sortMode.charAt(0).toUpperCase() + sortMode.slice(1)}</span>
											<span className="text-[10px]">˅</span>
										</button>

									{sortDropdownOpen && (
										<div role="menu" className="glass-dropdown absolute right-0 top-full z-dropdown mt-1 min-w-[150px] rounded-[7px] p-1">
											{(["priority", "alphabetical", "date"] as const).map((mode) => (
												<button
													key={mode}
													type="button"
													role="menuitem"
													onClick={() => {
														setSortMode(mode);
														setSortDropdownOpen(false);
													}}
													className={`w-full rounded-[5px] px-3 py-1.5 text-left text-xs font-semibold transition-colors ${
														sortMode === mode
															? "bg-border-brand/10 text-sapphire-500"
															: "text-text-primary hover:bg-gray-50 dark:hover:bg-gray-800/50"
													}`}
												>
													{mode === "priority" && "Priority"}
													{mode === "alphabetical" && "Alphabetical"}
													{mode === "date" && "Date Added"}
												</button>
											))}
										</div>
									)}
									</div>

									<button
										type="button"
										onClick={quickActions.onBulkAdd}
										className="glass-pill text-xs font-semibold text-text-primary px-3 py-2 sm:py-1 rounded-[7px] transition-colors flex items-center gap-1.5 justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40"
									>
										<FilePlus2 className="w-3.5 h-3.5" />
										<span>Bulk Add</span>
									</button>
								</div>
							</div>

							<section className="admin-work-pane min-h-[260px] rounded-[7px] p-3 sm:p-4">
							<div className="admin-work-pane__scroll">
							<TaskList
								day={currentDay}
								tasks={visibleDayTasks}
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
							</div>
							</section>
						</div>
					)}

					{showTimeline && (
						<aside
							className="admin-agenda-pane rounded-[7px] p-4 sm:p-5"
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
								tasks={visibleDayTasks}
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
