import type { Meta, StoryObj } from '@storybook/nextjs';
import ImageGallery from '../ImageGallery';
import { GalleryImage } from '@/types/gallery';

// Sample images for stories
const sampleImages: GalleryImage[] = [
  {
    src: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop',
    alt: 'Beautiful food 1',
    caption: 'Delicious appetizer platter with assorted snacks',
    highResSrc: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200&h=800&fit=crop'
  },
  {
    src: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=300&fit=crop',
    alt: 'Beautiful food 2',
    caption: 'Fresh seafood selection with garnishes',
    highResSrc: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=1200&h=800&fit=crop'
  },
  {
    src: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400&h=300&fit=crop',
    alt: 'Beautiful food 3',
    caption: 'Artisanal pasta dish with fresh herbs',
    highResSrc: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=1200&h=800&fit=crop'
  },
  {
    src: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
    alt: 'Beautiful food 4',
    caption: 'Colorful salad with mixed greens and vegetables',
    highResSrc: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&h=800&fit=crop'
  },
  {
    src: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop',
    alt: 'Beautiful food 5',
    caption: 'Gourmet sandwich with premium ingredients',
    highResSrc: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=1200&h=800&fit=crop'
  },
  {
    src: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop',
    alt: 'Beautiful food 6',
    caption: 'Dessert selection with artistic presentation',
    highResSrc: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=1200&h=800&fit=crop'
  },
];

const sampleImagesNoCaptions: GalleryImage[] = sampleImages.map(img => ({
  src: img.src,
  alt: img.alt,
  highResSrc: img.highResSrc
}));

// Broken image for error state
const brokenImages: GalleryImage[] = [
  {
    src: 'https://broken-url.com/image1.jpg',
    alt: 'Broken image 1',
    caption: 'This image will fail to load'
  },
  {
    src: 'https://broken-url.com/image2.jpg',
    alt: 'Broken image 2',
    caption: 'Another broken image'
  },
  ...sampleImages.slice(0, 2) // Add some working images too
];

const meta = {
  title: 'Components/ImageGallery',
  component: ImageGallery,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A responsive image gallery component with lightbox functionality, keyboard navigation, and accessibility support.',
      },
    },
  },
  argTypes: {
    images: {
      description: 'Array of gallery images',
      control: { type: 'object' }
    },
    columns: {
      description: 'Number of columns in the grid',
      control: { type: 'number', min: 1, max: 6 }
    },
    gap: {
      description: 'Gap between images',
      control: { type: 'text' }
    },
    enableLightbox: {
      description: 'Enable lightbox functionality',
      control: { type: 'boolean' }
    },
    className: {
      description: 'Additional CSS classes',
      control: { type: 'text' }
    }
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ImageGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic Gallery
 * A standard image gallery with 3 columns showing various landscape images.
 */
export const BasicGallery: Story = {
  args: {
    images: sampleImages,
    columns: 3,
    gap: '8px',
    enableLightbox: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'The basic gallery layout with default settings. Click on any image to open the lightbox.',
      },
    },
  },
};

/**
 * With Captions
 * Gallery images with descriptive captions that appear on hover and in the lightbox.
 */
export const WithCaptions: Story = {
  args: {
    images: sampleImages,
    columns: 3,
    gap: '12px',
    enableLightbox: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Images with captions that appear on hover and in the lightbox. Hover over images to see captions.',
      },
    },
  },
};

/**
 * Without Captions
 * Clean gallery layout without captions for a minimal appearance.
 */
export const WithoutCaptions: Story = {
  args: {
    images: sampleImagesNoCaptions,
    columns: 3,
    gap: '8px',
    enableLightbox: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Gallery without captions for a clean, minimal look.',
      },
    },
  },
};

/**
 * Different Column Layouts
 * Showcase different column configurations for various screen layouts.
 */
export const TwoColumns: Story = {
  args: {
    images: sampleImages.slice(0, 4),
    columns: 2,
    gap: '12px',
    enableLightbox: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Gallery with 2 columns layout.',
      },
    },
  },
};

export const FourColumns: Story = {
  args: {
    images: sampleImages,
    columns: 4,
    gap: '6px',
    enableLightbox: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Gallery with 4 columns layout for more compact display.',
      },
    },
  },
};

/**
 * Large Gap
 * Gallery with increased spacing between images.
 */
export const LargeGap: Story = {
  args: {
    images: sampleImages.slice(0, 4),
    columns: 2,
    gap: '24px',
    enableLightbox: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Gallery with larger gaps between images for a more spacious feel.',
      },
    },
  },
};

/**
 * Lightbox Disabled
 * Gallery without lightbox functionality - images are not clickable.
 */
export const LightboxDisabled: Story = {
  args: {
    images: sampleImages.slice(0, 4),
    columns: 3,
    gap: '8px',
    enableLightbox: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Gallery with lightbox disabled. Images are not clickable and no lightbox will open.',
      },
    },
  },
};

/**
 * Empty State
 * Shows what happens when no images are provided.
 */
export const EmptyState: Story = {
  args: {
    images: [],
    columns: 3,
    gap: '8px',
    enableLightbox: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty state displayed when no images are provided to the gallery.',
      },
    },
  },
};

/**
 * Error States
 * Gallery with some broken image URLs to demonstrate error handling.
 */
export const ErrorStates: Story = {
  args: {
    images: brokenImages,
    columns: 3,
    gap: '8px',
    enableLightbox: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Gallery demonstrating error handling for broken image URLs. Some images will show error states.',
      },
    },
  },
};

/**
 * Single Image
 * Gallery with just one image.
 */
export const SingleImage: Story = {
  args: {
    images: [sampleImages[0]],
    columns: 3,
    gap: '8px',
    enableLightbox: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Gallery with a single image. Lightbox navigation will be hidden.',
      },
    },
  },
};

/**
 * Custom Styling
 * Gallery with custom CSS classes applied.
 */
export const CustomStyling: Story = {
  args: {
    images: sampleImages.slice(0, 4),
    columns: 2,
    gap: '16px',
    enableLightbox: true,
    className: 'border-2 border-blue-200 rounded-xl p-4 bg-blue-50',
  },
  parameters: {
    docs: {
      description: {
        story: 'Gallery with custom styling applied through className prop.',
      },
    },
  },
};