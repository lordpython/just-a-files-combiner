import React from 'react';
import { FileText, X, Eye, Combine, Download, FolderDown, Files } from 'lucide-react';
import JSZip from 'jszip';

interface FileData {
  id: string;
  name: string;
  path: string;
  content: string;
}

interface FileListProps {
  files: FileData[];
  onRemoveFile: (id: string) => void;
  onPreviewFile: (content: string) => void;
  onCombineFiles: () => void;
}

export function FileList({ files, onRemoveFile, onPreviewFile, onCombineFiles }: FileListProps) {
  if (files.length === 0) return null;

  const downloadSingleFile = (file: FileData) => {
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAsZip = async (preserveFolders: boolean) => {
    const zip = new JSZip();
    
    files.forEach(file => {
      // If preserveFolders is false, just use the filename without path
      const filePath = preserveFolders ? file.path : file.name;
      zip.file(filePath, file.content);
    });

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = preserveFolders ? "files-with-folders.zip" : "files.zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Selected Files</h2>
        <div className="flex gap-2">
          <button
            onClick={() => downloadAsZip(true)}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
            title="Download with folder structure"
          >
            <FolderDown className="w-4 h-4" />
            Download with Folders
          </button>
          <button
            onClick={() => downloadAsZip(false)}
            className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600 transition-colors"
            title="Download files only"
          >
            <Files className="w-4 h-4" />
            Download Files Only
          </button>
          <button
            onClick={onCombineFiles}
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
          >
            <Combine className="w-4 h-4" />
            Combine & Download
          </button>
        </div>
      </div>
      <div className="space-y-3">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between bg-gray-50 p-3 rounded-md"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-500" />
              <div>
                <p className="font-medium text-gray-800">{file.name}</p>
                <p className="text-sm text-gray-500">{file.path}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => downloadSingleFile(file)}
                className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
                title="Download"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={() => onPreviewFile(file.content)}
                className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
                title="Preview"
              >
                <Eye className="w-5 h-5" />
              </button>
              <button
                onClick={() => onRemoveFile(file.id)}
                className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                title="Remove"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}