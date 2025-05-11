import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.types'

interface DataSource {
  name: string
  priority: number
  rateLimit: number // requests per minute
  lastFetch?: Date
}

interface LocationData {
  production: {
    title: string
    type: 'movie' | 'tv_show'
    release_year?: number
    imdb_id?: string
    tmdb_id?: string
    description?: string
    genres?: string[]
  }
  location: {
    name: string
    address?: string
    city?: string
    state_province?: string
    country: string
    latitude?: number
    longitude?: number
    location_type?: string
  }
  filming_info: {
    scene_description?: string
    filming_date?: string
    episode?: string
    season?: number
    verified: boolean
  }
  source: string
  confidence: number // 0-1 score
}

class FilmingLocationsPipeline {
  private supabase: any
  private sources: DataSource[] = [
    { name: 'tmdb', priority: 1, rateLimit: 40 },
    { name: 'imdb', priority: 2, rateLimit: 10 },
    { name: 'wikipedia', priority: 3, rateLimit: 30 },
    { name: 'reddit', priority: 4, rateLimit: 60 },
    { name: 'instagram', priority: 5, rateLimit: 20 }
  ]

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient<Database>(supabaseUrl, supabaseKey)
  }

  async processLocationData(data: LocationData): Promise<void> {
    try {
      // 1. Check if production exists
      let production = await this.findOrCreateProduction(data.production)
      
      // 2. Check if location exists
      let location = await this.findOrCreateLocation(data.location)
      
      // 3. Create or update filming location
      await this.createFilmingLocation(production.id, location.id, data.filming_info)
      
      // 4. If unverified, create a submission for review
      if (!data.filming_info.verified) {
        await this.createSubmission(data)
      }
      
    } catch (error) {
      console.error('Error processing location data:', error)
    }
  }

  private async findOrCreateProduction(productionData: LocationData['production']) {
    // First try to find by IMDB ID
    if (productionData.imdb_id) {
      const { data: existing } = await this.supabase
        .from('productions')
        .select()
        .eq('imdb_id', productionData.imdb_id)
        .single()
      
      if (existing) return existing
    }
    
    // Try to find by title and year
    const { data: existing } = await this.supabase
      .from('productions')
      .select()
      .eq('title', productionData.title)
      .eq('release_year', productionData.release_year)
      .single()
    
    if (existing) return existing
    
    // Create new production
    const { data: newProduction } = await this.supabase
      .from('productions')
      .insert(productionData)
      .select()
      .single()
    
    return newProduction
  }

  private async findOrCreateLocation(locationData: LocationData['location']) {
    // Try to find by coordinates if available
    if (locationData.latitude && locationData.longitude) {
      const { data: existing } = await this.supabase
        .from('locations')
        .select()
        .eq('latitude', locationData.latitude)
        .eq('longitude', locationData.longitude)
        .single()
      
      if (existing) return existing
    }
    
    // Try to find by name and city
    const { data: existing } = await this.supabase
      .from('locations')
      .select()
      .eq('name', locationData.name)
      .eq('city', locationData.city)
      .eq('country', locationData.country)
      .single()
    
    if (existing) return existing
    
    // Geocode if coordinates not provided
    if (!locationData.latitude && locationData.address) {
      const coords = await this.geocodeAddress(
        `${locationData.address}, ${locationData.city}, ${locationData.country}`
      )
      if (coords) {
        locationData.latitude = coords.lat
        locationData.longitude = coords.lng
      }
    }
    
    // Create new location
    const { data: newLocation } = await this.supabase
      .from('locations')
      .insert(locationData)
      .select()
      .single()
    
    return newLocation
  }

  private async createFilmingLocation(
    productionId: string, 
    locationId: string, 
    filmingInfo: LocationData['filming_info']
  ) {
    const { data, error } = await this.supabase
      .from('filming_locations')
      .upsert({
        production_id: productionId,
        location_id: locationId,
        ...filmingInfo
      })
    
    if (error) throw error
    return data
  }

  private async createSubmission(data: LocationData) {
    await this.supabase
      .from('submissions')
      .insert({
        type: 'filming_location',
        data: data,
        status: 'pending'
      })
  }

  private async geocodeAddress(address: string): Promise<{lat: number, lng: number} | null> {
    // Using Nominatim (OpenStreetMap) - free, no API key needed
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
    
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'FilmingLocations/1.0' }
      })
      const data = await response.json() as Array<{ lat: string; lon: string }>
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        }
      }
    } catch (error) {
      console.error('Geocoding error:', error)
    }
    
    return null
  }

  async runPipeline() {
    console.log('Starting filming locations data pipeline...')
    
    // Process each source based on priority
    for (const source of this.sources.sort((a, b) => a.priority - b.priority)) {
      console.log(`Processing source: ${source.name}`)
      
      try {
        switch (source.name) {
          case 'tmdb':
            // Import from TMDB
            break
          case 'imdb':
            // Run IMDb scraper
            break
          case 'wikipedia':
            // Scrape Wikipedia
            break
          case 'reddit':
            // Run Reddit scraper
            break
          case 'instagram':
            // Instagram API/scraping
            break
        }
        
        // Respect rate limits
        await this.rateLimit(source)
        
      } catch (error) {
        console.error(`Error processing ${source.name}:`, error)
      }
    }
  }

  private async rateLimit(source: DataSource) {
    const delayMs = (60 / source.rateLimit) * 1000
    await new Promise(resolve => setTimeout(resolve, delayMs))
  }
}

export { FilmingLocationsPipeline, LocationData }