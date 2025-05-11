import { TMDBIntegration } from '../integrations/tmdb-integration'
import { FilmingLocationsPipeline } from '../integrations/data-pipeline'
import { config } from 'dotenv'

// Load environment variables
config()

async function main() {
  console.log('🚀 Starting initial data fetch...')
  
  const supabaseUrl = process.env.SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_ANON_KEY!
  const tmdbApiKey = process.env.TMDB_API_KEY

  // Check for required keys
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials. Please check your .env file')
    process.exit(1)
  }

  if (!tmdbApiKey || tmdbApiKey === 'your_tmdb_api_key_here') {
    console.error('❌ Missing TMDB API key. Please get one from: https://www.themoviedb.org/settings/api')
    console.log('\nTo get started without TMDB:')
    console.log('- Run the IMDb scraper: npm run scrape:imdb')
    console.log('- Run the Wikipedia scraper: npm run scrape:wikipedia')
    console.log('- Run the Reddit scraper: npm run scrape:reddit')
    return
  }

  try {
    // Initialize TMDB integration
    const tmdb = new TMDBIntegration(tmdbApiKey, supabaseUrl, supabaseKey)
    
    console.log('📽️ Fetching popular movies from TMDB...')
    await tmdb.fetchPopularMovies(1)
    
    // Initialize pipeline for additional processing
    const pipeline = new FilmingLocationsPipeline(supabaseUrl, supabaseKey)
    
    console.log('🔄 Starting full data pipeline...')
    await pipeline.runPipeline()
    
    console.log('✅ Initial data fetch complete!')
    
  } catch (error) {
    console.error('❌ Error during data fetch:', error)
  }
}

main().catch(console.error)
