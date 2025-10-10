# MesaChain Feedback and Review System API Documentation

## Base URL
```
http://localhost:4000
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format
All API responses follow this format:
```json
{
  "success": true,
  "data": { ... },
  "message": "Success message",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

Error responses:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": { ... }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Reviews API

### Create Review
**POST** `/reviews`

Create a new review for a restaurant, menu item, or experience.

**Request Body:**
```json
{
  "orderId": "uuid-string", // Optional
  "menuItemId": "uuid-string", // Optional
  "type": "RESTAURANT", // RESTAURANT, MENU_ITEM, STAFF, EXPERIENCE
  "rating": 5, // 1-5
  "title": "Amazing experience!", // Optional, max 200 chars
  "content": "Great food and excellent service.", // Optional, max 2000 chars
  "isAnonymous": false // Optional, default false
}
```

**Response:**
```json
{
  "id": "review-uuid",
  "userId": "user-uuid",
  "orderId": "order-uuid",
  "menuItemId": "menu-item-uuid",
  "type": "RESTAURANT",
  "rating": 5,
  "title": "Amazing experience!",
  "content": "Great food and excellent service.",
  "status": "PENDING",
  "helpfulVotesCount": 0,
  "totalVotesCount": 0,
  "isVerified": false,
  "isAnonymous": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "user": {
    "id": "user-uuid",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Get Reviews
**GET** `/reviews`

Retrieve reviews with filtering and pagination.

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10, max: 100)
- `status` (string, optional): Filter by status (PENDING, APPROVED, REJECTED, FLAGGED, HIDDEN)
- `type` (string, optional): Filter by type (RESTAURANT, MENU_ITEM, STAFF, EXPERIENCE)
- `rating` (number, optional): Filter by rating (1-5)
- `userId` (string, optional): Filter by user ID
- `orderId` (string, optional): Filter by order ID
- `menuItemId` (string, optional): Filter by menu item ID
- `isVerified` (boolean, optional): Filter by verification status
- `startDate` (string, optional): Start date filter (ISO string)
- `endDate` (string, optional): End date filter (ISO string)
- `search` (string, optional): Search in title and content
- `sortBy` (string, optional): Sort by field (createdAt, rating, helpfulVotesCount)
- `sortOrder` (string, optional): Sort order (asc, desc)

**Response:**
```json
{
  "reviews": [
    {
      "id": "review-uuid",
      "rating": 5,
      "title": "Amazing experience!",
      "content": "Great food and excellent service.",
      "status": "APPROVED",
      "helpfulVotesCount": 10,
      "totalVotesCount": 12,
      "isVerified": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "user": {
        "id": "user-uuid",
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10
}
```

### Get Review Statistics
**GET** `/reviews/stats`

Get comprehensive review statistics.

**Response:**
```json
{
  "totalReviews": 1250,
  "averageRating": 4.2,
  "ratingDistribution": {
    "1": 50,
    "2": 75,
    "3": 200,
    "4": 400,
    "5": 525
  },
  "verifiedReviews": 800,
  "pendingReviews": 25,
  "flaggedReviews": 10,
  "recentReviews": [
    {
      "id": "review-uuid",
      "rating": 5,
      "title": "Excellent!",
      "content": "Perfect meal.",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "user": {
        "id": "user-uuid",
        "name": "Jane Doe",
        "email": "jane@example.com"
      }
    }
  ]
}
```

### Get Single Review
**GET** `/reviews/:id`

Get a specific review by ID.

**Response:**
```json
{
  "id": "review-uuid",
  "rating": 5,
  "title": "Amazing experience!",
  "content": "Great food and excellent service.",
  "status": "APPROVED",
  "helpfulVotesCount": 10,
  "totalVotesCount": 12,
  "isVerified": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "user": {
    "id": "user-uuid",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "order": {
    "id": "order-uuid",
    "orderNumber": "ORD-20240101-0001"
  },
  "menuItem": {
    "id": "menu-item-uuid",
    "name": "Grilled Salmon",
    "price": 25.99
  },
  "helpfulVotes": [
    {
      "id": "vote-uuid",
      "isHelpful": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "user": {
        "id": "user-uuid",
        "name": "Jane Doe",
        "email": "jane@example.com"
      }
    }
  ],
  "reports": [],
  "moderationHistory": []
}
```

### Update Review
**PATCH** `/reviews/:id`

Update a review (author only).

**Request Body:**
```json
{
  "title": "Updated title", // Optional
  "content": "Updated content", // Optional
  "isAnonymous": true // Optional
}
```

### Delete Review
**DELETE** `/reviews/:id`

Delete a review (author or admin/staff only).

**Response:** `204 No Content`

### Vote on Review
**POST** `/reviews/:id/vote`

Vote on review helpfulness.

**Request Body:**
```json
{
  "isHelpful": true
}
```

**Response:** `204 No Content`

### Report Review
**POST** `/reviews/:id/report`

Report a review for inappropriate content.

**Request Body:**
```json
{
  "reason": "INAPPROPRIATE_CONTENT", // SPAM, INAPPROPRIATE_CONTENT, HARASSMENT, etc.
  "description": "Contains offensive language" // Optional
}
```

**Response:** `204 No Content`

### Moderate Review (Admin/Staff Only)
**POST** `/reviews/:id/moderate`

Moderate a review.

**Request Body:**
```json
{
  "action": "APPROVE", // APPROVE, REJECT, FLAG, HIDE, ESCALATE
  "reason": "Content meets guidelines", // Optional
  "notes": "High quality review" // Optional
}
```

---

## Moderation API (Admin/Staff Only)

### Get Moderation Queue
**GET** `/reviews/moderation/queue`

Get reviews pending moderation.

**Query Parameters:**
- `limit` (number, optional): Number of reviews to fetch (default: 50)

**Response:**
```json
[
  {
    "id": "review-uuid",
    "rating": 1,
    "title": "Terrible experience",
    "content": "Worst restaurant ever!",
    "status": "FLAGGED",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "user": {
      "id": "user-uuid",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "reports": [
      {
        "id": "report-uuid",
        "reason": "INAPPROPRIATE_CONTENT",
        "description": "Contains offensive language",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "user": {
          "id": "user-uuid",
          "name": "Jane Doe",
          "email": "jane@example.com"
        }
      }
    ]
  }
]
```

### Get Moderation Statistics
**GET** `/reviews/moderation/stats`

Get moderation statistics.

**Response:**
```json
{
  "pending": 25,
  "flagged": 10,
  "approved": 1000,
  "rejected": 50,
  "hidden": 5,
  "totalReports": 15,
  "averageProcessingTime": 2.5
}
```

### Process Pending Reviews
**POST** `/reviews/moderation/process-pending`

Process pending reviews for auto-moderation.

**Response:**
```json
{
  "processed": 25,
  "approved": 20,
  "flagged": 3,
  "rejected": 2
}
```

### Bulk Moderate Reviews
**POST** `/reviews/moderation/bulk-moderate`

Bulk moderate multiple reviews.

**Request Body:**
```json
{
  "reviewIds": ["review-uuid-1", "review-uuid-2"],
  "action": "APPROVE",
  "reason": "All reviews meet guidelines"
}
```

**Response:**
```json
{
  "processed": 2,
  "errors": []
}
```

### Analyze Content
**POST** `/reviews/moderation/analyze-content`

Analyze content for moderation purposes.

**Request Body:**
```json
{
  "content": "This is a test review",
  "rating": 5
}
```

**Response:**
```json
{
  "isSpam": false,
  "isInappropriate": false,
  "isSuspicious": false,
  "confidence": 0.1,
  "reasons": [],
  "suggestions": ["Content appears clean - consider auto-approval"],
  "shouldAutoApprove": true,
  "shouldFlagForReview": false
}
```

---

## Feedback API

### Create Feedback
**POST** `/feedback`

Create new feedback (public endpoint).

**Request Body:**
```json
{
  "orderId": "uuid-string", // Optional
  "category": "SERVICE", // GENERAL, FOOD_QUALITY, SERVICE, AMBIANCE, etc.
  "priority": "MEDIUM", // LOW, MEDIUM, HIGH, URGENT (optional, auto-assigned)
  "subject": "Slow service",
  "message": "The service was slower than expected during peak hours.",
  "isAnonymous": false, // Optional, default false
  "contactEmail": "customer@example.com", // Optional
  "contactPhone": "+1234567890" // Optional
}
```

**Response:**
```json
{
  "id": "feedback-uuid",
  "userId": "user-uuid",
  "orderId": "order-uuid",
  "category": "SERVICE",
  "priority": "MEDIUM",
  "status": "OPEN",
  "subject": "Slow service",
  "message": "The service was slower than expected during peak hours.",
  "isAnonymous": false,
  "contactEmail": "customer@example.com",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "user": {
    "id": "user-uuid",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Get All Feedback (Admin/Staff Only)
**GET** `/feedback`

Retrieve feedback with filtering and pagination.

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10, max: 100)
- `status` (string, optional): Filter by status (OPEN, IN_PROGRESS, RESOLVED, CLOSED, ESCALATED)
- `category` (string, optional): Filter by category
- `priority` (string, optional): Filter by priority
- `assignedTo` (string, optional): Filter by assigned user
- `userId` (string, optional): Filter by user ID
- `orderId` (string, optional): Filter by order ID
- `startDate` (string, optional): Start date filter (ISO string)
- `endDate` (string, optional): End date filter (ISO string)
- `search` (string, optional): Search in subject and message
- `sortBy` (string, optional): Sort by field (createdAt, priority, status)
- `sortOrder` (string, optional): Sort order (asc, desc)

### Get My Feedback
**GET** `/feedback/my`

Get current user's feedback (authenticated).

**Query Parameters:** Same as above

### Get Feedback Statistics (Admin/Staff Only)
**GET** `/feedback/stats`

Get feedback statistics.

**Response:**
```json
{
  "totalFeedback": 500,
  "openFeedback": 25,
  "inProgressFeedback": 15,
  "resolvedFeedback": 400,
  "closedFeedback": 50,
  "escalatedFeedback": 10,
  "averageResolutionTime": 24.5,
  "categoryBreakdown": {
    "SERVICE": 200,
    "FOOD_QUALITY": 150,
    "AMBIANCE": 100,
    "GENERAL": 50
  },
  "priorityBreakdown": {
    "LOW": 100,
    "MEDIUM": 300,
    "HIGH": 80,
    "URGENT": 20
  },
  "recentFeedback": [
    {
      "id": "feedback-uuid",
      "category": "SERVICE",
      "priority": "HIGH",
      "status": "OPEN",
      "subject": "Slow service",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "user": {
        "id": "user-uuid",
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ]
}
```

### Get Single Feedback
**GET** `/feedback/:id`

Get specific feedback by ID.

**Response:**
```json
{
  "id": "feedback-uuid",
  "category": "SERVICE",
  "priority": "MEDIUM",
  "status": "IN_PROGRESS",
  "subject": "Slow service",
  "message": "The service was slower than expected during peak hours.",
  "isAnonymous": false,
  "contactEmail": "customer@example.com",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "user": {
    "id": "user-uuid",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "order": {
    "id": "order-uuid",
    "orderNumber": "ORD-20240101-0001"
  },
  "assignee": {
    "id": "staff-uuid",
    "name": "Jane Smith",
    "email": "jane@restaurant.com"
  },
  "responses": [
    {
      "id": "response-uuid",
      "message": "Thank you for your feedback. We will look into this issue.",
      "isInternal": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "user": {
        "id": "staff-uuid",
        "name": "Jane Smith",
        "email": "jane@restaurant.com"
      }
    }
  ],
  "history": [
    {
      "id": "history-uuid",
      "action": "STATUS_CHANGED",
      "oldValue": "OPEN",
      "newValue": "IN_PROGRESS",
      "changedBy": "staff-uuid",
      "notes": "Assigned to staff member",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "user": {
        "id": "staff-uuid",
        "name": "Jane Smith",
        "email": "jane@restaurant.com"
      }
    }
  ]
}
```

### Update Feedback (Admin/Staff Only)
**PATCH** `/feedback/:id`

Update feedback.

**Request Body:**
```json
{
  "category": "FOOD_QUALITY", // Optional
  "priority": "HIGH", // Optional
  "status": "IN_PROGRESS", // Optional
  "subject": "Updated subject", // Optional
  "message": "Updated message", // Optional
  "assignedTo": "staff-uuid" // Optional
}
```

### Add Response to Feedback (Admin/Staff Only)
**POST** `/feedback/:id/response`

Add response to feedback.

**Request Body:**
```json
{
  "message": "Thank you for your feedback. We will look into this issue.",
  "isInternal": false // Optional, default false
}
```

**Response:** `204 No Content`

### Delete Feedback
**DELETE** `/feedback/:id`

Delete feedback (author or admin/staff only).

**Response:** `204 No Content`

---

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `UNAUTHORIZED` | Authentication required |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `DUPLICATE_REVIEW` | User already reviewed this item |
| `INVALID_STATUS_TRANSITION` | Invalid status change |
| `CONTENT_MODERATION_FAILED` | Content moderation error |
| `RATE_LIMIT_EXCEEDED` | Too many requests |

## Rate Limits

- Public endpoints: 100 requests per hour per IP
- Authenticated endpoints: 1000 requests per hour per user
- Moderation endpoints: 500 requests per hour per user

## Pagination

All list endpoints support pagination with these parameters:
- `page`: Page number (1-based)
- `limit`: Items per page (max 100)

Response includes:
- `total`: Total number of items
- `page`: Current page number
- `limit`: Items per page

## Filtering and Sorting

Most list endpoints support:
- **Filtering**: By various fields using query parameters
- **Searching**: Text search in relevant fields
- **Sorting**: By specified fields in ascending or descending order

## Webhooks (Future)

Planned webhook events:
- `review.created` - New review submitted
- `review.approved` - Review approved
- `review.rejected` - Review rejected
- `feedback.created` - New feedback submitted
- `feedback.assigned` - Feedback assigned to staff
- `feedback.resolved` - Feedback resolved

## SDKs and Libraries

Official SDKs planned for:
- JavaScript/TypeScript
- Python
- PHP
- Java

## Support

For API support or questions:
- Email: api-support@mesachain.com
- Documentation: https://docs.mesachain.com
- Status Page: https://status.mesachain.com




