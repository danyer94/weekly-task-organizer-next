import React from "react";
import { Trash2, FilePlus2, MessageCircle, Save, FolderOpen } from "lucide-react";

interface QuickActionsProps {
  onClearCompleted: () => void;
  onBulkAdd: () => void;
  onExportWhatsApp: () => void;
  onExportJSON: () => void;
  onImportJSON: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string; // To allow hiding/showing based on breakpoints
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onClearCompleted,
  onBulkAdd,
  onExportWhatsApp,
  onExportJSON,
  onImportJSON,
  className = "",
}) => {
  return (
    <div className={className}>
      <h4 className="font-bold text-text-brand mb-3 uppercase tracking-[0.3em] text-xs">
        Quick Actions
      </h4>
      <button
        onClick={onClearCompleted}
        className="w-full p-2.5 mb-2 bg-bg-main/60 border border-sapphire-500/60 text-sapphire-500 rounded-xl font-semibold hover:bg-sapphire-500/90 hover:text-white transition-all text-sm flex items-center justify-center gap-2 hover:-translate-y-0.5"
      >
        <Trash2 className="w-4 h-4" />
        <span>Clear Completed</span>
      </button>
      <button
        onClick={onBulkAdd}
        className="w-full p-2.5 mb-2 bg-bg-main/60 border border-sapphire-500/60 text-sapphire-500 rounded-xl font-semibold hover:bg-sapphire-500/90 hover:text-white transition-all text-sm flex items-center justify-center gap-2 hover:-translate-y-0.5"
      >
        <FilePlus2 className="w-4 h-4" />
        <span>Bulk Add</span>
      </button>

      <h4 className="font-bold text-text-brand mb-2 mt-4 uppercase tracking-[0.3em] text-xs">
        Export / Import
      </h4>
      <button
        onClick={onExportWhatsApp}
        className="w-full p-2.5 mb-2 bg-bg-main/60 border border-emerald-500/60 text-emerald-500 rounded-xl font-semibold hover:bg-emerald-500/90 hover:text-white transition-all text-sm flex items-center justify-center gap-2 hover:-translate-y-0.5"
      >
        <MessageCircle className="w-4 h-4" />
        <span>WhatsApp</span>
      </button>
      <button
        onClick={onExportJSON}
        className="w-full p-2.5 mb-2 bg-bg-main/60 border border-blue-500/60 text-blue-500 rounded-xl font-semibold hover:bg-blue-500/90 hover:text-white transition-all text-sm flex items-center justify-center gap-2 hover:-translate-y-0.5"
      >
        <Save className="w-4 h-4" />
        <span>Backup</span>
      </button>
      <label className="w-full p-2.5 mb-2 bg-bg-main/60 border border-orange-500/60 text-orange-500 rounded-xl font-semibold hover:bg-orange-500/90 hover:text-white transition-all text-sm cursor-pointer text-center flex items-center justify-center gap-2 hover:-translate-y-0.5">
        <FolderOpen className="w-4 h-4" />
        <span>Restore</span>
        <input
          type="file"
          accept=".json"
          onChange={onImportJSON}
          className="hidden"
        />
      </label>
    </div>
  );
};
