# ⚡ Quick Start Guide - Influencer Trust Score

## 🚀 Get Running in 5 Minutes

### Step 1: Start Backend (Terminal 1)
```bash
cd "/Users/roane/roane/perso/hackathon blackbox/mobile-app/backend"
npm run dev
```

**Expected output:**
```
🚀 Server running on port 3000
📊 Environment: development
🔗 Health check: http://localhost:3000/api/health
```

### Step 2: Start Mobile App (Terminal 2)
```bash
cd "/Users/roane/roane/perso/hackathon blackbox/mobile-app/mobile"
npm start
```

**Then press:**
- `w` for **Web** (fastest, recommended for testing)
- `i` for **iOS Simulator** (requires Xcode)
- `a` for **Android Emulator** (requires Android Studio)

### Step 3: Test the App

1. **Web opens automatically** at http://localhost:8081
2. **Accept disclaimer** (first time only)
3. **Tap "Rechercher"** button (bottom right)
4. **Enter "Squeezie"** (or any French influencer)
5. **Wait 30-60 seconds** for analysis
6. **View results!** 🎉

---

## 📱 Install as PWA

### On Your Phone (Android)
1. Open http://localhost:8081 in **Chrome**
2. Wait 3 seconds for install prompt
3. Tap **"Install"**
4. App appears on home screen!

### On Your Phone (iOS)
1. Open http://localhost:8081 in **Safari**
2. Tap **Share** button (square with arrow)
3. Tap **"Add to Home Screen"**
4. Tap **"Add"**
5. App appears on home screen!

---

## 🧪 Quick Test Commands

```bash
# Check backend is running
curl http://localhost:3000/api/health

# Get all influencers
curl http://localhost:3000/api/influencers

# Search for influencer
curl -X POST http://localhost:3000/api/influencers/search \
  -H "Content-Type: application/json" \
  -d '{"name": "Squeezie"}'
```

---

## ✅ What's New

### 🎯 Improved Scoring
- **60+ drama keywords** (was 23)
- **40+ good action keywords** (was 20)
- **More lenient classification** (catches more mentions)
- **Better text parsing** (paragraphs instead of sentences)

### 🏆 Ranking System
- **Rank positions** (#1, #2, #3...)
- **Medal badges** (🥇🥈🥉 for top 3)
- **Search & filters** (by name, minimum score)
- **Summary stats** (total count, average score)

### 📱 PWA Features
- **Installable** on iOS, Android, Desktop
- **Offline support** (view cached data)
- **Full-screen mode** (no browser UI)
- **App icons** and splash screen

### 🎨 UX Improvements
- **Better empty states** with helpful messages
- **Loading indicators**
- **Summary cards** at top
- **Polished design**

---

## 📚 Documentation

- **COMPLETE_PROJECT_GUIDE.md** - Full documentation
- **PWA_INSTALLATION_GUIDE.md** - How to install on mobile
- **TESTING_AND_DEPLOYMENT.md** - Testing and deployment
- **IMPLEMENTATION_SUMMARY.md** - What was changed

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Kill existing process
lsof -ti:3000 | xargs kill -9

# Restart
cd mobile-app/backend
npm run dev
```

### Mobile app can't connect
1. Check backend is running: `curl http://localhost:3000/api/health`
2. Restart Expo: `npm start`

### Scores still at 50
- This is normal for cached data
- Search a new influencer with `forceRefresh: true`
- Check Perplexity API key is set in `.env`

---

## 🎯 Try These Influencers

- **Squeezie** (gaming, very popular)
- **Norman** (comedy)
- **Cyprien** (comedy)
- **Natoo** (lifestyle)
- **McFly & Carlito** (comedy duo)

---

## 🚀 Next Steps

1. **Test the app** - Search for influencers
2. **Install as PWA** - Try on your phone
3. **Check documentation** - Read the guides
4. **Deploy** - Follow TESTING_AND_DEPLOYMENT.md
5. **Customize** - Add your own features!

---

## 💡 Pro Tips

- **First search takes 30-60 seconds** (Perplexity researches 7 queries)
- **Cached results are instant** (24-hour cache)
- **Pull to refresh** updates data
- **Use filters** to find top influencers
- **Check sources** by clicking link icons

---

**🎉 You're all set! Start exploring influencer trust scores! 🔍**

**Questions?** Check the documentation files or backend logs.

**Built with ❤️ for Hackathon Blackbox 2025**
