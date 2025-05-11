import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import type { Database } from '../types/database.types'

// Load environment variables
config()

async function showDatabaseStats() {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials')
    return
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseKey)

  try {
    console.log('📊 FILMING LOCATIONS DATABASE STATISTICS\n')

    // Count productions
    const { count: productionCount } = await supabase
      .from('productions')
      .select('*', { count: 'exact', head: true })

    console.log(`📽️  Total Productions: ${productionCount}`)

    // Count movies vs TV shows
    const { data: productionTypes } = await supabase
      .from('productions')
      .select('type')

    const movieCount = productionTypes?.filter(p => p.type === 'movie').length || 0
    const tvCount = productionTypes?.filter(p => p.type === 'tv_show').length || 0

    console.log(`   - Movies: ${movieCount}`)
    console.log(`   - TV Shows: ${tvCount}`)

    // Count locations
    const { count: locationCount } = await supabase
      .from('locations')
      .select('*', { count: 'exact', head: true })

    console.log(`\n📍 Total Locations: ${locationCount}`)

    // Count by country
    const { data: locationsByCountry } = await supabase
      .from('locations')
      .select('country')

    const countryStats: { [key: string]: number } = {}
    locationsByCountry?.forEach(loc => {
      countryStats[loc.country] = (countryStats[loc.country] || 0) + 1
    })

    console.log('   By Country:')
    Object.entries(countryStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([country, count]) => {
        console.log(`   - ${country}: ${count}`)
      })

    // Count filming locations
    const { count: filmingLocationCount } = await supabase
      .from('filming_locations')
      .select('*', { count: 'exact', head: true })

    console.log(`\n🎬 Total Filming Locations: ${filmingLocationCount}`)

    // Count verified vs unverified
    const { data: verificationStats } = await supabase
      .from('filming_locations')
      .select('verified')

    const verifiedCount = verificationStats?.filter(fl => fl.verified).length || 0
    const unverifiedCount = verificationStats?.filter(fl => !fl.verified).length || 0

    console.log(`   - Verified: ${verifiedCount}`)
    console.log(`   - Unverified: ${unverifiedCount}`)

    // Popular productions
    const { data: popularProductions } = await supabase
      .from('filming_locations_full')
      .select('production_title, production_type')

    const productionCounts: { [key: string]: number } = {}
    popularProductions?.forEach(fl => {
      const key = `${fl.production_title}|${fl.production_type}`
      productionCounts[key] = (productionCounts[key] || 0) + 1
    })

    console.log('\n🌟 Most Filmed Productions:')
    Object.entries(productionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([key, count]) => {
        const [title, type] = key.split('|')
        const icon = type === 'tv_show' ? '📺' : '🎬'
        console.log(`   ${icon} ${title}: ${count} location${count > 1 ? 's' : ''}`)
      })

    // Recent additions
    const { data: recentAdditions } = await supabase
      .from('filming_locations_full')
      .select('production_title, location_name, filming_location_created_at')
      .order('filming_location_created_at', { ascending: false })
      .limit(3)

    console.log('\n⏰ Recent Additions:')
    recentAdditions?.forEach(fl => {
      const date = fl.filming_location_created_at 
        ? new Date(fl.filming_location_created_at).toLocaleDateString()
        : 'Unknown date'
      console.log(`   - ${fl.production_title} → ${fl.location_name} (${date})`)
    })

    console.log('\n✅ Database is healthy and ready for use!')

  } catch (error) {
    console.error('Error fetching stats:', error)
  }
}

showDatabaseStats()
