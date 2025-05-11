#!/bin/bash

# Filming Locations Data Ingestion Script

echo "🎬 Starting Filming Locations Data Ingestion..."

# 1. Install dependencies
echo "📦 Installing dependencies..."
# Dependencies already installed

# 2. Set up environment variables
echo "🔐 Setting up environment variables..."
cat > .env << EOL
SUPABASE_URL=https://bpntoeeidxwtoztxdpjp.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
TMDB_API_KEY=your_tmdb_api_key_here
EOL

echo "⚠️  Please update .env with your actual API keys"

# 3. Create initial data fetch script
cat > scripts/fetch-initial-data.ts << 'EOL'
import { TMDBIntegration } from './../integrations/tmdb-integration'
import { FilmingLocationsPipeline } from './../integrations/data-pipeline'

async function main() {
  // Initialize pipeline
  const pipeline = new FilmingLocationsPipeline(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  )
  
  // Start with TMDB popular movies
  const tmdb = new TMDBIntegration(
    process.env.TMDB_API_KEY!,
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  )
  
  console.log('Fetching popular movies from TMDB...')
  await tmdb.fetchPopularMovies(1)
  
  console.log('Starting full pipeline...')
  await pipeline.runPipeline()
}

main().catch(console.error)
EOL

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Get your Supabase anon key from: https://app.supabase.com/project/bpntoeeidxwtoztxdpjp/settings/api"
echo "2. Get a TMDB API key from: https://www.themoviedb.org/settings/api"
echo "3. Update the .env file with your keys"
echo "4. Run: npm run start"
echo ""
echo "Data sources to implement:"
echo "- ✅ TMDB API (movies/TV metadata)"
echo "- ✅ IMDb scraper (filming locations)"
echo "- ✅ Reddit scraper (community data)"
echo "- ⏳ Wikipedia scraper"
echo "- ⏳ Instagram hashtag scraper"
echo "- ⏳ Google Places enrichment"
