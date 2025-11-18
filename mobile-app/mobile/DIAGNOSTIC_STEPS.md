# 🔍 Diagnostic Steps for Contributor Dashboard Issue

## Current Status
✅ **Backend APIs**: All working correctly - returning proper user data
✅ **Code Configuration**: All correct - tabs set to 'user', proper type checking
✅ **File Structure**: No duplicate files found
✅ **Build Artifacts**: No stale compiled code found

## The Mystery
The code is **100% correct** but you're still seeing influencer data in contributor tabs. This means:
1. Either the app is running old cached JavaScript
2. Or there's a runtime issue we need to debug

## 🔬 Diagnostic Steps

### Step 1: Check What's Actually Running
Open your mobile app and check the console/terminal where it's running. Look for these logs:

```
[Leaderboard] Loaded contributors: X items
[Leaderboard] First item: {...}
[LeaderboardList] Rendering with type: user, items: X
[LeaderboardList] First item keys: [...]
```

**What to look for:**
- Does it say `type: user` or `type: influencer`?
- Does the first item have `dramaReports` and `positiveReports` (user) or `imageUrl` and `niche` (influencer)?

### Step 2: Add More Debug Logging
If the logs aren't showing, let's add more explicit logging. Can you:

1. Open the mobile app
2. Navigate to Leaderboard
3. Switch to "🏆 All Contributors" tab
4. Take a screenshot of:
   - The UI showing the wrong data
   - The console/terminal output
   - The network tab (if on web) showing the API response

### Step 3: Verify API Response in Browser
If running on web, open DevTools (F12) and:

1. Go to Network tab
2. Switch to Contributors tab
3. Find the request to `/engagement/leaderboard/top-contributors`
4. Check the response - does it show user data or influencer data?

### Step 4: Force Complete Cache Clear

Try these in order:

#### Option A: Nuclear Clear (Recommended)
```bash
cd mobile-app/mobile

# Stop everything
pkill -f "expo"
pkill -f "metro"
pkill -f "react-native"

# Clear ALL caches
rm -rf .expo
rm -rf node_modules/.cache
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-*
rm -rf $TMPDIR/react-*
watchman watch-del-all 2>/dev/null || true

# Reinstall
rm -rf node_modules
npm install

# Start completely fresh
npx expo start --clear --reset-cache
```

#### Option B: Web-Specific Clear (If on Web)
```bash
cd mobile-app/mobile

# Clear web build
rm -rf web-build
rm -rf .expo/web

# Start fresh
npx expo start --web --clear
```

Then in browser:
1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"
4. Or press Ctrl+Shift+Delete and clear all browsing data

#### Option C: Native App Clear (If on iOS/Android)
```bash
cd mobile-app/mobile

# For iOS
rm -rf ios/build
npx expo run:ios --clear

# For Android
rm -rf android/build
rm -rf android/app/build
npx expo run:android --clear
```

### Step 5: Verify the Fix

After clearing cache, you should see:

**Contributors Tab (🏆 All Contributors):**
```
🏆 Samir                    [1]
1 drama report 🚨
Reputation: 50.0 • Level 1
```

**NOT this (influencer):**
```
🥇 Thomas Pesquet          [99]
Science
+2.5 pts (+3.2%)
```

**Key Visual Differences:**
- ✅ User: Blue circular avatar with letter
- ❌ Influencer: Profile photo
- ✅ User: "X drama reports 🚨" or "X good actions ✨"
- ❌ Influencer: Niche name (Science, Gaming, etc.)
- ✅ User: Black level badge on right
- ❌ Influencer: Colored trust score badge

### Step 6: Check Console Logs

After switching to Contributors tab, you should see:

```javascript
[Leaderboard] Loaded contributors: 1 items
[Leaderboard] First item: {
  "id": "14d2b8a5-3fb5-4129-ae57-5507b19f4a48",
  "name": "Samir",
  "avatar": null,
  "role": "COMMUNITY",
  "subscriptionTier": "FREE",
  "dramaReports": 1,
  "positiveReports": 0,
  "totalReports": 1,
  "reputationScore": 50,
  "level": 1,
  "rank": 1,
  "badge": "🏆"
}
[LeaderboardList] Rendering with type: user, items: 1
[LeaderboardList] First item keys: ["id","name","avatar","role","subscriptionTier","dramaReports","positiveReports","totalReports","reputationScore","level","rank","badge"]
```

**If you see this instead, there's a problem:**
```javascript
[Leaderboard] First item: {
  "id": "...",
  "name": "Thomas Pesquet",
  "imageUrl": "...",
  "niche": "Science",
  "trustScore": 99,
  ...
}
[LeaderboardList] First item keys: ["id","name","imageUrl","niche","trustScore",...]
```

## 🐛 If Still Not Working

### Possibility 1: Wrong API Endpoint
Check if the mobile app is hitting the wrong endpoint:

```bash
# Check current API URL
cat mobile-app/mobile/app.json | grep apiUrl
```

Should show: `https://4029e75314d9.ngrok-free.app/api`

Test that endpoint:
```bash
curl "https://4029e75314d9.ngrok-free.app/api/engagement/leaderboard/top-contributors?period=WEEKLY&limit=3" \
  -H "ngrok-skip-browser-warning: true" | jq
```

### Possibility 2: Code Not Being Used
The app might be using a different version of the files. Check:

```bash
# Verify file contents
head -70 mobile-app/mobile/src/screens/LeaderboardScreen.tsx | tail -10

# Should show the tabs array with type: 'user' for contributors
```

### Possibility 3: TypeScript Compilation Issue
```bash
cd mobile-app/mobile

# Clear TypeScript cache
rm -rf node_modules/.cache
rm tsconfig.tsbuildinfo 2>/dev/null

# Restart
npx expo start --clear
```

## 📊 Expected vs Actual

### Expected Behavior:
1. Switch to "🏆 All Contributors" tab
2. API call to `/engagement/leaderboard/top-contributors`
3. Response contains user data with `dramaReports`, `positiveReports`
4. `LeaderboardList` receives `type='user'`
5. Renders `renderUserItem` with blue avatar and user info

### What You're Seeing:
1. Switch to "🏆 All Contributors" tab
2. ??? (Need to check what API is called)
3. ??? (Need to check what data is received)
4. ??? (Need to check what type is passed)
5. Renders influencer items with profile photos

## 🎯 Next Steps

Please provide:
1. **Console logs** when switching to Contributors tab
2. **Network tab** showing the API request/response (if on web)
3. **Screenshot** of the UI showing the wrong data
4. **Result** of running the nuclear cache clear (Option A above)

This will help us identify exactly where the disconnect is happening!
