import React, { useState } from "react";
import { FilePlus2, CheckCircle2, XCircle } from "lucide-react";

interface BulkAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (text: string) => void;
}

export const BulkAddModal: React.FC<BulkAddModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [text, setText] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/50 flex items-center justify-center z-50 backdrop-blur-sm overscroll-contain">
      <div className="glass-panel p-6 rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-border-subtle/70">
        <div className="flex items-center gap-2 mb-4 text-text-primary">
          <FilePlus2 className="w-6 h-6" />
          <h3 className="text-xl font-bold">Bulk Add Tasks</h3>
        </div>
        <p className="text-sm text-text-secondary mb-2">
          Paste multiple tasks (one per line)
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          name="bulkTasks"
          autoComplete="off"
          aria-label="Bulk task list"
          className="w-full h-40 p-3 border border-border-subtle rounded-xl focus:outline-none focus:border-border-brand focus-visible:ring-2 focus-visible:ring-border-brand/30 mb-4 bg-bg-main/70 text-text-primary"
          placeholder="Buy milk&#10;Walk the dog&#10;Call mom"
        />
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 bg-bg-main/60 text-text-primary border border-border-subtle rounded-xl hover:bg-bg-main/80 font-medium transition-colors flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40"
          >
            <XCircle className="w-4 h-4" />
            <span>Cancel</span>
          </button>
          <button
            onClick={() => {
              onConfirm(text);
              setText("");
            }}
            className="w-full sm:w-auto px-4 py-2 bg-sapphire-700 text-white rounded-xl hover:bg-sapphire-600 font-medium transition-colors flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Add Tasks</span>
          </button>
        </div>

      </div>
    </div>
  );
};
