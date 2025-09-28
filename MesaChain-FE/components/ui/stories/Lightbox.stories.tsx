import type { Meta, StoryObj } from '@storybook/nextjs';
import { Lightbox } from '../Lightbox';
import { GalleryImage } from '@/types/gallery';
import { useState } from 'react';

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
];

const meta = {
  title: 'Components/Lightbox',
  component: Lightbox,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A full-screen lightbox component with keyboard navigation, touch gestures, and image preloading.',
      },
    },
  },
  argTypes: {
    images: {
      description: 'Array of gallery images',
      control: { type: 'object' }
    },
    currentIndex: {
      description: 'Current image index',
      control: { type: 'number', min: 0 }
    },
    isOpen: {
      description: 'Whether the lightbox is open',
      control: { type: 'boolean' }
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Lightbox>;

export default meta;
type Story = StoryObj<typeof meta>;

// Wrapper component to handle state
const LightboxWrapper = ({ initialIndex = 0, ...props }: { initialIndex?: number; [key: string]: any }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isOpen, setIsOpen] = useState(true);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % sampleImages.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => prev === 0 ? sampleImages.length - 1 : prev - 1);
  };

  const handleClose = () => {
    setIsOpen(false);
    // Reopen after a short delay for demo purposes
    setTimeout(() => setIsOpen(true), 1000);
  };

  return (
    <div>
      <div className="p-4 bg-gray-100 text-center">
        <p className="text-sm text-gray-600 mb-2">
          Lightbox Demo - Use arrow keys to navigate, ESC to close
        </p>
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Open Lightbox
        </button>
      </div>
      
      <Lightbox
        images={sampleImages}
        currentIndex={currentIndex}
        isOpen={isOpen}
        onClose={handleClose}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onImageChange={setCurrentIndex}
        {...props}
      />
    </div>
  );
};

/**
 * Basic Lightbox
 * A lightbox showing the first image in the collection.
 */
export const BasicLightbox: Story = {
  args: {
    images: sampleImages,
    currentIndex: 0,
    isOpen: true,
    onClose: () => {},
    onNext: () => {},
    onPrevious: () => {},
  },
  render: (args) => <LightboxWrapper {...args} initialIndex={0} />,
  parameters: {
    docs: {
      description: {
        story: 'Basic lightbox functionality. Use arrow keys to navigate between images or click the navigation buttons.',
      },
    },
  },
};

/**
 * With Caption
 * Lightbox displaying an image with caption.
 */
export const WithCaption: Story = {
  args: {
    images: sampleImages,
    currentIndex: 0,
    isOpen: true,
    onClose: () => {},
    onNext: () => {},
    onPrevious: () => {},
  },
  render: (args) => <LightboxWrapper {...args} initialIndex={0} />,
  parameters: {
    docs: {
      description: {
        story: 'Lightbox showing image with caption at the bottom.',
      },
    },
  },
};

/**
 * Middle Image
 * Lightbox starting from the middle image to show navigation.
 */
export const MiddleImage: Story = {
  args: {
    images: sampleImages,
    currentIndex: 1,
    isOpen: true,
    onClose: () => {},
    onNext: () => {},
    onPrevious: () => {},
  },
  render: (args) => <LightboxWrapper {...args} initialIndex={1} />,
  parameters: {
    docs: {
      description: {
        story: 'Lightbox starting from the second image to demonstrate navigation.',
      },
    },
  },
};

/**
 * Single Image
 * Lightbox with only one image (navigation hidden).
 */
export const SingleImage: Story = {
  args: {
    images: [sampleImages[0]],
    currentIndex: 0,
    isOpen: true,
    onClose: () => {},
    onNext: () => {},
    onPrevious: () => {},
  },
  render: (args) => (
    <LightboxWrapper 
      {...args} 
      initialIndex={0}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Lightbox with a single image. Navigation arrows will be hidden.',
      },
    },
  },
};