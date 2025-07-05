import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  try {
    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Delete RSVPs older than 1 month
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

    const { data, error, count } = await supabase
      .from('rsvps')
      .delete({ count: 'exact' })
      .lt('created_at', oneMonthAgo.toISOString())

    if (error) {
      throw error
    }

    console.log(`Deleted ${count} old RSVP records`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        deleted_count: count,
        message: `Successfully deleted ${count} RSVP records older than 1 month`
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error cleaning up RSVPs:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
