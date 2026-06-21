"use client";

import React from "react";
import { createPortal } from "react-dom";
import { Calendar, ChevronDown, Clock, Flag, Plus } from "lucide-react";
import type { Priority } from "@/types";

interface AddTaskComposerProps {
	taskText: string;
	onTaskTextChange: (text: string) => void;
	selectedDate: Date;
	onDateChange: (date: Date) => void;
	startTime: string;
	onStartTimeChange: (time: string) => void;
	endTime: string;
	onEndTimeChange: (time: string) => void;
	priority: Priority;
	onPriorityChange: (priority: Priority) => void;
	onSubmit: () => void;
	isSubmitting?: boolean;
}

const priorityOptions: Array<{ value: Priority; label: string; colorClass: string; swatchClass: string }> = [
	{ value: "high", label: "High", colorClass: "text-red-500", swatchClass: "admin-task-composer__priority-flag--high" },
	{
		value: "medium",
		label: "Medium",
		colorClass: "text-orange-500",
		swatchClass: "admin-task-composer__priority-flag--medium",
	},
	{ value: "low", label: "Low", colorClass: "text-green-500", swatchClass: "admin-task-composer__priority-flag--low" },
];

type PriorityMenuPlacement = "bottom" | "top";

type PriorityMenuPosition = {
	placement: PriorityMenuPlacement;
	top: number;
	left: number;
	minWidth: number;
	maxHeight: number;
};

const PRIORITY_MENU_GAP = 8;
const PRIORITY_MENU_MIN_WIDTH = 156;
const PRIORITY_MENU_ESTIMATED_HEIGHT = 130;

export const getPriorityMenuPlacement = (
	triggerRect: Pick<DOMRect, "top" | "bottom">,
	menuHeight = PRIORITY_MENU_ESTIMATED_HEIGHT,
	viewportHeight = typeof window === "undefined" ? 0 : window.innerHeight,
	gap = PRIORITY_MENU_GAP
): PriorityMenuPlacement => {
	const availableBelow = viewportHeight - triggerRect.bottom - gap;
	const availableAbove = triggerRect.top - gap;

	if (availableBelow >= menuHeight || availableBelow >= availableAbove) return "bottom";

	return "top";
};

type NativePickerInput = HTMLInputElement & {
	showPicker?: () => void;
};

const openNativePicker = (input: NativePickerInput | null) => {
	if (!input) return;

	input.focus();

	if (typeof input.showPicker !== "function") return;

	try {
		input.showPicker();
	} catch {
		input.focus();
	}
};

const toDateInputValue = (date: Date) => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
};

const parseDateInputValue = (value: string) => {
	const [year, month, day] = value.split("-").map(Number);

	return new Date(year, month - 1, day, 12);
};

const isSameLocalDay = (a: Date, b: Date) =>
	a.getFullYear() === b.getFullYear() &&
	a.getMonth() === b.getMonth() &&
	a.getDate() === b.getDate();

const getDateLabel = (date: Date) => {
	if (isSameLocalDay(date, new Date())) return "Today";

	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
	});
};

const getTimeRangeError = (startTime: string, endTime: string) => {
	if (endTime && !startTime) return "Select a start time before adding an end time.";
	if (startTime && endTime && endTime <= startTime) {
		return "End time must be after start time.";
	}

	return "";
};

export const AddTaskComposer: React.FC<AddTaskComposerProps> = ({
	taskText,
	onTaskTextChange,
	selectedDate,
	onDateChange,
	startTime,
	onStartTimeChange,
	endTime,
	onEndTimeChange,
	priority,
	onPriorityChange,
	onSubmit,
	isSubmitting = false,
}) => {
	const [timeError, setTimeError] = React.useState("");
	const [hasAttemptedSubmit, setHasAttemptedSubmit] = React.useState(false);
	const [isPriorityOpen, setIsPriorityOpen] = React.useState(false);
	const [priorityMenuPosition, setPriorityMenuPosition] = React.useState<PriorityMenuPosition | null>(null);
	const [activePriorityIndex, setActivePriorityIndex] = React.useState(() =>
		Math.max(
			priorityOptions.findIndex((option) => option.value === priority),
			0
		)
	);
	const dateInputRef = React.useRef<HTMLInputElement>(null);
	const startTimeInputRef = React.useRef<HTMLInputElement>(null);
	const endTimeInputRef = React.useRef<HTMLInputElement>(null);
	const priorityRootRef = React.useRef<HTMLDivElement>(null);
	const priorityTriggerRef = React.useRef<HTMLButtonElement>(null);
	const priorityMenuRef = React.useRef<HTMLDivElement>(null);
	const priorityOptionRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
	const isTaskTextEmpty = taskText.trim().length === 0;
	const helperId = "add-task-composer-helper";
	const timeErrorId = "add-task-composer-time-error";
	const priorityListboxId = React.useId();
	const selectedPriority = priorityOptions.find((option) => option.value === priority) ?? priorityOptions[1];
	const activePriority = priorityOptions[activePriorityIndex] ?? selectedPriority;
	const isSubmitBlocked = isTaskTextEmpty || isSubmitting;

	React.useEffect(() => {
		if (isSubmitting) setIsPriorityOpen(false);
	}, [isSubmitting]);

	React.useEffect(() => {
		setActivePriorityIndex(Math.max(priorityOptions.findIndex((option) => option.value === priority), 0));
	}, [priority]);

	React.useEffect(() => {
		if (!isPriorityOpen) return;

		const handlePointerDown = (event: PointerEvent) => {
			const target = event.target as Node;
			if (!priorityRootRef.current?.contains(target) && !priorityMenuRef.current?.contains(target)) {
				setIsPriorityOpen(false);
			}
		};

		document.addEventListener("pointerdown", handlePointerDown);

		return () => {
			document.removeEventListener("pointerdown", handlePointerDown);
		};
	}, [isPriorityOpen]);

	const updatePriorityMenuPosition = React.useCallback(() => {
		if (!isPriorityOpen || !priorityTriggerRef.current) return;

		const triggerRect = priorityTriggerRef.current.getBoundingClientRect();
		const menuHeight = priorityMenuRef.current?.offsetHeight || PRIORITY_MENU_ESTIMATED_HEIGHT;
		const menuWidth = Math.max(PRIORITY_MENU_MIN_WIDTH, triggerRect.width);
		const placement = getPriorityMenuPlacement(triggerRect, menuHeight, window.innerHeight, PRIORITY_MENU_GAP);
		const availableBelow = window.innerHeight - triggerRect.bottom - PRIORITY_MENU_GAP;
		const availableAbove = triggerRect.top - PRIORITY_MENU_GAP;
		const minLeft = menuWidth / 2 + PRIORITY_MENU_GAP;
		const maxLeft = Math.max(minLeft, window.innerWidth - menuWidth / 2 - PRIORITY_MENU_GAP);
		const safeLeft = Math.min(Math.max(triggerRect.left + triggerRect.width / 2, minLeft), maxLeft);

		setPriorityMenuPosition({
			placement,
			top:
				placement === "bottom"
					? triggerRect.bottom + PRIORITY_MENU_GAP
					: Math.max(PRIORITY_MENU_GAP, triggerRect.top - menuHeight - PRIORITY_MENU_GAP),
			left: safeLeft,
			minWidth: menuWidth,
			maxHeight: Math.max(96, placement === "bottom" ? availableBelow : availableAbove),
		});
	}, [isPriorityOpen]);

	React.useLayoutEffect(() => {
		if (!isPriorityOpen) {
			setPriorityMenuPosition(null);
			return;
		}

		updatePriorityMenuPosition();
		window.addEventListener("resize", updatePriorityMenuPosition);
		window.addEventListener("scroll", updatePriorityMenuPosition, { capture: true, passive: true });

		return () => {
			window.removeEventListener("resize", updatePriorityMenuPosition);
			window.removeEventListener("scroll", updatePriorityMenuPosition, { capture: true });
		};
	}, [isPriorityOpen, updatePriorityMenuPosition]);

	React.useEffect(() => {
		if (!isPriorityOpen) return;

		priorityOptionRefs.current[activePriorityIndex]?.focus();
	}, [activePriorityIndex, isPriorityOpen]);

	const submitIfValid = () => {
		if (isSubmitting) return;

		setHasAttemptedSubmit(true);
		const nextTimeError = getTimeRangeError(startTime, endTime);
		setTimeError(nextTimeError);
		if (isTaskTextEmpty) return;
		if (nextTimeError) return;
		onSubmit();
	};

	const selectPriority = (nextPriority: Priority) => {
		onPriorityChange(nextPriority);
		setIsPriorityOpen(false);
		priorityTriggerRef.current?.focus();
	};

	const togglePriorityMenu = () => {
		if (isSubmitting) return;

		setActivePriorityIndex(Math.max(priorityOptions.findIndex((option) => option.value === priority), 0));
		setIsPriorityOpen((isOpen) => !isOpen);
	};

	const handlePriorityKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
		if (isSubmitting) return;

		if (event.key === "Escape") {
			event.preventDefault();
			setIsPriorityOpen(false);
			priorityTriggerRef.current?.focus();
			return;
		}

		if (event.key === "Tab") {
			setIsPriorityOpen(false);
			priorityTriggerRef.current?.focus();
			return;
		}

		if (event.key === "ArrowDown" || event.key === "ArrowUp") {
			event.preventDefault();
			setIsPriorityOpen(true);
			setActivePriorityIndex((currentIndex) => {
				const delta = event.key === "ArrowDown" ? 1 : -1;
				return (currentIndex + delta + priorityOptions.length) % priorityOptions.length;
			});
			return;
		}

		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			if (!isPriorityOpen) {
				setIsPriorityOpen(true);
				return;
			}

			selectPriority(priorityOptions[activePriorityIndex]?.value ?? selectedPriority.value);
		}
	};

	const priorityMenu = isPriorityOpen
		? createPortal(
				<div
					ref={priorityMenuRef}
					id={priorityListboxId}
					role="listbox"
					aria-label="Priority options"
					data-placement={priorityMenuPosition?.placement ?? "bottom"}
					onKeyDown={handlePriorityKeyDown}
					className="admin-task-composer__priority-menu fixed z-50 grid min-w-[156px] -translate-x-1/2 gap-1 rounded-xl p-1.5 shadow-lg"
					style={{
						top: priorityMenuPosition?.top ?? 0,
						left: priorityMenuPosition?.left ?? 0,
						minWidth: priorityMenuPosition?.minWidth ?? PRIORITY_MENU_MIN_WIDTH,
						maxHeight: priorityMenuPosition?.maxHeight,
						visibility: priorityMenuPosition ? "visible" : "hidden",
					}}
				>
					{priorityOptions.map((option, index) => {
						const isSelected = priority === option.value;

						return (
							<button
								key={option.value}
								ref={(element) => {
									priorityOptionRefs.current[index] = element;
								}}
								id={`${priorityListboxId}-${option.value}`}
								type="button"
								role="option"
								aria-selected={isSelected}
								data-state={isSelected ? "selected" : "idle"}
								data-highlight={isSelected ? "theme-aware" : undefined}
								onMouseEnter={() => setActivePriorityIndex(index)}
								onClick={() => selectPriority(option.value)}
								className={`admin-task-composer__priority-option flex min-h-9 items-center gap-2 rounded-lg px-3 text-left text-sm font-semibold transition-colors ${
									isSelected ? "is-selected" : ""
								}`}
							>
								<span
									role="img"
									aria-label={`${option.label} priority option flag`}
									className={`admin-task-composer__priority-flag ${option.colorClass} ${option.swatchClass}`}
								>
									<Flag className="h-4 w-4 fill-current" aria-hidden="true" />
								</span>
								<span>{option.label}</span>
							</button>
						);
					})}
				</div>,
				document.body
			)
		: null;

	return (
		<section
			className="admin-task-composer overflow-hidden rounded-2xl"
			aria-label="Task composer"
		>
			<div className="flex flex-col">
				<div className="admin-task-composer__input-row">
					<input
						type="text"
						value={taskText}
						onChange={(event) => onTaskTextChange(event.target.value)}
						onKeyDown={(event) => {
							if (event.key === "Enter") submitIfValid();
						}}
						disabled={isSubmitting}
						placeholder="What needs to be done?"
						name="newTask"
						autoComplete="off"
						aria-label="New task"
						aria-describedby={hasAttemptedSubmit && isTaskTextEmpty ? helperId : undefined}
						aria-invalid={hasAttemptedSubmit && isTaskTextEmpty}
						data-focus-style="subtle"
						className="admin-task-composer__input min-h-[52px] w-full border-0 bg-transparent px-5 py-3 text-base font-medium transition-colors focus:outline-none"
					/>
					{hasAttemptedSubmit && isTaskTextEmpty ? (
						<p id={helperId} className="admin-task-composer__helper px-5 pb-3 text-xs font-medium">
							Task text is required.
						</p>
					) : null}
				</div>

				{timeError ? (
					<p
						id={timeErrorId}
						className="admin-task-composer__helper admin-task-composer__helper--error px-5 py-2 text-xs font-semibold"
						role="alert"
					>
						{timeError}
					</p>
				) : null}

				<div className="admin-task-composer__segments flex flex-col sm:min-h-11 sm:flex-row sm:items-stretch">
					<div
						className="admin-task-composer__segment admin-task-composer__segment--date relative flex min-h-11 items-center gap-2 px-3 text-sm font-semibold transition-colors"
						onClick={() => {
							if (!isSubmitting) openNativePicker(dateInputRef.current);
						}}
					>
						<Calendar className="admin-task-composer__icon h-4 w-4" aria-hidden="true" />
						<span className="min-w-12 whitespace-nowrap">{getDateLabel(selectedDate)}</span>
						<input
							ref={dateInputRef}
							type="date"
							aria-label="Task date"
							value={toDateInputValue(selectedDate)}
							disabled={isSubmitting}
							onChange={(event) => {
								if (!event.target.value) return;
								onDateChange(parseDateInputValue(event.target.value));
							}}
							data-focus-style="subtle"
							className="admin-task-composer__date-input admin-task-composer__native-picker-input absolute inset-0 cursor-pointer opacity-0 outline-none"
						/>
					</div>

					<div
						className="admin-task-composer__segment admin-task-composer__segment--time relative flex min-h-11 items-center gap-2 px-3 text-sm font-semibold transition-colors"
						onClick={() => {
							if (!isSubmitting) openNativePicker(startTimeInputRef.current);
						}}
					>
						<Clock className="admin-task-composer__icon h-4 w-4" data-slot="time-leading-icon" aria-hidden="true" />
						<span className="admin-task-composer__time-label min-w-[76px] whitespace-nowrap">
							{startTime || "Start Time"}
						</span>
						<input
							ref={startTimeInputRef}
							type="time"
							aria-label="Start time"
							value={startTime}
							disabled={isSubmitting}
							onChange={(event) => {
								setTimeError("");
								onStartTimeChange(event.target.value);
							}}
							aria-describedby={timeError ? timeErrorId : undefined}
							aria-invalid={Boolean(timeError)}
							data-focus-style="subtle"
							className="admin-task-composer__time-input admin-task-composer__native-picker-input admin-task-composer__time-input--native-hidden absolute inset-0 cursor-pointer opacity-0 outline-none"
						/>
					</div>

					<div
						className="admin-task-composer__segment admin-task-composer__segment--time relative flex min-h-11 items-center gap-2 px-3 text-sm font-semibold transition-colors"
						onClick={() => {
							if (!isSubmitting) openNativePicker(endTimeInputRef.current);
						}}
					>
						<Clock className="admin-task-composer__icon h-4 w-4" data-slot="time-leading-icon" aria-hidden="true" />
						<span className="admin-task-composer__time-label min-w-[70px] whitespace-nowrap">
							{endTime || "End Time"}
						</span>
						<input
							ref={endTimeInputRef}
							type="time"
							aria-label="End time"
							value={endTime}
							disabled={isSubmitting}
							onChange={(event) => {
								setTimeError("");
								onEndTimeChange(event.target.value);
							}}
							aria-describedby={timeError ? timeErrorId : undefined}
							aria-invalid={Boolean(timeError)}
							data-focus-style="subtle"
							className="admin-task-composer__time-input admin-task-composer__native-picker-input admin-task-composer__time-input--native-hidden absolute inset-0 cursor-pointer opacity-0 outline-none"
						/>
					</div>

					<div
						ref={priorityRootRef}
						className="admin-task-composer__segment admin-task-composer__segment--priority relative flex min-h-11 items-center text-sm font-semibold transition-colors"
						onKeyDown={handlePriorityKeyDown}
					>
						<button
							ref={priorityTriggerRef}
							type="button"
							role="combobox"
							aria-label="Task priority"
							aria-haspopup="listbox"
							aria-expanded={isPriorityOpen}
							aria-controls={priorityListboxId}
							aria-activedescendant={isPriorityOpen ? `${priorityListboxId}-${activePriority.value}` : undefined}
							disabled={isSubmitting}
							data-value={selectedPriority.value}
							data-focus-style="subtle"
							onClick={togglePriorityMenu}
							className="admin-task-composer__priority-trigger flex min-h-11 w-full min-w-[124px] items-center gap-2 px-3 pr-9 text-left text-sm font-semibold transition-colors focus:outline-none"
						>
							<span
								role="img"
								aria-label={`${selectedPriority.label} priority flag`}
								className={`admin-task-composer__priority-flag ${selectedPriority.colorClass} ${selectedPriority.swatchClass}`}
							>
								<Flag className="h-4 w-4 fill-current" aria-hidden="true" />
							</span>
							<span>{selectedPriority.label}</span>
							<ChevronDown className="admin-task-composer__chevron pointer-events-none absolute right-3 h-4 w-4" aria-hidden="true" />
						</button>
					</div>

					<button
						type="button"
						onClick={submitIfValid}
						disabled={isSubmitBlocked}
						aria-disabled={isSubmitBlocked}
						aria-busy={isSubmitting}
						className="admin-task-composer__submit m-2 flex min-h-8 w-auto items-center justify-center gap-1.5 self-stretch rounded-lg px-4 text-sm font-bold transition-colors focus-visible:outline-none disabled:cursor-not-allowed sm:ml-auto sm:self-center"
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
						<span>Add Task</span>
					</button>
				</div>
			</div>
			{priorityMenu}
		</section>
	);
};
