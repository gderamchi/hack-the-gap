from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
import torch
from typing import Dict, Tuple
import config

class SentimentAnalyzer:
    """French sentiment analyzer using CamemBERT"""
    
    def __init__(self):
        self.model_name = config.SENTIMENT_MODEL
        self.device = 0 if torch.cuda.is_available() else -1
        self.analyzer = None
        self.tokenizer = None
        self.model = None
        self._initialize_model()
    
    def _initialize_model(self):
        """Initialize the sentiment analysis model"""
        try:
            print(f"Loading sentiment model: {self.model_name}")
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self.model = AutoModelForSequenceClassification.from_pretrained(self.model_name)
            self.analyzer = pipeline(
                "sentiment-analysis",
                model=self.model,
                tokenizer=self.tokenizer,
                device=self.device
            )
            print("Sentiment model loaded successfully!")
        except Exception as e:
            print(f"Error loading model: {str(e)}")
            print("Falling back to simple keyword-based analysis")
            self.analyzer = None
    
    def analyze_text(self, text: str) -> Dict:
        """
        Analyze sentiment of text
        Returns: {
            'sentiment_score': float (-1 to 1),
            'label': str ('drama', 'good_action', 'neutral'),
            'confidence': float (0 to 1)
        }
        """
        if not text or len(text.strip()) < 10:
            return {
                'sentiment_score': 0.0,
                'label': 'neutral',
                'confidence': 0.0
            }
        
        # Truncate text if too long
        text = text[:config.MAX_TEXT_LENGTH]
        
        # Get sentiment from model
        if self.analyzer:
            sentiment_result = self._model_sentiment(text)
        else:
            sentiment_result = self._keyword_sentiment(text)
        
        # Classify based on keywords and sentiment
        label = self._classify_content(text, sentiment_result['sentiment_score'])
        
        return {
            'sentiment_score': sentiment_result['sentiment_score'],
            'label': label,
            'confidence': sentiment_result['confidence']
        }
    
    def _model_sentiment(self, text: str) -> Dict:
        """Get sentiment using transformer model"""
        try:
            result = self.analyzer(text)[0]
            label = result['label'].lower()
            score = result['score']
            
            # Convert to -1 to 1 scale
            if 'positive' in label or '5' in label or '4' in label:
                sentiment_score = score
            elif 'negative' in label or '1' in label or '2' in label:
                sentiment_score = -score
            else:
                sentiment_score = 0.0
            
            return {
                'sentiment_score': sentiment_score,
                'confidence': score
            }
        except Exception as e:
            print(f"Error in model sentiment analysis: {str(e)}")
            return self._keyword_sentiment(text)
    
    def _keyword_sentiment(self, text: str) -> Dict:
        """Fallback keyword-based sentiment analysis"""
        text_lower = text.lower()
        
        # Count positive and negative keywords
        drama_count = sum(1 for keyword in config.DRAMA_KEYWORDS if keyword in text_lower)
        good_count = sum(1 for keyword in config.GOOD_ACTION_KEYWORDS if keyword in text_lower)
        
        # Calculate sentiment score
        total = drama_count + good_count
        if total == 0:
            sentiment_score = 0.0
            confidence = 0.3
        else:
            sentiment_score = (good_count - drama_count) / total
            confidence = min(total / 10.0, 1.0)
        
        return {
            'sentiment_score': sentiment_score,
            'confidence': confidence
        }
    
    def _classify_content(self, text: str, sentiment_score: float) -> str:
        """
        Classify content as drama, good_action, or neutral
        Based on keywords and sentiment
        """
        text_lower = text.lower()
        
        # Check for drama keywords
        drama_matches = sum(1 for keyword in config.DRAMA_KEYWORDS if keyword in text_lower)
        good_matches = sum(1 for keyword in config.GOOD_ACTION_KEYWORDS if keyword in text_lower)
        
        # Classification logic
        if drama_matches > 0 and sentiment_score < -0.2:
            return 'drama'
        elif good_matches > 0 and sentiment_score > 0.2:
            return 'good_action'
        elif drama_matches > good_matches and sentiment_score < 0:
            return 'drama'
        elif good_matches > drama_matches and sentiment_score > 0:
            return 'good_action'
        else:
            return 'neutral'
    
    def batch_analyze(self, texts: list) -> list:
        """Analyze multiple texts"""
        return [self.analyze_text(text) for text in texts]
