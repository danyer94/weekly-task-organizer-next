import React from "react";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel p-6 rounded-2xl shadow-2xl w-full max-w-md mx-4 transform transition-all scale-100 border border-border-subtle/60 border-l-4 border-l-red-500">
        <div className="flex items-center gap-2 mb-4 text-text-primary">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <h3 className="text-xl font-bold">{title}</h3>
        </div>
        
        <p className="text-text-secondary mb-6 leading-relaxed">
          {message}
        </p>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 bg-gray-400/20 text-text-primary border border-border-subtle rounded-xl hover:bg-gray-400/30 font-medium transition-colors flex items-center justify-center gap-2"
          >
            <XCircle className="w-4 h-4" />
            <span>Cancel</span>
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:shadow-lg font-medium transition-colors flex items-center justify-center gap-2 transform active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>

      </div>
    </div>
  );
};
