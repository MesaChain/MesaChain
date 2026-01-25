"use client";

import { useState } from "react";
import { GalleryImage } from "./GalleryImage";
import { Lightbox } from "./Lightbox";
import { cn } from "@/lib/utils";

export interface GalleryImageType {
    src: string;
    alt: string;
    caption?: string;
    id?: string | number; // Optional ID for stability if available
}

export interface ImageGalleryProps {
    images: GalleryImageType[];
    columns?: number;
    gap?: string;
    enableLightbox?: boolean;
    className?: string;
    // Events
    onGalleryOpen?: (index: number) => void;
    onGalleryClose?: () => void;
    onImageChange?: (index: number) => void;
    // Custom Renderers
    renderCaption?: (image: GalleryImageType) => React.ReactNode;
}

export function ImageGallery({
    images,
    columns = 3,
    gap = "8px",
    enableLightbox = true,
    className,
    onGalleryOpen,
    onGalleryClose,
    onImageChange,
    renderCaption,
}: ImageGalleryProps) {
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    const openLightbox = (index: number) => {
        if (enableLightbox) {
            setLightboxIndex(index);
            onGalleryOpen?.(index);
        }
    };

    const closeLightbox = () => {
        setLightboxIndex(null);
        onGalleryClose?.();
    };

    const nextImage = () => {
        if (lightboxIndex !== null && lightboxIndex < images.length - 1) {
            const newIndex = lightboxIndex + 1;
            setLightboxIndex(newIndex);
            onImageChange?.(newIndex);
        }
    };

    const prevImage = () => {
        if (lightboxIndex !== null && lightboxIndex > 0) {
            const newIndex = lightboxIndex - 1;
            setLightboxIndex(newIndex);
            onImageChange?.(newIndex);
        }
    };

    if (!images || images.length === 0) {
        return (
            <div className="w-full text-center p-8 text-black/50">
                No images to display.
            </div>
        );
    }

    return (
        <div className={cn("w-full", className)}>
            <div
                className="grid w-full"
                style={{
                    gridTemplateColumns: `repeat(auto-fill, minmax(250px, 1fr))`,
                    gap: gap,
                    // We can override this with a explicit grid cols style if strict columns are needed,
                    // but auto-fill is usually more responsive. 
                    // However, if the user explicitly asked for 'columns' prop, we should try to respect it on larger screens.
                }}
            >
                {/*
          Implementation Note: 
          To strictly respect the `columns` prop on larger screens while remaining responsive, 
          we can use a media query style or CSS variable. 
          For simplicity and robustness in this specialized component:
        */}
                <style jsx>{`
          @media (min-width: 768px) {
            .grid {
              grid-template-columns: repeat(${columns}, minmax(0, 1fr)) !important;
            }
          }
           @media (max-width: 767px) {
            .grid {
               grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
            }
          }
        `}</style>

                {images.map((image, index) => (
                    <GalleryImage
                        key={image.id || index}
                        src={image.src}
                        alt={image.alt}
                        caption={image.caption}
                        onClick={() => openLightbox(index)}
                        // Prioritize loading the first few images
                        priority={index < 4}
                    />
                ))}
            </div>

            {enableLightbox && lightboxIndex !== null && (
                <Lightbox
                    image={images[lightboxIndex]}
                    nextImage={lightboxIndex < images.length - 1 ? images[lightboxIndex + 1] : undefined}
                    prevImage={lightboxIndex > 0 ? images[lightboxIndex - 1] : undefined}
                    onClose={closeLightbox}
                    onNext={nextImage}
                    onPrev={prevImage}
                    hasNext={lightboxIndex < images.length - 1}
                    hasPrev={lightboxIndex > 0}
                    currentIndex={lightboxIndex}
                    totalCount={images.length}
                    renderCaption={renderCaption}
                />
            )}
        </div>
    );
}
