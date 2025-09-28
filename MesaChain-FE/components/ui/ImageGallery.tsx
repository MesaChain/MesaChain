'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ImageGalleryProps, GalleryImage } from '@/types/gallery';
import { Lightbox } from './Lightbox';
import { ImageSkeleton } from './ImageSkeleton';

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  columns = 3,
  gap = '8px',
  enableLightbox = true,
  className,
  onImageClick,
  onGalleryOpen,
  onGalleryClose,
  onImageChange,
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>({});
  const [errorStates, setErrorStates] = useState<Record<number, boolean>>({});
  const [intersectionObserver, setIntersectionObserver] = useState<IntersectionObserver | null>(null);



  // Initialize intersection observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const imageIndex = parseInt(entry.target.getAttribute('data-index') || '0');
            setLoadingStates(prev => ({ ...prev, [imageIndex]: true }));
            // Unobserve once we start loading
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '100px', // Start loading earlier
        threshold: 0.1,
      }
    );

    setIntersectionObserver(observer);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Auto-load first few images immediately
  useEffect(() => {
    if (images.length > 0) {
      // Load first 3 images immediately
      const initialImages = Math.min(3, images.length);
      for (let i = 0; i < initialImages; i++) {
        setLoadingStates(prev => ({ ...prev, [i]: true }));
      }
    }
  }, [images]);

  const handleImageClick = useCallback((image: GalleryImage, index: number) => {
    if (onImageClick) {
      onImageClick(image, index);
    }

    if (enableLightbox) {
      setCurrentImageIndex(index);
      setLightboxOpen(true);
      if (onGalleryOpen) {
        onGalleryOpen(index);
      }
    }
  }, [onImageClick, enableLightbox, onGalleryOpen]);

  const handleLightboxClose = useCallback(() => {
    setLightboxOpen(false);
    if (onGalleryClose) {
      onGalleryClose();
    }
  }, [onGalleryClose]);

  const handleLightboxNext = useCallback(() => {
    const nextIndex = (currentImageIndex + 1) % images.length;
    setCurrentImageIndex(nextIndex);
    if (onImageChange) {
      onImageChange(nextIndex);
    }
  }, [currentImageIndex, images.length, onImageChange]);

  const handleLightboxPrevious = useCallback(() => {
    const prevIndex = currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1;
    setCurrentImageIndex(prevIndex);
    if (onImageChange) {
      onImageChange(prevIndex);
    }
  }, [currentImageIndex, images.length, onImageChange]);

  const handleImageLoad = useCallback((index: number) => {
    setLoadingStates(prev => ({ ...prev, [index]: false }));
    setErrorStates(prev => ({ ...prev, [index]: false }));
  }, []);

  const handleImageError = useCallback((index: number) => {
    setLoadingStates(prev => ({ ...prev, [index]: false }));
    setErrorStates(prev => ({ ...prev, [index]: true }));
  }, []);

  // Empty state
  if (!images || images.length === 0) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center p-8 text-center",
        "bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700",
        className
      )}>
        <div className="text-gray-400 dark:text-gray-600 mb-2">
          <svg
            className="w-12 h-12 mx-auto"
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
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
          No images to display
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Add some images to see them in the gallery
        </p>
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(
          "grid auto-rows-max",
          // Responsive grid classes
          columns === 1 && "grid-cols-1",
          columns === 2 && "grid-cols-1 sm:grid-cols-2",
          columns === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
          columns === 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
          columns >= 5 && "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
          className
        )}
        style={{ gap }}
        role="region"
        aria-label="Image gallery"
      >
        {images.map((image, index) => (
          <div
            key={`${image.src}-${index}`}
            className="relative group cursor-pointer overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-800 transition-transform duration-200 hover:scale-105"
            onClick={() => handleImageClick(image, index)}
            role="button"
            tabIndex={0}
            aria-label={`View image: ${image.alt}${image.caption ? ` - ${image.caption}` : ''}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleImageClick(image, index);
              }
            }}
            data-index={index}
            ref={(el) => {
              if (el && intersectionObserver) {
                intersectionObserver.observe(el);
              }
            }}
          >
            {/* Loading skeleton */}
            {(loadingStates[index] === undefined || loadingStates[index]) && !errorStates[index] && (
              <ImageSkeleton />
            )}

            {/* Error state */}
            {errorStates[index] && (
              <div className="aspect-square flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                <div className="text-center text-gray-400 dark:text-gray-600">
                  <svg
                    className="w-8 h-8 mx-auto mb-2"
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
                  <p className="text-xs">Failed to load</p>
                </div>
              </div>
            )}

            {/* Actual image - only render when loading is triggered */}
            {(loadingStates[index] || loadingStates[index] === false) && !errorStates[index] && (
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover transition-opacity duration-200"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                onLoad={() => handleImageLoad(index)}
                onError={() => handleImageError(index)}
                loading={index < 3 ? "eager" : "lazy"} // Load first 3 images eagerly
                quality={75}
              />
            )}

            {/* Overlay with caption */}
            {image.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <p className="text-white text-sm font-medium line-clamp-2">
                  {image.caption}
                </p>
              </div>
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <svg
                  className="w-8 h-8 text-white drop-shadow-lg"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                  />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {enableLightbox && (
        <Lightbox
          images={images}
          currentIndex={currentImageIndex}
          isOpen={lightboxOpen}
          onClose={handleLightboxClose}
          onNext={handleLightboxNext}
          onPrevious={handleLightboxPrevious}
          onImageChange={onImageChange}
        />
      )}
    </>
  );
};

export default ImageGallery;