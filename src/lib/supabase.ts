import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type definitions for our RSVP table
export interface RSVP {
  id: number
  name: string
  email: string
  message?: string
  created_at: string
}

export interface RSVPInsert {
  name: string
  email: string
  message?: string
}
