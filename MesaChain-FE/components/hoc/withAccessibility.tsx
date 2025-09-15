import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { Loader2 } from 'lucide-react';

interface WithAccessibilityProps {
  isLoading?: boolean;
  error?: string;
  'aria-label'?: string;
  className?: string;
}

export function withAccessibility<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: {
    role?: string;
    announcePageChanges?: boolean;
    loadingMessage?: string;
    errorMessage?: string;
  } = {}
) {
  return function AccessibleComponent({
    isLoading,
    error,
    'aria-label': ariaLabel,
    className,
    ...props
  }: P & WithAccessibilityProps) {
    const router = useRouter();
    const previousPathRef = useRef(router.asPath);
    const componentRef = useRef<HTMLDivElement>(null);

    // Handle page announcements for screen readers
    useEffect(() => {
      if (!options.announcePageChanges) return;

      const path = router.asPath;
      if (path !== previousPathRef.current) {
        const pageTitle = document.title;
        announceToScreenReader(`Navigated to ${pageTitle}`);
        previousPathRef.current = path;
      }
    }, [router.asPath]);

    // Ensure proper focus management
    useEffect(() => {
      if (error || isLoading) {
        const element = componentRef.current?.querySelector(
          '[role="alert"], [role="status"]'
        );
        if (element instanceof HTMLElement) {
          element.focus();
        }
      }
    }, [error, isLoading]);

    // Handle escape key for modal-like components
    useEffect(() => {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && componentRef.current) {
          // Implement any escape key functionality here
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    const announceToScreenReader = (message: string) => {
      const announcement = document.createElement('div');
      announcement.setAttribute('role', 'status');
      announcement.setAttribute('aria-live', 'polite');
      announcement.className = 'sr-only';
      announcement.textContent = message;
      document.body.appendChild(announcement);
      setTimeout(() => document.body.removeChild(announcement), 1000);
    };

    const renderLoadingState = () => (
      <div
        role="status"
        aria-live="polite"
        className="flex items-center justify-center p-4"
      >
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">{options.loadingMessage || 'Loading...'}</span>
      </div>
    );

    const renderErrorState = () => (
      <div
        role="alert"
        className="p-4 border border-red-200 rounded bg-red-50 text-red-700"
      >
        <p>{options.errorMessage || error || 'An error occurred'}</p>
      </div>
    );

    return (
      <div
        ref={componentRef}
        className={className}
        role={options.role}
        aria-label={ariaLabel}
      >
        {isLoading ? (
          renderLoadingState()
        ) : error ? (
          renderErrorState()
        ) : (
          <WrappedComponent {...(props as P)} />
        )}
      </div>
    );
  };
}

// Example usage:
/*
const AccessibleReviewList = withAccessibility(ReviewList, {
  role: 'region',
  announcePageChanges: true,
  loadingMessage: 'Loading reviews...',
  errorMessage: 'Failed to load reviews. Please try again.',
});

// Then use it like:
<AccessibleReviewList
  isLoading={loading}
  error={error}
  aria-label="Customer Reviews"
  // ... other props
/>
*/