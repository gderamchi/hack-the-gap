import aiohttp
from bs4 import BeautifulSoup
from typing import List, Dict
from .base_scraper import BaseScraper
import config
import asyncio

class YouTubeScraper(BaseScraper):
    """Scraper for YouTube comments and video descriptions"""
    
    def __init__(self):
        super().__init__()
        self.source_name = "youtube"
    
    async def scrape(self, influencer_name: str) -> List[Dict]:
        """Scrape YouTube for influencer mentions"""
        results = []
        
        async with aiohttp.ClientSession() as session:
            # Search YouTube (scraping search results page)
            search_url = f"https://www.youtube.com/results?search_query={influencer_name.replace(' ', '+')}"
            
            html = await self.fetch(session, search_url)
            if html:
                # Extract video IDs from search results
                video_ids = self.extract_video_ids(html)
                
                # Get video details for top 5 videos
                for video_id in video_ids[:5]:
                    video_url = f"https://www.youtube.com/watch?v={video_id}"
                    video_data = await self.scrape_video_page(session, video_url)
                    if video_data:
                        results.append(video_data)
                    
                    await asyncio.sleep(1)  # Rate limiting
        
        return results
    
    def extract_video_ids(self, html: str) -> List[str]:
        """Extract video IDs from YouTube search results"""
        video_ids = []
        try:
            # Look for video IDs in the HTML
            import re
            pattern = r'"videoId":"([^"]+)"'
            matches = re.findall(pattern, html)
            video_ids = list(set(matches))[:10]  # Get unique IDs
        except Exception as e:
            print(f"Error extracting video IDs: {str(e)}")
        
        return video_ids
    
    async def scrape_video_page(self, session: aiohttp.ClientSession, url: str) -> Dict:
        """Scrape video page for title and description"""
        try:
            html = await self.fetch(session, url)
            if not html:
                return None
            
            soup = BeautifulSoup(html, 'html.parser')
            
            # Extract title
            title_tag = soup.find('meta', property='og:title')
            title = title_tag['content'] if title_tag else "Unknown"
            
            # Extract description
            desc_tag = soup.find('meta', property='og:description')
            description = desc_tag['content'] if desc_tag else ""
            
            if description and len(description) > 50:
                excerpt = description[:500] + "..." if len(description) > 500 else description
                
                return {
                    'url': url,
                    'text': f"{title}. {excerpt}",
                    'source': self.source_name,
                    'title': title
                }
        except Exception as e:
            print(f"Error scraping YouTube video {url}: {str(e)}")
        
        return None
