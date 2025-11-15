import aiohttp
from bs4 import BeautifulSoup
from typing import List, Dict
from .base_scraper import BaseScraper
import asyncio
import json

class RedditScraper(BaseScraper):
    """Scraper for Reddit posts and comments"""
    
    def __init__(self):
        super().__init__()
        self.source_name = "reddit"
    
    async def scrape(self, influencer_name: str) -> List[Dict]:
        """Scrape Reddit for influencer mentions"""
        results = []
        
        async with aiohttp.ClientSession() as session:
            # Use Reddit's JSON API (no auth needed for public posts)
            search_url = f"https://www.reddit.com/search.json?q={influencer_name.replace(' ', '+')}&limit=20"
            
            try:
                async with session.get(search_url, headers=self.headers) as response:
                    if response.status == 200:
                        data = await response.json()
                        posts = data.get('data', {}).get('children', [])
                        
                        for post in posts[:10]:
                            post_data = post.get('data', {})
                            title = post_data.get('title', '')
                            selftext = post_data.get('selftext', '')
                            permalink = post_data.get('permalink', '')
                            subreddit = post_data.get('subreddit', '')
                            
                            # Combine title and text
                            text = f"{title}. {selftext}" if selftext else title
                            
                            if text and len(text) > 20:
                                excerpt = text[:500] + "..." if len(text) > 500 else text
                                
                                results.append({
                                    'url': f"https://www.reddit.com{permalink}",
                                    'text': excerpt,
                                    'source': self.source_name,
                                    'title': f"r/{subreddit}: {title[:100]}"
                                })
                        
                        await asyncio.sleep(2)  # Reddit rate limiting
            except Exception as e:
                print(f"Error scraping Reddit: {str(e)}")
        
        return results
