import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Textarea } from '../ui/textarea';
import StarRating from './StarRating';
import { ReviewSubmission } from '@/types/reviews';
import { cn } from '@/lib/utils';

interface ReviewFormProps {
  itemId: string;
  itemType: 'DISH' | 'SERVICE' | 'RESTAURANT';
  onSubmit: (review: ReviewSubmission) => Promise<void>;
  className?: string;
}

export function ReviewForm({
  itemId,
  itemType,
  onSubmit,
  className,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setMediaFiles((prev) => [...prev, ...acceptedFiles].slice(0, 5));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 5,
  });

  const removeFile = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (!content.trim()) {
      setError('Please write a review');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        rating,
        content,
        itemId,
        itemType,
        mediaFiles: mediaFiles.length > 0 ? mediaFiles : undefined,
      });

      // Reset form
      setRating(0);
      setContent('');
      setMediaFiles([]);
    } catch (err) {
      setError('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const charCount = content.length;
  const maxChars = 1000;

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
      <div className="space-y-2">
        <label className="text-sm font-medium">Your Rating</label>
        <StarRating
          value={rating}
          size="lg"
          interactive
          onChange={setRating}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Your Review</label>
        <Textarea
          value={content}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
          placeholder="Share your experience..."
          className="min-h-[120px]"
          maxLength={maxChars}
        />
        <div className="flex justify-end">
          <span className="text-sm text-gray-500">
            {charCount}/{maxChars}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Add Photos</label>
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors',
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-gray-200 hover:border-primary/50'
          )}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-8 w-8 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">
            Drag &amp; drop images here, or click to select
          </p>
          <p className="text-xs text-gray-400">
            Max 5 images, 5MB each (JPEG, PNG, GIF)
          </p>
        </div>

        {mediaFiles.length > 0 && (
          <div className="flex gap-2 overflow-x-auto py-2">
            {mediaFiles.map((file, index) => (
              <div
                key={index}
                className="relative h-20 w-20 rounded-md overflow-hidden flex-shrink-0"
              >
                <Image
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 bg-black/50 rounded-full p-0.5 hover:bg-black/70"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  );
}