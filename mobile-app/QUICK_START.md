# ⚡ Quick Start Guide

Get the app running in 5 minutes!

## Prerequisites

- Node.js 18+
- PostgreSQL (or Docker)
- Perplexity.ai API key

## 1. Start Database

```bash
docker run -d --name influencer-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=influencer_trust \
  -p 5432:5432 postgres:15
```

## 2. Backend Setup

```bash
cd mobile-app/backend
npm install
cp .env.example .env
# Edit .env: Add your PERPLEXITY_API_KEY
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

✅ Backend running on http://localhost:3000

## 3. Mobile Setup

**New terminal**:
```bash
cd mobile-app/mobile
npm install
npm start
```

Then press:
- `i` for iOS Simulator
- `a` for Android Emulator
- Scan QR for physical device

## 4. Test

1. Accept disclaimer
2. Tap "Rechercher" button
3. Enter "Squeezie"
4. Wait 30-60 seconds
5. View results!

## Troubleshooting

**Backend won't start?**
```bash
# Check PostgreSQL
docker ps

# Regenerate Prisma
npm run prisma:generate
```

**Mobile won't start?**
```bash
# Clear cache
npm start -- --clear
```

**Network error?**
- Check backend is running: `curl http://localhost:3000/api/health`
- For physical device: Update `apiUrl` in `app.json` with your IP

## Documentation

- 📖 [Full README](./README.md)
- 🚀 [Detailed Setup Guide](./SETUP_GUIDE.md)
- 📡 [API Documentation](./API_DOCUMENTATION.md)
- 📊 [Project Summary](./PROJECT_SUMMARY.md)

---

**Need help?** Check the full documentation files above!
