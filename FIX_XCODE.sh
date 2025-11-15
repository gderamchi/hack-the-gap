#!/bin/bash

echo "🔧 Fixing Xcode Configuration..."
echo ""

# Step 1: Reset xcode-select
echo "Step 1: Resetting xcode-select..."
sudo xcode-select --reset

# Step 2: Accept Xcode license
echo ""
echo "Step 2: Accepting Xcode license..."
sudo xcodebuild -license accept

# Step 3: Install command line tools if needed
echo ""
echo "Step 3: Ensuring command line tools are installed..."
xcode-select --install 2>/dev/null || echo "Command line tools already installed"

# Step 4: Verify installation
echo ""
echo "Step 4: Verifying installation..."
xcode-select -p

echo ""
echo "✅ Xcode configuration fixed!"
echo ""
echo "Now you can run: ./OPEN_APP_NOW.sh"
