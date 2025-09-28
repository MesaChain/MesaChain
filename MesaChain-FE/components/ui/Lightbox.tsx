'use client';

import React, { useEffect, useCallback, useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogOverlay, DialogPortal } from './dialog';
import { cn } from '@/lib/utils';
import { LightboxProps } from '@/types/gallery';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';

export const Lightbox: React.FC<LightboxProps> = ({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNext,
  onPrevious,
  onImageChange: _onImageChange,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const currentImage = images[currentIndex];
  const totalImages = images.length;

  // Preload adjacent images for smooth navigation
  useEffect(() => {
    if (isOpen && images.length > 1) {
      const preloadIndexes = [
        (currentIndex + 1) % images.length,
        currentIndex === 0 ? images.length - 1 : currentIndex - 1,
      ];

      preloadIndexes.forEach(index => {
        const img = new window.Image();
        const src = images[index].highResSrc || images[index].src;
        img.src = src;
      });
    }
  }, [currentIndex, images, isOpen]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        onPrevious();
        break;
      case 'ArrowRight':
        e.preventDefault();
        onNext();
        break;
      case ' ':
        e.preventDefault();
        onNext();
        break;
    }
  }, [isOpen, onClose, onNext, onPrevious]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Touch/swipe handling
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      onNext();
    } else if (isRightSwipe) {
      onPrevious();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setImageError(true);
  };

  const handleDownload = async () => {
    if (!currentImage) return;

    const imageSrc = currentImage.highResSrc || currentImage.src;
    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = `image-${currentIndex + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetImageState = () => {
    setIsLoading(true);
    setImageError(false);
    setIsZoomed(false);
    setZoomLevel(1);
  };

  // Reset image state when image changes
  useEffect(() => {
    resetImageState();
  }, [currentIndex]);

  if (!isOpen || !currentImage) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay className="bg-black/90 backdrop-blur-sm" />
        <DialogContent
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center",
            "bg-transparent border-none shadow-none p-0 max-w-none h-full w-full translate-y-0 translate-x-0",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          )}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className={cn(
              "absolute top-4 right-4 z-10",
              "flex items-center justify-center w-10 h-10",
              "bg-black/50 hover:bg-black/70 rounded-full transition-colors",
              "text-white"
            )}
            aria-label="Close lightbox"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Navigation buttons */}
          {totalImages > 1 && (
            <>
              <button
                onClick={onPrevious}
                className={cn(
                  "absolute left-4 top-1/2 -translate-y-1/2 z-10",
                  "flex items-center justify-center w-12 h-12",
                  "bg-black/50 hover:bg-black/70 rounded-full transition-colors",
                  "text-white"
                )}
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={onNext}
                className={cn(
                  "absolute right-4 top-1/2 -translate-y-1/2 z-10",
                  "flex items-center justify-center w-12 h-12",
                  "bg-black/50 hover:bg-black/70 rounded-full transition-colors",
                  "text-white"
                )}
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Image counter */}
          {totalImages > 1 && (
            <div className="absolute top-4 left-4 z-10 bg-black/50 rounded-full px-3 py-1 text-white text-sm">
              {currentIndex + 1} of {totalImages}
            </div>
          )}

          {/* Action buttons */}
          <div className="absolute top-4 right-16 z-10 flex gap-2">
            <button
              onClick={handleDownload}
              className={cn(
                "flex items-center justify-center w-10 h-10",
                "bg-black/50 hover:bg-black/70 rounded-full transition-colors",
                "text-white"
              )}
              aria-label="Download image"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>

          {/* Main image container */}
          <div className="relative w-full h-full flex items-center justify-center p-4 md:p-8 lg:p-12 ">
            {/* Loading indicator */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
              </div>
            )}

            {/* Error state */}
            {imageError && (
              <div className="text-center text-white">
                <div className="text-red-400 mb-2">
                  <svg
                    className="w-12 h-12 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-1">Failed to load image</h3>
                <p className="text-gray-300 text-sm">The image could not be displayed</p>
              </div>
            )}

            {/* Main image */}
            {!imageError && (
              <div className="relative flex items-center justify-center w-full h-full ">
                <Image
                  src={currentImage.highResSrc || currentImage.src}
                  alt={currentImage.alt}
                  width={1200}
                  height={800}
                  className={cn(
                    "max-w-full max-h-full w-auto h-auto object-contain transition-transform duration-200",
                    isZoomed && "cursor-zoom-out",
                    !isZoomed && "cursor-zoom-in"
                  )}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  priority
                  quality={95}
                  style={{
                    transform: `scale(${zoomLevel})`,
                    maxHeight: 'calc(100vh - 8rem)',
                    maxWidth: 'calc(100vw - 8rem)',
                  }}
                  onClick={() => {
                    if (isZoomed) {
                      setIsZoomed(false);
                      setZoomLevel(1);
                    } else {
                      setIsZoomed(true);
                      setZoomLevel(1.5);
                    }
                  }}
                />
              </div>
            )}
          </div>

          {/* Caption */}
          {currentImage.caption && (
            <div className="absolute bottom-4 left-4 right-4 z-10">
              <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 max-w-2xl mx-auto">
                <p className="text-white text-sm text-center">{currentImage.caption}</p>
              </div>
            </div>
          )}

          {/* Touch indicators for mobile */}
          <div className="absolute inset-y-0 left-0 w-1/3 flex items-center justify-center md:hidden">
            <div className="text-white/30 text-xs">Swipe left</div>
          </div>
          <div className="absolute inset-y-0 right-0 w-1/3 flex items-center justify-center md:hidden">
            <div className="text-white/30 text-xs">Swipe right</div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};