# 🚀 Complete Setup Guide

Step-by-step instructions to get the French Influencer Trust Score mobile app running locally.

## Prerequisites Installation

### 1. Install Node.js

**macOS** (using Homebrew):
```bash
brew install node@18
```

**Windows/Linux**: Download from [nodejs.org](https://nodejs.org/)

Verify installation:
```bash
node --version  # Should be 18+
npm --version
```

### 2. Install PostgreSQL

**Option A: Using Docker (Recommended)**
```bash
# Install Docker Desktop from docker.com

# Start PostgreSQL container
docker run -d \
  --name influencer-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=influencer_trust \
  -p 5432:5432 \
  postgres:15

# Verify it's running
docker ps
```

**Option B: Native Installation**

**macOS**:
```bash
brew install postgresql@15
brew services start postgresql@15
createdb influencer_trust
```

**Windows**: Download from [postgresql.org](https://www.postgresql.org/download/windows/)

### 3. Install Expo CLI

```bash
npm install -g expo-cli
```

### 4. Get Perplexity.ai API Key

1. Go to [perplexity.ai](https://www.perplexity.ai)
2. Sign up for an account
3. Navigate to API settings
4. Generate a new API key
5. Copy the key (you'll need it later)

### 5. Install Mobile Development Tools

**For iOS (macOS only)**:
- Install Xcode from App Store
- Open Xcode → Preferences → Components → Install iOS Simulator

**For Android**:
- Install Android Studio from [developer.android.com](https://developer.android.com/studio)
- Open Android Studio → Tools → AVD Manager → Create Virtual Device

**For Physical Device**:
- Install Expo Go app from App Store or Google Play

## Backend Setup

### Step 1: Navigate to Backend Directory

```bash
cd "/Users/roane/roane/perso/hackathon blackbox/mobile-app/backend"
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install:
- Express (web framework)
- Prisma (database ORM)
- Axios (HTTP client)
- Winston (logging)
- And all other dependencies

### Step 3: Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Open .env in your editor
nano .env  # or use VS Code: code .env
```

Edit the `.env` file:

```env
# Database - Update if using different credentials
DATABASE_URL="postgresql://postgres:password@localhost:5432/influencer_trust?schema=public"

# Perplexity AI - REQUIRED: Add your API key here
PERPLEXITY_API_KEY="pplx-your-actual-api-key-here"

# Server
PORT=3000
NODE_ENV=development

# Rate Limiting
MAX_REQUESTS_PER_MINUTE=60
PERPLEXITY_MAX_CONCURRENT=5
PERPLEXITY_RATE_LIMIT_MS=1000

# Cache
CACHE_TTL_HOURS=24
```

**Important**: Replace `pplx-your-actual-api-key-here` with your real Perplexity API key!

### Step 4: Setup Database

```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations (creates tables)
npm run prisma:migrate

# Optional: Open Prisma Studio to view database
npm run prisma:studio
```

You should see output like:
```
✔ Generated Prisma Client
✔ Database migrations applied
```

### Step 5: Start Backend Server

```bash
npm run dev
```

You should see:
```
🚀 Server running on port 3000
📊 Environment: development
🔗 Health check: http://localhost:3000/api/health
```

### Step 6: Test Backend

Open a new terminal and test:

```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Expected response:
# {"success":true,"status":"healthy","timestamp":"..."}
```

✅ **Backend is ready!** Keep this terminal running.

## Mobile App Setup

### Step 1: Navigate to Mobile Directory

Open a **new terminal** window:

```bash
cd "/Users/roane/roane/perso/hackathon blackbox/mobile-app/mobile"
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install:
- React Native
- Expo SDK
- React Navigation
- React Query
- React Native Paper
- And all other dependencies

### Step 3: Configure API URL (if needed)

If your backend is running on a different URL, edit `app.json`:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://localhost:3000/api"
    }
  }
}
```

**Note**: For physical devices, replace `localhost` with your computer's IP address:
```json
"apiUrl": "http://192.168.1.100:3000/api"
```

To find your IP:
- **macOS**: `ifconfig | grep "inet " | grep -v 127.0.0.1`
- **Windows**: `ipconfig`

### Step 4: Start Expo Development Server

```bash
npm start
```

You should see:
```
› Metro waiting on exp://192.168.1.100:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web
```

### Step 5: Run on Device/Simulator

**Option A: iOS Simulator (macOS only)**
```
Press 'i' in the terminal
```

**Option B: Android Emulator**
```
1. Start Android Emulator from Android Studio
2. Press 'a' in the terminal
```

**Option C: Physical Device**
```
1. Install Expo Go app from App Store or Google Play
2. Scan the QR code shown in terminal
3. App will load on your device
```

✅ **Mobile app is running!**

## First Run

### 1. Accept Disclaimer

When you first open the app, you'll see a disclaimer modal. Read it and tap "J'ai compris et j'accepte".

### 2. Search for an Influencer

1. Tap the "Rechercher" button (floating action button)
2. Enter a French influencer name (e.g., "Squeezie")
3. Tap "Rechercher"
4. Wait 30-60 seconds for analysis
5. View the results!

### 3. Explore Features

- **Ranking Screen**: See all analyzed influencers sorted by trust score
- **Filters**: Tap chips to filter by minimum trust score
- **Search Bar**: Search by name in the ranking
- **Detail Screen**: Tap an influencer to see full profile
- **Mentions**: View dramas, good actions, and sources
- **Refresh**: Pull down to refresh or tap refresh icon

## Troubleshooting

### Backend Issues

**Problem**: `Error: connect ECONNREFUSED`
```bash
# Check if PostgreSQL is running
docker ps  # Should show influencer-postgres

# If not running, start it
docker start influencer-postgres
```

**Problem**: `Prisma Client not generated`
```bash
cd mobile-app/backend
npm run prisma:generate
```

**Problem**: `PERPLEXITY_API_KEY not configured`
```bash
# Edit .env and add your API key
nano .env
# Then restart server: npm run dev
```

### Mobile Issues

**Problem**: `Unable to resolve module`
```bash
# Clear cache and reinstall
cd mobile-app/mobile
rm -rf node_modules
npm install
npm start -- --clear
```

**Problem**: `Network request failed`
```bash
# Check backend is running
curl http://localhost:3000/api/health

# If using physical device, update apiUrl in app.json
# Replace localhost with your computer's IP address
```

**Problem**: Expo won't start
```bash
# Clear Expo cache
expo start -c

# Or reinstall Expo CLI
npm install -g expo-cli
```

### Database Issues

**Problem**: `Migration failed`
```bash
# Reset database
cd mobile-app/backend
npx prisma migrate reset
npx prisma migrate dev
```

**Problem**: `Can't reach database server`
```bash
# Check PostgreSQL is running
docker ps

# Check connection string in .env
# Make sure port 5432 is not blocked
```

## Development Tips

### Hot Reload

Both backend and mobile app support hot reload:
- **Backend**: Changes to `.ts` files automatically restart server
- **Mobile**: Changes to `.tsx` files automatically refresh app

### Debugging

**Backend Logs**:
```bash
# Logs appear in terminal where you ran npm run dev
# Look for errors in red
```

**Mobile Logs**:
```bash
# In Expo terminal, press 'j' to open debugger
# Or shake device and tap "Debug"
```

### Database Inspection

```bash
cd mobile-app/backend
npm run prisma:studio
# Opens web UI at http://localhost:5555
```

### API Testing

Use curl or Postman to test API endpoints:

```bash
# Get all influencers
curl http://localhost:3000/api/influencers

# Search for influencer
curl -X POST http://localhost:3000/api/influencers/search \
  -H "Content-Type: application/json" \
  -d '{"name":"Squeezie"}'

# Get influencer by ID
curl http://localhost:3000/api/influencers/{id}
```

## Next Steps

1. ✅ Backend running on http://localhost:3000
2. ✅ Mobile app running on simulator/device
3. ✅ Search for your first influencer
4. 📖 Read [README.md](./README.md) for full documentation
5. 🚀 Build for production (see README.md)

## Getting Help

- **Backend errors**: Check terminal logs where `npm run dev` is running
- **Mobile errors**: Check Expo terminal and device logs
- **Database errors**: Run `npm run prisma:studio` to inspect data
- **API errors**: Test endpoints with curl to isolate issues

---

**Congratulations! 🎉 Your app is ready to use!**

Try searching for popular French influencers like:
- Squeezie
- Norman
- Cyprien
- Natoo
- Enjoy Phoenix
- McFly & Carlito

Happy monitoring! 🔍
