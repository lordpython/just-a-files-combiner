import React, { useCallback, useRef } from 'react';
import { Upload } from 'lucide-react';

interface FileUploaderProps {
  onFilesSelected: (files: FileData[]) => void;
}

interface FileData {
  id: string;
  name: string;
  path: string;
  content: string;
}

// Excluded paths and folders
const EXCLUDED_PATHS = [
  'node_modules',
  'public',
  'dist',
  '.bolt',
  'package-lock.json'
];

const isExcluded = (path: string): boolean => {
  // Split the path into segments and check if any segment matches excluded paths
  const segments = path.split('/');
  return segments.some(segment => EXCLUDED_PATHS.includes(segment));
};

async function getAllFileEntries(dataTransferItemList: DataTransferItemList): Promise<FileSystemEntry[]> {
  const fileEntries: FileSystemEntry[] = [];
  const queue: FileSystemEntry[] = [];

  // Initial push of items to queue
  for (let i = 0; i < dataTransferItemList.length; i++) {
    queue.push(dataTransferItemList[i].webkitGetAsEntry() as FileSystemEntry);
  }

  while (queue.length > 0) {
    const entry = queue.shift()!;
    const path = entry.fullPath.slice(1);

    if (isExcluded(path)) {
      continue; // Skip this entry and its children if it's in an excluded path
    }

    if (entry.isFile) {
      fileEntries.push(entry);
    } else if (entry.isDirectory) {
      const dirReader = (entry as FileSystemDirectoryEntry).createReader();
      const entries = await new Promise<FileSystemEntry[]>((resolve) => {
        dirReader.readEntries((entries) => resolve(entries));
      });
      queue.push(...entries);
    }
  }

  return fileEntries;
}

async function readFileContent(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.readAsText(file);
  });
}

export function FileUploader({ onFilesSelected }: FileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFileEntry = async (entry: FileSystemEntry): Promise<FileData | null> => {
    if (entry.isFile) {
      const fileEntry = entry as FileSystemFileEntry;
      const file: File = await new Promise((resolve) => fileEntry.file(resolve));
      try {
        const path = entry.fullPath.slice(1);
        if (isExcluded(path)) return null;
        
        const content = await readFileContent(file);
        return {
          id: Math.random().toString(36).substring(7),
          name: file.name,
          path,
          content,
        };
      } catch (error) {
        console.error(`Error reading file ${file.name}:`, error);
        return null;
      }
    }
    return null;
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    
    const items = e.dataTransfer.items;
    if (!items) return;

    const entries = await getAllFileEntries(items);
    const filePromises = entries.map(processFileEntry);
    const files = (await Promise.all(filePromises)).filter((file): file is FileData => file !== null);
    
    onFilesSelected(files);
  }, [onFilesSelected]);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const fileDataPromises = Array.from(files)
      .filter(file => !isExcluded(file.webkitRelativePath || file.name))
      .map(async (file) => {
        const content = await readFileContent(file);
        return {
          id: Math.random().toString(36).substring(7),
          name: file.name,
          path: file.webkitRelativePath || file.name,
          content,
        };
      });

    const fileData = await Promise.all(fileDataPromises);
    onFilesSelected(fileData);
  }, [onFilesSelected]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div
      className="border-2 border-dashed border-blue-300 rounded-lg p-8 mb-6 bg-white transition-all hover:border-blue-400"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="text-center">
        <Upload className="w-12 h-12 text-blue-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">Drag and drop files or folders here, or</p>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          Select Files
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          webkitdirectory=""
          directory=""
        />
        <p className="text-sm text-gray-500 mt-2">
          Excluded: node_modules, public, dist, .bolt, package-lock.json
        </p>
      </div>
    </div>
  );
}