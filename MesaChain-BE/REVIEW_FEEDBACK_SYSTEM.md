# Customer Feedback and Review System

## Overview

The MesaChain Customer Feedback and Review System provides a comprehensive platform for managing customer reviews and feedback. It includes automated content moderation, analytics, and robust API endpoints for both customers and administrators.

## Features

### Review System
- **Multi-type Reviews**: Restaurant, menu item, staff, and experience reviews
- **Rating System**: 1-5 star rating system with helpfulness voting
- **Content Moderation**: Automated spam detection and content filtering
- **Review Analytics**: Comprehensive statistics and trending analysis
- **Verification System**: Verified purchase reviews for authenticity
- **Anonymous Reviews**: Option for anonymous feedback

### Feedback System
- **Categorized Feedback**: Multiple categories (service, food quality, ambiance, etc.)
- **Priority Management**: Automatic priority assignment based on content
- **Assignment System**: Auto-assignment to staff members
- **Response Management**: Internal and public response system
- **Status Tracking**: Complete lifecycle management
- **Analytics**: Resolution time and category breakdown

### Moderation Features
- **Auto-moderation**: AI-powered content analysis
- **Manual Review Queue**: Flagged content for human review
- **Bulk Operations**: Mass moderation capabilities
- **Content Sanitization**: Automatic inappropriate content removal
- **Report System**: User reporting with escalation

## API Endpoints

### Reviews

#### Public Endpoints
- `POST /reviews` - Create a new review
- `GET /reviews` - Get reviews with filtering and pagination
- `GET /reviews/stats` - Get review statistics
- `GET /reviews/:id` - Get specific review
- `PATCH /reviews/:id` - Update review (author only)
- `DELETE /reviews/:id` - Delete review (author only)
- `POST /reviews/:id/vote` - Vote on review helpfulness
- `POST /reviews/:id/report` - Report a review

#### Admin/Staff Endpoints
- `POST /reviews/:id/moderate` - Moderate a review
- `GET /reviews/moderation/queue` - Get moderation queue
- `GET /reviews/moderation/stats` - Get moderation statistics
- `POST /reviews/moderation/process-pending` - Process pending reviews
- `POST /reviews/moderation/bulk-moderate` - Bulk moderate reviews
- `POST /reviews/moderation/analyze-content` - Analyze content
- `POST /reviews/moderation/sanitize-content` - Sanitize content

### Feedback

#### Public Endpoints
- `POST /feedback` - Create new feedback (public)
- `GET /feedback/my` - Get current user's feedback (authenticated)
- `GET /feedback/:id` - Get specific feedback (author or admin/staff)

#### Admin/Staff Endpoints
- `GET /feedback` - Get all feedback with filtering
- `GET /feedback/stats` - Get feedback statistics
- `PATCH /feedback/:id` - Update feedback
- `POST /feedback/:id/response` - Add response to feedback
- `DELETE /feedback/:id` - Delete feedback

## Database Schema

### Review Models
- `Review` - Main review entity
- `ReviewHelpfulVote` - User votes on review helpfulness
- `ReviewReport` - User reports on reviews
- `ReviewModerationHistory` - Moderation action history
- `ReviewAnalytics` - Aggregated review statistics

### Feedback Models
- `Feedback` - Main feedback entity
- `FeedbackResponse` - Responses to feedback
- `FeedbackHistory` - Feedback change history
- `FeedbackAnalytics` - Aggregated feedback statistics

## Content Moderation

### Automated Analysis
The system includes sophisticated content analysis for:
- **Spam Detection**: Keyword-based spam identification
- **Inappropriate Content**: Language and content filtering
- **Suspicious Patterns**: URL detection, excessive caps, repetition
- **Quality Assessment**: Content length and rating correlation

### Moderation Actions
- **APPROVE**: Content meets guidelines
- **REJECT**: Content violates guidelines
- **FLAG**: Requires manual review
- **HIDE**: Hide from public view
- **ESCALATE**: Escalate to senior moderator

### Auto-moderation Rules
- High ratings (4-5 stars) with clean content → Auto-approve
- Inappropriate content or high spam confidence → Auto-reject
- Suspicious patterns or multiple reports → Flag for review
- Low ratings with long content → Flag for potential fake reviews

## Analytics and Reporting

### Review Analytics
- Total reviews and average rating
- Rating distribution (1-5 stars)
- Category breakdown by review type
- Verified vs unverified reviews
- Pending and flagged review counts
- Trending reviews (most helpful)

### Feedback Analytics
- Total feedback by category and priority
- Resolution time analysis
- Status distribution
- Assignment efficiency
- Response time metrics

### User Behavior Analytics
- Review frequency and patterns
- Content quality scores
- Helpfulness voting patterns
- Reporting behavior

## Security Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin, Staff, User)
- Public endpoints for feedback submission
- Protected endpoints for moderation

### Data Protection
- Input validation and sanitization
- XSS and CSRF protection
- SQL injection prevention via Prisma
- Rate limiting on public endpoints

### Privacy Features
- Anonymous review options
- IP address logging for moderation
- User agent tracking
- GDPR-compliant data handling

## Performance Optimizations

### Database Indexing
- Optimized indexes for common queries
- Composite indexes for filtering
- Foreign key relationships for joins

### Caching Strategy
- Review statistics caching
- Moderation queue caching
- User permission caching

### Query Optimization
- Pagination for large datasets
- Selective field loading
- Efficient aggregation queries

## Configuration

### Environment Variables
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/mesachain"

# Moderation
MODERATION_AUTO_APPROVE_THRESHOLD=0.8
MODERATION_FLAG_THRESHOLD=0.4
MODERATION_REJECT_THRESHOLD=0.7

# Analytics
ANALYTICS_RETENTION_DAYS=365
ANALYTICS_BATCH_SIZE=1000
```

### Feature Flags
- `ENABLE_AUTO_MODERATION` - Enable/disable auto-moderation
- `ENABLE_ANONYMOUS_REVIEWS` - Allow anonymous reviews
- `ENABLE_REVIEW_REPORTS` - Enable user reporting
- `ENABLE_FEEDBACK_RESPONSES` - Enable feedback responses

## Usage Examples

### Creating a Review
```typescript
const review = await reviewsService.create({
  orderId: 'order-uuid',
  type: ReviewType.RESTAURANT,
  rating: 5,
  title: 'Amazing experience!',
  content: 'Great food and excellent service.',
  isAnonymous: false
}, user);
```

### Moderating a Review
```typescript
await moderationService.moderateReview('review-uuid', {
  action: ModerationAction.APPROVE,
  reason: 'Content meets guidelines',
  notes: 'High quality review'
}, moderator);
```

### Creating Feedback
```typescript
const feedback = await feedbackService.create({
  category: FeedbackCategory.SERVICE,
  subject: 'Slow service',
  message: 'The service was slower than expected.',
  contactEmail: 'customer@example.com'
}, user);
```

## Monitoring and Alerts

### Key Metrics
- Review submission rate
- Moderation queue size
- Average resolution time
- Content quality scores
- User satisfaction ratings

### Alert Conditions
- High spam detection rate
- Large moderation queue backlog
- Unusual review patterns
- System performance degradation

## Future Enhancements

### Planned Features
- Machine learning-based content analysis
- Sentiment analysis for reviews
- Multi-language support
- Advanced analytics dashboard
- Integration with external moderation services
- Real-time notifications
- Mobile app support

### Scalability Considerations
- Horizontal scaling for high-volume systems
- Microservices architecture
- Event-driven processing
- Caching layer optimization
- Database sharding strategies

## Troubleshooting

### Common Issues
1. **Prisma Client Not Generated**: Run `npx prisma generate`
2. **Database Connection**: Check DATABASE_URL environment variable
3. **Permission Errors**: Verify user roles and permissions
4. **Content Moderation**: Check moderation thresholds and rules

### Debug Mode
Enable debug logging by setting `LOG_LEVEL=debug` in environment variables.

## Support

For technical support or feature requests, please contact the development team or create an issue in the project repository.




