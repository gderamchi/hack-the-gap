# 📱 French Influencer Trust Score - Complete Index

Welcome! This is your complete guide to the mobile app project.

---

## 🚀 Quick Navigation

### **Just Want to Run It?**
→ Start here: [QUICK_START.md](./QUICK_START.md) (5 minutes)

### **First Time Setup?**
→ Follow this: [SETUP_GUIDE.md](./SETUP_GUIDE.md) (Step-by-step)

### **Need API Reference?**
→ Check this: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

### **Want Full Details?**
→ Read this: [README.md](./README.md) (Complete documentation)

### **Installation Done?**
→ See status: [INSTALLATION_STATUS.md](./INSTALLATION_STATUS.md)

### **Project Overview?**
→ View this: [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)

---

## 📚 Documentation Files

| File | Purpose | When to Use |
|------|---------|-------------|
| **QUICK_START.md** | 5-minute quick start | You want to run the app ASAP |
| **SETUP_GUIDE.md** | Detailed setup instructions | First time setup, troubleshooting |
| **README.md** | Complete documentation | Understanding architecture, features |
| **API_DOCUMENTATION.md** | API reference | Building integrations, testing API |
| **PROJECT_SUMMARY.md** | Project overview | Understanding what was built |
| **INSTALLATION_STATUS.md** | Installation status | Checking what's installed |
| **INDEX.md** | This file | Finding the right documentation |

---

## 🎯 Common Tasks

### I Want to...

**...run the app for the first time**
1. Read [INSTALLATION_STATUS.md](./INSTALLATION_STATUS.md) - Check what's installed
2. Follow [QUICK_START.md](./QUICK_START.md) - Get running in 5 minutes

**...understand the architecture**
1. Read [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - High-level overview
2. Read [README.md](./README.md) - Detailed architecture

**...test the API**
1. Read [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - All endpoints
2. Use curl or Postman to test

**...troubleshoot issues**
1. Check [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Troubleshooting section
2. Check [INSTALLATION_STATUS.md](./INSTALLATION_STATUS.md) - Common issues

**...deploy to production**
1. Read [README.md](./README.md) - "Building for Production" section
2. Configure environment for production

**...understand Perplexity integration**
1. Read [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Perplexity section
2. Read [README.md](./README.md) - Integration details

---

## 📁 Project Structure

```
mobile-app/
│
├── 📄 Documentation (You are here!)
│   ├── INDEX.md                    ← This file
│   ├── QUICK_START.md              ← 5-minute quick start
│   ├── SETUP_GUIDE.md              ← Detailed setup
│   ├── README.md                   ← Complete docs
│   ├── API_DOCUMENTATION.md        ← API reference
│   ├── PROJECT_SUMMARY.md          ← Overview
│   └── INSTALLATION_STATUS.md      ← Install status
│
├── 🖥️ Backend (Node.js API)
│   ├── src/
│   │   ├── server.ts               ← Express app
│   │   ├── config/                 ← Configuration
│   │   ├── routes/                 ← API endpoints
│   │   ├── services/               ← Business logic
│   │   │   ├── perplexity.service.ts
│   │   │   ├── influencer.service.ts
│   │   │   └── scoring.service.ts
│   │   └── utils/                  ← Helpers
│   ├── prisma/
│   │   └── schema.prisma           ← Database schema
│   ├── package.json
│   ├── .env.example
│   └── .env                        ← Add your API key here!
│
└── 📱 Mobile (React Native + Expo)
    ├── src/
    │   ├── App.tsx                 ← Main app
    │   ├── screens/                ← 3 screens
    │   │   ├── RankingScreen.tsx
    │   │   ├── DetailScreen.tsx
    │   │   └── SearchScreen.tsx
    │   ├── components/             ← UI components
    │   ├── services/               ← API client
    │   ├── types/                  ← TypeScript types
    │   └── constants/              ← Theme
    ├── app.json
    └── package.json
```

---

## ✅ Installation Status

**Dependencies**: ✅ Installed (195 backend + 1,193 mobile)  
**Prisma Client**: ✅ Generated  
**TypeScript**: ✅ Configured  
**Vulnerabilities**: ✅ 0 critical  

**Next Steps**:
1. Add Perplexity API key to `.env`
2. Start PostgreSQL
3. Run migrations
4. Start servers

See [INSTALLATION_STATUS.md](./INSTALLATION_STATUS.md) for details.

---

## 🎓 Learning Path

### Beginner
1. Start with [QUICK_START.md](./QUICK_START.md)
2. Run the app and test it
3. Read [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) for overview

### Intermediate
1. Read [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed setup
2. Read [README.md](./README.md) for architecture
3. Explore the code in `backend/src/` and `mobile/src/`

### Advanced
1. Read [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
2. Study Perplexity integration in `backend/src/services/perplexity.service.ts`
3. Customize scoring algorithm in `backend/src/services/scoring.service.ts`

---

## 🔑 Key Concepts

### Trust Score
- **Range**: 0-100%
- **Formula**: Base 50 + weighted dramas/good actions + sentiment
- **Recency**: Recent events have more impact (exponential decay)
- **Transparency**: Full breakdown shown to users

### Perplexity Integration
- **Queries**: 7 parallel French queries per influencer
- **Execution**: Max 5 concurrent with rate limiting
- **Classification**: Keyword-based (drama/good_action/neutral)
- **Sources**: All mentions have clickable URLs

### Mobile UI
- **Screens**: Ranking, Detail, Search
- **Navigation**: React Navigation stack
- **Data**: React Query for caching and state
- **Design**: Material Design 3 with React Native Paper

---

## 🆘 Getting Help

### Quick Fixes

**Backend won't start?**
→ Check [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Troubleshooting section

**Mobile app errors?**
→ Check [INSTALLATION_STATUS.md](./INSTALLATION_STATUS.md) - Common issues

**API not working?**
→ Check [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Examples

**Database issues?**
→ Check [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Database section

### Documentation Search

Use your editor's search (Cmd/Ctrl + F) to find:
- "Perplexity" - Integration details
- "trust score" - Scoring algorithm
- "API" - API endpoints
- "troubleshoot" - Problem solving
- "install" - Installation steps

---

## 📊 Project Stats

- **Backend**: 195 packages, 0 vulnerabilities
- **Mobile**: 1,193 packages, 18 non-critical vulnerabilities
- **Code Files**: 30+ TypeScript/TSX files
- **Documentation**: 7 comprehensive files
- **API Endpoints**: 6 RESTful endpoints
- **Database Tables**: 3 (Influencer, Mention, History)
- **Mobile Screens**: 3 (Ranking, Detail, Search)
- **Components**: 3 reusable components

---

## 🎯 What's Next?

### Immediate (Now)
1. ✅ Dependencies installed
2. ⏳ Add Perplexity API key
3. ⏳ Start PostgreSQL
4. ⏳ Run migrations
5. ⏳ Start servers
6. ⏳ Test the app

### Short Term (This Week)
- [ ] Test with multiple influencers
- [ ] Customize UI theme
- [ ] Add more French keywords
- [ ] Deploy backend to cloud

### Long Term (Future)
- [ ] Add user authentication
- [ ] Implement push notifications
- [ ] Add more data sources
- [ ] Build admin dashboard

---

## 🏆 Features Checklist

### Core Features
- ✅ Cross-platform mobile app (iOS/Android)
- ✅ Perplexity.ai integration
- ✅ Trust score calculation
- ✅ Ranking screen
- ✅ Detail screen with sources
- ✅ Search functionality
- ✅ Filters and sorting
- ✅ Legal disclaimers
- ✅ Source attribution

### Technical Features
- ✅ TypeScript throughout
- ✅ RESTful API
- ✅ PostgreSQL database
- ✅ Rate limiting
- ✅ Caching
- ✅ Error handling
- ✅ Logging
- ✅ Security headers

### Documentation
- ✅ README
- ✅ Setup guide
- ✅ API docs
- ✅ Quick start
- ✅ Project summary
- ✅ Installation status
- ✅ This index

---

## 📞 Support

For issues or questions:
1. Check the relevant documentation file above
2. Search for keywords in documentation
3. Check troubleshooting sections
4. Review code comments in source files

---

## 🎉 Ready to Start?

**Choose your path**:

- 🚀 **Quick Start**: [QUICK_START.md](./QUICK_START.md)
- 📖 **Detailed Setup**: [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- 📚 **Full Docs**: [README.md](./README.md)

---

**Built with ❤️ for Hackathon Blackbox 2025**

Happy coding! 🔍
