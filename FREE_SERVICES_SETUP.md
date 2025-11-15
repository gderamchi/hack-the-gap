# 🆓 Free Services Setup for FirstToPay Platform

## ✅ Free Services We're Using

### 1. **Blackbox AI API** (FREE - You have API keys)
**Purpose**: Replace Perplexity AI for influencer research

**Benefits**:
- ✅ FREE with your API keys
- ✅ Web search capabilities
- ✅ Code generation
- ✅ No rate limits with your plan

**Implementation**:
```typescript
// mobile-app/backend/src/services/blackbox.service.ts
// Use Blackbox AI instead of Perplexity for research
```

### 2. **Stripe Test Mode** (FREE Forever)
**Purpose**: Payment processing for DeepSearch

**Benefits**:
- ✅ FREE test mode forever
- ✅ Full payment flow testing
- ✅ Webhook testing with Stripe CLI
- ✅ No credit card required for testing

**Test Cards**:
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0025 0000 3155
```

### 3. **SQLite** (FREE)
**Purpose**: Database

**Benefits**:
- ✅ Completely FREE
- ✅ No server required
- ✅ Perfect for development
- ✅ Easy to migrate to PostgreSQL later

### 4. **Expo Go** (FREE)
**Purpose**: Mobile app development & testing

**Benefits**:
- ✅ FREE forever
- ✅ Test on real devices
- ✅ Hot reload
- ✅ No Apple Developer account needed for testing

### 5. **Vercel** (FREE Tier)
**Purpose**: Web dashboard hosting

**Benefits**:
- ✅ FREE for personal projects
- ✅ Automatic deployments
- ✅ Custom domains
- ✅ Serverless functions

### 6. **Railway** or **Render** (FREE Tier)
**Purpose**: Backend API hosting

**Benefits**:
- ✅ FREE tier available
- ✅ Automatic deployments from GitHub
- ✅ PostgreSQL included
- ✅ Environment variables

---

## 🔧 Setup Instructions

### **Step 1: Replace Perplexity with Blackbox AI**

Update `.env`:
```bash
# Remove
# PERPLEXITY_API_KEY=...

# Add
BLACKBOX_API_KEY=your_blackbox_api_key_here
BLACKBOX_API_URL=https://api.blackbox.ai/v1/chat/completions
```

Create new service:
```bash
# File: mobile-app/backend/src/services/blackbox.service.ts
```

### **Step 2: Setup Stripe Test Mode**

1. Go to https://dashboard.stripe.com/register
2. Create FREE account
3. Get test API keys (starts with `sk_test_` and `pk_test_`)
4. Add to `.env`:

```bash
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

5. Install Stripe CLI for webhook testing:
```bash
brew install stripe/stripe-cli/stripe
stripe login
stripe listen --forward-to localhost:3000/api/payments/webhook
```

### **Step 3: Free Hosting Options**

#### **Option A: Railway (Recommended)**
```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Deploy backend
cd mobile-app/backend
railway init
railway up

# 4. Add environment variables in Railway dashboard
```

#### **Option B: Render**
```bash
# 1. Go to https://render.com
# 2. Connect GitHub repo
# 3. Create Web Service
# 4. Add environment variables
# 5. Deploy automatically
```

#### **Web Dashboard: Vercel**
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
cd mobile-app/web
vercel

# 3. Add environment variables
vercel env add NEXT_PUBLIC_API_URL
```

---

## 💰 Cost Breakdown

| Service | Cost | Usage Limit |
|---------|------|-------------|
| **Blackbox AI** | $0 | Unlimited with your keys |
| **Stripe Test** | $0 | Unlimited testing |
| **SQLite** | $0 | Unlimited |
| **Expo Go** | $0 | Unlimited |
| **Vercel** | $0 | 100GB bandwidth/month |
| **Railway** | $0 | $5 credit/month (enough for testing) |
| **Render** | $0 | 750 hours/month |

**Total Monthly Cost**: **$0** 🎉

---

## 🚀 Blackbox AI Integration

### **API Endpoint**:
```
POST https://api.blackbox.ai/v1/chat/completions
```

### **Request Format**:
```json
{
  "model": "blackbox",
  "messages": [
    {
      "role": "system",
      "content": "You are a research assistant analyzing French influencers."
    },
    {
      "role": "user",
      "content": "Find controversies about [influencer name]"
    }
  ],
  "stream": false,
  "webSearch": true
}
```

### **Response Format**:
```json
{
  "choices": [
    {
      "message": {
        "content": "Research results here...",
        "role": "assistant"
      }
    }
  ]
}
```

---

## 📝 Implementation Priority

### **Phase 1: Replace Perplexity with Blackbox** (30 min)
1. Create `blackbox.service.ts`
2. Update `influencer.service.ts` to use Blackbox
3. Test with your API keys

### **Phase 2: Setup Stripe Test Mode** (15 min)
1. Create Stripe account
2. Get test keys
3. Add to `.env`
4. Test payment flow

### **Phase 3: Deploy to Free Hosting** (1 hour)
1. Deploy backend to Railway/Render
2. Deploy web to Vercel
3. Update mobile app API URL
4. Test end-to-end

---

## 🔐 Security Notes

### **Environment Variables**:
Never commit these to Git:
- `BLACKBOX_API_KEY`
- `STRIPE_SECRET_KEY`
- `JWT_SECRET`
- `DATABASE_URL` (production)

### **Git Ignore**:
```
.env
.env.local
.env.production
*.db
node_modules/
```

---

## 📊 Monitoring (FREE)

### **Sentry** (FREE Tier)
- Error tracking
- Performance monitoring
- 5,000 events/month FREE

### **LogRocket** (FREE Tier)
- Session replay
- Console logs
- 1,000 sessions/month FREE

### **Uptime Robot** (FREE)
- Uptime monitoring
- 50 monitors FREE
- Email alerts

---

## 🎯 Next Steps

1. ✅ **Upgrade Expo SDK** - Done
2. 🔄 **Replace Perplexity with Blackbox AI** - In Progress
3. ⏳ **Setup Stripe Test Mode**
4. ⏳ **Deploy to free hosting**

---

## 💡 Pro Tips

1. **Use Blackbox AI for everything**:
   - Influencer research
   - Code generation
   - Documentation
   - Bug fixing

2. **Stripe Test Mode is production-ready**:
   - Same API
   - Same webhooks
   - Just switch keys when ready

3. **Free hosting is enough**:
   - Railway: 500MB RAM, enough for Node.js
   - Vercel: Unlimited bandwidth for hobby
   - Render: 750 hours = 31 days continuous

4. **SQLite → PostgreSQL migration is easy**:
   - Prisma handles it
   - Just change DATABASE_URL
   - Run `prisma migrate`

---

**Total Setup Time**: ~2 hours  
**Total Cost**: **$0/month** 🎉

