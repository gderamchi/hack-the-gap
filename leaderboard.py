"""
Leaderboard module for competitive dashboard
Handles point calculation, ranking logic, and achievements
"""

from typing import Dict, List
from datetime import datetime, timedelta
import database

class LeaderboardManager:
    """Manages leaderboard calculations and rankings"""
    
    def __init__(self):
        self.db = database.get_db()
        
        # Point system configuration
        self.BASE_POINTS = 10
        self.QUALITY_BONUS_THRESHOLD = 0.8
        self.QUALITY_BONUS_POINTS = 5
        self.COMPREHENSIVE_DATA_BONUS = 3  # For analyses with many mentions
        self.STREAK_BONUS_MULTIPLIER = 0.1  # 10% bonus per streak day
        
        # Achievement thresholds
        self.ACHIEVEMENTS = {
            'first_analysis': {'name': '🎯 First Steps', 'description': 'Complete your first analysis', 'threshold': 1},
            'dedicated': {'name': '💪 Dedicated', 'description': 'Complete 10 analyses', 'threshold': 10},
            'expert': {'name': '🏆 Expert', 'description': 'Complete 50 analyses', 'threshold': 50},
            'master': {'name': '👑 Master', 'description': 'Complete 100 analyses', 'threshold': 100},
            'streak_3': {'name': '🔥 On Fire', 'description': '3-day streak', 'threshold': 3},
            'streak_7': {'name': '⚡ Unstoppable', 'description': '7-day streak', 'threshold': 7},
            'streak_30': {'name': '🌟 Legend', 'description': '30-day streak', 'threshold': 30},
        }
    
    def calculate_points(self, mentions_count: int, quality_score: float = 1.0, streak_days: int = 0) -> int:
        """
        Calculate points for an analysis
        
        Args:
            mentions_count: Number of mentions found
            quality_score: Quality score (0-1) based on data comprehensiveness
            streak_days: Current contributor streak
        
        Returns:
            Total points awarded
        """
        points = self.BASE_POINTS
        
        # Quality bonus
        if quality_score >= self.QUALITY_BONUS_THRESHOLD:
            points += self.QUALITY_BONUS_POINTS
        
        # Comprehensive data bonus (more mentions = better analysis)
        if mentions_count >= 20:
            points += self.COMPREHENSIVE_DATA_BONUS
        elif mentions_count >= 10:
            points += self.COMPREHENSIVE_DATA_BONUS // 2
        
        # Streak bonus
        if streak_days > 0:
            streak_bonus = int(points * self.STREAK_BONUS_MULTIPLIER * min(streak_days, 10))
            points += streak_bonus
        
        return points
    
    def calculate_quality_score(self, mentions: List[Dict]) -> float:
        """
        Calculate quality score based on analysis data
        
        Factors:
        - Number of sources
        - Diversity of sources
        - Recency of data
        """
        if not mentions:
            return 0.5
        
        score = 0.0
        
        # Source diversity (max 0.4)
        unique_sources = len(set(m.get('source', '') for m in mentions))
        source_diversity = min(unique_sources / 5.0, 1.0) * 0.4
        score += source_diversity
        
        # Data volume (max 0.3)
        volume_score = min(len(mentions) / 30.0, 1.0) * 0.3
        score += volume_score
        
        # Recency (max 0.3)
        now = datetime.utcnow()
        recent_count = 0
        for mention in mentions:
            scraped_at = mention.get('scraped_at', now)
            if isinstance(scraped_at, str):
                try:
                    scraped_at = datetime.fromisoformat(scraped_at)
                except:
                    scraped_at = now
            
            days_old = (now - scraped_at).days
            if days_old <= 30:  # Within last month
                recent_count += 1
        
        recency_score = (recent_count / len(mentions)) * 0.3
        score += recency_score
        
        return min(score, 1.0)
    
    def get_rankings(self, period: str = 'all', limit: int = 10) -> List[Dict]:
        """
        Get leaderboard rankings for specified period
        
        Args:
            period: 'day', 'week', 'month', or 'all'
            limit: Maximum number of results
        
        Returns:
            List of ranked contributors with stats
        """
        rankings = database.get_leaderboard(self.db, period, limit)
        
        # Add rank change indicators (would need historical data)
        for ranking in rankings:
            ranking['rank_change'] = 0  # Placeholder for rank change tracking
            ranking['achievements'] = self.get_contributor_achievements(ranking['contributor_id'])
        
        return rankings
    
    def get_contributor_achievements(self, contributor_id: int) -> List[Dict]:
        """Get achievements earned by contributor"""
        profile = database.get_contributor_profile(self.db, contributor_id)
        if not profile:
            return []
        
        contributor = profile['contributor']
        achievements = []
        
        # Analysis count achievements
        if contributor.analyses_count >= self.ACHIEVEMENTS['master']['threshold']:
            achievements.append(self.ACHIEVEMENTS['master'])
        elif contributor.analyses_count >= self.ACHIEVEMENTS['expert']['threshold']:
            achievements.append(self.ACHIEVEMENTS['expert'])
        elif contributor.analyses_count >= self.ACHIEVEMENTS['dedicated']['threshold']:
            achievements.append(self.ACHIEVEMENTS['dedicated'])
        elif contributor.analyses_count >= self.ACHIEVEMENTS['first_analysis']['threshold']:
            achievements.append(self.ACHIEVEMENTS['first_analysis'])
        
        # Streak achievements
        if contributor.streak_days >= self.ACHIEVEMENTS['streak_30']['threshold']:
            achievements.append(self.ACHIEVEMENTS['streak_30'])
        elif contributor.streak_days >= self.ACHIEVEMENTS['streak_7']['threshold']:
            achievements.append(self.ACHIEVEMENTS['streak_7'])
        elif contributor.streak_days >= self.ACHIEVEMENTS['streak_3']['threshold']:
            achievements.append(self.ACHIEVEMENTS['streak_3'])
        
        return achievements
    
    def get_contributor_stats(self, contributor_id: int) -> Dict:
        """Get detailed statistics for a contributor"""
        profile = database.get_contributor_profile(self.db, contributor_id)
        if not profile:
            return None
        
        contributor = profile['contributor']
        recent_analyses = profile['recent_analyses']
        
        # Calculate additional stats
        all_rankings = {
            'all': database.get_leaderboard(self.db, 'all', 100),
            'month': database.get_leaderboard(self.db, 'month', 100),
            'week': database.get_leaderboard(self.db, 'week', 100),
            'day': database.get_leaderboard(self.db, 'day', 100)
        }
        
        ranks = {}
        for period, rankings in all_rankings.items():
            for idx, r in enumerate(rankings):
                if r['contributor_id'] == contributor_id:
                    ranks[period] = idx + 1
                    break
            if period not in ranks:
                ranks[period] = None
        
        return {
            'username': contributor.username,
            'total_points': contributor.total_points,
            'analyses_count': contributor.analyses_count,
            'streak_days': contributor.streak_days,
            'member_since': contributor.created_at,
            'last_contribution': contributor.last_contribution_date,
            'ranks': ranks,
            'achievements': self.get_contributor_achievements(contributor_id),
            'recent_analyses': [{
                'influencer_name': a.influencer_name,
                'points_awarded': a.points_awarded,
                'analyzed_at': a.analyzed_at
            } for a in recent_analyses]
        }
    
    def get_period_label(self, period: str) -> str:
        """Get display label for period"""
        labels = {
            'day': "📅 Today",
            'week': "📆 This Week",
            'month': "📊 This Month",
            'all': "🏆 All Time"
        }
        return labels.get(period, period)
    
    def get_medal_emoji(self, rank: int) -> str:
        """Get medal emoji for rank"""
        medals = {
            1: "🥇",
            2: "🥈",
            3: "🥉"
        }
        return medals.get(rank, f"#{rank}")
    
    def format_rank_change(self, change: int) -> str:
        """Format rank change indicator"""
        if change > 0:
            return f"↑{change}"
        elif change < 0:
            return f"↓{abs(change)}"
        else:
            return "—"
