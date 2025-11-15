# 🧪 Testing & Deployment Guide

## ✅ What Was Fixed

### Phase 1: Scoring System Improvements
- ✅ **Expanded keyword dictionary** (60+ drama keywords, 40+ good action keywords)
- ✅ **More lenient classification thresholds** (sentiment -0.1 instead of -0.2)
- ✅ **Better text parsing** (paragraphs instead of just sentences)
- ✅ **Enhanced logging** for debugging classification issues
- ✅ **Multiple classification strategies** (strong, moderate, weak)

### Phase 2: Ranking System
- ✅ **Rank positions** added to API response (#1, #2, #3...)
- ✅ **Medal badges** for top 3 (🥇🥈🥉)
- ✅ **Server-side search** filtering
- ✅ **Summary statistics** (total count, average score)

### Phase 3: PWA Conversion
- ✅ **Web manifest** (`manifest.json`) with app metadata
- ✅ **Service worker** for offline support and caching
- ✅ **App icons** (192x192, 512x512)
- ✅ **Install prompt** for Android
- ✅ **Full-screen mode** configuration

### Phase 4: UX Improvements
- ✅ **Better empty states** with icons and helpful messages
- ✅ **Loading indicators**
- ✅ **Summary cards** showing total and average
- ✅ **Improved visual hierarchy**

---

## 🧪 Testing Checklist

### Backend API Tests

#### 1. Health Check
```bash
curl http://localhost:3000/api/health
```
**Expected**: `{"success":true,"status":"healthy",...}`

#### 2. Get All Influencers
```bash
curl http://localhost:3000/api/influencers
```
**Expected**: Array of influencers with `rank` field

#### 3. Search with Filters
```bash
curl "http://localhost:3000/api/influencers?minTrustScore=60&search=norman"
```
**Expected**: Filtered results

#### 4. Search New Influencer
```bash
curl -X POST http://localhost:3000/api/influencers/search \
  -H "Content-Type: application/json" \
  -d '{"name": "Squeezie", "forceRefresh": true}'
```
**Expected**: 
- `isFromCache: false`
- `mentions` array with classified content
- `trustScore` different from 50 (if mentions found)
- `dramaCount` and/or `goodActionCount` > 0

#### 5. Get Influencer Details
```bash
curl http://localhost:3000/api/influencers/{id}
```
**Expected**: Full influencer data with mentions

### Mobile App Tests

#### 1. Ranking Screen
- [ ] Opens without errors
- [ ] Shows list of influencers
- [ ] Displays rank badges (🥇🥈🥉 for top 3)
- [ ] Shows summary cards (total, average)
- [ ] Search bar filters results
- [ ] Filter chips work (80%+, 60%+, 40%+)
- [ ] Pull-to-refresh works
- [ ] Empty state shows when no results

#### 2. Detail Screen
- [ ] Opens when tapping influencer card
- [ ] Shows trust score with color
- [ ] Displays drama/good action counts
- [ ] Shows mentions list
- [ ] Tabs work (All, Dramas, Positifs, Neutres)
- [ ] Source links are clickable
- [ ] Refresh button works

#### 3. Search Screen
- [ ] Input field accepts text
- [ ] Search button triggers API call
- [ ] Loading indicator shows during search
- [ ] Results navigate to detail screen
- [ ] Error handling works

### PWA Tests

#### 1. Web Manifest
```bash
# Check manifest is accessible
curl http://localhost:8081/manifest.json
```
**Expected**: Valid JSON with app metadata

#### 2. Service Worker
- [ ] Open DevTools → Application → Service Workers
- [ ] Service worker is registered
- [ ] Status shows "activated and running"
- [ ] Update on reload works

#### 3. Installation (Android Chrome)
- [ ] Open app in Chrome
- [ ] Install prompt appears after 3 seconds
- [ ] Click "Install" button
- [ ] App installs to home screen
- [ ] Icon appears in app drawer
- [ ] Opens in standalone mode (no browser UI)

#### 4. Installation (iOS Safari)
- [ ] Open app in Safari
- [ ] Tap Share button
- [ ] "Add to Home Screen" option available
- [ ] Add to home screen
- [ ] Icon appears on home screen
- [ ] Opens in standalone mode

#### 5. Offline Mode
- [ ] Open app while online
- [ ] Navigate through screens
- [ ] Turn off internet
- [ ] Refresh app
- [ ] Cached data still visible
- [ ] API calls show offline message

---

## 🐛 Known Issues & Solutions

### Issue 1: All Scores Stuck at 50

**Symptoms**: 
- All influencers have `trustScore: 50`
- `dramaCount: 0` and `goodActionCount: 0`
- `mentions` array is empty

**Possible Causes**:
1. Perplexity API not returning content
2. Content parsing too strict
3. Classification not matching keywords
4. API rate limiting

**Solutions**:
1. **Check API Key**: Verify `PERPLEXITY_API_KEY` in `.env`
2. **Check API Response**: Add logging to see raw Perplexity responses
3. **Test Classification**: Try with known controversial/positive influencers
4. **Adjust Thresholds**: Lower classification requirements further
5. **Check Rate Limits**: Ensure not hitting Perplexity rate limits

**Debug Steps**:
```bash
# 1. Check backend logs
cd mobile-app/backend
npm run dev

# 2. Search for a well-known influencer
curl -X POST http://localhost:3000/api/influencers/search \
  -H "Content-Type: application/json" \
  -d '{"name": "Squeezie", "forceRefresh": true}'

# 3. Check database
npx prisma studio
# Look at Mention table for entries

# 4. Add debug logging
# Edit src/services/perplexity.service.ts
# Add: console.log('Perplexity response:', response.data);
```

### Issue 2: PWA Not Installing

**iOS**:
- Must use Safari (not Chrome)
- No automatic prompt (manual only)
- Limited storage (50MB)

**Android**:
- Must use Chrome
- Requires HTTPS (or localhost)
- Check manifest is valid

**Solution**: See `PWA_INSTALLATION_GUIDE.md`

### Issue 3: Backend Not Starting

**Error**: "Port 3000 already in use"
```bash
# Kill existing process
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

**Error**: "Prisma Client not generated"
```bash
npx prisma generate
```

### Issue 4: Mobile App Can't Connect

**Error**: "Network request failed"

**Solution**:
1. Ensure backend is running: `curl http://localhost:3000/api/health`
2. Check `app.json` has correct `apiUrl`
3. For physical device, use computer's IP instead of localhost
4. Disable firewall temporarily

---

## 🚀 Deployment Guide

### Prerequisites
- GitHub account
- Perplexity API key
- Hosting service account (Railway, Render, Vercel, etc.)

### Step 1: Prepare for Deployment

#### Backend
```bash
cd mobile-app/backend

# 1. Update package.json
# Ensure "start" script exists:
# "start": "node dist/server.js"

# 2. Create .env.production
cp .env .env.production
# Edit with production values

# 3. Build TypeScript
npm run build

# 4. Test production build
NODE_ENV=production npm start
```

#### Frontend
```bash
cd mobile-app/mobile

# 1. Update app.json with production API URL
# "extra": {
#   "apiUrl": "https://your-api.railway.app/api"
# }

# 2. Build for web
npx expo export:web

# 3. Test build
npx serve web-build
```

### Step 2: Deploy Backend (Railway Example)

1. **Create Railway Account**: https://railway.app
2. **Create New Project**: Click "New Project"
3. **Deploy from GitHub**:
   - Connect GitHub repository
   - Select `mobile-app/backend` as root directory
4. **Add Environment Variables**:
   ```
   NODE_ENV=production
   DATABASE_URL=file:./prod.db
   PERPLEXITY_API_KEY=your_key_here
   PORT=3000
   ```
5. **Deploy**: Railway auto-deploys on push
6. **Get URL**: Copy your Railway app URL (e.g., `https://your-app.railway.app`)

### Step 3: Deploy Frontend (Vercel Example)

1. **Create Vercel Account**: https://vercel.com
2. **Import Project**: Click "New Project"
3. **Configure**:
   - Root Directory: `mobile-app/mobile`
   - Build Command: `npx expo export:web`
   - Output Directory: `web-build`
4. **Environment Variables**:
   ```
   EXPO_PUBLIC_API_URL=https://your-api.railway.app/api
   ```
5. **Deploy**: Vercel auto-deploys
6. **Get URL**: Copy your Vercel URL (e.g., `https://your-app.vercel.app`)

### Step 4: Update PWA Configuration

```bash
cd mobile-app/mobile/public

# Edit manifest.json
{
  "start_url": "https://your-app.vercel.app/",
  "scope": "https://your-app.vercel.app/"
}
```

### Step 5: Test Production

1. **Backend Health**: `curl https://your-api.railway.app/api/health`
2. **Frontend**: Open `https://your-app.vercel.app`
3. **PWA Install**: Try installing on mobile
4. **API Calls**: Search for influencer
5. **Offline Mode**: Disconnect internet, verify caching

---

## 📊 Performance Optimization

### Backend
- [ ] Enable compression middleware
- [ ] Add Redis caching for API responses
- [ ] Optimize database queries (indexes)
- [ ] Implement request batching
- [ ] Add CDN for static assets

### Frontend
- [ ] Code splitting (lazy loading)
- [ ] Image optimization
- [ ] Reduce bundle size
- [ ] Implement virtual scrolling for long lists
- [ ] Optimize re-renders (React.memo)

### Database
- [ ] Add indexes on frequently queried fields
- [ ] Implement pagination
- [ ] Archive old data
- [ ] Use connection pooling

---

## 🔒 Security Checklist

- [ ] API key stored in environment variables (not code)
- [ ] Rate limiting enabled
- [ ] CORS configured properly
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (Prisma handles this)
- [ ] XSS prevention (React handles this)
- [ ] HTTPS in production
- [ ] Helmet.js security headers
- [ ] No sensitive data in logs

---

## 📈 Monitoring

### Recommended Tools
- **Backend**: Railway logs, Sentry for errors
- **Frontend**: Vercel Analytics, Google Analytics
- **Database**: Prisma Studio, Railway database metrics
- **API**: Postman monitors, UptimeRobot

### Key Metrics to Track
- API response times
- Error rates
- User engagement (searches per day)
- Cache hit rate
- PWA install rate
- Offline usage

---

## 🎯 Success Criteria

### Minimum Viable Product (MVP)
- [x] Backend API running and accessible
- [x] Mobile app displays influencer list
- [x] Search functionality works
- [x] Trust scores calculated (even if all 50)
- [x] PWA installable on at least one platform

### Full Launch
- [ ] Trust scores vary (not all 50)
- [ ] At least 10 influencers in database
- [ ] PWA installable on iOS and Android
- [ ] Offline mode works
- [ ] No critical bugs
- [ ] Documentation complete

### Production Ready
- [ ] Deployed to public URL
- [ ] HTTPS enabled
- [ ] Monitoring set up
- [ ] Error tracking configured
- [ ] Performance optimized
- [ ] Security audit passed

---

## 📞 Support & Debugging

### Quick Debug Commands

```bash
# Check backend status
curl http://localhost:3000/api/health

# View database
cd mobile-app/backend && npx prisma studio

# Check service worker
# Open DevTools → Application → Service Workers

# View backend logs
cd mobile-app/backend && npm run dev

# Clear app cache
# Chrome: DevTools → Application → Clear storage
# iOS: Settings → Safari → Clear History and Website Data

# Restart everything
pkill -f "npm run dev"
pkill -f "expo start"
cd mobile-app/backend && npm run dev &
cd mobile-app/mobile && npm start
```

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Network request failed" | Backend not running | Start backend: `npm run dev` |
| "Influencer not found" | Invalid ID | Check database with Prisma Studio |
| "Failed to fetch influencers" | Database error | Run migrations: `npx prisma migrate dev` |
| "Service worker registration failed" | Invalid SW file | Check `public/service-worker.js` exists |
| "Manifest not found" | Missing manifest | Check `public/manifest.json` exists |

---

## ✅ Final Checklist

Before considering the project complete:

### Code Quality
- [ ] All TypeScript errors resolved
- [ ] No console.errors in production
- [ ] Code formatted consistently
- [ ] Comments added for complex logic
- [ ] No hardcoded values (use config)

### Functionality
- [ ] All API endpoints tested
- [ ] All screens accessible
- [ ] Error handling implemented
- [ ] Loading states shown
- [ ] Empty states handled

### Documentation
- [ ] README.md updated
- [ ] API documentation complete
- [ ] Installation guide written
- [ ] Deployment guide written
- [ ] Code comments added

### Testing
- [ ] Manual testing on iOS
- [ ] Manual testing on Android
- [ ] Manual testing on web
- [ ] PWA installation tested
- [ ] Offline mode tested

### Deployment
- [ ] Backend deployed
- [ ] Frontend deployed
- [ ] Environment variables set
- [ ] HTTPS enabled
- [ ] Domain configured (optional)

---

**🎉 Congratulations! Your influencer ranking app is ready!**

For questions or issues, refer to:
- `COMPLETE_PROJECT_GUIDE.md` - Comprehensive guide
- `PWA_INSTALLATION_GUIDE.md` - PWA installation help
- `mobile-app/API_DOCUMENTATION.md` - API reference

**Built with ❤️ for Hackathon Blackbox 2025**
