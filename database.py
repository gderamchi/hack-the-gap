from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import config

Base = declarative_base()

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
    trust_score = Column(Float, nullable=False)
    drama_count = Column(Integer, nullable=False)
    good_action_count = Column(Integer, nullable=False)
    analyzed_at = Column(DateTime, default=datetime.utcnow)

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

def update_influencer_score(db, name, trust_score, drama_count, good_action_count):
    """Update influencer trust score"""
    influencer = get_or_create_influencer(db, name)
    influencer.trust_score = trust_score
    influencer.drama_count = drama_count
    influencer.good_action_count = good_action_count
    influencer.last_updated = datetime.utcnow()
    
    # Save to history
    history = AnalysisHistory(
        influencer_name=name,
        trust_score=trust_score,
        drama_count=drama_count,
        good_action_count=good_action_count
    )
    db.add(history)
    db.commit()
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
