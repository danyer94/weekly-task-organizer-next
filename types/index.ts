export type Priority = "high" | "medium" | "low";

export type Day =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export interface Task {
  id: number;
  text: string;
  completed: boolean;
  priority: Priority;
}

export type TasksByDay = {
  [key in Day]?: Task[];
};

export interface GroupedTasks {
  high: { task: Task; index: number }[];
  medium: { task: Task; index: number }[];
  low: { task: Task; index: number }[];
}
