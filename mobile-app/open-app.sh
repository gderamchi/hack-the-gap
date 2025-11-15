#!/bin/bash

# Script to open the Influencer Trust Score mobile app

echo "🚀 Opening Influencer Trust Score App..."
echo ""

# Check if backend is running
echo "📡 Checking backend..."
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Backend is running on http://localhost:3000"
else
    echo "❌ Backend is not running!"
    echo "Starting backend..."
    cd backend
    npm run dev &
    sleep 3
    cd ..
fi

echo ""
echo "📱 Starting mobile app..."
echo ""
echo "Choose how to open the app:"
echo "  1) iOS Simulator (macOS only)"
echo "  2) Android Emulator"
echo "  3) Physical Device (scan QR code)"
echo "  4) Web Browser"
echo ""
read -p "Enter your choice (1-4): " choice

cd mobile

case $choice in
    1)
        echo "Opening iOS Simulator..."
        npx expo start --ios
        ;;
    2)
        echo "Opening Android Emulator..."
        npx expo start --android
        ;;
    3)
        echo "Starting Expo - Scan the QR code with Expo Go app..."
        npx expo start
        ;;
    4)
        echo "Opening in web browser..."
        npx expo start --web
        ;;
    *)
        echo "Invalid choice. Starting Expo (scan QR code)..."
        npx expo start
        ;;
esac
