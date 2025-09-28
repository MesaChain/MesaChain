import { IsString, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';

export class ModerateContentDto {
  @IsString()
  content: string;

  @IsEnum(['review', 'feedback'])
  type: 'review' | 'feedback';

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;
}

export class ModerationResultDto {
  isApproved: boolean;
  confidence: number;
  reasons: string[];
  suggestions: string[];
  sentiment: {
    score: number;
    comparative: number;
    positive: number;
    negative: number;
    neutral: number;
  };
  toxicity: {
    isToxic: boolean;
    level: 'low' | 'medium' | 'high';
    detectedWords: string[];
  };
  spam: {
    isSpam: boolean;
    probability: number;
    indicators: string[];
  };
  category: {
    suggested: string;
    confidence: number;
  };
}

