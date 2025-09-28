# Review System Implementation Guide

## Overview

The MesaChain Review System provides comprehensive customer review functionality with ratings, helpfulness voting, reporting, and AI-powered moderation. The system supports both REST API and GraphQL endpoints with real-time WebSocket updates.

## Features

### 🌟 **Core Review Features**
- **Star Ratings**: 1-5 star rating system
- **Review Content**: Text-based review content with AI moderation
- **Order Verification**: Verified reviews for completed orders
- **Menu Item Reviews**: Reviews for specific menu items
- **Anonymous Reviews**: Option for anonymous reviews
- **Review Status**: Pending, approved, rejected, flagged statuses

### 👍 **Social Features**
- **Helpfulness Voting**: Users can vote on review helpfulness
- **Review Reporting**: Report inappropriate reviews
- **Review Statistics**: Aggregated ratings and helpfulness scores
- **User Permissions**: Users can only edit/delete their own reviews

### 🤖 **AI Integration**
- **Content Moderation**: Automatic content analysis and flagging
- **Sentiment Analysis**: Review sentiment detection
- **Spam Detection**: Automatic spam and fake review detection
- **Auto-categorization**: Automatic review categorization

### 📊 **Analytics & Reporting**
- **Review Statistics**: Total reviews, average ratings, distribution
- **Menu Item Analytics**: Per-item review statistics
- **Moderation Metrics**: AI moderation effectiveness
- **Real-time Updates**: Live review statistics

## API Endpoints

### **REST API Endpoints**

#### **Create Review**
```http
POST /reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "order-123",
  "menuItemId": "item-456",
  "rating": 5,
  "content": "Excellent food and service!",
  "isAnonymous": false
}
```

#### **Get Reviews**
```http
GET /reviews?page=1&limit=10&status=approved&rating=5&menuItemId=item-456
Authorization: Bearer <token>
```

#### **Get Review by ID**
```http
GET /reviews/{id}
Authorization: Bearer <token>
```

#### **Update Review**
```http
PATCH /reviews/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 4,
  "content": "Updated review content"
}
```

#### **Vote on Review**
```http
POST /reviews/{id}/vote
Authorization: Bearer <token>
Content-Type: application/json

{
  "isHelpful": true
}
```

#### **Report Review**
```http
POST /reviews/{id}/report
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "inappropriate_content",
  "description": "Contains offensive language"
}
```

#### **Moderate Review** (Admin/Moderator)
```http
POST /reviews/{id}/moderate
Authorization: Bearer <token>
Content-Type: application/json

{
  "action": "approve",
  "reason": "content_appropriate",
  "notes": "Review meets guidelines"
}
```

#### **Get Review Statistics**
```http
GET /reviews/stats
Authorization: Bearer <token>
```

#### **Get Menu Item Statistics**
```http
GET /reviews/menu-item/{menuItemId}/stats
Authorization: Bearer <token>
```

### **GraphQL Endpoints**

#### **GraphQL Playground**
```
http://localhost:3000/graphql
```

#### **Review Queries**
```graphql
query GetReviews($input: ReviewQueryInput!) {
  reviews(input: $input) {
    id
    rating
    content
    status
    isVerified
    isAnonymous
    createdAt
    user {
      id
      name
      email
    }
    menuItem {
      id
      name
      price
    }
    helpfulVotes {
      id
      userId
      isHelpful
      createdAt
    }
  }
}

query GetReview($id: String!) {
  review(id: $id) {
    id
    rating
    content
    status
    isVerified
    isAnonymous
    createdAt
    user {
      id
      name
      email
    }
    menuItem {
      id
      name
      price
    }
    helpfulVotes {
      id
      userId
      isHelpful
      createdAt
      user {
        id
        name
      }
    }
    reports {
      id
      reason
      description
      status
      createdAt
      user {
        id
        name
      }
    }
  }
}

query GetReviewStats($menuItemId: String) {
  reviewStats(menuItemId: $menuItemId) {
    totalReviews
    averageRating
    ratingDistribution
    statusBreakdown
    moderationStats
  }
}
```

#### **Review Mutations**
```graphql
mutation CreateReview($input: CreateReviewInput!, $userId: String) {
  createReview(input: $input, userId: $userId) {
    id
    rating
    content
    status
    isVerified
    isAnonymous
    createdAt
  }
}

mutation UpdateReview($id: String!, $input: UpdateReviewInput!, $userId: String) {
  updateReview(id: $id, input: $input, userId: $userId) {
    id
    rating
    content
    status
    updatedAt
  }
}

mutation VoteReview($id: String!, $input: VoteReviewInput!, $userId: String!) {
  voteReview(id: $id, input: $input, userId: $userId)
}

mutation ReportReview($id: String!, $input: ReportReviewInput!, $userId: String!) {
  reportReview(id: $id, input: $input, userId: $userId)
}

mutation DeleteReview($id: String!, $userId: String) {
  deleteReview(id: $id, userId: $userId)
}
```

## Response Formats

### **Review Object**
```json
{
  "id": "review-123",
  "userId": "user-456",
  "orderId": "order-789",
  "menuItemId": "item-101",
  "rating": 5,
  "content": "Excellent food and service!",
  "status": "approved",
  "helpfulVotesCount": 12,
  "totalVotesCount": 15,
  "isVerified": true,
  "isAnonymous": false,
  "moderationNotes": null,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "user": {
    "id": "user-456",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "menuItem": {
    "id": "item-101",
    "name": "Margherita Pizza",
    "price": 15.99
  },
  "helpfulVotes": [
    {
      "id": "vote-123",
      "userId": "user-789",
      "isHelpful": true,
      "createdAt": "2024-01-15T11:00:00.000Z"
    }
  ]
}
```

### **Review Statistics**
```json
{
  "total": 1250,
  "approved": 1100,
  "pending": 50,
  "rejected": 75,
  "flagged": 25,
  "averageRating": 4.2
}
```

### **Menu Item Statistics**
```json
{
  "totalReviews": 45,
  "averageRating": 4.5,
  "ratingDistribution": [2, 3, 5, 15, 20],
  "helpfulnessScore": 0.85
}
```

## WebSocket Events

### **Real-time Review Events**

#### **New Review**
```javascript
socket.on('new-review', (review) => {
  console.log('New review:', review);
});
```

#### **Review Updated**
```javascript
socket.on('review-updated', (review) => {
  console.log('Review updated:', review);
});
```

#### **Review Voted**
```javascript
socket.on('review-voted', (vote) => {
  console.log('Review voted:', vote);
});
```

#### **Review Reported**
```javascript
socket.on('review-reported', (report) => {
  console.log('Review reported:', report);
});
```

#### **Review Moderated**
```javascript
socket.on('review-moderated', (moderation) => {
  console.log('Review moderated:', moderation);
});
```

### **Room-based Events**

#### **Join Review Room**
```javascript
socket.emit('join-room', 'review-123');
socket.emit('join-room', 'menuItem-456');
```

#### **Menu Item Review Events**
```javascript
socket.on('new-review-for-item', (review) => {
  console.log('New review for menu item:', review);
});

socket.on('review-updated-for-item', (review) => {
  console.log('Review updated for menu item:', review);
});
```

## Database Schema

### **Review Model**
```prisma
model Review {
  id                String   @id @default(cuid())
  userId            String
  orderId           String?
  menuItemId        String?
  rating            Int      @db.SmallInt
  content           String?
  status            ReviewStatus @default(pending)
  helpfulVotesCount Int      @default(0)
  totalVotesCount   Int      @default(0)
  isVerified        Boolean  @default(false)
  isAnonymous       Boolean  @default(false)
  moderationNotes   String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  user              User     @relation(fields: [userId], references: [id])
  order             Order?   @relation(fields: [orderId], references: [id])
  menuItem          MenuItem? @relation(fields: [menuItemId], references: [id])
  helpfulVotes      ReviewHelpfulVote[]
  reports           ReviewReport[]
  moderationHistory ReviewModerationHistory[]
}
```

### **Review Helpful Vote Model**
```prisma
model ReviewHelpfulVote {
  id        String   @id @default(cuid())
  reviewId  String
  userId    String
  isHelpful Boolean
  createdAt DateTime @default(now())

  review    Review   @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id])
}
```

### **Review Report Model**
```prisma
model ReviewReport {
  id          String   @id @default(cuid())
  reviewId    String
  userId      String
  reason      String
  description String?
  status      String   @default("pending")
  createdAt   DateTime @default(now())

  review      Review   @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  user        User     @relation(fields: [userId], references: [id])
}
```

## Usage Examples

### **JavaScript/TypeScript**

#### **Create a Review**
```typescript
const createReview = async (reviewData: CreateReviewDto) => {
  const response = await fetch('/reviews', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(reviewData)
  });
  return response.json();
};

// Usage
const review = await createReview({
  orderId: 'order-123',
  menuItemId: 'item-456',
  rating: 5,
  content: 'Excellent food!',
  isAnonymous: false
});
```

#### **Vote on Review**
```typescript
const voteReview = async (reviewId: string, isHelpful: boolean) => {
  const response = await fetch(`/reviews/${reviewId}/vote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ isHelpful })
  });
  return response.json();
};
```

#### **WebSocket Integration**
```typescript
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

// Listen for review events
socket.on('new-review', (review) => {
  console.log('New review received:', review);
  // Update UI with new review
});

socket.on('review-updated', (review) => {
  console.log('Review updated:', review);
  // Update UI with updated review
});

// Join specific review room
socket.emit('join-room', 'review-123');
```

### **React Component Example**
```jsx
import React, { useState, useEffect } from 'react';

function ReviewComponent({ menuItemId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [menuItemId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/reviews?menuItemId=${menuItemId}&status=approved`);
      const data = await response.json();
      setReviews(data.reviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const voteReview = async (reviewId, isHelpful) => {
    try {
      await fetch(`/reviews/${reviewId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isHelpful })
      });
      // Refresh reviews
      fetchReviews();
    } catch (error) {
      console.error('Error voting on review:', error);
    }
  };

  if (loading) return <div>Loading reviews...</div>;

  return (
    <div className="reviews">
      {reviews.map(review => (
        <div key={review.id} className="review">
          <div className="rating">
            {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
          </div>
          <p>{review.content}</p>
          <div className="helpful-votes">
            <button onClick={() => voteReview(review.id, true)}>
              Helpful ({review.helpfulVotesCount})
            </button>
            <button onClick={() => voteReview(review.id, false)}>
              Not Helpful ({review.totalVotesCount - review.helpfulVotesCount})
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

## Security and Permissions

### **Role-based Access Control**
- **Users**: Can create, update, delete their own reviews
- **Moderators**: Can moderate all reviews, view reports
- **Admins**: Full access to all review operations

### **Data Validation**
- **Rating Validation**: 1-5 star rating range
- **Content Validation**: AI-powered content moderation
- **Permission Checks**: Users can only modify their own reviews
- **Input Sanitization**: XSS protection and content filtering

### **Rate Limiting**
- **Review Creation**: Limit per user per order/menu item
- **Voting**: One vote per user per review
- **Reporting**: One report per user per review

## Performance Considerations

### **Database Optimization**
- **Indexes**: Optimized queries for ratings, status, and timestamps
- **Pagination**: Efficient pagination for large review sets
- **Aggregation**: Pre-calculated statistics for better performance

### **Caching Strategy**
- **Review Statistics**: Cached menu item statistics
- **Popular Reviews**: Cached frequently accessed reviews
- **User Permissions**: Cached user role information

### **Real-time Updates**
- **WebSocket Scaling**: Efficient room-based broadcasting
- **Event Batching**: Batched updates for better performance
- **Connection Management**: Proper cleanup of disconnected clients

## Monitoring and Analytics

### **Review Metrics**
- **Total Reviews**: Count of all reviews
- **Average Rating**: Overall rating average
- **Status Distribution**: Pending, approved, rejected, flagged counts
- **Helpfulness Scores**: Review helpfulness metrics

### **Performance Metrics**
- **Response Times**: API endpoint performance
- **WebSocket Connections**: Active connection counts
- **Error Rates**: Failed operations and error tracking

### **Business Intelligence**
- **Menu Item Performance**: Reviews per menu item
- **User Engagement**: Review creation and voting patterns
- **Moderation Efficiency**: AI moderation accuracy and speed

## Troubleshooting

### **Common Issues**

1. **Review Creation Fails**
   - Check user authentication
   - Verify order/menu item exists
   - Ensure user hasn't already reviewed

2. **Voting Issues**
   - Verify user is authenticated
   - Check if user already voted
   - Ensure review exists and is approved

3. **WebSocket Connection Issues**
   - Check server WebSocket configuration
   - Verify client connection URL
   - Check for firewall/proxy issues

### **Debug Mode**
```typescript
// Enable detailed logging
const review = await reviewsService.create(createDto, userId, { debug: true });
```

## Future Enhancements

### **Planned Features**
- **Photo Reviews**: Support for image attachments
- **Review Replies**: Restaurant responses to reviews
- **Advanced Filtering**: More sophisticated review filtering
- **Review Templates**: Pre-defined review templates
- **Multi-language Support**: Internationalization support

### **Integration Opportunities**
- **Social Media**: Share reviews on social platforms
- **Email Notifications**: Review status change notifications
- **Mobile App**: Native mobile review interface
- **Third-party APIs**: Integration with review aggregators

---

**Note**: The review system is designed to provide a comprehensive customer feedback platform with AI-powered moderation, real-time updates, and detailed analytics. Regular monitoring and maintenance ensure optimal performance and user experience.

