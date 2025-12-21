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
      <h4 className="font-bold text-text-brand mb-3">Quick Actions</h4>
      <button
        onClick={onClearCompleted}
        className="w-full p-2 mb-2 bg-bg-surface border-2 border-sapphire-600 text-sapphire-600 rounded-lg font-semibold hover:bg-sapphire-600 hover:text-white transition-all text-sm flex items-center justify-center gap-2"
      >
        <Trash2 className="w-4 h-4" />
        <span>Clear Completed</span>
      </button>
      <button
        onClick={onBulkAdd}
        className="w-full p-2 mb-2 bg-bg-surface border-2 border-sapphire-600 text-sapphire-600 rounded-lg font-semibold hover:bg-sapphire-600 hover:text-white transition-all text-sm flex items-center justify-center gap-2"
      >
        <FilePlus2 className="w-4 h-4" />
        <span>Bulk Add</span>
      </button>

      <h4 className="font-bold text-text-brand mb-2 mt-4">Export / Import</h4>
      <button
        onClick={onExportWhatsApp}
        className="w-full p-2 mb-2 bg-bg-surface border-2 border-green-500 text-green-600 rounded-lg font-semibold hover:bg-green-500 hover:text-white transition-all text-sm flex items-center justify-center gap-2"
      >
        <MessageCircle className="w-4 h-4" />
        <span>WhatsApp</span>
      </button>
      <button
        onClick={onExportJSON}
        className="w-full p-2 mb-2 bg-bg-surface border-2 border-blue-500 text-blue-600 rounded-lg font-semibold hover:bg-blue-500 hover:text-white transition-all text-sm flex items-center justify-center gap-2"
      >
        <Save className="w-4 h-4" />
        <span>Backup</span>
      </button>
      <label className="w-full p-2 mb-2 bg-bg-surface border-2 border-orange-500 text-orange-600 rounded-lg font-semibold hover:bg-orange-500 hover:text-white transition-all text-sm cursor-pointer text-center flex items-center justify-center gap-2">
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
