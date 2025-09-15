import { useState } from 'react';
import Image from 'next/image';
import { X, Upload, AlertCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface MediaUploaderProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  className?: string;
}

export function MediaUploader({
  files,
  onFilesChange,
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024, // 5MB
  className,
}: MediaUploaderProps) {
  const [error, setError] = useState<string>('');

  const onDrop = (acceptedFiles: File[], rejectedFiles: any[]) => {
    setError('');

    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles[0].errors;
      if (errors[0]?.code === 'file-too-large') {
        setError(`File is too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
      } else if (errors[0]?.code === 'file-invalid-type') {
        setError('Only image files are allowed (JPEG, PNG, GIF)');
      } else {
        setError('Invalid file');
      }
      return;
    }

    const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles);
    onFilesChange(newFiles);
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
    },
    maxSize,
    maxFiles: maxFiles - files.length,
    disabled: files.length >= maxFiles,
  });

  return (
    <div className={cn('space-y-4', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-gray-200 hover:border-primary/50',
          files.length >= maxFiles && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        <Upload
          className={cn(
            'mx-auto h-12 w-12',
            isDragActive ? 'text-primary' : 'text-gray-400'
          )}
        />
        <div className="mt-4">
          <p className="text-sm font-medium">
            {files.length >= maxFiles
              ? 'Maximum number of files reached'
              : 'Drag & drop images here, or click to select'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Max {maxFiles} images, {maxSize / 1024 / 1024}MB each (JPEG, PNG, GIF)
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-500">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {files.map((file, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden group"
            >
              <Image
                src={URL.createObjectURL(file)}
                alt={`Preview ${index + 1}`}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 bg-black/50 hover:bg-black/70"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                >
                  <X className="h-4 w-4 text-white" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}