import asyncio
import aiohttp
from abc import ABC, abstractmethod
from typing import List, Dict
import config
import time

class BaseScraper(ABC):
    """Base class for all scrapers"""
    
    def __init__(self):
        self.timeout = aiohttp.ClientTimeout(total=config.REQUEST_TIMEOUT)
        self.headers = {
            'User-Agent': config.USER_AGENT,
            'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8'
        }
        self.results = []
        
    @abstractmethod
    async def scrape(self, influencer_name: str) -> List[Dict]:
        """
        Scrape data for an influencer
        Returns list of dicts with: url, text, source
        """
        pass
    
    async def fetch(self, session: aiohttp.ClientSession, url: str) -> str:
        """Fetch URL content with error handling"""
        try:
            async with session.get(url, headers=self.headers, timeout=self.timeout) as response:
                if response.status == 200:
                    return await response.text()
                else:
                    print(f"Error fetching {url}: Status {response.status}")
                    return ""
        except asyncio.TimeoutError:
            print(f"Timeout fetching {url}")
            return ""
        except Exception as e:
            print(f"Error fetching {url}: {str(e)}")
            return ""
    
    def rate_limit(self, delay: float = 1.0):
        """Simple rate limiting"""
        time.sleep(delay)
