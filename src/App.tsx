import React, { useState, useCallback } from 'react';
import { FileUploader } from './components/FileUploader';
import { FileList } from './components/FileList';
import { PreviewModal } from './components/PreviewModal';

interface FileData {
  id: string;
  name: string;
  path: string;
  content: string;
}

function App() {
  const [files, setFiles] = useState<FileData[]>([]);
  const [previewContent, setPreviewContent] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);

  const handleFilesSelected = useCallback((newFiles: FileData[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  }, []);

  const previewFile = useCallback((content: string) => {
    setPreviewContent(content);
    setShowPreview(true);
  }, []);

  const combineAndDownload = useCallback(() => {
    if (files.length === 0) return;

    const combined = files
      .map((file) => `// File: ${file.path}\n\n${file.content}\n\n`)
      .join('// ------------------------\n\n');

    const blob = new Blob([combined], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'combined_files.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [files]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">File Combiner Pro</h1>
          <p className="text-gray-600">Combine multiple text files into one with path preservation</p>
        </div>

        <FileUploader onFilesSelected={handleFilesSelected} />
        
        <FileList
          files={files}
          onRemoveFile={removeFile}
          onPreviewFile={previewFile}
          onCombineFiles={combineAndDownload}
        />

        {showPreview && (
          <PreviewModal
            content={previewContent}
            onClose={() => setShowPreview(false)}
          />
        )}
      </div>
    </div>
  );
}

export default App;