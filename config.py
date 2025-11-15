import os
from dotenv import load_dotenv

load_dotenv()

# API Keys
YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY', '')
TWITTER_BEARER_TOKEN = os.getenv('TWITTER_BEARER_TOKEN', '')

# Database
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///influencer_monitor.db')

# Scraping Settings
MAX_CONCURRENT_REQUESTS = int(os.getenv('MAX_CONCURRENT_REQUESTS', 5))
REQUEST_TIMEOUT = int(os.getenv('REQUEST_TIMEOUT', 30))
USER_AGENT = os.getenv('USER_AGENT', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36')

# Analysis Settings
SENTIMENT_MODEL = os.getenv('SENTIMENT_MODEL', 'cmarkea/distilcamembert-base-sentiment')
MAX_TEXT_LENGTH = int(os.getenv('MAX_TEXT_LENGTH', 512))

# French Keywords for Classification
DRAMA_KEYWORDS = [
    'scandale', 'controverse', 'polémique', 'accusation', 'critique',
    'problème', 'clash', 'conflit', 'arnaque', 'mensonge', 'tricherie',
    'manipulation', 'fake', 'faux', 'plagiat', 'vol', 'insulte',
    'racisme', 'sexisme', 'harcèlement', 'violence', 'agression'
]

GOOD_ACTION_KEYWORDS = [
    'don', 'charité', 'aide', 'soutien', 'générosité', 'solidarité',
    'bénévolat', 'association', 'humanitaire', 'entraide', 'partage',
    'bienfaisance', 'philanthropie', 'engagement', 'cause', 'défense',
    'protection', 'sensibilisation', 'mobilisation', 'collecte'
]

# News Sources (French)
NEWS_SOURCES = [
    'https://www.lemonde.fr',
    'https://www.lefigaro.fr',
    'https://www.liberation.fr',
    'https://www.20minutes.fr',
    'https://www.francetvinfo.fr'
]
