import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TaskList } from "./TaskList";

describe("TaskList", () => {
  it("lets admins toggle task completion", () => {
    const onToggleComplete = vi.fn();

    render(
      <TaskList
        day="Monday"
        tasks={[
          {
            id: "task-1",
            text: "Finish report",
            completed: false,
            priority: "high",
          },
        ]}
        groupByPriority={false}
        isAdmin
        onToggleComplete={onToggleComplete}
        editingTaskId={null}
      />
    );

    fireEvent.click(
      screen.getByLabelText("Mark task as complete: Finish report")
    );

    expect(onToggleComplete).toHaveBeenCalledWith("Monday", "task-1");
  });

  it("keeps the admin selection checkbox separate from completion", () => {
    const onToggleComplete = vi.fn();
    const onToggleSelection = vi.fn();

    render(
      <TaskList
        day="Monday"
        tasks={[
          {
            id: "task-1",
            text: "Finish report",
            completed: false,
            priority: "high",
          },
        ]}
        groupByPriority={false}
        isAdmin
        selectedTasks={new Set()}
        onToggleSelection={onToggleSelection}
        onToggleComplete={onToggleComplete}
        editingTaskId={null}
      />
    );

    fireEvent.click(screen.getByLabelText("Select task: Finish report"));

    expect(onToggleSelection).toHaveBeenCalledWith("task-1");
    expect(onToggleComplete).not.toHaveBeenCalled();
  });
});
