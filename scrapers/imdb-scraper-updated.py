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
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
        }

    async def get_filming_locations(self, imdb_id: str) -> List[FilmingLocation]:
        """Scrape filming locations for a specific IMDb ID"""
        url = f"{self.base_url}/title/{imdb_id}/locations"
        
        ssl_context = ssl.create_default_context(cafile=certifi.where())
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
        connector = aiohttp.TCPConnector(ssl=ssl_context)
        
        async with aiohttp.ClientSession(connector=connector) as session:
            async with session.get(url, headers=self.headers) as response:
                if response.status != 200:
                    print(f"Error: Status {response.status} for {url}")
                    return []
                
                html = await response.text()
                soup = BeautifulSoup(html, 'html.parser')
                
                # Get production title
                title_elem = soup.find('h3', attrs={'data-testid': 'hero__primary-text'})
                if not title_elem:
                    # Try alternate selector
                    title_elem = soup.find('a', attrs={'data-testid': 'hero__pageTitle'})
                
                if not title_elem:
                    print("Could not find title element")
                    return []
                
                title_text = title_elem.text.strip()
                
                # Determine production type
                production_type = 'tv_show' if 'TV Series' in html else 'movie'
                
                # Extract title without year/type
                production_title = re.sub(r'\s*\(.*?\)\s*$', '', title_text)
                
                locations = []
                
                # Find all location sections - try different selectors for modern IMDb
                location_sections = soup.find_all('section', class_='ipc-page-section')
                
                # Also check for location listings
                location_items = soup.find_all('div', attrs={'data-testid': 'item-body'})
                if not location_items:
                    location_items = soup.find_all('div', class_='ipc-html-content-inner-div')
                
                for item in location_items:
                    # Extract location text
                    location_text = item.get_text(strip=True)
                    
                    # Skip if this doesn't look like a location
                    if not location_text or len(location_text) < 5:
                        continue
                    
                    location_data = self._parse_location_text(location_text)
                    if location_data:
                        locations.append(FilmingLocation(
                            production_title=production_title,
                            production_type=production_type,
                            imdb_id=imdb_id,
                            **location_data
                        ))
                
                print(f"Found {len(locations)} locations for {production_title}")
                return locations
    
    def _parse_location_text(self, text: str) -> Optional[Dict]:
        """Parse location text from IMDb"""
        try:
            # Split by newlines or commas
            lines = text.split('\n')
            
            # First line is usually the location name
            location_name = lines[0].strip()
            
            # Parse location components
            parts = [p.strip() for p in location_name.split(',')]
            
            location_data = {
                'location_name': location_name,
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
                location_data['city'] = parts[1]
            if len(parts) >= 3:
                location_data['state_province'] = parts[2]
            if len(parts) >= 4:
                location_data['country'] = parts[3]
            else:
                # If only 2 parts, second might be country
                if len(parts) == 2:
                    location_data['country'] = parts[1]
                elif len(parts) == 3:
                    location_data['country'] = parts[2]
            
            # Look for scene description in additional lines
            if len(lines) > 1:
                scene_text = ' '.join(lines[1:]).strip()
                if scene_text and not scene_text.startswith('('):
                    location_data['scene_description'] = scene_text
            
            return location_data
            
        except Exception as e:
            print(f"Error parsing location text: {e}")
            return None

    async def scrape_popular_titles(self, count: int = 10) -> List[FilmingLocation]:
        """Scrape locations for popular movies and TV shows"""
        # Sample list of popular titles
        popular_titles = [
            'tt0111161',  # The Shawshank Redemption
            'tt0068646',  # The Godfather
            'tt0468569',  # The Dark Knight
            'tt0944947',  # Game of Thrones
            'tt0903747',  # Breaking Bad
            'tt4574334',  # Stranger Things
            'tt0110912',  # Pulp Fiction
            'tt0167260',  # Lord of the Rings: Return of the King
        ]
        
        all_locations = []
        for imdb_id in popular_titles[:count]:
            print(f"Scraping {imdb_id}...")
            locations = await self.get_filming_locations(imdb_id)
            all_locations.extend(locations)
            await asyncio.sleep(2)  # Be respectful with rate limiting
        
        return all_locations

# Example usage
async def main():
    scraper = IMDbLocationScraper()
    
    # Test with specific titles
    test_ids = [
        'tt0111161',  # The Shawshank Redemption
        'tt0903747',  # Breaking Bad
        'tt4574334',  # Stranger Things
    ]
    
    all_locations = []
    for imdb_id in test_ids:
        print(f"\nTesting with {imdb_id}")
        locations = await scraper.get_filming_locations(imdb_id)
        
        if locations:
            for loc in locations:
                print(f"- {loc.location_name}")
                if loc.scene_description:
                    print(f"  Scene: {loc.scene_description}")
        
        all_locations.extend(locations)
    
    # Save results
    if all_locations:
        with open('imdb_locations.json', 'w') as f:
            json.dump([loc.__dict__ for loc in all_locations], f, indent=2)
        print(f"\nSaved {len(all_locations)} locations to imdb_locations.json")
    else:
        print("\nNo locations found")

if __name__ == "__main__":
    asyncio.run(main())
