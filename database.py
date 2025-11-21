from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, ForeignKey, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import config

Base = declarative_base()

class Contributor(Base):
    __tablename__ = 'contributors'
    
    id = Column(Integer, primary_key=True)
    username = Column(String(100), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=True)
    total_points = Column(Integer, default=0)
    analyses_count = Column(Integer, default=0)
    streak_days = Column(Integer, default=0)
    last_contribution_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Indexes for leaderboard queries
    __table_args__ = (
        Index('idx_total_points', 'total_points'),
        Index('idx_analyses_count', 'analyses_count'),
    )

class ContributorStats(Base):
    __tablename__ = 'contributor_stats'
    
    id = Column(Integer, primary_key=True)
    contributor_id = Column(Integer, ForeignKey('contributors.id'), nullable=False)
    period = Column(String(20), nullable=False)  # 'day', 'week', 'month'
    period_start = Column(DateTime, nullable=False)
    points_earned = Column(Integer, default=0)
    analyses_count = Column(Integer, default=0)
    
    # Indexes for efficient queries
    __table_args__ = (
        Index('idx_contributor_period', 'contributor_id', 'period', 'period_start'),
        Index('idx_period_points', 'period', 'points_earned'),
    )

class Influencer(Base):
    __tablename__ = 'influencers'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(255), unique=True, nullable=False)
    trust_score = Column(Float, default=50.0)
    drama_count = Column(Integer, default=0)
    good_action_count = Column(Integer, default=0)
    last_updated = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

class Mention(Base):
    __tablename__ = 'mentions'
    
    id = Column(Integer, primary_key=True)
    influencer_name = Column(String(255), nullable=False)
    source = Column(String(50), nullable=False)  # news, youtube, twitter, reddit, forum
    url = Column(Text, nullable=False)
    text_excerpt = Column(Text, nullable=False)
    sentiment_score = Column(Float, nullable=False)  # -1 to 1
    label = Column(String(20), nullable=False)  # drama, good_action, neutral
    scraped_at = Column(DateTime, default=datetime.utcnow)

class AnalysisHistory(Base):
    __tablename__ = 'analysis_history'
    
    id = Column(Integer, primary_key=True)
    influencer_name = Column(String(255), nullable=False)
    contributor_id = Column(Integer, ForeignKey('contributors.id'), nullable=True)
    trust_score = Column(Float, nullable=False)
    drama_count = Column(Integer, nullable=False)
    good_action_count = Column(Integer, nullable=False)
    points_awarded = Column(Integer, default=10)
    quality_score = Column(Float, default=1.0)
    analyzed_at = Column(DateTime, default=datetime.utcnow)
    
    # Index for contributor queries
    __table_args__ = (
        Index('idx_contributor_date', 'contributor_id', 'analyzed_at'),
    )

# Database setup
engine = create_engine(config.DATABASE_URL)
Base.metadata.create_all(engine)
SessionLocal = sessionmaker(bind=engine)

def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        return db
    finally:
        pass

def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(engine)
    print("Database initialized successfully!")

def get_or_create_influencer(db, name):
    """Get existing influencer or create new one"""
    influencer = db.query(Influencer).filter(Influencer.name == name).first()
    if not influencer:
        influencer = Influencer(name=name)
        db.add(influencer)
        db.commit()
        db.refresh(influencer)
    return influencer

def save_mention(db, influencer_name, source, url, text_excerpt, sentiment_score, label):
    """Save a mention to database"""
    mention = Mention(
        influencer_name=influencer_name,
        source=source,
        url=url,
        text_excerpt=text_excerpt,
        sentiment_score=sentiment_score,
        label=label
    )
    db.add(mention)
    db.commit()
    return mention

def update_influencer_score(db, name, trust_score, drama_count, good_action_count, contributor_id=None, points_awarded=10, quality_score=1.0):
    """Update influencer trust score"""
    influencer = get_or_create_influencer(db, name)
    influencer.trust_score = trust_score
    influencer.drama_count = drama_count
    influencer.good_action_count = good_action_count
    influencer.last_updated = datetime.utcnow()
    
    # Save to history
    history = AnalysisHistory(
        influencer_name=name,
        contributor_id=contributor_id,
        trust_score=trust_score,
        drama_count=drama_count,
        good_action_count=good_action_count,
        points_awarded=points_awarded,
        quality_score=quality_score
    )
    db.add(history)
    db.commit()
    
    # Update contributor stats if provided
    if contributor_id:
        update_contributor_stats(db, contributor_id, points_awarded, quality_score)
    
    return influencer

def get_influencer_mentions(db, name, limit=50):
    """Get recent mentions for an influencer"""
    return db.query(Mention).filter(
        Mention.influencer_name == name
    ).order_by(Mention.scraped_at.desc()).limit(limit).all()

def get_influencer_data(db, name):
    """Get complete influencer data"""
    influencer = db.query(Influencer).filter(Influencer.name == name).first()
    if not influencer:
        return None
    
    mentions = get_influencer_mentions(db, name)
    return {
        'influencer': influencer,
        'mentions': mentions
    }

# Contributor Management Functions

def get_or_create_contributor(db, username, email=None):
    """Get existing contributor or create new one"""
    contributor = db.query(Contributor).filter(Contributor.username == username).first()
    if not contributor:
        contributor = Contributor(username=username, email=email)
        db.add(contributor)
        db.commit()
        db.refresh(contributor)
    return contributor

def update_contributor_stats(db, contributor_id, points_earned, quality_score=1.0):
    """Update contributor statistics after an analysis"""
    from datetime import datetime, timedelta
    
    contributor = db.query(Contributor).filter(Contributor.id == contributor_id).first()
    if not contributor:
        return None
    
    # Update total stats
    contributor.total_points += points_earned
    contributor.analyses_count += 1
    
    # Update streak
    now = datetime.utcnow()
    if contributor.last_contribution_date:
        days_diff = (now.date() - contributor.last_contribution_date.date()).days
        if days_diff == 1:
            contributor.streak_days += 1
        elif days_diff > 1:
            contributor.streak_days = 1
    else:
        contributor.streak_days = 1
    
    contributor.last_contribution_date = now
    
    # Update period stats
    for period, days in [('day', 1), ('week', 7), ('month', 30)]:
        period_start = (now - timedelta(days=days)).replace(hour=0, minute=0, second=0, microsecond=0)
        
        stat = db.query(ContributorStats).filter(
            ContributorStats.contributor_id == contributor_id,
            ContributorStats.period == period,
            ContributorStats.period_start == period_start
        ).first()
        
        if not stat:
            stat = ContributorStats(
                contributor_id=contributor_id,
                period=period,
                period_start=period_start,
                points_earned=0,
                analyses_count=0
            )
            db.add(stat)
        
        stat.points_earned += points_earned
        stat.analyses_count += 1
    
    db.commit()
    db.refresh(contributor)
    return contributor

def get_leaderboard(db, period='all', limit=10):
    """
    Get leaderboard for specified period
    period: 'day', 'week', 'month', 'all'
    """
    from datetime import datetime, timedelta
    from sqlalchemy import func, desc
    
    if period == 'all':
        # All-time leaderboard
        contributors = db.query(Contributor).order_by(
            desc(Contributor.total_points),
            desc(Contributor.analyses_count)
        ).limit(limit).all()
        
        return [{
            'rank': idx + 1,
            'username': c.username,
            'points': c.total_points,
            'analyses_count': c.analyses_count,
            'streak_days': c.streak_days,
            'contributor_id': c.id
        } for idx, c in enumerate(contributors)]
    
    else:
        # Period-based leaderboard
        now = datetime.utcnow()
        if period == 'day':
            period_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        elif period == 'week':
            period_start = (now - timedelta(days=now.weekday())).replace(hour=0, minute=0, second=0, microsecond=0)
        elif period == 'month':
            period_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        else:
            return []
        
        results = db.query(
            Contributor.username,
            Contributor.id,
            Contributor.streak_days,
            func.sum(ContributorStats.points_earned).label('points'),
            func.sum(ContributorStats.analyses_count).label('analyses_count')
        ).join(
            ContributorStats,
            Contributor.id == ContributorStats.contributor_id
        ).filter(
            ContributorStats.period == period,
            ContributorStats.period_start >= period_start
        ).group_by(
            Contributor.id
        ).order_by(
            desc('points'),
            desc('analyses_count')
        ).limit(limit).all()
        
        return [{
            'rank': idx + 1,
            'username': r.username,
            'points': int(r.points) if r.points else 0,
            'analyses_count': int(r.analyses_count) if r.analyses_count else 0,
            'streak_days': r.streak_days,
            'contributor_id': r.id
        } for idx, r in enumerate(results)]

def get_contributor_profile(db, contributor_id):
    """Get detailed contributor profile"""
    contributor = db.query(Contributor).filter(Contributor.id == contributor_id).first()
    if not contributor:
        return None
    
    # Get recent analyses
    recent_analyses = db.query(AnalysisHistory).filter(
        AnalysisHistory.contributor_id == contributor_id
    ).order_by(AnalysisHistory.analyzed_at.desc()).limit(10).all()
    
    return {
        'contributor': contributor,
        'recent_analyses': recent_analyses
    }
