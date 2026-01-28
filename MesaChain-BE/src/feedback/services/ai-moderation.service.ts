import { Injectable, Logger } from '@nestjs/common';
import * as natural from 'natural';
import * as sentiment from 'sentiment';
import * as ProfanityUtil from 'profanity-util';

export interface ModerationResult {
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

@Injectable()
export class AiModerationService {
  private readonly logger = new Logger(AiModerationService.name);
  private readonly sentimentAnalyzer = new sentiment();
  private readonly spamKeywords = [
    'buy now', 'click here', 'free money', 'guaranteed', 'act now',
    'limited time', 'exclusive offer', 'no risk', 'instant', 'urgent',
    'congratulations', 'winner', 'claim your', 'special promotion'
  ];

  async moderateContent(content: string, type: 'review' | 'feedback'): Promise<ModerationResult> {
    try {
      this.logger.log(`Moderating ${type} content: ${content.substring(0, 50)}...`);

      const sentiment = this.analyzeSentiment(content);
      const toxicity = this.analyzeToxicity(content);
      const spam = this.analyzeSpam(content);
      const category = this.suggestCategory(content, type);

      const reasons: string[] = [];
      const suggestions: string[] = [];

      // Check for toxicity
      if (toxicity.isToxic) {
        reasons.push(`Content contains inappropriate language (${toxicity.level} level)`);
        suggestions.push('Please revise your message to remove inappropriate language');
      }

      // Check for spam
      if (spam.isSpam) {
        reasons.push('Content appears to be spam or promotional');
        suggestions.push('Please provide genuine feedback without promotional content');
      }

      // Check sentiment for extreme negativity
      if (sentiment.comparative < -0.5) {
        reasons.push('Content is extremely negative');
        suggestions.push('Please provide constructive feedback');
      }

      // Check for excessive length
      if (content.length > 1000) {
        reasons.push('Content is too long');
        suggestions.push('Please keep your message under 1000 characters');
      }

      // Check for minimum length
      if (content.length < 10) {
        reasons.push('Content is too short');
        suggestions.push('Please provide more detailed feedback');
      }

      const isApproved = reasons.length === 0;
      const confidence = this.calculateConfidence(sentiment, toxicity, spam);

      return {
        isApproved,
        confidence,
        reasons,
        suggestions,
        sentiment,
        toxicity,
        spam,
        category
      };
    } catch (error) {
      this.logger.error('Error in content moderation:', error);
      return {
        isApproved: true, // Default to approved if moderation fails
        confidence: 0.5,
        reasons: ['Moderation system error'],
        suggestions: ['Please review your content manually'],
        sentiment: { score: 0, comparative: 0, positive: 0, negative: 0, neutral: 0 },
        toxicity: { isToxic: false, level: 'low', detectedWords: [] },
        spam: { isSpam: false, probability: 0, indicators: [] },
        category: { suggested: 'general', confidence: 0.5 }
      };
    }
  }

  private analyzeSentiment(content: string) {
    const result = this.sentimentAnalyzer.analyze(content);
    return {
      score: result.score,
      comparative: result.comparative,
      positive: result.positive.length,
      negative: result.negative.length,
      neutral: result.tokens.length - result.positive.length - result.negative.length
    };
  }

  private analyzeToxicity(content: string) {
    const lowerContent = content.toLowerCase();
    
    // Check for profanity using multiple methods
    const profanityCheck = ProfanityUtil.check(content);
    
    // Additional toxic patterns
    const toxicPatterns = [
      /\b(hate|stupid|idiot|moron|dumb|suck|terrible|awful|horrible)\b/gi,
      /\b(kill|die|death|murder|suicide)\b/gi,
      /\b(fuck|shit|damn|hell|bitch|asshole)\b/gi
    ];

    const detectedWords: string[] = [];
    let toxicityLevel = 0;

    toxicPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        detectedWords.push(...matches);
        toxicityLevel += matches.length;
      }
    });

    const isToxic = profanityCheck.isProfane || toxicityLevel > 2;
    const level: 'low' | 'medium' | 'high' = toxicityLevel > 5 ? 'high' : toxicityLevel > 2 ? 'medium' : 'low';

    return {
      isToxic,
      level,
      detectedWords: [...new Set(detectedWords)]
    };
  }

  private analyzeSpam(content: string) {
    const lowerContent = content.toLowerCase();
    const indicators: string[] = [];
    let spamScore = 0;

    // Check for spam keywords
    this.spamKeywords.forEach(keyword => {
      if (lowerContent.includes(keyword)) {
        indicators.push(keyword);
        spamScore += 1;
      }
    });

    // Check for excessive repetition
    const words = content.split(/\s+/);
    const wordCounts = words.reduce((acc, word) => {
      acc[word.toLowerCase()] = (acc[word.toLowerCase()] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const maxRepetition = Math.max(...Object.values(wordCounts));
    if (maxRepetition > 3) {
      indicators.push('excessive word repetition');
      spamScore += 2;
    }

    // Check for excessive caps
    const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
    if (capsRatio > 0.5) {
      indicators.push('excessive capitalization');
      spamScore += 1;
    }

    // Check for excessive punctuation
    const punctRatio = (content.match(/[!]{2,}|[?]{2,}|[.]{2,}/g) || []).length;
    if (punctRatio > 2) {
      indicators.push('excessive punctuation');
      spamScore += 1;
    }

    const isSpam = spamScore > 2;
    const probability = Math.min(spamScore / 5, 1);

    return {
      isSpam,
      probability,
      indicators
    };
  }

  private suggestCategory(content: string, type: 'review' | 'feedback'): { suggested: string; confidence: number } {
    const lowerContent = content.toLowerCase();
    
    if (type === 'review') {
      // Review categories
      if (lowerContent.includes('food') || lowerContent.includes('taste') || lowerContent.includes('delicious')) {
        return { suggested: 'food_quality', confidence: 0.8 };
      }
      if (lowerContent.includes('service') || lowerContent.includes('staff') || lowerContent.includes('waiter')) {
        return { suggested: 'service', confidence: 0.8 };
      }
      if (lowerContent.includes('price') || lowerContent.includes('cost') || lowerContent.includes('expensive')) {
        return { suggested: 'pricing', confidence: 0.8 };
      }
      if (lowerContent.includes('atmosphere') || lowerContent.includes('ambiance') || lowerContent.includes('decor')) {
        return { suggested: 'atmosphere', confidence: 0.8 };
      }
      return { suggested: 'overall', confidence: 0.6 };
    } else {
      // Feedback categories
      if (lowerContent.includes('bug') || lowerContent.includes('error') || lowerContent.includes('broken')) {
        return { suggested: 'bug_report', confidence: 0.9 };
      }
      if (lowerContent.includes('feature') || lowerContent.includes('suggestion') || lowerContent.includes('improvement')) {
        return { suggested: 'feature_request', confidence: 0.8 };
      }
      if (lowerContent.includes('complaint') || lowerContent.includes('problem') || lowerContent.includes('issue')) {
        return { suggested: 'complaint', confidence: 0.8 };
      }
      if (lowerContent.includes('compliment') || lowerContent.includes('great') || lowerContent.includes('excellent')) {
        return { suggested: 'compliment', confidence: 0.8 };
      }
      return { suggested: 'general', confidence: 0.6 };
    }
  }

  private calculateConfidence(sentiment: any, toxicity: any, spam: any): number {
    let confidence = 1.0;

    // Reduce confidence for toxic content
    if (toxicity.isToxic) {
      confidence -= 0.3;
    }

    // Reduce confidence for spam
    if (spam.isSpam) {
      confidence -= 0.2;
    }

    // Reduce confidence for extreme sentiment
    if (Math.abs(sentiment.comparative) > 0.8) {
      confidence -= 0.1;
    }

    return Math.max(0.1, confidence);
  }

  async moderateReview(content: string, rating: number): Promise<ModerationResult> {
    const result = await this.moderateContent(content, 'review');
    
    // Additional review-specific checks
    if (rating < 1 || rating > 5) {
      result.reasons.push('Invalid rating provided');
      result.suggestions.push('Please provide a rating between 1 and 5 stars');
      result.isApproved = false;
    }

    // Check for rating/content mismatch
    if (rating <= 2 && result.sentiment.comparative > 0.3) {
      result.reasons.push('Rating and content sentiment do not match');
      result.suggestions.push('Please ensure your rating reflects your written review');
    }

    if (rating >= 4 && result.sentiment.comparative < -0.3) {
      result.reasons.push('Rating and content sentiment do not match');
      result.suggestions.push('Please ensure your rating reflects your written review');
    }

    return result;
  }

  async moderateFeedback(content: string, subject: string): Promise<ModerationResult> {
    const fullContent = `${subject} ${content}`;
    const result = await this.moderateContent(fullContent, 'feedback');
    
    // Additional feedback-specific checks
    if (subject.length < 5) {
      result.reasons.push('Subject line is too short');
      result.suggestions.push('Please provide a more descriptive subject');
      result.isApproved = false;
    }

    return result;
  }
}
