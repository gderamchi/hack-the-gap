#!/bin/bash

echo "🧹 Clearing all caches and restarting..."

# Kill any running Metro bundler
echo "Stopping Metro bundler..."
pkill -f "react-native" || true
pkill -f "metro" || true

# Clear watchman
echo "Clearing watchman..."
watchman watch-del-all 2>/dev/null || true

# Clear Metro cache
echo "Clearing Metro cache..."
rm -rf $TMPDIR/metro-* 2>/dev/null || true
rm -rf $TMPDIR/haste-* 2>/dev/null || true

# Clear npm cache
echo "Clearing npm cache..."
npm cache clean --force

# Remove node_modules and reinstall
echo "Reinstalling dependencies..."
rm -rf node_modules
npm install

# Clear Expo cache
echo "Clearing Expo cache..."
npx expo start --clear

echo "✅ Done! The app should now reload with fresh code."
