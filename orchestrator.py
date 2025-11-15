import asyncio
from concurrent.futures import ThreadPoolExecutor
from typing import List, Dict
from scrapers import NewsScraper, YouTubeScraper, TwitterScraper, RedditScraper, ForumScraper
from analyzer import SentimentAnalyzer
from scorer import TrustScorer
import database
from datetime import datetime

class InfluencerOrchestrator:
    """Orchestrates parallel scraping, analysis, and scoring"""
    
    def __init__(self):
        self.scrapers = {
            'news': NewsScraper(),
            'youtube': YouTubeScraper(),
            'twitter': TwitterScraper(),
            'reddit': RedditScraper(),
            'forum': ForumScraper()
        }
        self.analyzer = SentimentAnalyzer()
        self.scorer = TrustScorer()
        self.db = database.get_db()
    
    async def analyze_influencer(self, influencer_name: str, progress_callback=None) -> Dict:
        """
        Main orchestration method - runs all scrapers in parallel
        Returns complete analysis results
        """
        print(f"\n🔍 Starting analysis for: {influencer_name}")
        
        if progress_callback:
            progress_callback("Initializing scrapers...", 0)
        
        # Step 1: Run all scrapers in parallel
        if progress_callback:
            progress_callback("Scraping data from multiple sources...", 10)
        
        scraping_results = await self._run_scrapers_parallel(influencer_name)
        
        print(f"✅ Scraped {len(scraping_results)} mentions")
        
        # Step 2: Analyze sentiment for all mentions
        if progress_callback:
            progress_callback("Analyzing sentiment...", 40)
        
        analyzed_mentions = self._analyze_mentions(scraping_results)
        
        print(f"✅ Analyzed {len(analyzed_mentions)} mentions")
        
        # Step 3: Save to database
        if progress_callback:
            progress_callback("Saving to database...", 70)
        
        self._save_mentions(influencer_name, analyzed_mentions)
        
        # Step 4: Calculate trust score
        if progress_callback:
            progress_callback("Calculating trust score...", 85)
        
        score_data = self.scorer.calculate_trust_score(analyzed_mentions)
        
        # Step 5: Update influencer record
        database.update_influencer_score(
            self.db,
            influencer_name,
            score_data['trust_score'],
            score_data['drama_count'],
            score_data['good_action_count']
        )
        
        if progress_callback:
            progress_callback("Analysis complete!", 100)
        
        print(f"✅ Trust Score: {score_data['trust_score']}/100")
        print(f"   Dramas: {score_data['drama_count']}")
        print(f"   Good Actions: {score_data['good_action_count']}")
        
        return {
            'influencer_name': influencer_name,
            'mentions': analyzed_mentions,
            'score_data': score_data,
            'trust_level': self.scorer.get_trust_level(score_data['trust_score']),
            'trust_color': self.scorer.get_trust_color(score_data['trust_score'])
        }
    
    async def _run_scrapers_parallel(self, influencer_name: str) -> List[Dict]:
        """Run all scrapers in parallel using asyncio"""
        tasks = []
        
        for scraper_name, scraper in self.scrapers.items():
            task = asyncio.create_task(
                self._safe_scrape(scraper, influencer_name, scraper_name)
            )
            tasks.append(task)
        
        # Wait for all scrapers to complete
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Flatten results
        all_mentions = []
        for result in results:
            if isinstance(result, list):
                all_mentions.extend(result)
            elif isinstance(result, Exception):
                print(f"Scraper error: {str(result)}")
        
        return all_mentions
    
    async def _safe_scrape(self, scraper, influencer_name: str, scraper_name: str) -> List[Dict]:
        """Safely run a scraper with error handling"""
        try:
            print(f"  🔄 Running {scraper_name} scraper...")
            results = await scraper.scrape(influencer_name)
            print(f"  ✅ {scraper_name}: {len(results)} results")
            return results
        except Exception as e:
            print(f"  ❌ {scraper_name} error: {str(e)}")
            return []
    
    def _analyze_mentions(self, mentions: List[Dict]) -> List[Dict]:
        """Analyze sentiment for all mentions"""
        analyzed = []
        
        for mention in mentions:
            text = mention.get('text', '')
            if not text:
                continue
            
            # Analyze sentiment
            analysis = self.analyzer.analyze_text(text)
            
            # Combine mention data with analysis
            analyzed_mention = {
                **mention,
                'sentiment_score': analysis['sentiment_score'],
                'label': analysis['label'],
                'confidence': analysis['confidence'],
                'scraped_at': datetime.utcnow()
            }
            
            analyzed.append(analyzed_mention)
        
        return analyzed
    
    def _save_mentions(self, influencer_name: str, mentions: List[Dict]):
        """Save analyzed mentions to database"""
        for mention in mentions:
            try:
                database.save_mention(
                    self.db,
                    influencer_name=influencer_name,
                    source=mention.get('source', 'unknown'),
                    url=mention.get('url', ''),
                    text_excerpt=mention.get('text', ''),
                    sentiment_score=mention.get('sentiment_score', 0.0),
                    label=mention.get('label', 'neutral')
                )
            except Exception as e:
                print(f"Error saving mention: {str(e)}")
    
    def get_cached_results(self, influencer_name: str) -> Dict:
        """Get cached results from database"""
        data = database.get_influencer_data(self.db, influencer_name)
        
        if not data:
            return None
        
        influencer = data['influencer']
        mentions = data['mentions']
        
        # Convert mentions to dict format
        mention_dicts = []
        for m in mentions:
            mention_dicts.append({
                'url': m.url,
                'text': m.text_excerpt,
                'source': m.source,
                'sentiment_score': m.sentiment_score,
                'label': m.label,
                'scraped_at': m.scraped_at
            })
        
        # Recalculate score from cached mentions
        score_data = self.scorer.calculate_trust_score(mention_dicts)
        
        return {
            'influencer_name': influencer_name,
            'mentions': mention_dicts,
            'score_data': score_data,
            'trust_level': self.scorer.get_trust_level(score_data['trust_score']),
            'trust_color': self.scorer.get_trust_color(score_data['trust_score']),
            'last_updated': influencer.last_updated
        }
