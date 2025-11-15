# 🎯 Influencer Trust Score - Complete Project Guide

## 📊 Project Overview

A comprehensive full-stack application for ranking and analyzing French influencers based on public data sources. Features real-time research using Perplexity AI, sophisticated trust scoring, and a mobile-first PWA interface.

---

## 🏗️ Architecture

### Tech Stack

#### Backend
- **Framework**: Node.js + Express + TypeScript
- **Database**: SQLite with Prisma ORM
- **AI Research**: Perplexity AI API (real-time web search)
- **Classification**: Keyword-based sentiment analysis
- **Scoring**: Custom algorithm with recency weighting

#### Frontend
- **Framework**: React Native (Expo)
- **UI Library**: React Native Paper (Material Design)
- **State Management**: TanStack Query (React Query)
- **Navigation**: React Navigation
- **Platform**: iOS, Android, Web (PWA)

#### Original Python App
- **Framework**: Streamlit
- **Scraping**: BeautifulSoup, Newspaper3k, Scrapy
- **AI**: HuggingFace Transformers (CamemBERT)
- **Database**: SQLite with SQLAlchemy

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+ (for original Streamlit app)
- Perplexity API key

### 1. Backend Setup

```bash
cd mobile-app/backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and add your PERPLEXITY_API_KEY

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Start development server
npm run dev
```

Backend will run on `http://localhost:3000`

### 2. Mobile App Setup

```bash
cd mobile-app/mobile

# Install dependencies
npm install

# Start Expo
npm start

# Then choose:
# - Press 'i' for iOS simulator
# - Press 'a' for Android emulator
# - Press 'w' for web browser
# - Scan QR code for physical device
```

### 3. Python Streamlit App (Original)

```bash
# From project root
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

pip install -r requirements.txt

streamlit run streamlit_app.py
```

---

## 📱 Features

### ✅ Implemented

#### Core Features
- [x] **Real-time influencer research** using Perplexity AI
- [x] **Trust score calculation** (0-100%) with recency weighting
- [x] **Ranking system** with positions (#1, #2, #3...) and medals 🥇🥈🥉
- [x] **Search & filters** (by name, minimum score)
- [x] **Detailed analysis** (dramas, good actions, neutral mentions)
- [x] **Source citations** with clickable links
- [x] **Caching system** (24-hour TTL)
- [x] **Pull-to-refresh** functionality

#### PWA Features
- [x] **Installable** on iOS, Android, Desktop
- [x] **Offline support** with service worker
- [x] **App manifest** with icons and metadata
- [x] **Full-screen mode** (standalone display)
- [x] **Install prompt** for Android
- [x] **Responsive design** for all screen sizes

#### UX Enhancements
- [x] **Rank badges** with medals for top 3
- [x] **Color-coded scores** (green, blue, orange, red)
- [x] **Summary statistics** (total influencers, average score)
- [x] **Empty states** with helpful messages
- [x] **Loading indicators**
- [x] **Filter chips** for quick filtering
- [x] **Disclaimer modal** on first launch

### 🔮 Future Enhancements

- [ ] Push notifications for score changes
- [ ] Historical trend charts
- [ ] Compare two influencers side-by-side
- [ ] Export reports (PDF, CSV)
- [ ] Social sharing
- [ ] Bookmark favorites
- [ ] Dark mode
- [ ] Multi-language support (English, Spanish)
- [ ] Instagram/TikTok integration
- [ ] User accounts and personalization

---

## 🧠 How It Works

### 1. Research Process

When you search for an influencer:

1. **Query Generation**: Backend generates 7 targeted French queries:
   - "Controverses et scandales de [name]..."
   - "Actions positives et charité de [name]..."
   - "Polémiques récentes [name]..."
   - etc.

2. **Parallel Research**: All queries sent to Perplexity AI simultaneously
   - Uses `llama-3.1-sonar-small-128k-online` model
   - Real-time web search with citations
   - 30-60 seconds for complete analysis

3. **Content Parsing**: Response text split into segments (paragraphs/sentences)

4. **Classification**: Each segment analyzed for:
   - **Keywords**: Drama vs. good action terms
   - **Sentiment**: Positive, negative, or neutral
   - **Label**: drama, good_action, or neutral

5. **Storage**: All mentions saved to database with metadata

### 2. Trust Score Calculation

```
Base Score: 50

Adjustments:
+ (good_actions × 10 × recency_weight)
- (dramas × 15 × recency_weight)
+ (avg_sentiment × 20)

Recency Weight: e^(-days_old / 180)
(Recent events have exponentially more impact)

Final Score: clamp(0, 100, calculated_score)
```

### 3. Ranking System

- Influencers sorted by trust score (descending)
- Position assigned (#1, #2, #3...)
- Top 3 get medal emojis (🥇🥈🥉)
- Filters applied server-side for performance

---

## 🎨 UI/UX Design

### Color Scheme

- **Primary**: #3b82f6 (Blue)
- **Success**: #10b981 (Green) - High trust
- **Warning**: #f59e0b (Orange) - Medium trust
- **Danger**: #ef4444 (Red) - Low trust
- **Background**: #f9fafb (Light gray)

### Trust Score Colors

| Score | Color | Label |
|-------|-------|-------|
| 80-100 | 🟢 Green | Très fiable |
| 60-79 | 🔵 Blue | Fiable |
| 40-59 | 🟠 Orange | Neutre |
| 20-39 | 🔴 Red | Peu fiable |
| 0-19 | 🔴 Dark Red | Non fiable |

### Screens

1. **Ranking Screen**: List of all influencers with filters
2. **Detail Screen**: Full analysis with mentions breakdown
3. **Search Screen**: Add new influencer to database

---

## 🔧 Configuration

### Backend Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="file:./dev.db"

# Perplexity AI
PERPLEXITY_API_KEY=your_api_key_here
PERPLEXITY_MAX_CONCURRENT=5
PERPLEXITY_RATE_LIMIT_MS=1000

# Cache
CACHE_TTL_HOURS=24

# Rate Limiting
MAX_REQUESTS_PER_MINUTE=60
```

### Mobile App Configuration

Edit `mobile-app/mobile/app.json`:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://localhost:3000/api"
    }
  }
}
```

For production, change to your deployed API URL.

---

## 📊 Database Schema

### Influencer Table
```sql
- id: UUID (primary key)
- name: String (unique)
- socialHandles: JSON (optional)
- niche: String (optional)
- trustScore: Float (default: 50.0)
- dramaCount: Integer (default: 0)
- goodActionCount: Integer (default: 0)
- neutralCount: Integer (default: 0)
- avgSentiment: Float (default: 0.0)
- language: String (default: "fr")
- lastUpdated: DateTime
- createdAt: DateTime
```

### Mention Table
```sql
- id: UUID (primary key)
- influencerId: UUID (foreign key)
- source: String (perplexity, news, youtube, etc.)
- sourceUrl: String
- textExcerpt: Text
- sentimentScore: Float (-1 to 1)
- label: Enum (drama, good_action, neutral)
- scrapedAt: DateTime
```

### AnalysisHistory Table
```sql
- id: UUID (primary key)
- influencerId: UUID (foreign key)
- trustScore: Float
- dramaCount: Integer
- goodActionCount: Integer
- neutralCount: Integer
- avgSentiment: Float
- analyzedAt: DateTime
```

---

## 🧪 Testing

### Backend API Testing

```bash
# Health check
curl http://localhost:3000/api/health

# Get all influencers
curl http://localhost:3000/api/influencers

# Search influencer
curl -X POST http://localhost:3000/api/influencers/search \
  -H "Content-Type: application/json" \
  -d '{"name": "Squeezie"}'

# Get influencer by ID
curl http://localhost:3000/api/influencers/{id}

# Refresh influencer
curl -X POST http://localhost:3000/api/influencers/{id}/refresh
```

### Mobile App Testing

1. **iOS Simulator**: `npm start` → Press `i`
2. **Android Emulator**: `npm start` → Press `a`
3. **Web Browser**: `npm start` → Press `w`
4. **Physical Device**: Scan QR code with Expo Go app

### PWA Testing

1. **Chrome DevTools**:
   - Open DevTools (F12)
   - Go to "Application" tab
   - Check "Manifest" section
   - Check "Service Workers" section
   - Run Lighthouse audit

2. **Installation Test**:
   - Open app in Chrome/Safari
   - Try installing (see PWA_INSTALLATION_GUIDE.md)
   - Verify offline functionality

---

## 🚀 Deployment

### Backend Deployment (Example: Railway/Render)

1. Push code to GitHub
2. Connect repository to Railway/Render
3. Set environment variables
4. Deploy automatically

### Frontend Deployment (Example: Vercel/Netlify)

```bash
cd mobile-app/mobile

# Build for web
npx expo export:web

# Deploy to Vercel
vercel deploy

# Or deploy to Netlify
netlify deploy --prod
```

### Database Migration

```bash
# Production migration
npx prisma migrate deploy

# View database
npx prisma studio
```

---

## 📚 API Documentation

### Endpoints

#### GET `/api/health`
Health check endpoint.

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-11-15T17:00:00.000Z",
  "environment": "development"
}
```

#### GET `/api/influencers`
Get all influencers with optional filters.

**Query Parameters:**
- `minTrustScore` (number, optional): Minimum trust score filter
- `niche` (string, optional): Filter by niche
- `limit` (number, optional): Max results (default: 50)
- `search` (string, optional): Search by name

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Squeezie",
      "trustScore": 85.5,
      "dramaCount": 2,
      "goodActionCount": 5,
      "rank": 1,
      "trustLevel": "Très fiable",
      "trustColor": "#10b981",
      ...
    }
  ],
  "count": 10
}
```

#### POST `/api/influencers/search`
Search for influencer by name (creates if not exists).

**Body:**
```json
{
  "name": "Squeezie",
  "forceRefresh": false
}
```

**Response:**
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

#### GET `/api/influencers/:id`
Get influencer by ID with all mentions.

#### POST `/api/influencers/:id/refresh`
Force refresh influencer data.

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: "Perplexity API key not configured"
- **Solution**: Add `PERPLEXITY_API_KEY` to `.env` file

**Problem**: All scores stuck at 50
- **Solution**: Check Perplexity API is working, review logs for classification issues

**Problem**: Database errors
- **Solution**: Run `npx prisma migrate dev` to update schema

### Mobile App Issues

**Problem**: "Network request failed"
- **Solution**: Ensure backend is running on `http://localhost:3000`

**Problem**: App won't install as PWA
- **Solution**: See PWA_INSTALLATION_GUIDE.md for platform-specific instructions

**Problem**: Icons not showing
- **Solution**: Ensure icons exist in `public/` folder, clear cache

---

## 📖 Documentation Files

- `README.md` - Main project documentation
- `PROJECT_SUMMARY.md` - Original Python app summary
- `COMPLETE_PROJECT_GUIDE.md` - This file (comprehensive guide)
- `PWA_INSTALLATION_GUIDE.md` - PWA installation instructions
- `mobile-app/API_DOCUMENTATION.md` - Detailed API reference
- `mobile-app/HOW_TO_OPEN_APP.md` - Quick start guide
- `mobile-app/SETUP_COMPLETE.md` - Setup status

---

## 🤝 Contributing

### Code Style

- **TypeScript**: Use strict mode, proper types
- **React**: Functional components with hooks
- **Naming**: camelCase for variables, PascalCase for components
- **Comments**: Explain "why", not "what"

### Git Workflow

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes and commit: `git commit -m "Add feature"`
3. Push branch: `git push origin feature/my-feature`
4. Create pull request

---

## 📄 License

This project was created for the Blackbox Hackathon 2025.

---

## 🙏 Acknowledgments

- **Perplexity AI** for real-time web research API
- **Expo** for cross-platform mobile development
- **Prisma** for type-safe database access
- **React Native Paper** for Material Design components
- **Blackbox** for the hackathon opportunity

---

## 📞 Support

For issues or questions:

1. Check this documentation
2. Review API logs: `mobile-app/backend/logs/`
3. Check browser console for frontend errors
4. Review Prisma Studio for database issues: `npx prisma studio`

---

**Built with ❤️ for Hackathon Blackbox 2025**

🔍 Happy Monitoring!
