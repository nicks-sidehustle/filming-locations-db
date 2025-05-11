import asyncio
import aiohttp
from bs4 import BeautifulSoup
import re
from typing import List, Dict, Optional
import json
from dataclasses import dataclass
from datetime import datetime
import ssl
import certifi

@dataclass
class FilmingLocation:
    production_title: str
    production_type: str
    imdb_id: str
    location_name: str
    scene_description: Optional[str]
    address: Optional[str]
    city: Optional[str]
    state_province: Optional[str]
    country: Optional[str]

class IMDbLocationScraper:
    def __init__(self):
        self.base_url = "https://www.imdb.com"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }

    async def get_filming_locations(self, imdb_id: str) -> List[FilmingLocation]:
        """Scrape filming locations for a specific IMDb ID"""
        url = f"{self.base_url}/title/{imdb_id}/locations"
        
        ssl_context = ssl.create_default_context(cafile=certifi.where())
        connector = aiohttp.TCPConnector(ssl=ssl_context)
        
        async with aiohttp.ClientSession(connector=connector) as session:
            async with session.get(url, headers=self.headers) as response:
                if response.status != 200:
                    return []
                
                html = await response.text()
                soup = BeautifulSoup(html, 'html.parser')
                
                # Get production title and type
                title_elem = soup.find('h3', {'itemprop': 'name'})
                if not title_elem:
                    return []
                
                title_text = title_elem.text.strip()
                production_type = 'tv_show' if 'TV Series' in title_text else 'movie'
                production_title = re.sub(r'\s*\(.*?\)\s*$', '', title_text)
                
                locations = []
                
                # Find all location entries
                location_divs = soup.find_all('div', class_='soda odd')
                location_divs.extend(soup.find_all('div', class_='soda even'))
                
                for div in location_divs:
                    location_data = self._parse_location_div(div)
                    if location_data:
                        locations.append(FilmingLocation(
                            production_title=production_title,
                            production_type=production_type,
                            imdb_id=imdb_id,
                            **location_data
                        ))
                
                return locations
    
    def _parse_location_div(self, div) -> Optional[Dict]:
        """Parse a single location div from IMDb"""
        try:
            # Get the location text
            dt = div.find('dt')
            if not dt:
                return None
            
            location_text = dt.get_text(strip=True)
            
            # Parse location components
            parts = [p.strip() for p in location_text.split(',')]
            
            location_data = {
                'location_name': location_text,
                'scene_description': None,
                'address': None,
                'city': None,
                'state_province': None,
                'country': None
            }
            
            # Try to parse location hierarchy
            if len(parts) >= 1:
                location_data['location_name'] = parts[0]
            if len(parts) >= 2:
                location_data['city'] = parts[-2] if len(parts) > 2 else parts[0]
            if len(parts) >= 3:
                location_data['state_province'] = parts[-2]
            if len(parts) >= 1:
                location_data['country'] = parts[-1]
            
            # Get scene description if available
            dd = div.find('dd')
            if dd:
                scene_text = dd.get_text(strip=True)
                if scene_text and not scene_text.startswith('('):
                    location_data['scene_description'] = scene_text
            
            return location_data
            
        except Exception as e:
            print(f"Error parsing location: {e}")
            return None

    async def scrape_popular_titles(self, count: int = 100) -> List[FilmingLocation]:
        """Scrape locations for popular movies and TV shows"""
        # This would scrape IMDb's popular titles and then get locations for each
        # For now, let's use a sample list
        popular_titles = [
            'tt0111161',  # The Shawshank Redemption
            'tt0068646',  # The Godfather
            'tt0468569',  # The Dark Knight
            'tt0944947',  # Game of Thrones
            'tt0903747',  # Breaking Bad
            'tt4574334',  # Stranger Things
        ]
        
        all_locations = []
        for imdb_id in popular_titles[:count]:
            print(f"Scraping {imdb_id}...")
            locations = await self.get_filming_locations(imdb_id)
            all_locations.extend(locations)
            await asyncio.sleep(1)  # Be respectful with rate limiting
        
        return all_locations

# Example usage
async def main():
    scraper = IMDbLocationScraper()
    
    # Scrape a specific title
    locations = await scraper.get_filming_locations('tt0111161')
    
    # Save to JSON
    with open('filming_locations.json', 'w') as f:
        json.dump([loc.__dict__ for loc in locations], f, indent=2)
    
    print(f"Scraped {len(locations)} locations")

if __name__ == "__main__":
    asyncio.run(main())
