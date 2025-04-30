
import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, File, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
  isUploading?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFilesSelected,
  multiple = true,
  accept = '.csv',
  isUploading = false
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = multiple 
        ? Array.from(e.dataTransfer.files).filter(file => file.name.endsWith('.csv'))
        : [e.dataTransfer.files[0]];
        
      setSelectedFiles(prev => [...prev, ...files]);
      onFilesSelected(files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files.length > 0) {
      const files = multiple 
        ? Array.from(e.target.files)
        : [e.target.files[0]];
        
      setSelectedFiles(prev => [...prev, ...files]);
      onFilesSelected(files);
    }
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          dragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary/50"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
        
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="rounded-full bg-primary/10 p-3">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-medium text-sm">
              Drag and drop CSV files here, or click to browse
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Supports CSV files only
            </p>
          </div>
        </div>
      </div>
      
      {selectedFiles.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium mb-2">Selected Files:</p>
          <ul className="space-y-2">
            {selectedFiles.map((file, index) => (
              <li key={`${file.name}-${index}`} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                <div className="flex items-center space-x-2">
                  <File className="h-4 w-4 text-gray-500" />
                  <span className="text-sm truncate max-w-xs">{file.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
