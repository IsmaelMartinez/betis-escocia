import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type definitions for our matches table
export interface Match {
  id: number
  date_time: string
  opponent: string
  venue: string
  competition: string
  home_away: 'home' | 'away'
  notes?: string
  created_at: string
  updated_at: string
  external_id?: number
  external_source?: string
}

export interface MatchInsert {
  date_time: string
  opponent: string
  venue: string
  competition: string
  home_away: 'home' | 'away'
  notes?: string
  external_id?: number
  external_source?: string
}

export interface MatchUpdate {
  date_time?: string
  opponent?: string
  venue?: string
  competition?: string
  home_away?: 'home' | 'away'
  notes?: string
  external_id?: number
  external_source?: string
}

// Type definition for match RSVP counts view
export interface MatchRSVPCount {
  match_id: number
  opponent: string
  date_time: string
  total_attendees: number
  rsvp_count: number
}

// Type definitions for our RSVP table (updated with match_id)
export interface RSVP {
  id: number
  name: string
  email: string
  attendees: number
  message?: string
  whatsapp_interest: boolean
  match_date: string
  match_id?: number  // New field for linking to matches
  created_at: string
}

export interface RSVPInsert {
  name: string
  email: string
  attendees: number
  message?: string
  whatsapp_interest: boolean
  match_date: string
  match_id?: number  // New field for linking to matches
}

// Type definitions for our contact_submissions table
export interface ContactSubmission {
  id: number
  name: string
  email: string
  phone?: string
  type: 'general' | 'rsvp' | 'merchandise' | 'photo' | 'whatsapp' | 'feedback'
  subject: string
  message: string
  status: 'new' | 'read' | 'responded' | 'closed'
  created_at: string
  updated_at: string
}

export interface ContactSubmissionInsert {
  name: string
  email: string
  phone?: string
  type: 'general' | 'rsvp' | 'merchandise' | 'photo' | 'whatsapp' | 'feedback'
  subject: string
  message: string
  status?: 'new' | 'read' | 'responded' | 'closed'
}

// Match CRUD operations
export async function getMatches(limit?: number) {
  const query = supabase
    .from('matches')
    .select('*')
    .order('date_time', { ascending: true })
  
  if (limit) {
    query.limit(limit)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching matches:', error)
    return null
  }
  
  return data as Match[]
}

export async function getUpcomingMatches(limit = 2) {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .gte('date_time', new Date().toISOString())
    .order('date_time', { ascending: true })
    .limit(limit)
  
  if (error) {
    console.error('Error fetching upcoming matches:', error)
    return null
  }
  
  return data as Match[]
}

export async function getMatch(id: number) {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching match:', error)
    return null
  }
  
  return data as Match
}

export async function createMatch(match: MatchInsert) {
  const { data, error } = await supabase
    .from('matches')
    .insert([match])
    .select()
    .single()
  
  if (error) {
    console.error('Error creating match:', error)
    return { success: false, error: error.message }
  }
  
  return { success: true, data: data as Match }
}

export async function updateMatch(id: number, updates: MatchUpdate) {
  const { data, error } = await supabase
    .from('matches')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating match:', error)
    return { success: false, error: error.message }
  }
  
  return { success: true, data: data as Match }
}

export async function deleteMatch(id: number) {
  const { error } = await supabase
    .from('matches')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting match:', error)
    return { success: false, error: error.message }
  }
  
  return { success: true }
}

// Get match with RSVP counts
export async function getMatchWithRSVPCounts(id: number) {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      rsvps:rsvp_submissions(
        id,
        attendees
      )
    `)
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching match with RSVP counts:', error)
    return null
  }
  
  // Calculate totals
  const rsvpCount = data.rsvps?.length || 0
  const totalAttendees = data.rsvps?.reduce((sum: number, rsvp: { attendees: number }) => sum + rsvp.attendees, 0) || 0
  
  return {
    ...data,
    rsvp_count: rsvpCount,
    total_attendees: totalAttendees
  }
}

// Get upcoming matches with RSVP counts
export async function getUpcomingMatchesWithRSVPCounts(limit = 2) {
  // First, try to get matches with RSVP data
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      rsvps:rsvp_submissions(
        id,
        attendees
      )
    `)
    .gte('date_time', new Date().toISOString())
    .order('date_time', { ascending: true })
    .limit(limit)
  
  // If there's an error with RSVP join, fallback to matches only
  if (error) {
    console.warn('RSVP data not available, fetching matches only:', error)
    const fallbackResult = await supabase
      .from('matches')
      .select('*')
      .gte('date_time', new Date().toISOString())
      .order('date_time', { ascending: true })
      .limit(limit)
    
    if (fallbackResult.error) {
      console.error('Error fetching upcoming matches:', fallbackResult.error)
      return null
    }
    
    // Return matches with zero RSVP counts
    return fallbackResult.data.map(match => ({
      ...match,
      rsvp_count: 0,
      total_attendees: 0
    }))
  }
  
  // Calculate totals for each match
  if (!data) {
    return []
  }
  
  return data.map(match => {
    const rsvpCount = match.rsvps?.length || 0
    const totalAttendees = match.rsvps?.reduce((sum: number, rsvp: { attendees: number }) => sum + rsvp.attendees, 0) || 0
    
    return {
      ...match,
      rsvp_count: rsvpCount,
      total_attendees: totalAttendees
    }
  })
}
