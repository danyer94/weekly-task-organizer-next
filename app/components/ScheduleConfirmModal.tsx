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
    <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel p-6 rounded-2xl shadow-2xl w-96 transform transition-all scale-100 border border-border-subtle/60 border-l-4 border-l-red-500">
        <div className="flex items-center gap-2 mb-4 text-text-primary">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <h3 className="text-xl font-bold">{title}</h3>
        </div>

        <p className="text-text-secondary mb-6 leading-relaxed">{message}</p>

        <div className="flex flex-wrap gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-400/20 text-text-primary border border-border-subtle rounded-xl hover:bg-gray-400/30 font-medium transition-colors flex items-center gap-2"
          >
            <XCircle className="w-4 h-4" />
            <span>Cancel</span>
          </button>
          <button
            onClick={onNo}
            className="px-4 py-2 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl hover:shadow-lg font-medium transition-colors flex items-center gap-2 transform active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>No</span>
          </button>
          <button
            onClick={onYes}
            className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:shadow-lg font-medium transition-colors flex items-center gap-2 transform active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Yes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
