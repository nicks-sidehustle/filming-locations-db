import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.types'

interface TMDBMovie {
  id: number
  title: string
  overview: string
  release_date: string
  poster_path: string
  backdrop_path: string
  genre_ids: number[]
  imdb_id?: string
}

interface TMDBLocation {
  iso_3166_1: string
  name: string
}

interface TMDBGenre {
  id: number
  name: string
}

interface TMDBMovieResponse {
  results: TMDBMovie[]
  page: number
  total_pages: number
  total_results: number
}

interface TMDBGenreResponse {
  genres: TMDBGenre[]
}

interface TMDBMovieDetails extends TMDBMovie {
  imdb_id?: string
  external_ids?: {
    imdb_id?: string
  }
}

class TMDBIntegration {
  private apiKey: string
  private supabase: any
  private baseUrl = 'https://api.themoviedb.org/3'
  private imageBaseUrl = 'https://image.tmdb.org/t/p'

  constructor(
    tmdbApiKey: string,
    supabaseUrl: string,
    supabaseKey: string
  ) {
    this.apiKey = tmdbApiKey
    this.supabase = createClient<Database>(supabaseUrl, supabaseKey)
  }

  async fetchPopularMovies(page: number = 1): Promise<void> {
    try {
      // Get popular movies
      const moviesResponse = await fetch(
        `${this.baseUrl}/movie/popular?api_key=${this.apiKey}&page=${page}`
      )
      const moviesData = await moviesResponse.json() as TMDBMovieResponse

      // Get genre mappings
      const genresResponse = await fetch(
        `${this.baseUrl}/genre/movie/list?api_key=${this.apiKey}`
      )
      const genresData = await genresResponse.json() as TMDBGenreResponse
      const genreMap = new Map(
        genresData.genres.map((g: TMDBGenre) => [g.id, g.name])
      )

      for (const movie of moviesData.results) {
        await this.processMovie(movie, genreMap)
      }
    } catch (error) {
      console.error('Error fetching popular movies:', error)
    }
  }

  async processMovie(movie: TMDBMovie, genreMap: Map<number, string>): Promise<void> {
    try {
      // Get additional movie details including external IDs
      const detailsResponse = await fetch(
        `${this.baseUrl}/movie/${movie.id}?api_key=${this.apiKey}&append_to_response=external_ids`
      )
      const details = await detailsResponse.json() as TMDBMovieDetails

      // Insert or update production
      const { data: production, error: productionError } = await this.supabase
        .from('productions')
        .upsert({
          title: movie.title,
          type: 'movie',
          release_year: new Date(movie.release_date).getFullYear(),
          imdb_id: details.imdb_id,
          tmdb_id: movie.id.toString(),
          poster_url: movie.poster_path ? 
            `${this.imageBaseUrl}/w500${movie.poster_path}` : null,
          backdrop_url: movie.backdrop_path ? 
            `${this.imageBaseUrl}/original${movie.backdrop_path}` : null,
          description: movie.overview,
          genres: movie.genre_ids.map(id => genreMap.get(id)).filter(Boolean)
        })
        .select()
        .single()

      if (productionError) {
        console.error('Error inserting production:', productionError)
        return
      }

      // Note: TMDB doesn't provide filming locations directly
      // You'll need to cross-reference with IMDb or other sources
      console.log(`Processed movie: ${movie.title}`)

    } catch (error) {
      console.error(`Error processing movie ${movie.title}:`, error)
    }
  }

  async searchProduction(query: string, type: 'movie' | 'tv' = 'movie'): Promise<any> {
    const endpoint = type === 'movie' ? 'search/movie' : 'search/tv'
    const response = await fetch(
      `${this.baseUrl}/${endpoint}?api_key=${this.apiKey}&query=${encodeURIComponent(query)}`
    )
    return response.json()
  }

  async getProductionCredits(tmdbId: number, type: 'movie' | 'tv' = 'movie'): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/${type}/${tmdbId}/credits?api_key=${this.apiKey}`
    )
    return response.json()
  }
}

// Example usage
async function populateDatabase() {
  const tmdb = new TMDBIntegration(
    process.env.TMDB_API_KEY!,
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  )

  // Fetch popular movies
  await tmdb.fetchPopularMovies(1)
  
  // Fetch popular TV shows
  // ... similar implementation for TV shows
}

export { TMDBIntegration }