#!/bin/bash

echo "🌐 Opening App in Web Browser..."
echo ""
echo "✅ This doesn't require Xcode or iOS Simulator!"
echo ""

# Check if already running
if curl -s http://localhost:8081 > /dev/null 2>&1; then
    echo "✅ App is already running!"
    echo ""
    echo "Opening in browser..."
    open http://localhost:8081
    echo ""
    echo "✅ Done! Your app should open in your browser."
    exit 0
fi

echo "⏳ Starting Expo..."
echo ""

cd "/Users/roane/roane/perso/hackathon blackbox/mobile-app/mobile"

# Kill existing expo
pkill -f "expo start" 2>/dev/null
sleep 2

# Start in web mode
npx expo start --web

echo ""
echo "✅ App should open in your browser!"
echo ""
echo "If it doesn't open automatically, go to:"
echo "http://localhost:8081"
