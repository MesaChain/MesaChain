import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ImageGallery from '../ImageGallery';
import { GalleryImage } from '@/types/gallery';

const mockImages: GalleryImage[] = [
  {
    src: '/test-image-1.jpg',
    alt: 'Test image 1',
    caption: 'Test caption 1'
  },
  {
    src: '/test-image-2.jpg', 
    alt: 'Test image 2',
    caption: 'Test caption 2'
  }
];

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} />;
  };
});

describe('ImageGallery', () => {
  it('renders gallery with images', () => {
    render(<ImageGallery images={mockImages} columns={2} />);
    
    expect(screen.getByRole('region', { name: 'Image gallery' })).toBeInTheDocument();
    expect(screen.getByLabelText(/View image: Test image 1/)).toBeInTheDocument();
    expect(screen.getByLabelText(/View image: Test image 2/)).toBeInTheDocument();
  });

  it('renders empty state when no images provided', () => {
    render(<ImageGallery images={[]} columns={3} />);
    
    expect(screen.getByText('No images to display')).toBeInTheDocument();
    expect(screen.getByText('Add some images to see them in the gallery')).toBeInTheDocument();
  });

  it('applies correct column classes', () => {
    const { container } = render(<ImageGallery images={mockImages} columns={2} />);
    
    const gallery = container.querySelector('[role="region"]');
    expect(gallery).toHaveClass('grid-cols-1', 'sm:grid-cols-2');
  });

  it('disables lightbox when enableLightbox is false', () => {
    render(<ImageGallery images={mockImages} columns={2} enableLightbox={false} />);
    
    const imageButtons = screen.getAllByRole('button');
    // When lightbox is disabled, images should still be clickable but no lightbox should render
    expect(imageButtons).toHaveLength(2);
  });
});