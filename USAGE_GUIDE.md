# 🚀 French Influencer Monitor - Usage Guide

## Quick Start

### 1. Installation

```bash
# Navigate to project directory
cd "/Users/roane/roane/perso/hackathon blackbox"

# Activate virtual environment
source venv/bin/activate

# Verify installation
python -c "import streamlit; print('✅ All dependencies installed!')"
```

### 2. Start the Application

```bash
# Start Streamlit app
streamlit run streamlit_app.py
```

The app will automatically open in your browser at `http://localhost:8501`

### 3. Using the Web Interface

#### Search for an Influencer
1. Enter the influencer's name in the search box (e.g., "Squeezie", "Norman", "Cyprien")
2. Click the "🔍 Analyser" button
3. Wait for the analysis to complete (typically 30-60 seconds)

#### View Results
The dashboard displays:
- **Trust Score**: 0-100 score with color-coded gauge
- **Controversy Count**: Number of negative mentions
- **Positive Actions**: Number of good deeds found
- **Total Mentions**: All data points collected

#### Explore Data
- **Charts**: Visual representation of sentiment distribution
- **Source Breakdown**: See which platforms provided data
- **Detailed Mentions**: Browse all mentions with filters:
  - All mentions
  - Controversies only
  - Positive actions only
  - Neutral mentions

#### Cache System
- Enable "Utiliser le cache" in sidebar to use previously analyzed data
- Saves time on repeated searches
- Shows last update timestamp

## Testing the Application

### Run Test Script

```bash
# Activate environment
source venv/bin/activate

# Run test
python test_app.py
```

This will:
1. Test all scrapers in parallel
2. Analyze sentiment
3. Calculate trust score
4. Display sample results

### Manual Testing

Try these French influencers:
- **Squeezie** - Popular gaming YouTuber
- **Norman** - Comedy content creator
- **Cyprien** - Sketch comedian
- **Natoo** - Comedy YouTuber
- **Enjoy Phoenix** - Lifestyle influencer

## Understanding the Results

### Trust Score Breakdown

The trust score (0-100) is calculated using:

```
Base Score: 50 points

Adjustments:
+ Good Actions: +10 points each (weighted by recency)
- Controversies: -15 points each (weighted by recency)
+ Positive Sentiment: up to +20 points
- Negative Sentiment: up to -25 points

Recency Weight: Recent events have more impact
```

### Score Interpretation

| Score | Level | Meaning |
|-------|-------|---------|
| 80-100 | Très fiable | Highly trustworthy |
| 60-79 | Fiable | Trustworthy |
| 40-59 | Neutre | Neutral |
| 20-39 | Peu fiable | Low trust |
| 0-19 | Non fiable | Not trustworthy |

### Classification Labels

**Drama** (Controversy):
- Negative sentiment + keywords: scandale, polémique, controverse, etc.
- Indicates potential issues or controversies

**Good Action**:
- Positive sentiment + keywords: don, charité, aide, soutien, etc.
- Indicates charitable work or positive contributions

**Neutral**:
- Neither strongly positive nor negative
- General mentions without clear sentiment

## Advanced Usage

### Command Line Analysis

You can also use the orchestrator directly:

```python
import asyncio
from orchestrator import InfluencerOrchestrator

async def analyze():
    orchestrator = InfluencerOrchestrator()
    results = await orchestrator.analyze_influencer("Squeezie")
    print(f"Trust Score: {results['score_data']['trust_score']}")

asyncio.run(analyze())
```

### Database Access

Query the database directly:

```python
from database import get_db, get_influencer_data

db = get_db()
data = get_influencer_data(db, "Squeezie")

if data:
    influencer = data['influencer']
    mentions = data['mentions']
    print(f"Trust Score: {influencer.trust_score}")
    print(f"Total Mentions: {len(mentions)}")
```

### Custom Configuration

Edit `config.py` to customize:

```python
# Add more drama keywords
DRAMA_KEYWORDS = [
    'scandale', 'controverse', 'polémique',
    # Add your own keywords here
]

# Add more good action keywords
GOOD_ACTION_KEYWORDS = [
    'don', 'charité', 'aide',
    # Add your own keywords here
]

# Change sentiment model
SENTIMENT_MODEL = 'cmarkea/distilcamembert-base-sentiment'
```

## Troubleshooting

### Model Download Issues

If the sentiment model fails to download:

```bash
# Pre-download the model
python -c "from transformers import AutoTokenizer, AutoModelForSequenceClassification; \
AutoTokenizer.from_pretrained('cmarkea/distilcamembert-base-sentiment'); \
AutoModelForSequenceClassification.from_pretrained('cmarkea/distilcamembert-base-sentiment')"
```

### Scraping Errors

Some scrapers may fail due to:
- Network issues
- Rate limiting
- Site structure changes

This is normal - the app will continue with available data.

### Performance Issues

For faster analysis:
- Use cache for repeated searches
- Reduce `MAX_CONCURRENT_REQUESTS` in config.py
- Close other applications

### Database Issues

Reset the database:

```bash
rm influencer_monitor.db
python -c "import database; database.init_db()"
```

## API Endpoints (Optional)

If you want to use Flask API instead of Streamlit:

```python
# Create app.py
from flask import Flask, jsonify, request
from orchestrator import InfluencerOrchestrator
import asyncio

app = Flask(__name__)
orchestrator = InfluencerOrchestrator()

@app.route('/analyze/<influencer_name>')
def analyze(influencer_name):
    results = asyncio.run(orchestrator.analyze_influencer(influencer_name))
    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True)
```

## Best Practices

1. **First Search**: Always do a fresh analysis for new influencers
2. **Cache Usage**: Use cache for quick re-checks
3. **Multiple Sources**: Trust scores are more accurate with more data
4. **Recency**: Recent events have more weight in scoring
5. **Context**: Always read the actual mentions, not just the score

## Data Privacy

- Only public data is scraped
- No personal information is stored
- All data is from publicly accessible sources
- Results are for informational purposes only

## Support

For issues or questions:
1. Check the logs in the terminal
2. Review the README.md
3. Check the database for cached data
4. Try with a different influencer

## Next Steps

- Add more data sources
- Improve sentiment analysis accuracy
- Add historical trend tracking
- Export reports to PDF
- Add email notifications for score changes

---

**Happy Monitoring! 🔍**
