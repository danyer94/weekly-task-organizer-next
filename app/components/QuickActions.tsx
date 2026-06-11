import React from "react";
import { Trash2, FilePlus2, MessageCircle, Bell } from "lucide-react";


interface QuickActionsProps {
  onClearCompleted: () => void;
  onBulkAdd: () => void;
  onExportWhatsApp: () => void;

  onSendDailySummary: () => void;
  isSendingDailySummary?: boolean;
  className?: string; // To allow hiding/showing based on breakpoints
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onClearCompleted,
  onBulkAdd,
  onExportWhatsApp,

  onSendDailySummary,
  isSendingDailySummary = false,
  className = "",
}) => {
  return (
    <div className={className}>
      <h4 className="font-semibold text-text-secondary mb-3 uppercase tracking-[0.3em] text-xs">
        Quick Actions
      </h4>
      <button
        onClick={onSendDailySummary}
        disabled={isSendingDailySummary}
        className={`w-full px-3 py-2.5 sm:p-3 mb-2 rounded-xl font-semibold transition-colors transition-transform text-sm flex items-center justify-center gap-2 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40 ${
          isSendingDailySummary
            ? "glass-subpanel text-text-tertiary cursor-not-allowed"
            : "glass-button-amber text-amber-900 hover:bg-amber-50/70"
        }`}
      >
        <Bell className="w-4 h-4" />
        <span className="truncate">{isSendingDailySummary ? "Sending…" : "Send Daily Summary"}</span>
      </button>
      <button
        onClick={onClearCompleted}
        className="glass-control w-full px-3 py-2.5 sm:p-3 mb-2 text-text-primary rounded-xl font-semibold transition-colors transition-transform text-sm flex items-center justify-center gap-2 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40"
      >
        <Trash2 className="w-4 h-4" />
        <span className="truncate">Clear Completed</span>
      </button>
      <button
        onClick={onBulkAdd}
        className="glass-control w-full px-3 py-2.5 sm:p-3 mb-2 text-text-primary rounded-xl font-semibold transition-colors transition-transform text-sm flex items-center justify-center gap-2 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40"
      >
        <FilePlus2 className="w-4 h-4" />
        <span className="truncate">Bulk Add</span>
      </button>
      <h4 className="font-semibold text-text-secondary mb-2 mt-4 uppercase tracking-[0.3em] text-xs">
        Export
      </h4>
      <button
        onClick={onExportWhatsApp}
        className="glass-button-emerald w-full px-3 py-2.5 sm:p-3 mb-2 text-emerald-900 rounded-xl font-semibold transition-colors transition-transform text-sm flex items-center justify-center gap-2 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60"
      >
        <MessageCircle className="w-4 h-4" />
        <span className="truncate">WhatsApp</span>
      </button>


    </div>
  );
};
