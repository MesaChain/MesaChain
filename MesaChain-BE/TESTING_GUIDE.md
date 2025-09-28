# MesaChain Feedback System Testing Guide

## Overview
This guide explains how to test the Customer Feedback and Review System locally.

## Prerequisites
1. Docker and Docker Compose installed
2. Node.js and pnpm installed
3. PostgreSQL database running

## Quick Start

### 1. Start the Database
```bash
cd /Users/ew/month2/MesaChain/MesaChain-BE
docker compose up postgres -d
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Generate Prisma Client
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/mesachain?schema=public" pnpm exec prisma generate
```

### 4. Run Database Migrations
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/mesachain?schema=public" pnpm exec prisma migrate deploy
```

### 5. Seed the Database (Optional)
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/mesachain?schema=public" pnpm exec prisma db seed
```

### 6. Start the Server
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/mesachain?schema=public" pnpm run start:dev
```

The server will start on `http://localhost:3000`

## API Testing

### Using Postman
1. Import the `MesaChain_Feedback_API.postman_collection.json` file into Postman
2. Set the `base_url` variable to `http://localhost:3000`
3. Start with the "Authentication" section to get a JWT token
4. Use the "Sample Data Setup" to create test orders
5. Test the feedback endpoints

### Manual Testing with curl

#### 1. Login to get JWT token
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

#### 2. Create feedback (replace YOUR_JWT_TOKEN)
```bash
curl -X POST http://localhost:3000/feedback \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "orderId": "order-id-here",
    "category": "service",
    "priority": "medium",
    "subject": "Great service!",
    "message": "The staff was very helpful and the food was excellent.",
    "isAnonymous": false
  }'
```

#### 3. Get all feedback
```bash
curl -X GET http://localhost:3000/feedback?page=1&limit=10
```

#### 4. Get feedback statistics
```bash
curl -X GET http://localhost:3000/feedback/stats
```

## Available Endpoints

### Feedback Management
- `POST /feedback` - Create new feedback
- `GET /feedback` - Get all feedback (with pagination and filters)
- `GET /feedback/:id` - Get specific feedback
- `PATCH /feedback/:id` - Update feedback
- `DELETE /feedback/:id` - Delete feedback
- `POST /feedback/:id/responses` - Add response to feedback
- `GET /feedback/stats` - Get feedback statistics

### Query Parameters for GET /feedback
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `category` - Filter by category (service, food_quality, ambiance, pricing, staff, general)
- `priority` - Filter by priority (low, medium, high, urgent)
- `status` - Filter by status (open, in_progress, resolved, closed)
- `search` - Search in subject and message

## Feedback Categories
- `service` - Customer service related
- `food_quality` - Food quality and taste
- `ambiance` - Restaurant atmosphere
- `pricing` - Price and value concerns
- `staff` - Staff behavior and performance
- `general` - General feedback

## Feedback Priorities
- `low` - Low priority feedback
- `medium` - Medium priority feedback
- `high` - High priority feedback
- `urgent` - Urgent feedback requiring immediate attention

## Feedback Statuses
- `open` - Newly created feedback
- `in_progress` - Feedback being addressed
- `resolved` - Feedback has been resolved
- `closed` - Feedback is closed

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure PostgreSQL is running: `docker compose up postgres -d`
   - Check DATABASE_URL environment variable

2. **Prisma Client Not Found**
   - Regenerate Prisma client: `pnpm exec prisma generate`

3. **TypeScript Errors**
   - The IDE may show TypeScript errors due to caching
   - The actual compilation works fine - this is just an IDE issue
   - Restart your IDE or TypeScript language server

4. **Authentication Errors**
   - Make sure to include the JWT token in the Authorization header
   - Token format: `Bearer YOUR_JWT_TOKEN`

### Database Schema
The feedback system uses the following main tables:
- `Feedback` - Main feedback records
- `FeedbackResponse` - Responses to feedback
- `FeedbackHistory` - Audit trail of changes
- `FeedbackAnalytics` - Aggregated statistics

## Next Steps
1. Test all endpoints with the Postman collection
2. Verify data persistence in the database
3. Test error handling and validation
4. Check authentication and authorization
5. Test pagination and filtering
6. Verify statistics calculations

