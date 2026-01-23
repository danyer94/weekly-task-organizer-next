import React, { useState, useRef, useEffect } from "react";
import { Priority } from "@/types";
import { Circle, ChevronDown } from "lucide-react";

interface PrioritySelectorProps {
  priority: Priority;
  setPriority: (priority: Priority) => void;
  className?: string;
  isSmall?: boolean;
}

export const PrioritySelector: React.FC<PrioritySelectorProps> = ({
  priority,
  setPriority,
  className = "",
  isSmall = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const priorities: { value: Priority; label: string; color: string }[] = [
    { value: "high", label: "High", color: "text-red-500" },
    { value: "medium", label: "Medium", color: "text-orange-500" },
    { value: "low", label: "Low", color: "text-green-500" },
  ];

  const selectedPriority = priorities.find((p) => p.value === priority) || priorities[1];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Task priority"
        className={`w-full flex items-center justify-between border border-border-subtle rounded-xl bg-bg-surface/90 text-text-primary focus:border-border-brand transition-colors hover:border-border-hover shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/30 ${
          isSmall ? "p-2 sm:p-2.5 text-sm" : "p-3"
        }`}
      >
        <div className="flex items-center gap-2">
          <Circle className={`${isSmall ? "w-2.5 h-2.5" : "w-3 h-3"} fill-current ${selectedPriority.color}`} />
          <span className="font-medium">{selectedPriority.label}</span>
        </div>
        <ChevronDown className={`${isSmall ? "w-3 h-3" : "w-4 h-4"} text-text-secondary transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 right-0 mt-2 bg-bg-surface/90 border border-border-subtle rounded-xl shadow-xl z-[60] overflow-hidden animate-fade-in motion-reduce:animate-none backdrop-blur"
          role="listbox"
          aria-label="Priority options"
        >
          {priorities.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => {
                setPriority(p.value);
                setIsOpen(false);
              }}
              role="option"
              aria-selected={priority === p.value}
              className={`w-full flex items-center gap-2 hover:bg-bg-main/60 transition-colors ${
                priority === p.value ? "bg-bg-main/60" : ""
              } ${isSmall ? "p-2 text-sm" : "p-3"}`}
            >
              <Circle className={`${isSmall ? "w-2.5 h-2.5" : "w-3 h-3"} fill-current ${p.color}`} />
              <span className={`font-medium ${priority === p.value ? "text-text-primary" : "text-text-secondary"}`}>
                {p.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
