import asyncio
import aiohttp
import re
from typing import List, Dict, Optional
import json
from datetime import datetime

class RedditLocationScraper:
    def __init__(self):
        self.subreddits = [
            'MovieLocations',
            'FilmingLocations',
            'OnLocation',
            'movies',
            'television'
        ]
        self.base_url = 'https://www.reddit.com'
        self.headers = {
            'User-Agent': 'FilmingLocations/1.0'
        }
        
    async def search_subreddit(self, subreddit: str, query: str = 'filming location') -> List[Dict]:
        """Search a subreddit for filming location posts"""
        locations = []
        
        # Reddit JSON API
        url = f"{self.base_url}/r/{subreddit}/search.json"
        params = {
            'q': query,
            'restrict_sr': 'true',
            'sort': 'relevance',
            'limit': 100
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=self.headers, params=params) as response:
                if response.status != 200:
                    return locations
                
                data = await response.json()
                
                for post in data.get('data', {}).get('children', []):
                    post_data = post.get('data', {})
                    
                    # Extract location info from title and selftext
                    location_info = self._extract_location_info(
                        post_data.get('title', ''),
                        post_data.get('selftext', '')
                    )
                    
                    if location_info:
                        location_info.update({
                            'source': f"reddit:{subreddit}",
                            'source_url': f"https://reddit.com{post_data.get('permalink', '')}",
                            'created_at': datetime.fromtimestamp(post_data.get('created_utc', 0)).isoformat(),
                            'upvotes': post_data.get('ups', 0)
                        })
                        locations.append(location_info)
        
        return locations
    
    def _extract_location_info(self, title: str, text: str) -> Optional[Dict]:
        """Extract production and location information from post text"""
        combined_text = f"{title} {text}"
        
        # Common patterns for movie/show titles
        title_patterns = [
            r'"([^"]+)"',  # Quoted titles
            r"'([^']+)'",  # Single-quoted titles
            r'\b([A-Z][A-Za-z\s]+(?:Season \d+)?)\b',  # Title Case
        ]
        
        # Location patterns
        location_patterns = [
            r'filmed (?:at|in) ([^.]+)',
            r'shooting (?:at|in) ([^.]+)',
            r'location[s]? (?:at|in|:) ([^.]+)',
            r'shot (?:at|in) ([^.]+)',
        ]
        
        # Try to extract production title
        production_title = None
        for pattern in title_patterns:
            match = re.search(pattern, combined_text)
            if match:
                production_title = match.group(1).strip()
                break
        
        # Try to extract location
        location = None
        for pattern in location_patterns:
            match = re.search(pattern, combined_text, re.IGNORECASE)
            if match:
                location = match.group(1).strip()
                break
        
        if production_title and location:
            # Further parse location for city/country
            location_parts = [p.strip() for p in location.split(',')]
            
            return {
                'production_title': production_title,
                'location_name': location,
                'city': location_parts[-2] if len(location_parts) > 1 else None,
                'country': location_parts[-1] if len(location_parts) > 0 else None,
                'scene_description': text[:500] if len(text) > 50 else None
            }
        
        return None
    
    async def scrape_all_subreddits(self) -> List[Dict]:
        """Scrape all configured subreddits"""
        all_locations = []
        
        for subreddit in self.subreddits:
            print(f"Scraping r/{subreddit}...")
            locations = await self.search_subreddit(subreddit)
            all_locations.extend(locations)
            await asyncio.sleep(2)  # Rate limiting
        
        return all_locations

    async def monitor_new_posts(self, callback):
        """Monitor subreddits for new filming location posts"""
        while True:
            for subreddit in self.subreddits:
                url = f"{self.base_url}/r/{subreddit}/new.json"
                
                async with aiohttp.ClientSession() as session:
                    async with session.get(url, headers=self.headers) as response:
                        if response.status == 200:
                            data = await response.json()
                            
                            for post in data.get('data', {}).get('children', []):
                                post_data = post.get('data', {})
                                
                                # Check if post mentions filming locations
                                title = post_data.get('title', '').lower()
                                selftext = post_data.get('selftext', '').lower()
                                
                                if any(keyword in title + selftext for keyword in 
                                      ['filming location', 'shot at', 'filmed at', 'movie location']):
                                    
                                    location_info = self._extract_location_info(
                                        post_data.get('title', ''),
                                        post_data.get('selftext', '')
                                    )
                                    
                                    if location_info:
                                        await callback(location_info)
                
                await asyncio.sleep(300)  # Check every 5 minutes

# Example usage
async def main():
    scraper = RedditLocationScraper()
    locations = await scraper.scrape_all_subreddits()
    
    # Save to JSON
    with open('reddit_locations.json', 'w') as f:
        json.dump(locations, f, indent=2)
    
    print(f"Found {len(locations)} potential filming locations")

if __name__ == "__main__":
    asyncio.run(main())
