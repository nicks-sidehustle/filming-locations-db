import asyncio
import aiohttp
import re
from bs4 import BeautifulSoup
from typing import List, Dict, Optional
import json

class WikipediaLocationScraper:
    def __init__(self):
        self.base_url = 'https://en.wikipedia.org/w/api.php'
        self.headers = {
            'User-Agent': 'FilmingLocations/1.0 (Film Location Database)'
        }
    
    async def search_film_articles(self, query: str) -> List[str]:
        """Search Wikipedia for film/TV show articles"""
        params = {
            'action': 'query',
            'format': 'json',
            'list': 'search',
            'srsearch': f'{query} film OR movie OR "TV series"',
            'srlimit': 50
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.get(self.base_url, params=params, headers=self.headers) as response:
                data = await response.json()
                return [item['title'] for item in data.get('query', {}).get('search', [])]
    
    async def get_filming_locations(self, page_title: str) -> Dict:
        """Extract filming locations from a Wikipedia page"""
        # Get page content
        params = {
            'action': 'query',
            'format': 'json',
            'prop': 'revisions',
            'titles': page_title,
            'rvprop': 'content',
            'rvslots': 'main'
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.get(self.base_url, params=params, headers=self.headers) as response:
                data = await response.json()
                
                pages = data.get('query', {}).get('pages', {})
                if not pages:
                    return {}
                
                page_data = next(iter(pages.values()))
                if 'revisions' not in page_data:
                    return {}
                
                content = page_data['revisions'][0]['slots']['main']['*']
                
                # Parse filming locations section
                locations = self._parse_filming_locations(content, page_title)
                
                return {
                    'title': page_title,
                    'locations': locations
                }
    
    def _parse_filming_locations(self, content: str, page_title: str) -> List[Dict]:
        """Parse filming locations from Wikipedia content"""
        locations = []
        
        # Look for filming/production section
        filming_patterns = [
            r'==\s*(?:Filming|Production|Principal photography|Shooting locations?)\s*==',
            r'===\s*(?:Filming locations?|Shooting locations?)\s*==='
        ]
        
        filming_section = None
        for pattern in filming_patterns:
            match = re.search(pattern, content, re.IGNORECASE)
            if match:
                start = match.end()
                # Find the next section
                next_section = re.search(r'\n==', content[start:])
                end = start + next_section.start() if next_section else len(content)
                filming_section = content[start:end]
                break
        
        if not filming_section:
            return locations
        
        # Extract locations from the section
        location_patterns = [
            # "filmed in Location"
            r'filmed (?:in|at) ([^\.]+?)[\.\,]',
            # "shot in Location"
            r'shot (?:in|at) ([^\.]+?)[\.\,]',
            # "Location was used for"
            r'([^\.]+?) was used for',
            # "scenes were filmed at Location"
            r'scenes were filmed at ([^\.]+?)[\.\,]',
            # Bullet points with locations
            r'\*\s*([^:\n]+?)(?::|$)'
        ]
        
        for pattern in location_patterns:
            matches = re.finditer(pattern, filming_section, re.IGNORECASE)
            for match in matches:
                location_text = match.group(1).strip()
                
                # Clean up the location text
                location_text = re.sub(r'\[\[([^\]]+)\]\]', r'\1', location_text)  # Remove wiki links
                location_text = re.sub(r'<[^>]+>', '', location_text)  # Remove HTML tags
                
                if len(location_text) > 5 and len(location_text) < 200:
                    # Try to parse location components
                    location_data = self._parse_location_string(location_text)
                    if location_data:
                        location_data['source'] = f'wikipedia:{page_title}'
                        locations.append(location_data)
        
        return locations
    
    def _parse_location_string(self, location_text: str) -> Optional[Dict]:
        """Parse a location string into components"""
        # Remove parenthetical information
        location_text = re.sub(r'\([^)]*\)', '', location_text).strip()
        
        # Split by commas
        parts = [p.strip() for p in location_text.split(',')]
        
        if not parts:
            return None
        
        location_data = {
            'location_name': location_text,
            'name': parts[0]
        }
        
        # Try to identify city, state, country
        if len(parts) >= 2:
            location_data['city'] = parts[-2] if len(parts) > 2 else parts[0]
        if len(parts) >= 3:
            location_data['state_province'] = parts[-2]
        if len(parts) >= 1:
            location_data['country'] = parts[-1]
        
        # Common country patterns
        country_patterns = {
            r'\b(USA|United States|US|America)\b': 'United States',
            r'\b(UK|United Kingdom|Britain|England)\b': 'United Kingdom',
            r'\b(Canada)\b': 'Canada',
            r'\b(Australia)\b': 'Australia',
            r'\b(New Zealand|NZ)\b': 'New Zealand'
        }
        
        for pattern, country in country_patterns.items():
            if re.search(pattern, location_text, re.IGNORECASE):
                location_data['country'] = country
                break
        
        return location_data
    
    async def scrape_category(self, category: str = 'Category:Films_by_shooting_location') -> List[Dict]:
        """Scrape all pages in a Wikipedia category"""
        all_locations = []
        
        # Get pages in category
        params = {
            'action': 'query',
            'format': 'json',
            'list': 'categorymembers',
            'cmtitle': category,
            'cmlimit': 500
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.get(self.base_url, params=params, headers=self.headers) as response:
                data = await response.json()
                pages = data.get('query', {}).get('categorymembers', [])
                
                for page in pages:
                    if page['ns'] == 0:  # Only main namespace articles
                        print(f"Processing: {page['title']}")
                        result = await self.get_filming_locations(page['title'])
                        if result.get('locations'):
                            all_locations.extend(result['locations'])
                        await asyncio.sleep(1)  # Rate limiting
        
        return all_locations

# Example usage
async def main():
    scraper = WikipediaLocationScraper()
    
    # Search for specific movie
    results = await scraper.search_film_articles('The Lord of the Rings')
    print(f"Found {len(results)} articles")
    
    # Get locations for first result
    if results:
        locations = await scraper.get_filming_locations(results[0])
        print(json.dumps(locations, indent=2))
    
    # Or scrape entire category
    # all_locations = await scraper.scrape_category()
    # with open('wikipedia_locations.json', 'w') as f:
    #     json.dump(all_locations, f, indent=2)

if __name__ == "__main__":
    asyncio.run(main())
