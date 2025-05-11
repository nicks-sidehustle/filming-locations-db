# Filming Locations Database

A comprehensive database system for tracking filming locations of movies and TV shows.

## Project Structure

```
filming-locations-db/
├── scrapers/              # Web scrapers for various sources
│   ├── imdb-scraper.py    # IMDb filming locations scraper
│   ├── reddit-scraper.py  # Reddit community data scraper
│   └── wikipedia-scraper.py # Wikipedia filming info scraper
├── integrations/          # API integrations and data pipeline
│   ├── tmdb-integration.ts # TMDB API integration
│   └── data-pipeline.ts   # Main data processing pipeline
├── types/                 # TypeScript type definitions
│   └── database.types.ts  # Supabase database types
├── scripts/               # Utility scripts
│   └── start-ingestion.sh # Setup and data ingestion script
└── package.json          # Node.js project configuration
```

## Setup

1. Install dependencies:
```bash
npm install
pip install aiohttp beautifulsoup4 asyncio
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys
```

3. Run initial setup:
```bash
npm run setup
```

## Usage

### Fetch data from TMDB
```bash
npm start
```

### Run specific scrapers
```bash
npm run scrape:imdb
npm run scrape:reddit
npm run scrape:wikipedia
```

### Run full data pipeline
```bash
npm run pipeline
```

## Database Schema

- **productions**: Movies and TV shows
- **locations**: Physical filming locations
- **filming_locations**: Links productions to locations
- **images**: Photos of filming locations
- **posts**: User comments and threads
- **submissions**: User-submitted content for moderation

## Data Sources

1. **TMDB API**: Movie/TV metadata, posters, genres
2. **IMDb**: Actual filming locations (web scraping)
3. **Wikipedia**: Production sections with location info
4. **Reddit**: Community-sourced locations
5. **OpenStreetMap**: Geocoding addresses

## Project Info

- **Supabase Project ID**: bpntoeeidxwtoztxdpjp
- **Database**: PostgreSQL 15.8
- **Region**: us-west-1
