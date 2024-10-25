import React from 'react';
import { X } from 'lucide-react';

interface PreviewModalProps {
  content: string;
  onClose: () => void;
}

export function PreviewModal({ content, onClose }: PreviewModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">File Preview</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <pre className="p-4 overflow-auto max-h-[60vh] text-sm">
          {content}
        </pre>
      </div>
    </div>
  );
}