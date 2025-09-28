export interface GalleryImage {
  src: string;
  alt: string;
  caption?: string;
  highResSrc?: string; // For lightbox display
}

export interface ImageGalleryProps {
  images: GalleryImage[];
  columns?: number;
  gap?: string;
  enableLightbox?: boolean;
  className?: string;
  onImageClick?: (image: GalleryImage, index: number) => void;
  onGalleryOpen?: (index: number) => void;
  onGalleryClose?: () => void;
  onImageChange?: (index: number) => void;
}

export interface LightboxProps {
  images: GalleryImage[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onImageChange?: (index: number) => void;
}

export type GalleryLayout = 'grid' | 'masonry';