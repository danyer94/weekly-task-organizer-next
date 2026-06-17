import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
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
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const priorities: { value: Priority; label: string; color: string }[] = [
    { value: "high", label: "High", color: "text-red-500" },
    { value: "medium", label: "Medium", color: "text-orange-500" },
    { value: "low", label: "Low", color: "text-green-500" },
  ];

  const selectedPriority = priorities.find((p) => p.value === priority) || priorities[1];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        popoverRef.current &&
        !popoverRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const updatePopoverPosition = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const gap = 8;
      const width = Math.min(Math.max(rect.width, 180), window.innerWidth - 24);
      const left = Math.min(Math.max(12, rect.left), window.innerWidth - width - 12);
      const estimatedHeight = isSmall ? 132 : 156;
      const spaceBelow = window.innerHeight - rect.bottom;
      const top =
        spaceBelow < estimatedHeight && rect.top > estimatedHeight
          ? rect.top - estimatedHeight - gap
          : rect.bottom + gap;

      setPopoverStyle({
        position: "fixed",
        top,
        left,
        width,
      });
    };

    updatePopoverPosition();
    window.addEventListener("resize", updatePopoverPosition);
    window.addEventListener("scroll", updatePopoverPosition, true);

    return () => {
      window.removeEventListener("resize", updatePopoverPosition);
      window.removeEventListener("scroll", updatePopoverPosition, true);
    };
  }, [isOpen, isSmall]);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Task priority"
        className={`glass-control w-full flex items-center justify-between rounded-xl text-text-primary focus:border-border-brand transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/30 ${
          isSmall ? "p-2 sm:p-2.5 text-sm" : "p-3"
        }`}
      >
        <div className="flex items-center gap-2">
          <Circle className={`${isSmall ? "w-2.5 h-2.5" : "w-3 h-3"} fill-current ${selectedPriority.color}`} />
          <span className="font-medium">{selectedPriority.label}</span>
        </div>
        <ChevronDown className={`${isSmall ? "w-3 h-3" : "w-4 h-4"} text-text-secondary transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && typeof document !== "undefined" && createPortal(
        <div
          ref={popoverRef}
          style={popoverStyle}
          className="glass-panel rounded-xl shadow-xl z-[1000] overflow-hidden animate-fade-in motion-reduce:animate-none"
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
              className={`w-full flex items-center gap-2 hover:bg-white/35 transition-colors ${
                priority === p.value ? "bg-white/38" : ""
              } ${isSmall ? "p-2 text-sm" : "p-3"}`}
            >
              <Circle className={`${isSmall ? "w-2.5 h-2.5" : "w-3 h-3"} fill-current ${p.color}`} />
              <span className={`font-medium ${priority === p.value ? "text-text-primary" : "text-text-secondary"}`}>
                {p.label}
              </span>
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
};
