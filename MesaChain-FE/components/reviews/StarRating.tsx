import { useState } from 'react';
import { Star, StarHalf } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (value: number) => void;
  className?: string;
}

const StarRating = ({
  value,
  size = 'md',
  interactive = false,
  onChange,
  className,
}: StarRatingProps) => {
  const [hoverValue, setHoverValue] = useState(0);

  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const renderStar = (starValue: number) => {
    const filled = (interactive ? hoverValue || value : value) >= starValue;
    const halfFilled =
      (interactive ? hoverValue || value : value) >= starValue - 0.5 &&
      (interactive ? hoverValue || value : value) < starValue;

    return (
      <button
        key={starValue}
        type="button"
        className={cn(
          'text-yellow-400 transition-colors',
          interactive && 'hover:text-yellow-500',
          !interactive && 'cursor-default',
        )}
        onClick={() => interactive && onChange?.(starValue)}
        onMouseEnter={() => interactive && setHoverValue(starValue)}
        onMouseLeave={() => interactive && setHoverValue(0)}
        disabled={!interactive}
      >
        {halfFilled ? (
          <StarHalf className={sizes[size]} />
        ) : (
          <Star className={sizes[size]} fill={filled ? 'currentColor' : 'none'} />
        )}
      </button>
    );
  };

  return (
    <div className={cn('flex gap-0.5', className)}>
      {[1, 2, 3, 4, 5].map(renderStar)}
    </div>
  );
};

export default StarRating;