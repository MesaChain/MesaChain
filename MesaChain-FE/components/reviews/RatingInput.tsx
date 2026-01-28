"use client";

import { useMemo } from "react";
import { FaRegStar, FaStar } from "react-icons/fa";

interface RatingInputProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
}

export default function RatingInput({ value, onChange, max = 5 }: RatingInputProps) {
  const stars = useMemo(() => Array.from({ length: max }), [max]);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {stars.map((_, index) => {
          const starValue = index + 1;
          const isActive = starValue <= value;
          return (
            <button
              key={starValue}
              type="button"
              onClick={() => onChange(starValue)}
              className="text-yellow-500 hover:scale-110 transition-transform"
              aria-label={`Set rating to ${starValue}`}
            >
              {isActive ? <FaStar /> : <FaRegStar />}
            </button>
          );
        })}
      </div>
      <span className="text-sm text-gray-600">{value} / {max}</span>
    </div>
  );
}
