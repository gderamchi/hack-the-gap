from datetime import datetime, timedelta
from typing import List, Dict
import math

class TrustScorer:
    """Calculate trust scores for influencers"""
    
    def __init__(self):
        self.base_score = 50.0
        self.drama_weight = -15.0
        self.good_action_weight = 10.0
        self.sentiment_weight = 20.0
        self.recency_decay_days = 180  # 6 months
    
    def calculate_trust_score(self, mentions: List[Dict]) -> Dict:
        """
        Calculate trust score from mentions
        Returns: {
            'trust_score': float (0-100),
            'drama_count': int,
            'good_action_count': int,
            'neutral_count': int,
            'avg_sentiment': float,
            'breakdown': dict
        }
        """
        if not mentions:
            return {
                'trust_score': self.base_score,
                'drama_count': 0,
                'good_action_count': 0,
                'neutral_count': 0,
                'avg_sentiment': 0.0,
                'breakdown': {}
            }
        
        # Count mentions by label
        drama_count = 0
        good_action_count = 0
        neutral_count = 0
        sentiment_scores = []
        
        # Calculate weighted scores based on recency
        weighted_drama = 0.0
        weighted_good = 0.0
        weighted_sentiment = 0.0
        total_weight = 0.0
        
        now = datetime.utcnow()
        
        for mention in mentions:
            # Get recency weight (more recent = higher weight)
            scraped_at = mention.get('scraped_at', now)
            if isinstance(scraped_at, str):
                try:
                    scraped_at = datetime.fromisoformat(scraped_at)
                except:
                    scraped_at = now
            
            days_old = (now - scraped_at).days
            recency_weight = self._calculate_recency_weight(days_old)
            
            # Count by label
            label = mention.get('label', 'neutral')
            sentiment_score = mention.get('sentiment_score', 0.0)
            
            if label == 'drama':
                drama_count += 1
                weighted_drama += recency_weight
            elif label == 'good_action':
                good_action_count += 1
                weighted_good += recency_weight
            else:
                neutral_count += 1
            
            sentiment_scores.append(sentiment_score)
            weighted_sentiment += sentiment_score * recency_weight
            total_weight += recency_weight
        
        # Calculate average sentiment
        avg_sentiment = sum(sentiment_scores) / len(sentiment_scores) if sentiment_scores else 0.0
        
        # Calculate weighted averages
        if total_weight > 0:
            weighted_drama /= total_weight
            weighted_good /= total_weight
            weighted_sentiment /= total_weight
        
        # Calculate trust score
        trust_score = self.base_score
        
        # Apply drama penalty (weighted)
        trust_score += weighted_drama * self.drama_weight * drama_count
        
        # Apply good action bonus (weighted)
        trust_score += weighted_good * self.good_action_weight * good_action_count
        
        # Apply sentiment influence
        trust_score += weighted_sentiment * self.sentiment_weight
        
        # Normalize to 0-100 range
        trust_score = max(0.0, min(100.0, trust_score))
        
        # Calculate breakdown
        breakdown = {
            'base': self.base_score,
            'drama_impact': weighted_drama * self.drama_weight * drama_count,
            'good_action_impact': weighted_good * self.good_action_weight * good_action_count,
            'sentiment_impact': weighted_sentiment * self.sentiment_weight,
            'total_mentions': len(mentions),
            'recency_factor': total_weight / len(mentions) if mentions else 0.0
        }
        
        return {
            'trust_score': round(trust_score, 2),
            'drama_count': drama_count,
            'good_action_count': good_action_count,
            'neutral_count': neutral_count,
            'avg_sentiment': round(avg_sentiment, 3),
            'breakdown': breakdown
        }
    
    def _calculate_recency_weight(self, days_old: int) -> float:
        """
        Calculate weight based on how recent the mention is
        Uses exponential decay: weight = e^(-days/decay_period)
        """
        if days_old < 0:
            days_old = 0
        
        # Exponential decay
        weight = math.exp(-days_old / self.recency_decay_days)
        
        # Ensure minimum weight of 0.1 for very old mentions
        return max(0.1, weight)
    
    def get_trust_level(self, trust_score: float) -> str:
        """Get trust level description"""
        if trust_score >= 80:
            return "Très fiable"
        elif trust_score >= 60:
            return "Fiable"
        elif trust_score >= 40:
            return "Neutre"
        elif trust_score >= 20:
            return "Peu fiable"
        else:
            return "Non fiable"
    
    def get_trust_color(self, trust_score: float) -> str:
        """Get color for trust score visualization"""
        if trust_score >= 80:
            return "#10b981"  # Green
        elif trust_score >= 60:
            return "#3b82f6"  # Blue
        elif trust_score >= 40:
            return "#f59e0b"  # Orange
        elif trust_score >= 20:
            return "#ef4444"  # Red
        else:
            return "#991b1b"  # Dark red
