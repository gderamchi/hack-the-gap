# 🔍 French Influencer Monitor

A comprehensive Python web application that monitors French influencers by scraping public online data and classifying them based on controversies, positive actions, and overall trustworthiness.

## 🌟 Features

- **Multi-Source Scraping**: Parallel scraping from:
  - 📰 French news sites (Le Monde, Le Figaro, etc.)
  - 🎥 YouTube
  - 🐦 Twitter/X
  - 💬 Reddit
  - 🗨️ French forums

- **AI-Powered Analysis**: 
  - French sentiment analysis using CamemBERT
  - Automatic classification: Drama, Good Action, or Neutral
  - Keyword-based detection for controversies and positive actions

- **Trust Scoring System**:
  - 0-100 trust score calculation
  - Weighted by recency (recent events matter more)
  - Based on drama/good action ratio and sentiment

- **Interactive UI**:
  - Real-time search and analysis
  - Visual dashboards with charts
  - Detailed mention breakdown
  - Source citations with links

## 🚀 Installation

### Prerequisites
- Python 3.8+
- pip

### Setup

1. **Clone or navigate to the project directory**:
```bash
cd "/Users/roane/roane/perso/hackathon blackbox"
```

2. **Create a virtual environment**:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**:
```bash
pip install -r requirements.txt
```

4. **Configure environment (optional)**:
```bash
cp .env.example .env
# Edit .env with your API keys if needed
```

## 🎯 Usage

### Run the Streamlit App

```bash
streamlit run streamlit_app.py
```

The app will open in your browser at `http://localhost:8501`

### How to Use

1. Enter a French influencer's name (e.g., "Squeezie", "Norman", "Cyprien")
2. Click "🔍 Analyser"
3. Wait for the parallel scraping and analysis to complete
4. View the results:
   - Trust score (0-100)
   - Controversy count
   - Positive action count
   - Detailed mentions with sources
   - Visual charts and breakdowns

### Using Cache

Enable "Utiliser le cache" in the sidebar to use previously analyzed data instead of re-scraping.

## 📊 Architecture

```
├── streamlit_app.py          # Main Streamlit UI
├── orchestrator.py            # Parallel execution coordinator
├── analyzer.py                # Sentiment analysis (CamemBERT)
├── scorer.py                  # Trust score calculation
├── database.py                # SQLite database management
├── config.py                  # Configuration and keywords
├── scrapers/
│   ├── base_scraper.py       # Base scraper class
│   ├── news_scraper.py       # News sites scraper
│   ├── youtube_scraper.py    # YouTube scraper
│   ├── twitter_scraper.py    # Twitter/X scraper
│   ├── reddit_scraper.py     # Reddit scraper
│   └── forum_scraper.py      # French forums scraper
└── requirements.txt           # Python dependencies
```

## 🧠 How It Works

### 1. Parallel Scraping
All scrapers run concurrently using `asyncio` to maximize speed:
- Each scraper searches for the influencer's name
- Extracts relevant text excerpts and URLs
- Returns structured data

### 2. Sentiment Analysis
- Uses `cmarkea/distilcamembert-base-sentiment` model
- Analyzes French text for positive/negative sentiment
- Combines with keyword matching for classification

### 3. Classification
Content is classified as:
- **Drama**: Negative sentiment + controversy keywords (scandale, polémique, etc.)
- **Good Action**: Positive sentiment + charity keywords (don, charité, etc.)
- **Neutral**: Everything else

### 4. Trust Score Calculation
```
Base Score = 50
+ (good_actions × 10 × recency_weight)
- (dramas × 15 × recency_weight)
+ (avg_sentiment × 20)
Normalized to 0-100
```

Recency weight uses exponential decay: more recent mentions have higher impact.

## 🔧 Configuration

Edit `config.py` to customize:
- Sentiment model
- Drama/good action keywords
- News sources
- Scraping parameters

## 📝 Database

SQLite database stores:
- **Influencers**: Name, trust score, counts, timestamps
- **Mentions**: All scraped data with sentiment labels
- **Analysis History**: Historical trust scores

## ⚠️ Limitations

- Web scraping depends on site availability and structure
- Some platforms (Twitter) may require API keys for better results
- Sentiment analysis accuracy depends on text quality
- Rate limiting may slow down scraping

## 🛠️ Troubleshooting

### Model Download Issues
If the sentiment model fails to download:
```bash
# Pre-download the model
python -c "from transformers import AutoTokenizer, AutoModelForSequenceClassification; AutoTokenizer.from_pretrained('cmarkea/distilcamembert-base-sentiment'); AutoModelForSequenceClassification.from_pretrained('cmarkea/distilcamembert-base-sentiment')"
```

### Scraping Errors
- Check your internet connection
- Some sites may block scrapers - this is normal
- The app will continue with available data

## 📄 License

This project is for educational purposes (Hackathon).

## 🤝 Contributing

Built for the Blackbox Hackathon 2025.

## 🎓 Technologies Used

- **Backend**: Python, asyncio, aiohttp
- **UI**: Streamlit
- **Scraping**: BeautifulSoup, Newspaper3k
- **AI**: HuggingFace Transformers (CamemBERT)
- **Database**: SQLite, SQLAlchemy
- **Visualization**: Plotly

---

**Made with ❤️ for the Hackathon Blackbox**
