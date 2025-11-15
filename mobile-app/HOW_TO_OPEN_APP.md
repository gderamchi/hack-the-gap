# 📱 Your App is Running! Here's How to Open It

## ✅ Current Status

- ✅ **Backend**: Running on http://localhost:3000
- ✅ **Expo Metro**: Running on http://localhost:8081
- ✅ **Ready**: App is ready to open!

---

## 🎯 Choose Your Method

### Method 1: Open in Terminal (See QR Code)

Open a **new terminal** and run:

```bash
cd "/Users/roane/roane/perso/hackathon blackbox/mobile-app/mobile"
npx expo start
```

You'll see:
```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or Camera (iOS)

› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web
```

Then:
- Press **`i`** for iOS Simulator
- Press **`a`** for Android Emulator
- **Scan QR code** with your phone

---

### Method 2: iOS Simulator (Fastest - macOS only)

```bash
cd "/Users/roane/roane/perso/hackathon blackbox/mobile-app/mobile"
npx expo start --ios
```

This will:
1. Open iOS Simulator automatically
2. Install the app
3. Launch it

**Wait 30-60 seconds** for simulator to start.

---

### Method 3: Android Emulator

**First**, start Android Emulator from Android Studio.

**Then** run:
```bash
cd "/Users/roane/roane/perso/hackathon blackbox/mobile-app/mobile"
npx expo start --android
```

---

### Method 4: Physical Device (iPhone/Android)

#### Step 1: Install Expo Go App

- **iPhone**: [Download from App Store](https://apps.apple.com/app/expo-go/id982107779)
- **Android**: [Download from Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

#### Step 2: Connect to Same WiFi

Make sure your phone and computer are on the **same WiFi network**.

#### Step 3: Open Expo

In terminal:
```bash
cd "/Users/roane/roane/perso/hackathon blackbox/mobile-app/mobile"
npx expo start
```

#### Step 4: Scan QR Code

- **iPhone**: Open Camera app → Point at QR code → Tap notification
- **Android**: Open Expo Go app → Tap "Scan QR code" → Scan

#### Step 5: Wait

App will download and open (30-60 seconds first time).

---

### Method 5: Web Browser (Quick Test)

```bash
cd "/Users/roane/roane/perso/hackathon blackbox/mobile-app/mobile"
npx expo start --web
```

Opens in your default browser. **Note**: Some mobile features may not work.

---

## 🎮 Using the App

### 1. Accept Disclaimer
First time you open, tap **"J'ai compris et j'accepte"**

### 2. Search for Influencer
1. Tap **"Rechercher"** button (floating button, bottom-right)
2. Type: **`Squeezie`**
3. Tap **"Rechercher"**
4. **Wait 30-60 seconds** (Perplexity researching!)
5. View results! 🎉

### 3. Explore Features
- View trust score (0-100%)
- Check "Dramas" tab
- Check "Positifs" tab
- Click link icons to open sources
- Pull down to refresh
- Go back to see ranking

---

## 🧪 Test These Influencers

Try searching for:
- **Squeezie** (gaming)
- **Norman** (comedy)
- **Cyprien** (sketches)
- **Natoo** (lifestyle)
- **McFly & Carlito** (duo)

---

## 🔧 Troubleshooting

### "Network request failed"

**Check backend is running**:
```bash
curl http://localhost:3000/api/health
```

Should return:
```json
{"success":true,"status":"healthy",...}
```

If not, restart backend:
```bash
cd "/Users/roane/roane/perso/hackathon blackbox/mobile-app/backend"
npm run dev
```

---

### "Unable to connect to Metro"

**Restart Expo**:
```bash
# Kill existing Expo
pkill -f "expo start"

# Start fresh
cd "/Users/roane/roane/perso/hackathon blackbox/mobile-app/mobile"
npx expo start --clear
```

---

### Physical Device Can't Connect

**Make sure**:
1. Phone and computer on same WiFi
2. Firewall not blocking port 8081
3. Using correct QR code (not expired)

**Try**:
```bash
# Start with tunnel (slower but works through firewall)
npx expo start --tunnel
```

---

### App Crashes on Open

**Clear cache and rebuild**:
```bash
cd "/Users/roane/roane/perso/hackathon blackbox/mobile-app/mobile"
rm -rf node_modules/.cache
npx expo start --clear
```

---

## 📊 Check Status

### Backend Status
```bash
curl http://localhost:3000/api/health
```

### Expo Status
```bash
lsof -i :8081
```

### View Logs
```bash
# Backend logs
tail -f "/Users/roane/roane/perso/hackathon blackbox/.blackbox/tmp/shell_tool_2fb864291a2b.log"

# Mobile logs
tail -f "/Users/roane/roane/perso/hackathon blackbox/.blackbox/tmp/shell_tool_2042bd85eb32.log"
```

---

## 🎯 Recommended: iOS Simulator (Easiest)

If you're on macOS, this is the fastest way:

```bash
cd "/Users/roane/roane/perso/hackathon blackbox/mobile-app/mobile"
npx expo start --ios
```

Just wait for the simulator to open and the app to load!

---

## 💡 Pro Tips

1. **First search takes 30-60 seconds** (Perplexity API)
2. **Cached searches are instant** (try searching same influencer twice)
3. **Always verify sources** (click the link icons)
4. **Pull down to refresh** data
5. **Use filters** on ranking screen

---

## 🎉 You're Ready!

Choose one of the methods above and start using your app!

**Recommended for beginners**: Method 2 (iOS Simulator) or Method 5 (Web Browser)

---

**Need help?** Check the other documentation files in `mobile-app/` directory.

**Happy monitoring! 🔍**
