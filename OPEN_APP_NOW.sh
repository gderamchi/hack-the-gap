#!/bin/bash

echo "🚀 Opening Influencer Trust Score App..."
echo ""
echo "✅ Backend is running on http://localhost:3000"
echo "✅ Expo is running on http://localhost:8081"
echo ""
echo "Choose how to open:"
echo ""
echo "  1) iOS Simulator (macOS only) - RECOMMENDED"
echo "  2) Android Emulator"
echo "  3) Web Browser (quick test)"
echo "  4) Show QR code for phone"
echo ""
read -p "Enter choice (1-4): " choice

cd "/Users/roane/roane/perso/hackathon blackbox/mobile-app/mobile"

case $choice in
    1)
        echo ""
        echo "🍎 Opening iOS Simulator..."
        echo "⏳ This may take 30-60 seconds..."
        echo ""
        # Kill existing expo and start fresh with iOS
        pkill -f "expo start" 2>/dev/null
        sleep 2
        npx expo start --ios
        ;;
    2)
        echo ""
        echo "🤖 Opening Android Emulator..."
        echo "⚠️  Make sure Android Emulator is already running!"
        echo "⏳ This may take 30-60 seconds..."
        echo ""
        pkill -f "expo start" 2>/dev/null
        sleep 2
        npx expo start --android
        ;;
    3)
        echo ""
        echo "🌐 Opening in Web Browser..."
        echo ""
        pkill -f "expo start" 2>/dev/null
        sleep 2
        npx expo start --web
        ;;
    4)
        echo ""
        echo "📱 Starting Expo - Scan QR code with your phone..."
        echo ""
        echo "📲 Install Expo Go first:"
        echo "   iOS: https://apps.apple.com/app/expo-go/id982107779"
        echo "   Android: https://play.google.com/store/apps/details?id=host.exp.exponent"
        echo ""
        pkill -f "expo start" 2>/dev/null
        sleep 2
        npx expo start
        ;;
    *)
        echo ""
        echo "❌ Invalid choice"
        echo ""
        echo "Run this script again: ./OPEN_APP_NOW.sh"
        exit 1
        ;;
esac
