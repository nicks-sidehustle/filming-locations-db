# Filming Locations Database

## About This Project

This is a personal hobby project born from my fascination with discovering where our favorite movies and TV shows were filmed. As someone who loves both cinema and travel, I've always been curious about the real-world locations that bring fictional stories to life.

While this started as a personal interest, I'm excited to share it with fellow film location enthusiasts! If you share this passion for tracking down filming locations, exploring movie tourism, or preserving the history of where our favorite scenes were shot, I'd love to collaborate. Whether you want to contribute code, share location data, or just geek out about that amazing shot from your favorite film - you're welcome here!

This is very much a work in progress and a labor of love. Pull requests, suggestions, and any form of contribution are warmly welcomed!

## What We're Building

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

## Contributing

I'm always excited to meet fellow filming location enthusiasts! Here are some ways you can contribute:

- **Share Location Data**: Know a filming location that's not in our database? Submit it!
- **Improve Scrapers**: Help make our data collection more accurate and comprehensive
- **Frontend Development**: Want to help build a beautiful interface for browsing locations?
- **Photography**: Have photos of filming locations? We'd love to include them!
- **Documentation**: Help other contributors by improving our docs
- **Bug Reports**: Found something that's not working? Let us know!

No contribution is too small - even fixing a typo helps! Feel free to open an issue to discuss ideas or submit a pull request.

## Connect

If you're passionate about filming locations, movie tourism, or just want to chat about that incredible shot from your favorite film, don't hesitate to reach out. This is a community project in the truest sense - let's build something amazing together!

---

*Happy location hunting! 🎬📍*
