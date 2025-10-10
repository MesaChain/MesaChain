# AI-Powered Content Moderation System

## Overview

The MesaChain AI Moderation System provides intelligent content analysis for reviews and feedback, automatically detecting inappropriate content, spam, and providing sentiment analysis to improve content quality and user experience.

## Features

### 🤖 **AI Content Analysis**
- **Sentiment Analysis**: Analyzes emotional tone and polarity of content
- **Toxicity Detection**: Identifies inappropriate language and harmful content
- **Spam Detection**: Detects promotional and spam content
- **Auto-Categorization**: Suggests appropriate categories for feedback
- **Confidence Scoring**: Provides confidence levels for moderation decisions

### 🛡️ **Content Safety**
- **Profanity Filtering**: Multiple layers of profanity detection
- **Toxic Pattern Recognition**: Identifies harmful language patterns
- **Spam Indicators**: Detects promotional keywords and patterns
- **Length Validation**: Ensures appropriate content length
- **Rating-Content Consistency**: Validates rating matches content sentiment

### 📊 **Moderation Results**
- **Approval Status**: Automatic approve/reject decisions
- **Detailed Reasons**: Explains why content was flagged
- **Improvement Suggestions**: Provides actionable feedback
- **Confidence Metrics**: Shows reliability of analysis

## API Endpoints

### **Moderate Content**
```http
POST /feedback/moderate
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "This is a test review",
  "type": "review",
  "rating": 4,
  "subject": "Great food!"
}
```

### **Moderate Review**
```http
POST /moderation/review
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "The food was amazing!",
  "rating": 5
}
```

### **Moderate Feedback**
```http
POST /moderation/feedback
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "I found a bug in the ordering system",
  "subject": "Bug Report"
}
```

## Response Format

```json
{
  "isApproved": true,
  "confidence": 0.85,
  "reasons": [],
  "suggestions": [],
  "sentiment": {
    "score": 2,
    "comparative": 0.4,
    "positive": 1,
    "negative": 0,
    "neutral": 2
  },
  "toxicity": {
    "isToxic": false,
    "level": "low",
    "detectedWords": []
  },
  "spam": {
    "isSpam": false,
    "probability": 0.1,
    "indicators": []
  },
  "category": {
    "suggested": "food_quality",
    "confidence": 0.8
  }
}
```

## Integration with Feedback System

### **Automatic Moderation**
- All new feedback is automatically analyzed
- Content is flagged if inappropriate
- Categories are auto-suggested
- Priority is adjusted based on content analysis

### **Smart Categorization**
- **Bug Reports**: Detects technical issues and errors
- **Feature Requests**: Identifies improvement suggestions
- **Complaints**: Recognizes negative feedback
- **Compliments**: Identifies positive feedback
- **General**: Fallback category for unclear content

### **Priority Adjustment**
- **Urgent**: High toxicity or critical issues
- **High**: Medium toxicity or important feedback
- **Medium**: Normal feedback
- **Low**: Spam or low-quality content

## Configuration

### **Toxicity Levels**
- **Low**: 1-2 detected patterns
- **Medium**: 3-5 detected patterns
- **High**: 6+ detected patterns

### **Spam Detection**
- Keyword matching for promotional content
- Excessive repetition detection
- Capitalization ratio analysis
- Punctuation pattern analysis

### **Sentiment Thresholds**
- **Positive**: Comparative > 0.3
- **Neutral**: -0.3 ≤ Comparative ≤ 0.3
- **Negative**: Comparative < -0.3

## Usage Examples

### **JavaScript/TypeScript**
```typescript
// Moderate review content
const moderationResult = await feedbackService.moderateContent(
  "The food was absolutely delicious!",
  "review",
  undefined,
  5
);

if (!moderationResult.isApproved) {
  console.log("Content flagged:", moderationResult.reasons);
  console.log("Suggestions:", moderationResult.suggestions);
}
```

### **cURL**
```bash
# Test moderation endpoint
curl -X POST http://localhost:3000/feedback/moderate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "content": "This restaurant is terrible!",
    "type": "review",
    "rating": 1
  }'
```

## Monitoring and Analytics

### **Moderation Metrics**
- Total content analyzed
- Approval/rejection rates
- Toxicity detection accuracy
- Spam detection effectiveness
- Category suggestion accuracy

### **Performance Monitoring**
- Analysis response times
- Confidence score distributions
- Error rates and fallbacks

## Security and Privacy

### **Data Handling**
- Content is processed in memory only
- No permanent storage of analyzed content
- Secure API endpoints with authentication
- Role-based access control

### **Fallback Behavior**
- If moderation fails, content is approved by default
- Error logging for debugging
- Graceful degradation of service

## Troubleshooting

### **Common Issues**

1. **High False Positives**
   - Adjust toxicity thresholds
   - Review spam keyword lists
   - Update sentiment analysis parameters

2. **Low Detection Accuracy**
   - Expand pattern recognition rules
   - Update keyword databases
   - Improve sentiment analysis training

3. **Performance Issues**
   - Monitor analysis response times
   - Consider caching for repeated content
   - Optimize pattern matching algorithms

### **Debug Mode**
```typescript
// Enable detailed logging
const moderationResult = await aiModerationService.moderateContent(
  content,
  type,
  { debug: true }
);
```

## Future Enhancements

### **Planned Features**
- Machine learning model training
- Custom moderation rules
- Multi-language support
- Image content analysis
- Real-time moderation dashboard

### **Integration Opportunities**
- External moderation APIs
- Custom AI model deployment
- Advanced analytics integration
- Automated response generation

## Support

For technical support or feature requests, please contact the development team or create an issue in the project repository.

---

**Note**: This AI moderation system is designed to assist human moderators and should not be the sole method of content moderation. Always review flagged content manually for important decisions.

