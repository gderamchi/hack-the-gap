#!/bin/bash

echo "🚀 Starting Influencer Trust App"
echo ""
echo "📱 Scan the QR code with your phone:"
echo "   - iPhone: Open Camera app"
echo "   - Android: Open Expo Go app"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if Expo is already running
if lsof -Pi :8082 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Expo is already running on port 8082"
    echo ""
    echo "📱 Scan the QR code above to open the app!"
    echo ""
else
    echo "🔄 Starting Expo..."
    cd /Users/guillaume_deramchi/Documents/hack-the-gap/mobile-app/mobile
    npx expo start
fi
