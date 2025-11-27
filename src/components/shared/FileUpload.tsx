import * as React from 'react';
import { useDropzone, Accept } from 'react-dropzone';
import { Upload, File, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: Accept;
  maxSize?: number;
  uploading?: boolean;
  progress?: number;
  error?: string;
  helpText?: string;
}

export function FileUpload({
  onFileSelect,
  accept = { 'text/csv': ['.csv'] },
  maxSize = 5242880, // 5MB
  uploading = false,
  progress = 0,
  error,
  helpText = 'Drag & drop a file here, or click to select',
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    accept,
    maxSize,
    multiple: false,
    disabled: uploading,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setSelectedFile(file);
        onFileSelect(file);
      }
    },
  });

  const removeFile = () => {
    setSelectedFile(null);
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={cn(
          'relative rounded-lg border-2 border-dashed p-8 text-center transition-colors',
          isDragActive && 'border-primary bg-primary/5',
          isDragReject && 'border-destructive bg-destructive/5',
          !isDragActive && !isDragReject && 'border-border hover:border-primary/50',
          uploading && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />

        {!selectedFile ? (
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="rounded-full bg-primary/10 p-4">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">{helpText}</p>
              <p className="text-xs text-muted-foreground">
                Maximum file size: {(maxSize / 1024 / 1024).toFixed(1)}MB
              </p>
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border bg-card p-3">
              <div className="flex items-center space-x-3">
                <div className="rounded bg-primary/10 p-2">
                  <File className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              {!uploading && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {uploading && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-xs text-muted-foreground text-center">
                  Uploading... {progress}%
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
