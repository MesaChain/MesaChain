'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ImageSkeletonProps {
  className?: string;
}

export const ImageSkeleton: React.FC<ImageSkeletonProps> = ({ className }) => {
  return (
    <div className={cn("animate-pulse bg-gray-300 dark:bg-gray-700 aspect-square rounded-lg", className)}>
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-gray-400 dark:text-gray-600">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};