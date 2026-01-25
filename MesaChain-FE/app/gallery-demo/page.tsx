"use client";

import { ImageGallery } from "@/components/gallery/ImageGallery";

const dummyImages = [
    {
        src: "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba",
        alt: "Mountain landscape",
        caption: "A beautiful mountain landscape at sunset",
    },
    {
        src: "https://images.unsplash.com/photo-1682695794816-7b9da18ed470",
        alt: "Desert dunes",
        caption: "Rolling sand dunes in the desert",
    },
    {
        src: "https://images.unsplash.com/photo-1682685797661-9e0c8c18e19f",
        alt: "Ocean waves",
        caption: " crashing waves on a rocky shore",
    },
    {
        src: "https://images.unsplash.com/photo-1682686581854-5e71f58e7e3f",
        alt: "Forest path",
        caption: "A misty path through a dense forest",
    },
    {
        src: "https://images.unsplash.com/photo-1682687982501-1e58ab814717",
        alt: "City skyline",
        caption: "Modern city skyline at night",
    },
    {
        src: "https://images.unsplash.com/photo-1682687982185-531d09ec56fc",
        alt: "Canyon view",
        caption: "Grand view of a canyon from above",
    },
    {
        src: "https://images.unsplash.com/photo-1682687220199-d0124f48f95b",
        alt: "Snowy peak",
        caption: "Snow-capped mountain peak under blue sky",
    },
];

export default function GalleryDemoPage() {
    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">Image Gallery Component Demo</h1>

            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Default Gallery (3 Columns)</h2>
                <ImageGallery images={dummyImages} />
            </div>

            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">4 Columns with Custom Gap</h2>
                <ImageGallery images={dummyImages} columns={4} gap="16px" />
            </div>

            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Lightbox Disabled</h2>
                <ImageGallery images={dummyImages.slice(0, 3)} enableLightbox={false} columns={3} />
            </div>
        </div>
    );
}
