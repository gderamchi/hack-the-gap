# 📡 API Documentation

Complete REST API documentation for the French Influencer Trust Score backend.

## Base URL

```
http://localhost:3000/api
```

For production, replace with your deployed backend URL.

## Authentication

Currently, the API does not require authentication. For production, consider implementing:
- JWT tokens
- API keys
- OAuth 2.0

## Rate Limiting

- **Limit**: 60 requests per minute per IP
- **Response**: 429 Too Many Requests if exceeded

## Response Format

All endpoints return JSON with this structure:

**Success Response**:
```json
{
  "success": true,
  "data": { /* response data */ },
  "count": 10  // Optional: for list endpoints
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Error message"
}
```

## Endpoints

### Health Check

Check if the API is running.

**Endpoint**: `GET /api/health`

**Response**:
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-11-15T10:00:00.000Z",
  "environment": "development"
}
```

**Example**:
```bash
curl http://localhost:3000/api/health
```

---

### Get All Influencers

Retrieve a list of all influencers with optional filters.

**Endpoint**: `GET /api/influencers`

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `minTrustScore` | number | No | Minimum trust score (0-100) |
| `niche` | string | No | Filter by niche (e.g., "gaming", "beauty") |
| `limit` | number | No | Maximum results (default: 50, max: 100) |

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Squeezie",
      "socialHandles": {
        "youtube": "@Squeezie",
        "twitter": "@xSqueezie"
      },
      "niche": "gaming",
      "trustScore": 85.5,
      "dramaCount": 2,
      "goodActionCount": 8,
      "neutralCount": 15,
      "avgSentiment": 0.65,
      "language": "fr",
      "lastUpdated": "2025-11-15T10:00:00.000Z",
      "createdAt": "2025-11-01T10:00:00.000Z",
      "trustLevel": "Très fiable",
      "trustColor": "#10b981"
    }
  ],
  "count": 1
}
```

**Examples**:

```bash
# Get all influencers
curl http://localhost:3000/api/influencers

# Get influencers with trust score >= 80%
curl "http://localhost:3000/api/influencers?minTrustScore=80"

# Get gaming influencers
curl "http://localhost:3000/api/influencers?niche=gaming"

# Get top 10 influencers
curl "http://localhost:3000/api/influencers?limit=10"

# Combine filters
curl "http://localhost:3000/api/influencers?minTrustScore=60&niche=gaming&limit=20"
```

---

### Get Influencer by ID

Retrieve detailed information about a specific influencer, including all mentions.

**Endpoint**: `GET /api/influencers/:id`

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string (UUID) | Yes | Influencer ID |

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Squeezie",
    "socialHandles": {
      "youtube": "@Squeezie",
      "twitter": "@xSqueezie"
    },
    "niche": "gaming",
    "trustScore": 85.5,
    "dramaCount": 2,
    "goodActionCount": 8,
    "neutralCount": 15,
    "avgSentiment": 0.65,
    "language": "fr",
    "lastUpdated": "2025-11-15T10:00:00.000Z",
    "createdAt": "2025-11-01T10:00:00.000Z",
    "trustLevel": "Très fiable",
    "trustColor": "#10b981",
    "mentions": [
      {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "influencerId": "550e8400-e29b-41d4-a716-446655440000",
        "source": "perplexity",
        "sourceUrl": "https://example.com/article",
        "textExcerpt": "Squeezie a organisé une collecte de fonds pour une association caritative...",
        "sentimentScore": 0.85,
        "label": "good_action",
        "scrapedAt": "2025-11-15T09:00:00.000Z"
      }
    ]
  }
}
```

**Error Responses**:

- `404 Not Found`: Influencer not found
```json
{
  "success": false,
  "error": "Influencer not found"
}
```

**Example**:
```bash
curl http://localhost:3000/api/influencers/550e8400-e29b-41d4-a716-446655440000
```

---

### Search Influencer

Search for an influencer by name. If not in database, performs real-time research using Perplexity.ai.

**Endpoint**: `POST /api/influencers/search`

**Request Body**:
```json
{
  "name": "Squeezie",
  "forceRefresh": false
}
```

**Body Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Influencer name to search |
| `forceRefresh` | boolean | No | Force new research even if cached (default: false) |

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Squeezie",
    "trustScore": 85.5,
    "dramaCount": 2,
    "goodActionCount": 8,
    "neutralCount": 15,
    "avgSentiment": 0.65,
    "mentions": [ /* array of mentions */ ],
    "trustLevel": "Très fiable",
    "trustColor": "#10b981"
  },
  "isFromCache": false,
  "researchSummary": {
    "totalQueries": 7,
    "successfulQueries": 7,
    "errors": []
  }
}
```

**Response Fields**:

- `isFromCache`: `true` if data was retrieved from cache, `false` if new research was performed
- `researchSummary`: Only present when `isFromCache` is `false`
  - `totalQueries`: Number of Perplexity queries executed
  - `successfulQueries`: Number of successful queries
  - `errors`: Array of error messages (if any)

**Error Responses**:

- `400 Bad Request`: Missing or invalid name
```json
{
  "success": false,
  "error": "Name is required"
}
```

- `500 Internal Server Error`: Research failed
```json
{
  "success": false,
  "error": "Failed to search influencer"
}
```

**Examples**:

```bash
# Search for influencer (use cache if available)
curl -X POST http://localhost:3000/api/influencers/search \
  -H "Content-Type: application/json" \
  -d '{"name":"Squeezie"}'

# Force new research
curl -X POST http://localhost:3000/api/influencers/search \
  -H "Content-Type: application/json" \
  -d '{"name":"Squeezie","forceRefresh":true}'
```

**Note**: This endpoint can take 30-60 seconds when performing new research.

---

### Refresh Influencer

Force refresh of influencer data by performing new research.

**Endpoint**: `POST /api/influencers/:id/refresh`

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string (UUID) | Yes | Influencer ID |

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Squeezie",
    "trustScore": 86.2,
    "dramaCount": 2,
    "goodActionCount": 9,
    "mentions": [ /* updated mentions */ ],
    "trustLevel": "Très fiable",
    "trustColor": "#10b981"
  }
}
```

**Error Responses**:

- `404 Not Found`: Influencer not found
```json
{
  "success": false,
  "error": "Influencer not found"
}
```

**Example**:
```bash
curl -X POST http://localhost:3000/api/influencers/550e8400-e29b-41d4-a716-446655440000/refresh
```

**Note**: This endpoint can take 30-60 seconds as it performs new research.

---

### Get Niches

Retrieve list of available influencer niches.

**Endpoint**: `GET /api/influencers/niches/list`

**Response**:
```json
{
  "success": true,
  "data": [
    "gaming",
    "beauty",
    "lifestyle",
    "tech",
    "comedy",
    "cooking",
    "fitness"
  ]
}
```

**Example**:
```bash
curl http://localhost:3000/api/influencers/niches/list
```

---

## Data Models

### Influencer

```typescript
{
  id: string;              // UUID
  name: string;            // Influencer name
  socialHandles?: {        // Optional social media handles
    twitter?: string;
    instagram?: string;
    youtube?: string;
    tiktok?: string;
  };
  niche?: string;          // Category (gaming, beauty, etc.)
  trustScore: number;      // 0-100
  dramaCount: number;      // Number of dramas
  goodActionCount: number; // Number of good actions
  neutralCount: number;    // Number of neutral mentions
  avgSentiment: number;    // Average sentiment (-1 to 1)
  language: string;        // "fr"
  lastUpdated: string;     // ISO 8601 timestamp
  createdAt: string;       // ISO 8601 timestamp
  trustLevel?: string;     // "Très fiable", "Fiable", etc.
  trustColor?: string;     // Hex color code
}
```

### Mention

```typescript
{
  id: string;              // UUID
  influencerId: string;    // UUID of influencer
  source: string;          // "perplexity", "news", "youtube", etc.
  sourceUrl: string;       // URL to original source
  textExcerpt: string;     // Text content
  sentimentScore: number;  // -1 to 1
  label: string;           // "drama", "good_action", "neutral"
  scrapedAt: string;       // ISO 8601 timestamp
}
```

### Trust Levels

| Score Range | Level | Color |
|-------------|-------|-------|
| 80-100 | Très fiable | #10b981 (Green) |
| 60-79 | Fiable | #3b82f6 (Blue) |
| 40-59 | Neutre | #f59e0b (Orange) |
| 20-39 | Peu fiable | #ef4444 (Red) |
| 0-19 | Non fiable | #991b1b (Dark Red) |

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid parameters |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

---

## Caching

- **Cache Duration**: 24 hours (configurable via `CACHE_TTL_HOURS`)
- **Cache Key**: Influencer name
- **Cache Invalidation**: Automatic after TTL or manual via refresh endpoint

---

## Rate Limiting Details

### API Rate Limits
- **Global**: 60 requests/minute per IP
- **Perplexity**: 5 concurrent requests max
- **Delay**: 1 second between Perplexity requests

### Headers

Rate limit information is included in response headers:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1700000000
```

---

## Webhooks (Future)

Not currently implemented. Future versions may include:
- Influencer score change notifications
- New mention alerts
- Daily digest webhooks

---

## SDKs

### JavaScript/TypeScript

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 60000,
});

// Search influencer
const { data } = await api.post('/influencers/search', {
  name: 'Squeezie'
});

// Get all influencers
const { data } = await api.get('/influencers', {
  params: { minTrustScore: 80 }
});
```

### Python

```python
import requests

API_URL = "http://localhost:3000/api"

# Search influencer
response = requests.post(
    f"{API_URL}/influencers/search",
    json={"name": "Squeezie"}
)
data = response.json()

# Get all influencers
response = requests.get(
    f"{API_URL}/influencers",
    params={"minTrustScore": 80}
)
data = response.json()
```

---

## Testing

### Postman Collection

Import this collection to test all endpoints:

```json
{
  "info": {
    "name": "Influencer Trust API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/health"
      }
    },
    {
      "name": "Get All Influencers",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/influencers"
      }
    },
    {
      "name": "Search Influencer",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/influencers/search",
        "body": {
          "mode": "raw",
          "raw": "{\"name\":\"Squeezie\"}"
        }
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000/api"
    }
  ]
}
```

---

## Support

For issues or questions:
1. Check logs: Backend terminal shows detailed error messages
2. Verify Perplexity API key is valid
3. Ensure PostgreSQL is running
4. Check rate limits haven't been exceeded

---

**Last Updated**: November 15, 2025  
**API Version**: 1.0.0
