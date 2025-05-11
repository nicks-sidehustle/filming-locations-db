"""
Since IMDb's structure has changed, let's use TMDB (The Movie Database) API
which provides movie metadata and we can cross-reference with other sources for locations
"""

import asyncio
import aiohttp
import json
from datetime import datetime
from typing import List, Dict

class TMDBLocationsFetcher:
    def __init__(self, api_key: str = None):
        self.api_key = api_key
        self.base_url = "https://api.themoviedb.org/3"
        
    async def get_popular_movies(self, page: int = 1) -> List[Dict]:
        """Get popular movies from TMDB"""
        if not self.api_key:
            print("No API key provided. Using sample data...")
            return self._get_sample_data()
        
        url = f"{self.base_url}/movie/popular?api_key={self.api_key}&page={page}"
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    return data.get('results', [])
                else:
                    print(f"Error: {response.status}")
                    return []
    
    def _get_sample_data(self) -> List[Dict]:
        """Return sample movie data for testing without API key"""
        return [
            {
                "id": 111161,
                "title": "The Shawshank Redemption",
                "release_date": "1994-09-23",
                "overview": "Imprisoned in Shawshank State Penitentiary...",
                "poster_path": "/path/to/poster.jpg"
            },
            {
                "id": 903747,
                "title": "Breaking Bad",
                "release_date": "2008-01-20",
                "overview": "A high school chemistry teacher...",
                "poster_path": "/path/to/poster.jpg"
            },
            {
                "id": 4574334,
                "title": "Stranger Things",
                "release_date": "2016-07-15",
                "overview": "When a young boy vanishes...",
                "poster_path": "/path/to/poster.jpg"
            }
        ]
    
    def create_supabase_insert_data(self, movie: Dict) -> Dict:
        """Transform TMDB movie data for Supabase insertion"""
        return {
            "title": movie.get("title", ""),
            "type": "movie",
            "release_year": datetime.strptime(movie.get("release_date", "2000-01-01"), "%Y-%m-%d").year,
            "tmdb_id": str(movie.get("id", "")),
            "description": movie.get("overview", ""),
            "poster_url": f"https://image.tmdb.org/t/p/w500{movie.get('poster_path', '')}" if movie.get('poster_path') else None
        }

async def main():
    # You would get this from environment variable or .env file
    api_key = None  # Set to None to use sample data
    
    fetcher = TMDBLocationsFetcher(api_key)
    
    print("Fetching popular movies...")
    movies = await fetcher.get_popular_movies()
    
    print(f"Found {len(movies)} movies")
    
    # Transform for Supabase
    supabase_data = []
    for movie in movies:
        data = fetcher.create_supabase_insert_data(movie)
        supabase_data.append(data)
        print(f"- {data['title']} ({data['release_year']})")
    
    # Save to JSON
    with open('tmdb_movies.json', 'w') as f:
        json.dump(supabase_data, f, indent=2)
    print("\nSaved movie data to tmdb_movies.json")
    
    # Sample location data (you would get this from other sources)
    sample_locations = [
        {
            "production_title": "The Shawshank Redemption",
            "locations": [
                {
                    "name": "Ohio State Reformatory",
                    "address": "100 Reformatory Rd",
                    "city": "Mansfield",
                    "state": "Ohio",
                    "country": "USA",
                    "latitude": 40.7831,
                    "longitude": -82.5027,
                    "scene_description": "Shawshank State Prison exteriors"
                }
            ]
        },
        {
            "production_title": "Breaking Bad",
            "locations": [
                {
                    "name": "Walter White House",
                    "address": "3828 Piermont Dr NE",
                    "city": "Albuquerque",
                    "state": "New Mexico",
                    "country": "USA",
                    "latitude": 35.1261,
                    "longitude": -106.5369,
                    "scene_description": "Walter White's family home"
                }
            ]
        }
    ]
    
    with open('sample_locations.json', 'w') as f:
        json.dump(sample_locations, f, indent=2)
    print("Saved sample location data to sample_locations.json")

if __name__ == "__main__":
    asyncio.run(main())
