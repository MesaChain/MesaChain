import { FaRegStar, FaStar } from "react-icons/fa";

interface ReviewRatingProps {
  rating: number;
  max?: number;
  size?: string;
}

export default function ReviewRating({ rating, max = 5, size = "text-sm" }: ReviewRatingProps) {
  return (
    <div className={`flex items-center gap-1 ${size}`} aria-label={`Rating ${rating} out of ${max}`}>
      {Array.from({ length: max }).map((_, index) => {
        const starValue = index + 1;
        return starValue <= rating ? (
          <FaStar key={starValue} className="text-yellow-500" />
        ) : (
          <FaRegStar key={starValue} className="text-yellow-500" />
        );
      })}
      <span className="text-xs text-gray-500">{rating.toFixed(1)}</span>
    </div>
  );
}
