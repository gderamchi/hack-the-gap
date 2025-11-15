import aiohttp
from bs4 import BeautifulSoup
from typing import List, Dict
from .base_scraper import BaseScraper
import asyncio

class ForumScraper(BaseScraper):
    """Scraper for French forums and discussion boards"""
    
    def __init__(self):
        super().__init__()
        self.source_name = "forum"
        # Popular French forums
        self.forums = [
            "jeuxvideo.com",
            "forum.hardware.fr",
            "doctissimo.fr"
        ]
    
    async def scrape(self, influencer_name: str) -> List[Dict]:
        """Scrape French forums for influencer mentions"""
        results = []
        
        async with aiohttp.ClientSession() as session:
            # Use DuckDuckGo to search forums
            for forum in self.forums:
                search_url = f"https://html.duckduckgo.com/html/?q={influencer_name.replace(' ', '+')}+site:{forum}"
                
                html = await self.fetch(session, search_url)
                if html:
                    soup = BeautifulSoup(html, 'html.parser')
                    links = soup.find_all('a', class_='result__a', limit=3)
                    
                    for link in links:
                        url = link.get('href', '')
                        title = link.get_text(strip=True)
                        
                        if url and 'http' in url:
                            # Fetch the forum page
                            page_data = await self.scrape_forum_page(session, url, title)
                            if page_data:
                                results.append(page_data)
                
                await asyncio.sleep(2)  # Rate limiting
        
        return results[:10]
    
    async def scrape_forum_page(self, session: aiohttp.ClientSession, url: str, title: str) -> Dict:
        """Scrape individual forum page"""
        try:
            html = await self.fetch(session, url)
            if not html:
                return None
            
            soup = BeautifulSoup(html, 'html.parser')
            
            # Try to extract main content (varies by forum)
            # Look for common forum content containers
            content_selectors = [
                'div.post-content',
                'div.message-content',
                'div.content',
                'article',
                'div.post'
            ]
            
            text = ""
            for selector in content_selectors:
                elements = soup.select(selector)
                if elements:
                    text = ' '.join([elem.get_text(strip=True) for elem in elements[:3]])
                    break
            
            # Fallback: get all paragraph text
            if not text:
                paragraphs = soup.find_all('p', limit=5)
                text = ' '.join([p.get_text(strip=True) for p in paragraphs])
            
            if text and len(text) > 50:
                excerpt = text[:500] + "..." if len(text) > 500 else text
                
                return {
                    'url': url,
                    'text': excerpt,
                    'source': self.source_name,
                    'title': title[:100]
                }
        except Exception as e:
            print(f"Error scraping forum page {url}: {str(e)}")
        
        return None
