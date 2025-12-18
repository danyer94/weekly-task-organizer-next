"use client";
import React, { useState, useEffect, useRef } from "react";
import { saveTasks, subscribeToTasks } from "@/lib/firebase";

const WeeklyTaskOrganizer = () => {
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Track if we're on the client to prevent hydration mismatch
  const [isClient, setIsClient] = useState(false);
  const [syncStatus, setSyncStatus] = useState("connecting"); // "connecting", "synced", "offline", "error"
  const isLocalChange = useRef(false);

  // Initialize with empty state - will be populated from Firebase
  const [tasks, setTasks] = useState(
    days.reduce((acc, day) => ({ ...acc, [day]: [] }), {})
  );

  const [currentAdminDay, setCurrentAdminDay] = useState(days[0]);
  const [currentUserDay, setCurrentUserDay] = useState(days[0]);
  const [mode, setMode] = useState("admin");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");
  const [bulkTasksText, setBulkTasksText] = useState("");
  const [priority, setPriority] = useState("medium");
  const [draggedTask, setDraggedTask] = useState(null);

  // Client-side initialization and Firebase subscription
  useEffect(() => {
    setIsClient(true);

    // Set current day
    const dayIndex = new Date().getDay();
    const currentDay = days[dayIndex === 0 ? 6 : dayIndex - 1];
    setCurrentAdminDay(currentDay);
    setCurrentUserDay(currentDay);

    // Subscribe to Firebase real-time updates
    const unsubscribe = subscribeToTasks((data) => {
      if (data) {
        // Only update if this is not our own local change
        if (!isLocalChange.current) {
          setTasks(data);
        }
        isLocalChange.current = false;
        setSyncStatus("synced");
      } else {
        // Initialize empty database
        const emptyTasks = days.reduce(
          (acc, day) => ({ ...acc, [day]: [] }),
          {}
        );
        saveTasks(emptyTasks);
        setSyncStatus("synced");
      }
    });

    return () => unsubscribe();
  }, []);

  // Save tasks to Firebase whenever they change (but only on client and for local changes)
  useEffect(() => {
    if (isClient && isLocalChange.current) {
      saveTasks(tasks).then((success) => {
        setSyncStatus(success ? "synced" : "error");
      });
    }
  }, [tasks, isClient]);

  // Helper to update tasks and mark as local change
  const updateTasks = (updater) => {
    isLocalChange.current = true;
    setTasks(updater);
  };

  const addTask = () => {
    if (!newTaskText.trim()) return;

    updateTasks((prev) => ({
      ...prev,
      [currentAdminDay]: [
        ...prev[currentAdminDay],
        {
          id: Date.now(),
          text: newTaskText,
          completed: false,
          priority: priority,
        },
      ],
    }));
    setNewTaskText("");
  };

  const deleteTask = (day, id) => {
    updateTasks((prev) => ({
      ...prev,
      [day]: prev[day].filter((t) => t.id !== id),
    }));
  };

  const toggleComplete = (day, id) => {
    updateTasks((prev) => ({
      ...prev,
      [day]: prev[day].map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ),
    }));
  };

  const editTask = (day, id, newText) => {
    updateTasks((prev) => ({
      ...prev,
      [day]: prev[day].map((t) => (t.id === id ? { ...t, text: newText } : t)),
    }));
    setEditingTaskId(null);
  };

  const toggleSelection = (id) => {
    setSelectedTasks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAllTasks = () => {
    const dayTasks = tasks[currentAdminDay] || [];
    const allIds = dayTasks.map((t) => t.id);
    setSelectedTasks(new Set(allIds));
  };

  const moveOrCopyTasks = (targetDays, isMove) => {
    const tasksToProcess = tasks[currentAdminDay].filter((t) =>
      selectedTasks.has(t.id)
    );

    updateTasks((prev) => {
      const newTasks = { ...prev };

      targetDays.forEach((day) => {
        tasksToProcess.forEach((task) => {
          newTasks[day] = [
            ...newTasks[day],
            { ...task, id: Date.now() + Math.random(), completed: false },
          ];
        });
      });

      if (isMove) {
        newTasks[currentAdminDay] = newTasks[currentAdminDay].filter(
          (t) => !selectedTasks.has(t.id)
        );
      }

      return newTasks;
    });

    setSelectedTasks(new Set());
    setShowMoveModal(false);
    setShowCopyModal(false);
  };

  const deleteSelected = () => {
    if (!window.confirm(`Delete ${selectedTasks.size} task(s)?`)) return;
    updateTasks((prev) => ({
      ...prev,
      [currentAdminDay]: prev[currentAdminDay].filter(
        (t) => !selectedTasks.has(t.id)
      ),
    }));
    setSelectedTasks(new Set());
  };

  const clearCompleted = () => {
    if (!window.confirm("Clear all completed tasks from all days?")) return;
    updateTasks((prev) => {
      const newTasks = {};
      Object.keys(prev).forEach((day) => {
        newTasks[day] = prev[day].filter((t) => !t.completed);
      });
      return newTasks;
    });
  };

  const bulkAddTasks = () => {
    const lines = bulkTasksText.split("\n").filter((l) => l.trim());
    updateTasks((prev) => ({
      ...prev,
      [currentAdminDay]: [
        ...prev[currentAdminDay],
        ...lines.map((line) => ({
          id: Date.now() + Math.random(),
          text: line.trim(),
          completed: false,
          priority: "medium",
        })),
      ],
    }));
    setBulkTasksText("");
    setShowBulkModal(false);
  };

  const duplicateWeek = () => {
    if (
      !window.confirm(
        "Duplicate this week's tasks to next week? (This is a demo feature)"
      )
    )
      return;
    alert("Week duplicated! (Demo feature)");
  };

  // Export tasks to WhatsApp format (copy to clipboard)
  const exportToWhatsApp = () => {
    const priorityEmoji = { high: "🔴", medium: "🟠", low: "🟢" };
    let text = "📋 *Weekly Task Organizer*\n\n";

    days.forEach((day) => {
      const dayTasks = tasks[day] || [];
      if (dayTasks.length > 0) {
        text += `*${day}*\n`;
        dayTasks.forEach((task) => {
          const status = task.completed ? "✅" : "⬜";
          const priority = priorityEmoji[task.priority] || "🟠";
          text += `${status} ${priority} ${task.text}\n`;
        });
        text += "\n";
      }
    });

    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert("✅ Tasks copied to clipboard! Paste in WhatsApp to share.");
      })
      .catch(() => {
        // Fallback for older browsers
        const textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        alert("✅ Tasks copied to clipboard! Paste in WhatsApp to share.");
      });
  };

  // Export tasks to JSON file (backup)
  const exportToJSON = () => {
    const exportData = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      tasks: tasks,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `weekly-tasks-backup-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import tasks from JSON file
  const importFromJSON = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target.result);

        // Validate the imported data
        if (!importData.tasks) {
          alert("❌ Invalid file format. Please select a valid backup file.");
          return;
        }

        // Check if all days exist in the imported data
        const isValid = days.every((day) =>
          Array.isArray(importData.tasks[day])
        );
        if (!isValid) {
          alert("❌ Invalid file format. The file is missing some days.");
          return;
        }

        if (
          window.confirm(
            "⚠️ This will replace ALL current tasks. Are you sure?"
          )
        ) {
          updateTasks(() => importData.tasks);
          alert("✅ Tasks imported successfully!");
        }
      } catch (error) {
        alert(
          "❌ Error reading file. Please make sure it's a valid JSON file."
        );
      }
    };
    reader.readAsText(file);

    // Reset the input so the same file can be selected again
    event.target.value = "";
  };

  const reorderTasks = (day, fromIndex, toIndex) => {
    setTasks((prev) => {
      const newDayTasks = [...prev[day]];
      const [movedTask] = newDayTasks.splice(fromIndex, 1);
      newDayTasks.splice(toIndex, 0, movedTask);
      return { ...prev, [day]: newDayTasks };
    });
  };

  const getTotalTasks = () => {
    return Object.values(tasks).reduce(
      (sum, dayTasks) => sum + dayTasks.length,
      0
    );
  };

  const getCompletedTasks = () => {
    return Object.values(tasks).reduce(
      (sum, dayTasks) => sum + dayTasks.filter((t) => t.completed).length,
      0
    );
  };

  const DaySelectionModal = ({ show, onClose, onConfirm, title }) => {
    const [selectedDays, setSelectedDays] = useState([]);

    if (!show) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
          <h3 className="text-xl font-bold text-purple-600 mb-4">{title}</h3>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {days
              .filter((d) => d !== currentAdminDay)
              .map((day) => (
                <label
                  key={day}
                  className="flex items-center p-3 bg-purple-50 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedDays.includes(day)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedDays([...selectedDays, day]);
                      } else {
                        setSelectedDays(selectedDays.filter((d) => d !== day));
                      }
                    }}
                    className="mr-2 text-purple-600 focus:ring-purple-600 border-gray-300 rounded"
                  />
                  <span className="text-gray-700">{day}</span>
                </label>
              ))}
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm(selectedDays);
                setSelectedDays([]);
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  };

  const TaskItem = ({ task, day, index, isAdmin }) => {
    const [editText, setEditText] = useState(task.text);
    const isEditing = editingTaskId === task.id;
    const isSelected = selectedTasks.has(task.id);

    const priorityColors = {
      high: "border-l-red-500",
      medium: "border-l-orange-500",
      low: "border-l-green-500",
    };

    return (
      <li
        draggable={!isEditing}
        onDragStart={() => setDraggedTask({ task, index, day })}
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => {
          if (draggedTask && draggedTask.day === day) {
            reorderTasks(day, draggedTask.index, index);
          }
          setDraggedTask(null);
        }}
        className={`flex items-center justify-between p-4 rounded-lg mb-2 border-l-4 transition-all hover:shadow-md ${
          task.completed
            ? "bg-green-50 " + priorityColors[task.priority]
            : "bg-purple-50 " + priorityColors[task.priority]
        } ${isSelected ? "ring-2 ring-purple-600" : ""} ${
          isAdmin ? "hover:bg-purple-100 cursor-move" : ""
        }`}
      >
        <div className="flex items-center flex-1 gap-3">
          {isAdmin && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleSelection(task.id)}
                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
              />
              <span className="text-gray-400 cursor-grab">⋮⋮</span>
            </div>
          )}
          {!isAdmin && (
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleComplete(day, task.id)}
              className="w-6 h-6 text-green-600 rounded focus:ring-green-500 cursor-pointer mr-2"
            />
          )}
          {isEditing ? (
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") editTask(day, task.id, editText);
                  if (e.key === "Escape") setEditingTaskId(null);
                }}
                className="flex-1 p-2 border-2 border-purple-600 rounded-lg focus:outline-none"
                autoFocus
              />
              <button
                onClick={() => editTask(day, task.id, editText)}
                className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
              >
                💾
              </button>
              <button
                onClick={() => setEditingTaskId(null)}
                className="px-3 py-1 bg-gray-400 text-white rounded-lg text-sm hover:bg-gray-500"
              >
                ✖
              </button>
            </div>
          ) : (
            <div className="flex-1">
              <span
                className={`block text-base md:text-lg break-words ${
                  task.completed
                    ? "line-through text-gray-500"
                    : "text-gray-800"
                }`}
              >
                {task.text}
              </span>
            </div>
          )}
          {isAdmin && !isEditing && (
            <span
              className={`hidden sm:inline-block px-2 py-1 text-xs font-bold rounded-full whitespace-nowrap ml-2 ${
                task.completed
                  ? "bg-green-500 text-white"
                  : "bg-orange-500 text-white"
              }`}
            >
              {task.completed ? "✓ Done" : "○ Pending"}
            </span>
          )}
        </div>
        {isAdmin && !isEditing && (
          <div className="flex gap-2 ml-3">
            <button
              onClick={() => {
                setEditingTaskId(task.id);
                setEditText(task.text);
              }}
              className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
              title="Edit"
            >
              ✏️
            </button>
            <button
              onClick={() => deleteTask(day, task.id)}
              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
              title="Delete"
            >
              🗑️
            </button>
          </div>
        )}
      </li>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-900 font-sans p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-2">
          <h1 className="text-3xl md:text-4xl font-bold text-white text-center drop-shadow-lg">
            📋 Weekly Task Organizer
          </h1>
          {/* Sync Status Indicator */}
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${
              syncStatus === "synced"
                ? "bg-green-500 text-white"
                : syncStatus === "connecting"
                ? "bg-yellow-500 text-black"
                : syncStatus === "error"
                ? "bg-red-500 text-white"
                : "bg-gray-500 text-white"
            }`}
          >
            {syncStatus === "synced"
              ? "🟢 Synced"
              : syncStatus === "connecting"
              ? "🟡 Connecting..."
              : syncStatus === "error"
              ? "🔴 Error"
              : "⚪ Offline"}
          </span>
        </div>

        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setMode("admin")}
            className={`px-6 py-2 md:px-8 md:py-3 rounded-full font-bold transition-all ${
              mode === "admin"
                ? "bg-white text-purple-600 shadow-lg"
                : "bg-white/30 text-white hover:bg-white/40"
            }`}
          >
            <span>👨‍💼</span> <span>Administrator</span>
          </button>
          <button
            onClick={() => setMode("user")}
            className={`px-6 py-2 md:px-8 md:py-3 rounded-full font-bold transition-all ${
              mode === "user"
                ? "bg-white text-purple-600 shadow-lg"
                : "bg-white/30 text-white hover:bg-white/40"
            }`}
          >
            <span>👤</span> <span>Ramon</span>
          </button>
        </div>

        {mode === "admin" ? (
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar */}
              <div className="bg-purple-50 rounded-xl p-4">
                <h3 className="font-bold text-purple-600 mb-3">Days</h3>
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                  {days.map((day) => {
                    const dayTasks = tasks[day] || [];
                    const completed = dayTasks.filter(
                      (t) => t.completed
                    ).length;
                    return (
                      <button
                        key={day}
                        onClick={() => setCurrentAdminDay(day)}
                        className={`w-full p-3 rounded-lg font-semibold transition-all text-sm md:text-base ${
                          currentAdminDay === day
                            ? "bg-purple-600 text-white"
                            : "bg-white text-purple-600 hover:bg-purple-100"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span>{day}</span>
                          <span className="text-xs bg-black bg-opacity-20 px-2 py-0.5 rounded-full text-white">
                            {completed}/{dayTasks.length}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 bg-white rounded-lg p-4 hidden lg:block">
                  <h4 className="font-bold text-purple-600 mb-3">Week Stats</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center p-2 bg-purple-50 rounded">
                      <div className="text-xl font-bold text-purple-600">
                        {getTotalTasks()}
                      </div>
                      <div className="text-xs text-gray-600">Total</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <div className="text-xl font-bold text-green-600">
                        {getCompletedTasks()}
                      </div>
                      <div className="text-xs text-gray-600">Done</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 hidden lg:block">
                  <h4 className="font-bold text-purple-600 mb-3">
                    Quick Actions
                  </h4>
                  <button
                    onClick={clearCompleted}
                    className="w-full p-2 mb-2 bg-white border-2 border-purple-600 text-purple-600 rounded-lg font-semibold hover:bg-purple-600 hover:text-white transition-all text-sm"
                  >
                    🗑️ Clear Completed
                  </button>
                  <button
                    onClick={() => setShowBulkModal(true)}
                    className="w-full p-2 mb-2 bg-white border-2 border-purple-600 text-purple-600 rounded-lg font-semibold hover:bg-purple-600 hover:text-white transition-all text-sm"
                  >
                    📝 Bulk Add
                  </button>

                  {/* Export/Import Section */}
                  <h4 className="font-bold text-purple-600 mb-2 mt-4">
                    Export / Import
                  </h4>
                  <button
                    onClick={exportToWhatsApp}
                    className="w-full p-2 mb-2 bg-white border-2 border-green-500 text-green-600 rounded-lg font-semibold hover:bg-green-500 hover:text-white transition-all text-sm"
                  >
                    📱 WhatsApp
                  </button>
                  <button
                    onClick={exportToJSON}
                    className="w-full p-2 mb-2 bg-white border-2 border-blue-500 text-blue-600 rounded-lg font-semibold hover:bg-blue-500 hover:text-white transition-all text-sm"
                  >
                    � Backup
                  </button>
                  <label className="w-full p-2 mb-2 bg-white border-2 border-orange-500 text-orange-600 rounded-lg font-semibold hover:bg-orange-500 hover:text-white transition-all text-sm cursor-pointer text-center block">
                    📂 Restore
                    <input
                      type="file"
                      accept=".json"
                      onChange={importFromJSON}
                      className="hidden"
                    />
                  </label>
                </div>
                {/* Mobile Actions Menu (simplified) */}
                <div className="mt-4 lg:hidden flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  <button
                    onClick={clearCompleted}
                    className="whitespace-nowrap px-3 py-2 bg-white border border-purple-600 text-purple-600 rounded-lg text-sm font-medium"
                  >
                    🗑️ Clear
                  </button>
                  <button
                    onClick={() => setShowBulkModal(true)}
                    className="whitespace-nowrap px-3 py-2 bg-white border border-purple-600 text-purple-600 rounded-lg text-sm font-medium"
                  >
                    📝 Bulk
                  </button>
                  <button
                    onClick={exportToWhatsApp}
                    className="whitespace-nowrap px-3 py-2 bg-white border border-green-500 text-green-600 rounded-lg text-sm font-medium"
                  >
                    📱 WhatsApp
                  </button>
                  <button
                    onClick={exportToJSON}
                    className="whitespace-nowrap px-3 py-2 bg-white border border-blue-500 text-blue-600 rounded-lg text-sm font-medium"
                  >
                    💾 Backup
                  </button>
                  <label className="whitespace-nowrap px-3 py-2 bg-white border border-orange-500 text-orange-600 rounded-lg text-sm font-medium cursor-pointer">
                    📂 Restore
                    <input
                      type="file"
                      accept=".json"
                      onChange={importFromJSON}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3">
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 rounded-xl mb-4 text-center font-bold text-xl shadow-md">
                  {currentAdminDay}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 mb-6">
                  <input
                    type="text"
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addTask()}
                    placeholder="Enter a new task..."
                    className="flex-1 p-3 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="p-3 border-2 border-gray-300 rounded-lg bg-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                    <button
                      onClick={addTask}
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 shadow-md whitespace-nowrap"
                    >
                      ➕ Add
                    </button>
                  </div>
                </div>

                {/* Selection Toolbar - Always visible when there are tasks */}
                {tasks[currentAdminDay]?.length > 0 && (
                  <div className="bg-purple-50 p-3 rounded-lg mb-4 flex flex-wrap gap-2 items-center">
                    <button
                      onClick={selectAllTasks}
                      className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
                    >
                      ☑️ Select All
                    </button>
                    {selectedTasks.size > 0 && (
                      <>
                        <span className="font-bold text-purple-600 mx-2">
                          | {selectedTasks.size} selected
                        </span>
                        <button
                          onClick={() => setShowMoveModal(true)}
                          className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium"
                        >
                          📤 Move
                        </button>
                        <button
                          onClick={() => setShowCopyModal(true)}
                          className="px-3 py-1.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm font-medium"
                        >
                          📋 Copy
                        </button>
                        <button
                          onClick={deleteSelected}
                          className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium"
                        >
                          🗑️ Delete
                        </button>
                        <button
                          onClick={() => setSelectedTasks(new Set())}
                          className="px-3 py-1.5 bg-gray-400 text-white rounded-lg hover:bg-gray-500 text-sm font-medium"
                        >
                          ✖ Clear
                        </button>
                      </>
                    )}
                  </div>
                )}

                <ul className="space-y-2">
                  {tasks[currentAdminDay]?.length > 0 ? (
                    tasks[currentAdminDay].map((task, index) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        day={currentAdminDay}
                        index={index}
                        isAdmin={true}
                      />
                    ))
                  ) : (
                    <div className="text-center text-gray-400 py-12 italic">
                      No tasks for this day
                    </div>
                  )}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-purple-600 mb-4">
              Ramon's View
            </h2>
            <div className="flex overflow-x-auto pb-4 gap-2 mb-4 scrollbar-hide">
              {days.map((day) => (
                <button
                  key={day}
                  onClick={() => setCurrentUserDay(day)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
                    currentUserDay === day
                      ? "bg-purple-600 text-white"
                      : "bg-purple-100 text-purple-600 hover:bg-purple-200"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 rounded-xl mb-4 text-center font-bold text-xl shadow-md">
              {currentUserDay}
            </div>

            <ul className="space-y-2">
              {tasks[currentUserDay]?.length > 0 ? (
                tasks[currentUserDay].map((task, index) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    day={currentUserDay}
                    index={index}
                    isAdmin={false}
                  />
                ))
              ) : (
                <div className="text-center text-gray-400 py-12 italic">
                  No tasks for this day
                </div>
              )}
            </ul>
          </div>
        )}

        <DaySelectionModal
          show={showMoveModal}
          onClose={() => setShowMoveModal(false)}
          onConfirm={(days) => moveOrCopyTasks(days, true)}
          title="Move Tasks to Days"
        />

        <DaySelectionModal
          show={showCopyModal}
          onClose={() => setShowCopyModal(false)}
          onConfirm={(days) => moveOrCopyTasks(days, false)}
          title="Copy Tasks to Days"
        />

        {showBulkModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-xl font-bold text-purple-600 mb-2">
                Bulk Add Tasks
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                Enter one task per line:
              </p>
              <textarea
                value={bulkTasksText}
                onChange={(e) => setBulkTasksText(e.target.value)}
                placeholder="Task 1&#10;Task 2&#10;Task 3"
                className="w-full p-3 border-2 border-gray-300 rounded-lg min-h-[150px] focus:border-purple-600 focus:outline-none mb-4"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowBulkModal(false)}
                  className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={bulkAddTasks}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
                >
                  Add Tasks
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyTaskOrganizer;
