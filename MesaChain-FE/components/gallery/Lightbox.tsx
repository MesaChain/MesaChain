"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LightboxProps {
    image: {
        src: string;
        alt: string;
        caption?: string;
    };
    nextImage?: {
        src: string;
        alt: string;
    };
    prevImage?: {
        src: string;
        alt: string;
    };
    onClose: () => void;
    onNext: () => void;
    onPrev: () => void;
    hasNext: boolean;
    hasPrev: boolean;
    currentIndex: number;
    totalCount: number;
    renderCaption?: (image: { src: string; alt: string; caption?: string }) => React.ReactNode;
}

export function Lightbox({
    image,
    nextImage,
    prevImage,
    onClose,
    onNext,
    onPrev,
    hasNext,
    hasPrev,
    currentIndex,
    totalCount,
    renderCaption,
}: LightboxProps) {
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    // Keyboard navigation
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowRight" && hasNext) onNext();
            if (e.key === "ArrowLeft" && hasPrev) onPrev();
        },
        [onClose, onNext, onPrev, hasNext, hasPrev]
    );

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "unset";
        };
    }, [handleKeyDown]);

    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe && hasNext) {
            onNext();
        }
        if (isRightSwipe && hasPrev) {
            onPrev();
        }
    };

    const innerRef = useRef<HTMLDivElement>(null);

    const handleBackdropClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;

        // If clicking the image element, only close if clicking the "letterbox" (empty) area
        if (target.tagName === 'IMG') {
            const img = target as HTMLImageElement;
            // If natural dimensions aren't available yet effectively treats as full box (so doesn't close)
            // or we can just let it close? safe to assume loaded if we are clicking it.
            if (img.naturalWidth === 0) return;

            const rect = img.getBoundingClientRect();
            const naturalRatio = img.naturalWidth / img.naturalHeight;
            const visibleRatio = rect.width / rect.height;

            let paintedWidth = rect.width;
            let paintedHeight = rect.height;

            if (naturalRatio > visibleRatio) {
                // Image is constrained by width, so it's vertically centered with letterboxing
                paintedHeight = rect.width / naturalRatio;
            } else {
                // Image is constrained by height, so it's horizontally centered with letterboxing
                paintedWidth = rect.height * naturalRatio;
            }

            const xOffset = (rect.width - paintedWidth) / 2;
            const yOffset = (rect.height - paintedHeight) / 2;

            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;

            // Check if click is inside the painted area
            if (
                clickX >= xOffset &&
                clickX <= (xOffset + paintedWidth) &&
                clickY >= yOffset &&
                clickY <= (yOffset + paintedHeight)
            ) {
                return; // Clicked on the image pixels, do nothing
            }
        }

        // If we got here, we clicked outside the interactive parts (caption/buttons handle their own stopProp)
        onClose();
    };

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm transition-all duration-300"
            onClick={handleBackdropClick}
            aria-modal="true"
            role="dialog"
            aria-label="Image gallery lightbox"
        >
            <div className="absolute top-4 left-4 z-50 text-white/80 bg-black/40 px-3 py-1 rounded-full text-sm">
                {currentIndex + 1} / {totalCount}
            </div>

            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-50 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Close lightbox"
            >
                <X className="h-6 w-6" />
            </button>

            {hasPrev && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onPrev();
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-50 rounded-full bg-black/50 p-3 text-white hover:bg-black/70 transition-colors focus:outline-none focus:ring-2 focus:ring-white hidden md:block"
                    aria-label="Previous image"
                >
                    <ChevronLeft className="h-8 w-8" />
                </button>
            )}

            {hasNext && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onNext();
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-50 rounded-full bg-black/50 p-3 text-white hover:bg-black/70 transition-colors focus:outline-none focus:ring-2 focus:ring-white hidden md:block"
                    aria-label="Next image"
                >
                    <ChevronRight className="h-8 w-8" />
                </button>
            )}

            <div
                ref={innerRef}
                className="relative w-full h-full max-w-[90vw] max-h-[90vh] flex flex-col items-center justify-center"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                <div className="relative w-full h-full flex-1 min-h-0">
                    <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        className="object-contain"
                        priority
                        sizes="90vw"
                    />
                </div>

                {image.caption && (
                    <div
                        className="w-full bg-black/50 p-4 text-center mt-4 rounded-b-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <p className="text-white text-lg">{image.caption}</p>
                    </div>
                )}
            </div>

            {/* Hidden images for preloading */}
            <div className="hidden">
                {nextImage && (
                    <Image src={nextImage.src} alt="preload next" width={1} height={1} priority />
                )}
                {prevImage && (
                    <Image src={prevImage.src} alt="preload prev" width={1} height={1} priority />
                )}
            </div>
        </div>
    );
}
