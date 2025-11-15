#!/bin/bash

echo "🚀 Starting Influencer Trust Mobile App..."
echo ""
echo "📱 To run on your phone:"
echo ""
echo "1. Install 'Expo Go' app on your phone:"
echo "   - iPhone: App Store → Search 'Expo Go'"
echo "   - Android: Google Play → Search 'Expo Go'"
echo ""
echo "2. Make sure your phone and computer are on the SAME WiFi network"
echo ""
echo "3. When the QR code appears below, scan it with:"
echo "   - iPhone: Open Camera app → Point at QR code"
echo "   - Android: Open Expo Go app → Tap 'Scan QR Code'"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /Users/guillaume_deramchi/Documents/hack-the-gap/mobile-app/mobile
npx expo start --lan
