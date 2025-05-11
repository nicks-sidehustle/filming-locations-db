# Filming Locations Database - Setup Complete! 🎬

## What We've Accomplished

✅ **Database Created**: Supabase project with complete schema
✅ **Initial Data Loaded**: 8 productions and 8 filming locations
✅ **TypeScript Types**: Generated and ready for use
✅ **Project Structure**: Organized files and scripts
✅ **Sample Data**: Movies and TV shows with diverse locations

## Database Contents

- **Productions**: 5 movies, 3 TV shows
- **Locations**: Across 4 countries (USA, New Zealand, Australia, Hungary)
- **Filming Locations**: 8 verified connections with scene descriptions

## Next Steps for API Keys

You'll need these API keys to expand the database:

1. **TMDB API Key** (Free)
   - Sign up at: https://www.themoviedb.org/signup
   - Get API key at: https://www.themoviedb.org/settings/api
   - Add to `.env`: `TMDB_API_KEY=your_key_here`

2. **Google Places API** (Optional, for geocoding)
   - Enable at: https://console.cloud.google.com/
   - Add to `.env`: `GOOGLE_PLACES_API_KEY=your_key_here`

## How to Add More Data

### 1. Use TMDB Integration (Recommended)
```bash
# First, add your TMDB API key to .env
npm start
```

### 2. Manual Data Entry
```bash
# Edit scripts/add-more-data.ts with your data
npx ts-node scripts/add-more-data.ts
```

### 3. Run Scrapers
```bash
# Reddit scraper
npm run scrape:reddit

# Wikipedia scraper
npm run scrape:wikipedia
```

## Available Scripts

```bash
# Check database statistics
npx ts-node scripts/show-stats.ts

# Test database connection
npx ts-node scripts/test-connection.ts

# Add sample data
npx ts-node scripts/add-more-data.ts
```

## Database Access

- **Project ID**: bpntoeeidxwtoztxdpjp
- **API URL**: https://bpntoeeidxwtoztxdpjp.supabase.co
- **Dashboard**: https://app.supabase.com/project/bpntoeeidxwtoztxdpjp

## Building Your Frontend

1. Create an Astro project
2. Install Supabase client: `npm install @supabase/supabase-js`
3. Use the TypeScript types from `types/database.types.ts`
4. Query the `filming_locations_full` view for easy access

Example query:
```typescript
const { data } = await supabase
  .from('filming_locations_full')
  .select('*')
  .order('production_title')
```

## Data Sources to Explore

1. **Film Commission Websites**
   - Los Angeles: https://www.filmla.com/
   - New York: https://www.nyc.gov/site/mome/
   - Georgia: https://www.georgia.org/film

2. **Location Databases**
   - Movie-locations.com
   - Atlasofwonders.com
   - Filmaps.com

3. **Social Media**
   - Instagram: #filminglocations
   - Reddit: r/MovieLocations
   - Twitter: Film tourism accounts

## Tips for Success

1. Start with popular movies/shows - they have more documented locations
2. Focus on major cities first - they have dedicated film offices
3. Verify locations with multiple sources
4. Add photos to make your directory more engaging
5. Consider adding user submissions for crowd-sourcing

Good luck with your filming locations directory! 🎞️📍
