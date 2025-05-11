import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import type { Database } from '../types/database.types'

// Load environment variables
config()

// Sample data for popular movies and their filming locations
const sampleData = {
  productions: [
    {
      title: "The Lord of the Rings: The Fellowship of the Ring",
      type: "movie" as const,
      release_year: 2001,
      imdb_id: "tt0120737",
      genres: ["Adventure", "Fantasy", "Drama"],
      description: "A meek Hobbit and eight companions set out on a journey to destroy the powerful One Ring."
    },
    {
      title: "The Dark Knight",
      type: "movie" as const,
      release_year: 2008,
      imdb_id: "tt0468569",
      genres: ["Action", "Crime", "Drama"],
      description: "When the menace known as the Joker wreaks havoc on Gotham, Batman must confront him."
    },
    {
      title: "Game of Thrones",
      type: "tv_show" as const,
      release_year: 2011,
      imdb_id: "tt0944947",
      genres: ["Drama", "Fantasy", "Adventure"],
      description: "Nine noble families fight for control over the lands of Westeros."
    },
    {
      title: "Inception",
      type: "movie" as const,
      release_year: 2010,
      imdb_id: "tt1375666",
      genres: ["Action", "Sci-Fi", "Thriller"],
      description: "A thief who steals corporate secrets through dream-sharing technology."
    }
  ],
  locations: [
    {
      name: "Hobbiton Movie Set",
      address: "501 Buckland Rd",
      city: "Matamata",
      state_province: "Waikato",
      country: "New Zealand",
      latitude: -37.872093,
      longitude: 175.683594,
      location_type: "set",
      accessibility: "public",
      description: "The famous Hobbiton movie set from LOTR and The Hobbit"
    },
    {
      name: "Lower Wacker Drive",
      city: "Chicago",
      state_province: "Illinois",
      country: "USA",
      latitude: 41.8873,
      longitude: -87.6303,
      location_type: "street",
      accessibility: "public",
      description: "Underground street system used for chase scenes"
    },
    {
      name: "Dubrovnik Old Town",
      city: "Dubrovnik",
      country: "Croatia",
      latitude: 42.6507,
      longitude: 18.0944,
      location_type: "city",
      accessibility: "public",
      description: "Historic walled city used as King's Landing"
    },
    {
      name: "Château de Chambord",
      city: "Chambord",
      state_province: "Centre-Val de Loire",
      country: "France",
      latitude: 47.6161,
      longitude: 1.5173,
      location_type: "building",
      accessibility: "public",
      description: "Renaissance château used for dream sequences"
    }
  ],
  filmingLocations: [
    {
      production: "The Lord of the Rings: The Fellowship of the Ring",
      location: "Hobbiton Movie Set",
      scene_description: "The Shire - Hobbiton village scenes",
      verified: true
    },
    {
      production: "The Dark Knight",
      location: "Lower Wacker Drive",
      scene_description: "The Batmobile chase scene through Gotham's underground",
      verified: true
    },
    {
      production: "Game of Thrones",
      location: "Dubrovnik Old Town",
      scene_description: "King's Landing exterior shots",
      season: 2,
      verified: true
    },
    {
      production: "Inception",
      location: "Château de Chambord",
      scene_description: "The elaborate dream architecture sequences",
      verified: true
    }
  ]
}

async function loadSampleData() {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials')
    return
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseKey)

  try {
    console.log('Loading sample data into Supabase...')

    // 1. Insert productions
    console.log('Inserting productions...')
    const { data: productions, error: productionError } = await supabase
      .from('productions')
      .upsert(sampleData.productions)
      .select()

    if (productionError) throw productionError
    console.log(`✓ Inserted ${productions.length} productions`)

    // 2. Insert locations
    console.log('Inserting locations...')
    const { data: locations, error: locationError } = await supabase
      .from('locations')
      .upsert(sampleData.locations)
      .select()

    if (locationError) throw locationError
    console.log(`✓ Inserted ${locations.length} locations`)

    // 3. Insert filming locations (connections)
    console.log('Creating filming location connections...')
    
    for (const fl of sampleData.filmingLocations) {
      // Find the production
      const production = productions.find(p => p.title === fl.production)
      // Find the location
      const location = locations.find(l => l.name === fl.location)

      if (production && location) {
        const { error } = await supabase
          .from('filming_locations')
          .upsert({
            production_id: production.id,
            location_id: location.id,
            scene_description: fl.scene_description,
            season: fl.season,
            verified: fl.verified
          })

        if (error) {
          console.error(`Error linking ${fl.production} to ${fl.location}:`, error)
        } else {
          console.log(`✓ Linked ${fl.production} to ${fl.location}`)
        }
      }
    }

    // 4. Verify the data was loaded
    const { data: filmingLocations, error: flError } = await supabase
      .from('filming_locations_full')
      .select('*')

    if (flError) throw flError

    console.log('\n✅ Sample data loaded successfully!')
    console.log(`Total filming locations: ${filmingLocations.length}`)
    
    console.log('\nSample locations in database:')
    filmingLocations.forEach(fl => {
      console.log(`- ${fl.production_title} → ${fl.location_name}`)
    })

  } catch (error) {
    console.error('Error loading sample data:', error)
  }
}

loadSampleData()
