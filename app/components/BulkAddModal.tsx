import React, { useState } from "react";

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-96 transform transition-all scale-100">
        <h3 className="text-xl font-bold text-purple-700 mb-4">
          Bulk Add Tasks
        </h3>
        <p className="text-sm text-gray-500 mb-2">
          Paste multiple tasks (one per line)
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-40 p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-600 mb-4"
          placeholder="Buy milk&#10;Walk the dog&#10;Call mom"
        />
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm(text);
              setText("");
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
          >
            Add Tasks
          </button>
        </div>
      </div>
    </div>
  );
};
