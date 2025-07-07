import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type definitions for our RSVP table
export interface RSVP {
  id: number
  name: string
  email: string
  attendees: number
  message?: string
  whatsapp_interest: boolean
  match_date: string
  created_at: string
}

export interface RSVPInsert {
  name: string
  email: string
  attendees: number
  message?: string
  whatsapp_interest: boolean
  match_date: string
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
