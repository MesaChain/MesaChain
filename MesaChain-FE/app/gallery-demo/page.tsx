'use client';

import React from 'react';
import ImageGallery from '@/components/ui/ImageGallery';
import { GalleryImage } from '@/types/gallery';

const sampleImages: GalleryImage[] = [
  {
    src: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop',
    alt: 'Food platter 1',
    caption: 'Delicious appetizer platter with assorted snacks',
    highResSrc: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200&h=800&fit=crop'
  },
  {
    src: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=300&fit=crop',
    alt: 'Food platter 2', 
    caption: 'Fresh seafood selection with garnishes',
    highResSrc: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=1200&h=800&fit=crop'
  },
  {
    src: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400&h=300&fit=crop',
    alt: 'Food platter 3',
    caption: 'Artisanal pasta dish with fresh herbs',
    highResSrc: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=1200&h=800&fit=crop'
  },
  {
    src: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
    alt: 'Food platter 4',
    caption: 'Colorful salad with mixed greens and vegetables',
    highResSrc: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&h=800&fit=crop'
  },
  {
    src: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop', 
    alt: 'Food platter 5',
    caption: 'Gourmet sandwich with premium ingredients',
    highResSrc: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=1200&h=800&fit=crop'
  },
  {
    src: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop',
    alt: 'Food platter 6',
    caption: 'Dessert selection with artistic presentation',
    highResSrc: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=1200&h=800&fit=crop'
  },
];

export default function GalleryDemo() {
  const handleGalleryOpen = (index: number) => {
    console.log('Gallery opened at index:', index);
  };

  const handleGalleryClose = () => {
    console.log('Gallery closed');
  };

  const handleImageChange = (index: number) => {
    console.log('Image changed to index:', index);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Image Gallery Demo
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Click on any image to open the lightbox. Use keyboard arrows or swipe gestures to navigate between images.
          </p>
        </div>

        {/* Basic Gallery */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Basic Gallery (3 columns)
          </h2>
          <ImageGallery
            images={sampleImages}
            columns={3}
            gap="12px"
            onGalleryOpen={handleGalleryOpen}
            onGalleryClose={handleGalleryClose}
            onImageChange={handleImageChange}
          />
        </section>

        {/* Different Layouts */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Different Layouts
          </h2>
          
          <div className="space-y-12">
            <div>
              <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-4">
                2 Columns Layout
              </h3>
              <ImageGallery
                images={sampleImages.slice(0, 4)}
                columns={2}
                gap="16px"
                onGalleryOpen={handleGalleryOpen}
                onGalleryClose={handleGalleryClose}
              />
            </div>

            <div>
              <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-4">
                4 Columns Layout
              </h3>
              <ImageGallery
                images={sampleImages}
                columns={4}
                gap="8px"
                onGalleryOpen={handleGalleryOpen}
                onGalleryClose={handleGalleryClose}
              />
            </div>
          </div>
        </section>

        {/* Without Lightbox */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Gallery without Lightbox
          </h2>
          <ImageGallery
            images={sampleImages.slice(0, 4)}
            columns={3}
            gap="12px"
            enableLightbox={false}
          />
        </section>

        {/* Custom Styling */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Custom Styled Gallery
          </h2>
          <ImageGallery
            images={sampleImages.slice(0, 4)}
            columns={2}
            gap="20px"
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
            onGalleryOpen={handleGalleryOpen}
            onGalleryClose={handleGalleryClose}
          />
        </section>

        {/* Accessibility Note */}
        <section className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-3">
            Accessibility Features
          </h2>
          <ul className="text-blue-800 dark:text-blue-200 space-y-2">
            <li>• Keyboard navigation (Arrow keys, Enter, Space, Escape)</li>
            <li>• Screen reader support with proper ARIA labels</li>
            <li>• Focus management and focus trapping in lightbox</li>
            <li>• High contrast mode compatibility</li>
            <li>• Touch/swipe gestures for mobile devices</li>
          </ul>
        </section>
      </div>
    </div>
  );
}