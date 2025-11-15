import aiohttp
from bs4 import BeautifulSoup
from newspaper import Article
from typing import List, Dict
from .base_scraper import BaseScraper
import config

class NewsScraper(BaseScraper):
    """Scraper for French news websites"""
    
    def __init__(self):
        super().__init__()
        self.source_name = "news"
    
    async def scrape(self, influencer_name: str) -> List[Dict]:
        """Scrape French news sites for influencer mentions"""
        results = []
        
        async with aiohttp.ClientSession() as session:
            # Search Google News for French articles
            search_queries = [
                f"{influencer_name} scandale",
                f"{influencer_name} controverse",
                f"{influencer_name} polémique",
                f"{influencer_name} don charité",
                f"{influencer_name} actualité"
            ]
            
            for query in search_queries:
                # Use DuckDuckGo as a simple alternative (no API key needed)
                search_url = f"https://html.duckduckgo.com/html/?q={query.replace(' ', '+')}+site:lemonde.fr+OR+site:lefigaro.fr+OR+site:liberation.fr"
                
                html = await self.fetch(session, search_url)
                if html:
                    soup = BeautifulSoup(html, 'html.parser')
                    links = soup.find_all('a', class_='result__a', limit=3)
                    
                    for link in links:
                        url = link.get('href', '')
                        if url and 'http' in url:
                            article_data = await self.scrape_article(session, url)
                            if article_data:
                                results.append(article_data)
                
                # Rate limiting
                await asyncio.sleep(2)
        
        return results[:10]  # Limit to 10 articles
    
    async def scrape_article(self, session: aiohttp.ClientSession, url: str) -> Dict:
        """Scrape individual article using newspaper3k"""
        try:
            article = Article(url, language='fr')
            article.download()
            article.parse()
            
            if article.text and len(article.text) > 100:
                # Get excerpt (first 500 chars)
                excerpt = article.text[:500] + "..." if len(article.text) > 500 else article.text
                
                return {
                    'url': url,
                    'text': excerpt,
                    'source': self.source_name,
                    'title': article.title
                }
        except Exception as e:
            print(f"Error scraping article {url}: {str(e)}")
        
        return None

import asyncio
