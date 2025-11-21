"""
Mock scrapers for testing the leaderboard functionality
"""

class BaseScraper:
    async def scrape(self, query):
        return []

class NewsScraper(BaseScraper):
    async def scrape(self, query):
        return [
            {
                'source': 'news',
                'url': f'https://example.com/news/{query}',
                'text': f'Article about {query} discussing recent activities.',
                'title': f'News about {query}'
            }
        ]

class YouTubeScraper(BaseScraper):
    async def scrape(self, query):
        return [
            {
                'source': 'youtube',
                'url': f'https://youtube.com/watch?v={query}',
                'text': f'Video featuring {query} with positive content.',
                'title': f'YouTube video: {query}'
            }
        ]

class TwitterScraper(BaseScraper):
    async def scrape(self, query):
        return [
            {
                'source': 'twitter',
                'url': f'https://twitter.com/search?q={query}',
                'text': f'Tweet mentioning {query} in a neutral context.',
                'title': f'Twitter mention of {query}'
            }
        ]

class RedditScraper(BaseScraper):
    async def scrape(self, query):
        return [
            {
                'source': 'reddit',
                'url': f'https://reddit.com/search?q={query}',
                'text': f'Reddit discussion about {query} and their work.',
                'title': f'Reddit post about {query}'
            }
        ]

class ForumScraper(BaseScraper):
    async def scrape(self, query):
        return [
            {
                'source': 'forum',
                'url': f'https://forum.example.com/{query}',
                'text': f'Forum thread discussing {query} recent projects.',
                'title': f'Forum discussion: {query}'
            }
        ]
