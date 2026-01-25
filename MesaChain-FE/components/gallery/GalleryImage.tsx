"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface GalleryImageProps {
  src: string;
  alt: string;
  caption?: string;
  onClick?: () => void;
  priority?: boolean;
}

export function GalleryImage({
  src,
  alt,
  caption,
  onClick,
  priority = false,
}: GalleryImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className={cn(
        "group relative aspect-square w-full overflow-hidden bg-muted rounded-md cursor-pointer",
        onClick && "hover:opacity-90 transition-opacity"
      )}
      onClick={onClick}
    >
      {!hasError ? (
        <Image
          src={src}
          alt={alt}
          fill
          className={cn(
            "object-cover transition-all duration-300 group-hover:scale-105",
            isLoading ? "scale-105 blur-sm" : "scale-100 blur-0"
          )}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted text-muted-foreground p-4 text-center">
          <span className="text-sm">Failed to load</span>
        </div>
      )}

      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}

      {caption && !isLoading && !hasError && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100">
          <p className="text-sm truncate">{caption}</p>
        </div>
      )}
    </div>
  );
}
