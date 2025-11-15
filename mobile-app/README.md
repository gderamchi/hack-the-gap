# 📱 French Influencer Trust Score - Mobile App

A production-ready cross-platform mobile application (iOS/Android) that ranks French influencers by trust score based on public dramas and positive actions, powered by Perplexity.ai.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│           Mobile App (React Native + Expo)              │
│  • Ranking Screen (sorted by trust score)              │
│  • Detail Screen (dramas, good actions, sources)       │
│  • Search Screen (find new influencers)                │
└────────────────────┬────────────────────────────────────┘
                     │ REST API
                     ▼
┌─────────────────────────────────────────────────────────┐
│         Backend API (Node.js + Express + TS)            │
│  • Influencer Service (business logic)                 │
│  • Perplexity Service (parallel query decomposition)   │
│  • Scoring Service (trust score calculation)           │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              PostgreSQL Database (Prisma)               │
│  • Influencers (name, score, counts, metadata)         │
│  • Mentions (source, URL, text, sentiment, label)      │
│  • Analysis History (historical scores)                │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** 14+ (or Docker)
- **Expo CLI**: `npm install -g expo-cli`
- **Perplexity.ai API Key**: Get from [perplexity.ai](https://www.perplexity.ai)
- **iOS Simulator** (Mac only) or **Android Emulator**

### 1. Backend Setup

```bash
cd mobile-app/backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and add your PERPLEXITY_API_KEY and DATABASE_URL

# Start PostgreSQL (if using Docker)
docker run -d \
  --name influencer-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=influencer_trust \
  -p 5432:5432 \
  postgres:15

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start backend server
npm run dev
```

Backend will run on `http://localhost:3000`

### 2. Mobile App Setup

```bash
cd mobile-app/mobile

# Install dependencies
npm install

# Start Expo development server
npm start

# Then press:
# - 'i' for iOS Simulator
# - 'a' for Android Emulator
# - Scan QR code with Expo Go app for physical device
```

## 📊 Features

### ✅ Implemented

- **Ranking Screen**: Scrollable list of influencers sorted by trust score (descending)
- **Filters**: Minimum trust score (80%+, 60%+, 40%+), search by name
- **Detail Screen**: Full profile with trust score gauge, breakdown, and mentions
- **Mention Tabs**: Filter by dramas, good actions, or all mentions
- **Clickable Sources**: Every mention has a URL to the original source
- **Search**: Find new influencers with real-time Perplexity.ai research
- **Refresh**: Pull-to-refresh and manual refresh button
- **Legal Disclaimers**: Modal on first launch, banners on detail screen
- **Ethical Safeguards**: Source attribution, transparency, no fabricated data

### 🔍 Perplexity.ai Integration

The app uses **parallel query decomposition** to research influencers:

1. **Query Generation**: Creates 5-7 targeted French queries:
   - "Controverses et scandales de {name} influenceur français"
   - "Actions positives et charité de {name}"
   - "Polémiques récentes {name} 2024 2025"
   - "Réputation {name} dans la communauté française"
   - "{name} dramas et clashs récents"
   - "{name} dons et actions humanitaires"
   - "Critiques et accusations contre {name}"

2. **Parallel Execution**: Sends all queries concurrently (max 5 at a time)

3. **Rate Limiting**: 1 request/second with exponential backoff

4. **Result Aggregation**: Combines responses, extracts sources, deduplicates

5. **Classification**: Uses French keywords to label as drama/good_action/neutral

### 🧮 Trust Score Algorithm

```
Base Score = 50

Adjustments:
+ (good_actions × 10 × recency_weight)
- (dramas × 15 × recency_weight)
+ (avg_sentiment × 20)

Recency Weight = e^(-days_old / 180)

Final Score = clamp(0, 100, calculated_score)
```

**Color Coding**:
- 80-100%: Green (Très fiable)
- 60-79%: Blue (Fiable)
- 40-59%: Orange (Neutre)
- 20-39%: Red (Peu fiable)
- 0-19%: Dark Red (Non fiable)

## 📁 Project Structure

```
mobile-app/
├── backend/                    # Node.js API Server
│   ├── src/
│   │   ├── server.ts          # Express app entry point
│   │   ├── config/            # Configuration
│   │   │   └── index.ts       # Environment variables, keywords
│   │   ├── routes/            # API endpoints
│   │   │   └── influencer.routes.ts
│   │   ├── services/          # Business logic
│   │   │   ├── perplexity.service.ts  # Perplexity.ai integration
│   │   │   ├── influencer.service.ts  # Main service
│   │   │   └── scoring.service.ts     # Trust score calculation
│   │   └── utils/             # Helpers
│   │       ├── logger.ts      # Winston logger
│   │       └── classifier.ts  # Keyword classification
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   ├── package.json
│   └── tsconfig.json
│
├── mobile/                     # React Native App
│   ├── src/
│   │   ├── App.tsx            # Main app component
│   │   ├── screens/           # App screens
│   │   │   ├── RankingScreen.tsx   # List of influencers
│   │   │   ├── DetailScreen.tsx    # Influencer profile
│   │   │   └── SearchScreen.tsx    # Search new influencer
│   │   ├── components/        # Reusable components
│   │   │   ├── InfluencerCard.tsx
│   │   │   ├── MentionCard.tsx
│   │   │   └── DisclaimerModal.tsx
│   │   ├── services/          # API client
│   │   │   └── api.ts
│   │   ├── types/             # TypeScript types
│   │   │   └── index.ts
│   │   └── constants/         # Theme, colors
│   │       └── theme.ts
│   ├── app.json
│   ├── package.json
│   └── tsconfig.json
│
└── README.md                   # This file
```

## 🔌 API Endpoints

### GET `/api/health`
Health check endpoint

**Response**:
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-11-15T10:00:00.000Z"
}
```

### GET `/api/influencers`
Get all influencers with optional filters

**Query Parameters**:
- `minTrustScore` (number): Minimum trust score (0-100)
- `niche` (string): Filter by niche
- `limit` (number): Max results (default: 50)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Squeezie",
      "trustScore": 85.5,
      "dramaCount": 2,
      "goodActionCount": 8,
      "trustLevel": "Très fiable",
      "trustColor": "#10b981"
    }
  ],
  "count": 1
}
```

### GET `/api/influencers/:id`
Get influencer by ID with mentions

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Squeezie",
    "trustScore": 85.5,
    "mentions": [
      {
        "id": "uuid",
        "source": "perplexity",
        "sourceUrl": "https://...",
        "textExcerpt": "...",
        "sentimentScore": 0.8,
        "label": "good_action",
        "scrapedAt": "2025-11-15T10:00:00.000Z"
      }
    ]
  }
}
```

### POST `/api/influencers/search`
Search for influencer by name

**Request Body**:
```json
{
  "name": "Squeezie",
  "forceRefresh": false
}
```

**Response**:
```json
{
  "success": true,
  "data": { /* influencer with mentions */ },
  "isFromCache": false,
  "researchSummary": {
    "totalQueries": 7,
    "successfulQueries": 7,
    "errors": []
  }
}
```

### POST `/api/influencers/:id/refresh`
Refresh influencer data (force new research)

**Response**: Same as GET `/api/influencers/:id`

## ⚖️ Legal & Ethical Safeguards

### Disclaimers

1. **First Launch Modal**: Users must accept disclaimer before using app
2. **Banner on Detail Screen**: "Score indicatif - Vérifiez toujours les sources"
3. **Footer on All Screens**: "Informations basées sur sources publiques"

### Transparency

- **Source Attribution**: Every mention shows source URL and date
- **No Fabrication**: All data comes from Perplexity.ai or public sources
- **Verifiable**: Users can click URLs to verify original sources
- **Incomplete Data Handling**: Shows "Données insuffisantes" if no data

### Privacy

- **Public Data Only**: Only analyzes publicly available information
- **No Personal Data Collection**: App doesn't collect user data
- **Right to Deletion**: Influencers can request data removal

## 🧪 Testing

### Backend Testing

```bash
cd mobile-app/backend

# Test health endpoint
curl http://localhost:3000/api/health

# Test search (requires Perplexity API key)
curl -X POST http://localhost:3000/api/influencers/search \
  -H "Content-Type: application/json" \
  -d '{"name":"Squeezie"}'

# Test get all influencers
curl http://localhost:3000/api/influencers

# Test with filters
curl "http://localhost:3000/api/influencers?minTrustScore=60&limit=10"
```

### Mobile Testing

1. **iOS Simulator**: `npm start` → press `i`
2. **Android Emulator**: `npm start` → press `a`
3. **Physical Device**: Scan QR code with Expo Go app

### Functional Test Checklist

- [ ] Search for "Squeezie" → verify API call and results
- [ ] View ranking → verify sorting by trust score (descending)
- [ ] Tap influencer → verify navigation to detail screen
- [ ] View dramas tab → verify filtered mentions
- [ ] View good actions tab → verify filtered mentions
- [ ] Tap source URL → verify browser opens
- [ ] Pull to refresh → verify data updates
- [ ] Apply filter (80%+) → verify filtered results
- [ ] Search by name → verify search works
- [ ] Accept disclaimer → verify modal doesn't show again

## 📦 Building for Production

### Backend Deployment

```bash
cd mobile-app/backend

# Build TypeScript
npm run build

# Start production server
NODE_ENV=production npm start
```

**Recommended Hosting**: Heroku, Railway, Render, or AWS

### Mobile App Build

```bash
cd mobile-app/mobile

# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas login
eas build:configure

# Build for Android
eas build --platform android --profile production

# Build for iOS
eas build --platform ios --profile production

# Submit to stores
eas submit --platform android
eas submit --platform ios
```

## 🔧 Configuration

### Backend Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/influencer_trust"

# Perplexity AI
PERPLEXITY_API_KEY="your_api_key_here"

# Server
PORT=3000
NODE_ENV=production

# Rate Limiting
MAX_REQUESTS_PER_MINUTE=60
PERPLEXITY_MAX_CONCURRENT=5
PERPLEXITY_RATE_LIMIT_MS=1000

# Cache
CACHE_TTL_HOURS=24
```

### Mobile App Configuration

Edit `mobile-app/mobile/app.json`:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://your-backend-api.com/api"
    }
  }
}
```

## 🐛 Troubleshooting

### Backend Issues

**Problem**: Perplexity API returns errors
- **Solution**: Check API key, verify rate limits, check network

**Problem**: Database connection fails
- **Solution**: Verify DATABASE_URL, ensure PostgreSQL is running

### Mobile Issues

**Problem**: "Network request failed"
- **Solution**: Update `apiUrl` in `app.json`, ensure backend is running

**Problem**: Expo won't start
- **Solution**: Clear cache: `expo start -c`

**Problem**: Build fails
- **Solution**: Check `eas.json` configuration, verify credentials

## 📄 License

MIT License - Built for Hackathon Blackbox 2025

## 🤝 Contributing

This is a hackathon project. For production use, consider:

- [ ] Add authentication (JWT, OAuth)
- [ ] Implement caching layer (Redis)
- [ ] Add more data sources (Instagram, TikTok APIs)
- [ ] Implement real-time updates (WebSockets)
- [ ] Add analytics and monitoring (Sentry, Mixpanel)
- [ ] Improve sentiment analysis (fine-tuned models)
- [ ] Add multi-language support
- [ ] Implement user accounts and favorites

---

**Made with ❤️ for Hackathon Blackbox 2025**

🔍 Happy Influencer Monitoring!
