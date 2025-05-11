import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import type { Database } from '../types/database.types'

// Load environment variables
config()

async function testConnection() {
  console.log('Testing Supabase connection...')
  
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env file')
    return
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseKey)

  try {
    // Test query to check connection
    const { data, error } = await supabase
      .from('productions')
      .select('*')
      .limit(5)

    if (error) {
      console.error('Error connecting to database:', error)
      return
    }

    console.log('✅ Successfully connected to Supabase!')
    console.log(`Found ${data.length} productions in the database`)
    
    if (data.length > 0) {
      console.log('\nSample productions:')
      data.forEach(prod => {
        console.log(`- ${prod.title} (${prod.release_year})`)
      })
    }

    // Test the view
    const { data: viewData, error: viewError } = await supabase
      .from('filming_locations_full')
      .select('*')
      .limit(5)

    if (!viewError && viewData) {
      console.log(`\nFound ${viewData.length} filming locations`)
    }

  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

testConnection()
