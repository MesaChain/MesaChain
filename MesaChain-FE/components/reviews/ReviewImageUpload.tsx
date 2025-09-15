import React, { useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

interface ReviewImageUploadProps {
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
  disabled?: boolean;
}

export function ReviewImageUpload({ value = [], onChange, className, disabled }: ReviewImageUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (disabled) return;
    // For now, we'll just create object URLs
    const newImages = acceptedFiles.map(file => URL.createObjectURL(file));
    onChange([...value, ...newImages].slice(0, 5));
  }, [value, onChange, disabled]);

  // Cleanup blob URLs on unmount or when value changes
  useEffect(() => {
    return () => {
      value.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [value]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    disabled,
    maxFiles: 5 - value.length,
  });

  const removeImage = (index: number) => {
    if (disabled) return;
    const url = value[index];
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
    const newImages = [...value];
    newImages.splice(index, 1);
    onChange(newImages);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {value.map((image, index) => (
            <div key={image} className="relative aspect-square">
              {image.startsWith('blob:') ? (
                  <Image
                    src={image}
                    alt={`Review image ${index + 1}`}
                    className="rounded-lg object-cover w-full h-full absolute inset-0"
                    unoptimized
                    width={100}
                    height={100}
                    onLoadingComplete={() => URL.revokeObjectURL(image)}
                  />
              ) : (
                <Image
                  src={image}
                  alt={`Review image ${index + 1}`}
                  className="rounded-lg object-cover"
                  fill
                  unoptimized
                />
              )}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -right-2 -top-2"
                onClick={() => removeImage(index)}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {value.length < 5 && (
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          <input {...getInputProps()} />
          <p className="text-sm text-gray-600">
            {isDragActive
              ? 'Drop the images here...'
              : 'Drag and drop images here, or click to select'}
          </p>
        </div>
      )}
    </div>
  );
}