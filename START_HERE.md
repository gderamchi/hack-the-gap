# 🎉 YOUR APP IS READY! START HERE

## ✅ Everything is Running

- ✅ **Backend**: http://localhost:3000 (running in background)
- ✅ **Expo**: http://localhost:8081 (running in background)
- ✅ **Database**: SQLite (created and migrated)
- ✅ **API Key**: Perplexity configured

---

## 🚀 OPEN YOUR APP NOW (3 Easy Steps)

### Step 1: Open Terminal

Open a new terminal window (Command + T or Command + N)

### Step 2: Run This Command

```bash
cd "/Users/roane/roane/perso/hackathon blackbox"
./OPEN_APP_NOW.sh
```

### Step 3: Choose Option

When prompted, choose:
- **1** for iOS Simulator (RECOMMENDED if on macOS)
- **2** for Android Emulator
- **3** for Web Browser (quick test)
- **4** for Physical Device (QR code)

**That's it!** The app will open automatically.

---

## 📱 Alternative: Manual Commands

### For iOS Simulator (macOS only)

```bash
cd "/Users/roane/roane/perso/hackathon blackbox/mobile-app/mobile"
npx expo start --ios
```

### For Web Browser

```bash
cd "/Users/roane/roane/perso/hackathon blackbox/mobile-app/mobile"
npx expo start --web
```

### For Physical Device (QR Code)

```bash
cd "/Users/roane/roane/perso/hackathon blackbox/mobile-app/mobile"
npx expo start
```

Then scan the QR code with:
- **iOS**: Camera app
- **Android**: Expo Go app

---

## 🎮 How to Use the App

### 1️⃣ Accept Disclaimer
When app opens, tap **"J'ai compris et j'accepte"**

### 2️⃣ Search for Influencer
1. Tap the **"Rechercher"** button (floating button at bottom-right)
2. Type: **`Squeezie`**
3. Tap **"Rechercher"**
4. **Wait 30-60 seconds** (Perplexity is researching the web!)
5. **View results!** 🎉

### 3️⃣ Explore Features
- ✅ View trust score (0-100%) with color coding
- ✅ See drama count and good action count
- ✅ Tap "Dramas" tab to see controversies
- ✅ Tap "Positifs" tab to see good actions
- ✅ Click link icons (🔗) to open source URLs
- ✅ Pull down to refresh data
- ✅ Go back to see ranking of all influencers

---

## 🧪 Try These French Influencers

- **Squeezie** (gaming, very popular)
- **Norman** (comedy sketches)
- **Cyprien** (comedy sketches)
- **Natoo** (lifestyle, vlogs)
- **McFly & Carlito** (comedy duo)
- **Enjoy Phoenix** (beauty, lifestyle)
- **Amixem** (gaming, vlogs)

---

## 📊 What Happens When You Search?

1. **Mobile app** sends request to backend
2. **Backend** generates 7 French queries about the influencer:
   - "Controverses [name]..."
   - "Actions positives [name]..."
   - "Polémiques récentes [name]..."
   - etc.
3. **Perplexity AI** researches each query in parallel (real-time web search)
4. **Backend** analyzes results:
   - Classifies as drama/good_action/neutral
   - Calculates sentiment scores
   - Computes trust score (0-100%)
5. **Database** saves all data
6. **Mobile app** displays results with sources

**First search**: 30-60 seconds (researching)  
**Cached search**: Instant (already analyzed)

---

## 🔧 Troubleshooting

### App Won't Open?

**Check backend is running**:
```bash
curl http://localhost:3000/api/health
```

Should return: `{"success":true,"status":"healthy",...}`

If not, restart:
```bash
cd "/Users/roane/roane/perso/hackathon blackbox/mobile-app/backend"
npm run dev
```

### "Network request failed" in App?

Backend is not running. Restart it (see above).

### Expo Won't Start?

```bash
# Kill and restart
pkill -f "expo start"
cd "/Users/roane/roane/perso/hackathon blackbox/mobile-app/mobile"
npx expo start --clear
```

### iOS Simulator Not Opening?

Make sure Xcode is installed:
```bash
xcode-select --install
```

---

## 📚 Documentation

All docs are in `mobile-app/` directory:

- **HOW_TO_OPEN_APP.md** ⭐ - Detailed opening instructions
- **SETUP_COMPLETE.md** - What's running and status
- **QUICK_START.md** - Quick reference
- **README.md** - Complete documentation
- **API_DOCUMENTATION.md** - API reference
- **PROJECT_SUMMARY.md** - Project overview

---

## 🎯 Quick Commands Reference

### Check Backend
```bash
curl http://localhost:3000/api/health
```

### Check Expo
```bash
lsof -i :8081
```

### Restart Backend
```bash
cd mobile-app/backend
npm run dev
```

### Restart Mobile
```bash
cd mobile-app/mobile
npx expo start
```

### Stop Everything
```bash
pkill -f "npm run dev"
pkill -f "expo start"
```

---

## 💡 Pro Tips

1. **First search takes time** - Perplexity researches 7 queries in parallel
2. **Cached results are instant** - Try searching same influencer twice
3. **Always verify sources** - Click the link icons to see original articles
4. **Pull to refresh** - Update data for an influencer
5. **Use filters** - On ranking screen, filter by minimum trust score
6. **Check multiple influencers** - Compare trust scores

---

## 🎨 Understanding Trust Scores

### Color Coding
- 🟢 **80-100%**: Très fiable (Very trustworthy) - Green
- 🔵 **60-79%**: Fiable (Trustworthy) - Blue
- 🟠 **40-59%**: Neutre (Neutral) - Orange
- 🔴 **20-39%**: Peu fiable (Not very trustworthy) - Red
- 🔴 **0-19%**: Non fiable (Not trustworthy) - Dark Red

### How It's Calculated
```
Base Score: 50

+ Good Actions × 10 × Recency Weight
- Dramas × 15 × Recency Weight
+ Average Sentiment × 20

Recency Weight = e^(-days_old / 180)
(Recent events have more impact)

Final Score: 0-100 (clamped)
```

---

## 🎉 YOU'RE ALL SET!

**Everything is ready. Just run:**

```bash
cd "/Users/roane/roane/perso/hackathon blackbox"
./OPEN_APP_NOW.sh
```

**Choose option 1 (iOS Simulator) or 3 (Web Browser) for fastest results!**

---

## 🆘 Need Help?

1. Check **HOW_TO_OPEN_APP.md** for detailed instructions
2. Check **SETUP_COMPLETE.md** for status and troubleshooting
3. Check **README.md** for complete documentation

---

**Happy monitoring! 🔍**

**Start by searching for "Squeezie" - it's a great test!**
