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
}

export interface MatchInsert {
  date_time: string
  opponent: string
  venue: string
  competition: string
  home_away: 'home' | 'away'
  notes?: string
}

export interface MatchUpdate {
  date_time?: string
  opponent?: string
  venue?: string
  competition?: string
  home_away?: 'home' | 'away'
  notes?: string
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
