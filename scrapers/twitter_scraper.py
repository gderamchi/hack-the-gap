import aiohttp
from bs4 import BeautifulSoup
from typing import List, Dict
from .base_scraper import BaseScraper
import asyncio

class TwitterScraper(BaseScraper):
    """Scraper for Twitter/X mentions"""
    
    def __init__(self):
        super().__init__()
        self.source_name = "twitter"
    
    async def scrape(self, influencer_name: str) -> List[Dict]:
        """Scrape Twitter for influencer mentions"""
        results = []
        
        # Note: Twitter scraping is challenging without API access
        # Using Nitter (Twitter frontend) as alternative
        async with aiohttp.ClientSession() as session:
            # Try multiple Nitter instances
            nitter_instances = [
                "https://nitter.net",
                "https://nitter.poast.org",
                "https://nitter.privacydev.net"
            ]
            
            for instance in nitter_instances:
                try:
                    search_url = f"{instance}/search?f=tweets&q={influencer_name.replace(' ', '+')}"
                    html = await self.fetch(session, search_url)
                    
                    if html:
                        tweets = self.parse_nitter_results(html, instance)
                        results.extend(tweets)
                        
                        if len(results) >= 5:
                            break
                    
                    await asyncio.sleep(2)
                except Exception as e:
                    print(f"Error with Nitter instance {instance}: {str(e)}")
                    continue
        
        return results[:10]
    
    def parse_nitter_results(self, html: str, base_url: str) -> List[Dict]:
        """Parse Nitter search results"""
        results = []
        try:
            soup = BeautifulSoup(html, 'html.parser')
            tweets = soup.find_all('div', class_='timeline-item', limit=10)
            
            for tweet in tweets:
                # Extract tweet text
                tweet_content = tweet.find('div', class_='tweet-content')
                if tweet_content:
                    text = tweet_content.get_text(strip=True)
                    
                    # Extract tweet link
                    link_tag = tweet.find('a', class_='tweet-link')
                    tweet_url = base_url + link_tag['href'] if link_tag else base_url
                    
                    if text and len(text) > 20:
                        excerpt = text[:300] + "..." if len(text) > 300 else text
                        
                        results.append({
                            'url': tweet_url,
                            'text': excerpt,
                            'source': self.source_name,
                            'title': 'Tweet'
                        })
        except Exception as e:
            print(f"Error parsing Nitter results: {str(e)}")
        
        return results
