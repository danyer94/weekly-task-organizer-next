import React from "react";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

interface ScheduleConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onYes: () => void;
  onNo: () => void;
  onCancel: () => void;
}

export const ScheduleConfirmModal: React.FC<ScheduleConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onYes,
  onNo,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/50 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in motion-reduce:animate-none overscroll-contain">
      <div className="glass-panel p-6 rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-border-subtle/70 border-l-2 border-l-red-400">
        <div className="flex items-center gap-2 mb-4 text-text-primary">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <h3 className="text-xl font-bold">{title}</h3>
        </div>

        <p className="text-text-secondary mb-6 leading-relaxed">{message}</p>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            onClick={onCancel}
            className="w-full sm:w-auto px-4 py-2 bg-bg-main/60 text-text-primary border border-border-subtle rounded-xl hover:bg-bg-main/80 font-medium transition-colors flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40"
          >
            <XCircle className="w-4 h-4" />
            <span>Cancel</span>
          </button>
          <button
            onClick={onNo}
            className="w-full sm:w-auto px-4 py-2 bg-slate-600 text-white rounded-xl hover:bg-slate-700 font-medium transition-colors flex items-center justify-center gap-2 transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>No</span>
          </button>
          <button
            onClick={onYes}
            className="w-full sm:w-auto px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 font-medium transition-colors flex items-center justify-center gap-2 transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Yes</span>
          </button>
        </div>

      </div>
    </div>
  );
};
