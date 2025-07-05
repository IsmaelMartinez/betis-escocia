import { createClient } from '@supabase/supabase-js';
import { readFile } from 'fs/promises';
import { join } from 'path';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface JSONRSVPEntry {
  id: string;
  name: string;
  email: string;
  attendees: number;
  message?: string;
  whatsappInterest: boolean;
  matchDate: string;
  submittedAt: string;
}

interface JSONRSVPData {
  currentMatch: {
    opponent: string;
    date: string;
    competition: string;
  };
  entries: JSONRSVPEntry[];
  totalAttendees: number;
}

async function migrateRSVPData() {
  try {
    console.log('🚀 Starting RSVP data migration from JSON to Supabase...\n');

    // Read the JSON file
    const dataPath = join(process.cwd(), 'data', 'rsvp.json');
    console.log('📖 Reading RSVP data from:', dataPath);
    
    const fileContent = await readFile(dataPath, 'utf-8');
    const jsonData: JSONRSVPData = JSON.parse(fileContent);
    
    console.log(`📊 Found ${jsonData.entries.length} RSVP entries with ${jsonData.totalAttendees} total attendees\n`);

    // Check if there's already data in Supabase
    const { data: existingData, error: checkError } = await supabase
      .from('rsvps')
      .select('count')
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ Error checking existing data:', checkError);
      return;
    }

    if (existingData) {
      console.log('⚠️  Warning: There is already data in the Supabase rsvps table');
      console.log('This migration will add to existing data, not replace it.\n');
    }

    // Transform and insert the data
    const supabaseEntries = jsonData.entries.map(entry => ({
      name: entry.name,
      email: entry.email.toLowerCase(),
      attendees: entry.attendees,
      message: entry.message ?? '',
      whatsapp_interest: entry.whatsappInterest,
      match_date: entry.matchDate,
      // Use the original submission time, but as created_at
      created_at: entry.submittedAt
    }));

    console.log('🔄 Inserting RSVP entries into Supabase...');

    // Insert all entries
    const { data: insertedData, error: insertError } = await supabase
      .from('rsvps')
      .insert(supabaseEntries)
      .select();

    if (insertError) {
      console.error('❌ Error inserting data:', insertError);
      return;
    }

    console.log(`✅ Successfully migrated ${insertedData?.length || 0} RSVP entries!`);

    // Verify the migration
    const { data: verifyData, error: verifyError } = await supabase
      .from('rsvps')
      .select('attendees')
      .eq('match_date', jsonData.currentMatch.date);

    if (verifyError) {
      console.error('❌ Error verifying migration:', verifyError);
      return;
    }

    const totalAttendees = verifyData?.reduce((total, entry) => total + entry.attendees, 0) || 0;
    
    console.log('\n📈 Migration Summary:');
    console.log(`   • Total RSVPs migrated: ${verifyData?.length || 0}`);
    console.log(`   • Total attendees: ${totalAttendees}`);
    console.log(`   • Match: ${jsonData.currentMatch.opponent} (${jsonData.currentMatch.date})`);
    
    if (totalAttendees === jsonData.totalAttendees) {
      console.log('✅ Attendee count matches - migration successful!');
    } else {
      console.log(`⚠️  Attendee count mismatch: Expected ${jsonData.totalAttendees}, got ${totalAttendees}`);
    }

    console.log('\n🎉 RSVP data migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Test the RSVP system with your website');
    console.log('2. Consider backing up and removing the JSON file once confirmed working');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrateRSVPData();
