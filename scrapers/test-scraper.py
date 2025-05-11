import asyncio
import json
from pathlib import Path
import sys

# Add parent directory to path
sys.path.append(str(Path(__file__).parent))

# Import using the actual filename
import importlib.util
spec = importlib.util.spec_from_file_location("imdb_scraper", "scrapers/imdb-scraper.py")
imdb_scraper = importlib.util.module_from_spec(spec)
spec.loader.exec_module(imdb_scraper)
IMDbLocationScraper = imdb_scraper.IMDbLocationScraper

async def test_scraper():
    print("Testing IMDb scraper...")
    scraper = IMDbLocationScraper()
    
    # Test with The Shawshank Redemption
    imdb_id = 'tt0111161'
    print(f"Fetching locations for: {imdb_id}")
    
    try:
        locations = await scraper.get_filming_locations(imdb_id)
        
        if locations:
            print(f"\nFound {len(locations)} locations:")
            for loc in locations:
                print(f"- {loc.location_name}")
                if loc.scene_description:
                    print(f"  Scene: {loc.scene_description}")
            
            # Save to JSON
            with open('test_locations.json', 'w') as f:
                json.dump([loc.__dict__ for loc in locations], f, indent=2)
            print("\nSaved to test_locations.json")
        else:
            print("No locations found")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_scraper())
