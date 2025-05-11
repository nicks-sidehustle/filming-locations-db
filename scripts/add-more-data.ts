import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import type { Database } from '../types/database.types'

// Load environment variables
config()

// More diverse sample data
const additionalData = {
  productions: [
    {
      title: "The Matrix",
      type: "movie" as const,
      release_year: 1999,
      imdb_id: "tt0133093",
      genres: ["Action", "Sci-Fi"],
      description: "A computer programmer discovers that reality as he knows it is a simulation."
    },
    {
      title: "Blade Runner 2049",
      type: "movie" as const,
      release_year: 2017,
      imdb_id: "tt1856101",
      genres: ["Sci-Fi", "Drama"],
      description: "A young blade runner's discovery of a secret leads him to track down former blade runner Rick Deckard."
    },
    {
      title: "The Office",
      type: "tv_show" as const,
      release_year: 2005,
      imdb_id: "tt0386676",
      genres: ["Comedy"],
      description: "A mockumentary about the everyday lives of office employees."
    },
    {
      title: "Jurassic Park",
      type: "movie" as const,
      release_year: 1993,
      imdb_id: "tt0107290",
      genres: ["Adventure", "Sci-Fi"],
      description: "A pragmatic paleontologist visits an almost complete theme park on an island in Central America."
    },
    {
      title: "Black Panther",
      type: "movie" as const,
      release_year: 2018,
      imdb_id: "tt1825683",
      genres: ["Action", "Adventure"],
      description: "T'Challa returns home as king of Wakanda but finds his sovereignty challenged."
    }
  ],
  locations: [
    {
      name: "Sydney Harbour Bridge",
      city: "Sydney",
      state_province: "New South Wales",
      country: "Australia",
      latitude: -33.8523,
      longitude: 151.2108,
      location_type: "bridge",
      accessibility: "public",
      description: "Iconic bridge and Sydney landmark"
    },
    {
      name: "Origo Film Studios",
      city: "Budapest",
      country: "Hungary",
      latitude: 47.4979,
      longitude: 19.0402,
      location_type: "studio",
      accessibility: "private",
      description: "Major film production facility"
    },
    {
      name: "Chandler Valley Center Studios",
      city: "Van Nuys",
      state_province: "California",
      country: "USA",
      latitude: 34.1899,
      longitude: -118.4489,
      location_type: "studio",
      accessibility: "private",
      description: "TV production studio complex"
    },
    {
      name: "Kualoa Ranch",
      city: "Kaneohe",
      state_province: "Hawaii",
      country: "USA",
      latitude: 21.5329,
      longitude: -157.8309,
      location_type: "ranch",
      accessibility: "public",
      description: "4000-acre private nature reserve and working cattle ranch"
    },
    {
      name: "High Museum of Art",
      city: "Atlanta",
      state_province: "Georgia",
      country: "USA",
      latitude: 33.7905,
      longitude: -84.3852,
      location_type: "museum",
      accessibility: "public",
      description: "Leading art museum in the Southeast"
    }
  ],
  filmingLocations: [
    {
      production: "The Matrix",
      location: "Sydney Harbour Bridge",
      scene_description: "Neo's office building exterior shots",
      verified: true
    },
    {
      production: "Blade Runner 2049",
      location: "Origo Film Studios",
      scene_description: "Interior sets including Wallace Corporation",
      verified: true
    },
    {
      production: "The Office",
      location: "Chandler Valley Center Studios",
      scene_description: "Dunder Mifflin office interiors",
      season: 1,
      verified: true
    },
    {
      production: "Jurassic Park",
      location: "Kualoa Ranch",
      scene_description: "Dinosaur stampede scene and gallimimus chase",
      verified: true
    },
    {
      production: "Black Panther",
      location: "High Museum of Art",
      scene_description: "Museum heist scene in the film's opening",
      verified: true
    }
  ]
}

async function addMoreData() {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials')
    return
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseKey)

  try {
    console.log('Adding more sample data to Supabase...')

    // 1. Insert new productions
    console.log('Inserting new productions...')
    for (const production of additionalData.productions) {
      const { data, error } = await supabase
        .from('productions')
        .insert(production)
        .select()
        .single()

      if (error) {
        console.log(`Skipping ${production.title} (might already exist)`)
      } else {
        console.log(`✓ Added ${production.title}`)
      }
    }

    // 2. Insert new locations
    console.log('\nInserting new locations...')
    for (const location of additionalData.locations) {
      const { data, error } = await supabase
        .from('locations')
        .insert(location)
        .select()
        .single()

      if (error) {
        console.log(`Skipping ${location.name} (might already exist)`)
      } else {
        console.log(`✓ Added ${location.name}`)
      }
    }

    // 3. Create filming location connections
    console.log('\nCreating filming location connections...')
    
    for (const fl of additionalData.filmingLocations) {
      // Find the production
      const { data: production } = await supabase
        .from('productions')
        .select('id')
        .eq('title', fl.production)
        .single()

      // Find the location
      const { data: location } = await supabase
        .from('locations')
        .select('id')
        .eq('name', fl.location)
        .single()

      if (production && location) {
        const { error } = await supabase
          .from('filming_locations')
          .insert({
            production_id: production.id,
            location_id: location.id,
            scene_description: fl.scene_description,
            season: fl.season,
            verified: fl.verified
          })

        if (error) {
          console.log(`Skipping link ${fl.production} → ${fl.location}`)
        } else {
          console.log(`✓ Linked ${fl.production} → ${fl.location}`)
        }
      }
    }

    // 4. Show all data in database
    const { data: allLocations } = await supabase
      .from('filming_locations_full')
      .select('production_title, production_type, location_name, city, country, scene_description')
      .order('production_title')

    console.log('\n✅ Database now contains:')
    console.log(`Total filming locations: ${allLocations?.length}`)
    
    console.log('\nAll filming locations:')
    allLocations?.forEach(fl => {
      const type = fl.production_type === 'tv_show' ? '📺' : '🎬'
      console.log(`${type} ${fl.production_title} → ${fl.location_name} (${fl.city}, ${fl.country})`)
      if (fl.scene_description) {
        console.log(`   Scene: ${fl.scene_description}`)
      }
    })

  } catch (error) {
    console.error('Error adding data:', error)
  }
}

addMoreData()
