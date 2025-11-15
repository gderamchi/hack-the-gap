# 📱 PWA Installation Guide - Influencer Trust Score

## What is a PWA?

A **Progressive Web App (PWA)** is a web application that can be installed on your phone or computer like a native app. It works offline, sends notifications, and provides a native app-like experience.

---

## ✅ Features of Our PWA

- 📱 **Installable** on iOS, Android, and Desktop
- 🚀 **Fast loading** with caching
- 📴 **Offline support** (view cached data)
- 🔔 **Home screen icon** like a native app
- 🎨 **Full-screen experience** (no browser UI)
- 🔄 **Auto-updates** when online

---

## 📲 How to Install on Mobile

### iOS (iPhone/iPad) - Safari

1. **Open Safari** (must use Safari, not Chrome)
2. Navigate to your app URL (e.g., `http://localhost:8081` or your deployed URL)
3. Tap the **Share button** (square with arrow pointing up) at the bottom
4. Scroll down and tap **"Add to Home Screen"** (Ajouter à l'écran d'accueil)
5. Edit the name if desired, then tap **"Add"**
6. The app icon will appear on your home screen
7. Tap the icon to launch the app in full-screen mode

**Note**: iOS doesn't show an automatic install prompt. You must manually add to home screen.

### Android - Chrome

#### Method 1: Automatic Prompt
1. Open **Chrome** browser
2. Navigate to your app URL
3. After a few seconds, you'll see a banner at the bottom: **"Install app"**
4. Tap **"Install"**
5. Confirm installation
6. The app will be added to your app drawer and home screen

#### Method 2: Manual Installation
1. Open **Chrome** browser
2. Navigate to your app URL
3. Tap the **menu** (three dots) in the top-right corner
4. Tap **"Install app"** or **"Add to Home screen"**
5. Confirm installation
6. The app icon will appear in your app drawer

---

## 💻 How to Install on Desktop

### Chrome/Edge (Windows, Mac, Linux)

1. Open **Chrome** or **Edge** browser
2. Navigate to your app URL
3. Look for the **install icon** (⊕ or computer icon) in the address bar
4. Click the icon and select **"Install"**
5. Or click the **menu** (three dots) → **"Install [App Name]"**
6. The app will open in its own window
7. Find it in your applications/start menu

### Safari (Mac)

Safari on Mac doesn't support PWA installation. Use Chrome or Edge instead.

---

## 🔍 How to Verify Installation

### iOS
- Look for the app icon on your home screen
- Tap it - it should open without Safari's address bar
- Check that it runs in full-screen mode

### Android
- Find the app in your app drawer
- Long-press the icon to see app info
- It should show as an "Installed app"

### Desktop
- The app should appear in your applications list
- It opens in its own window (not a browser tab)
- Has its own icon in the taskbar/dock

---

## 🛠️ Troubleshooting

### "Add to Home Screen" not showing (iOS)
- ✅ Make sure you're using **Safari** (not Chrome or Firefox)
- ✅ Check that you're on the correct URL
- ✅ Try refreshing the page

### Install prompt not appearing (Android)
- ✅ Make sure you're using **Chrome** (not Firefox or other browsers)
- ✅ Wait a few seconds after page load
- ✅ Try the manual method (menu → Install app)
- ✅ Check that the site is served over HTTPS (or localhost)

### App not working offline
- ✅ Visit the app at least once while online
- ✅ Navigate through a few pages to cache content
- ✅ Check browser console for service worker errors

### Icons not showing
- ✅ Clear browser cache and reload
- ✅ Uninstall and reinstall the app
- ✅ Check that icon files exist in `/public` folder

---

## 🚀 For Developers: Deployment Checklist

### Before Deploying

- [ ] Generate proper app icons (192x192, 512x512)
- [ ] Update `manifest.json` with production URL
- [ ] Test service worker on HTTPS (required for production)
- [ ] Add screenshots to manifest for app stores
- [ ] Test installation on iOS Safari
- [ ] Test installation on Android Chrome
- [ ] Test offline functionality
- [ ] Verify all assets are cached correctly

### Deployment Requirements

1. **HTTPS Required**: PWAs require HTTPS in production (localhost is exempt)
2. **Valid Manifest**: Ensure `manifest.json` is accessible at `/manifest.json`
3. **Service Worker**: Must be served from root or `/` scope
4. **Icons**: Provide at least 192x192 and 512x512 PNG icons
5. **Responsive**: App must work on all screen sizes

### Testing Tools

- **Lighthouse** (Chrome DevTools): Audit PWA score
- **Chrome DevTools** → Application → Manifest: Check manifest
- **Chrome DevTools** → Application → Service Workers: Check SW status
- **PWA Builder**: https://www.pwabuilder.com/ (test and package)

---

## 📊 PWA Checklist

### Core Requirements ✅
- [x] Web manifest (`manifest.json`)
- [x] Service worker (`service-worker.js`)
- [x] HTTPS (or localhost for development)
- [x] Responsive design
- [x] App icons (192x192, 512x512)

### Enhanced Features ✅
- [x] Offline support
- [x] Install prompt
- [x] Theme color
- [x] Splash screen
- [x] Full-screen mode

### Optional Enhancements
- [ ] Push notifications
- [ ] Background sync
- [ ] Share target API
- [ ] Shortcuts menu
- [ ] App badges

---

## 🎯 User Benefits

### Why Install?

1. **Faster Access**: Launch from home screen, no browser needed
2. **Offline Mode**: View cached influencer data without internet
3. **Native Feel**: Full-screen experience, no browser UI
4. **Less Data**: Cached assets reduce data usage
5. **Notifications**: Get updates about influencer scores (future feature)

---

## 📝 Notes

- **iOS Limitations**: iOS has limited PWA support compared to Android
  - No automatic install prompt
  - Limited storage (50MB)
  - No push notifications
  - Service worker restrictions

- **Android Advantages**: Full PWA support
  - Automatic install prompts
  - Unlimited storage
  - Push notifications
  - Background sync

- **Desktop**: Best experience on Chrome/Edge
  - Full PWA features
  - Window management
  - Keyboard shortcuts

---

## 🔗 Useful Links

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Manifest Generator](https://www.simicart.com/manifest-generator.html/)
- [Icon Generator](https://realfavicongenerator.net/)
- [PWA Builder](https://www.pwabuilder.com/)
- [Can I Use - PWA](https://caniuse.com/?search=pwa)

---

## 🆘 Support

If you encounter issues:

1. Check browser console for errors
2. Verify service worker is registered (DevTools → Application)
3. Clear cache and try again
4. Ensure you're on HTTPS (or localhost)
5. Try a different browser

---

**Made with ❤️ for Hackathon Blackbox 2025**

🔍 Happy Monitoring!
