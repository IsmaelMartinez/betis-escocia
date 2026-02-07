import { createApiHandler } from "@/lib/api/apiUtils";
import { contactSchema } from "@/lib/schemas/contact";
import {
  supabase,
  getAuthenticatedSupabaseClient,
  type ContactSubmissionInsert,
} from "@/lib/api/supabase";
import { getAuth } from "@clerk/nextjs/server";
import { log } from "@/lib/utils/logger";
import { StandardErrors } from "@/lib/utils/standardErrors";

// POST - Submit contact form
export const POST = createApiHandler({
  auth: "none", // Contact supports anonymous submissions
  schema: contactSchema,
  handler: async (validatedData, context) => {
    const { name, email, phone, type, subject, message } = validatedData;

    // Get user authentication if available
    const { userId, getToken } = getAuth(context.request);
    let authenticatedSupabase;

    if (userId) {
      try {
        const clerkToken = await getToken({ template: "supabase" });
        if (clerkToken) {
          authenticatedSupabase = getAuthenticatedSupabaseClient(clerkToken);
        }
      } catch (error) {
        // Token retrieval failed, continue with anonymous access
        log.warn(
          "Token retrieval failed for contact submission, using anonymous access",
          { userId },
          {
            error: error instanceof Error ? error.message : String(error),
          },
        );
      }
    }

    // Create new submission
    const newSubmission: ContactSubmissionInsert = {
      name,
      email,
      phone: phone || null,
      type,
      subject,
      message,
      status: "new",
      user_id: userId || undefined,
    };

    // Insert into Supabase
    const { error: insertError } = await (authenticatedSupabase || supabase)
      .from("contact_submissions")
      .insert(newSubmission)
      .select()
      .single();

    if (insertError) {
      log.error("Failed to insert contact submission", insertError, {
        name,
        email,
        type,
        userId: userId || undefined,
      });
      throw new Error(StandardErrors.CONTACT.PROCESSING_ERROR);
    }

    log.business(
      "contact_submission_created",
      { type },
      {
        email: email.toLowerCase().trim(),
        userId: userId || undefined,
      },
    );

    return {
      success: true,
      message: "Mensaje enviado correctamente. Te responderemos pronto.",
    };
  },
});

// GET - Retrieve contact statistics (for admin purposes)
export const GET = createApiHandler({
  auth: "none",
  handler: async () => {
    // Get total submissions count
    const { count: totalSubmissions, error: countError } = await supabase
      .from("contact_submissions")
      .select("*", { count: "exact", head: true });

    if (countError) {
      log.error("Failed to get total contact submissions count", countError);
      throw new Error(StandardErrors.CONTACT.STATS_ERROR);
    }

    // Get new submissions count
    const { count: newSubmissions, error: newCountError } = await supabase
      .from("contact_submissions")
      .select("*", { count: "exact", head: true })
      .eq("status", "new");

    if (newCountError) {
      log.error("Failed to get new contact submissions count", newCountError);
      throw new Error(StandardErrors.CONTACT.STATS_ERROR);
    }

    return {
      success: true,
      totalSubmissions: totalSubmissions || 0,
      newSubmissions: newSubmissions || 0,
      stats: {
        totalSubmissions: totalSubmissions || 0,
        responseRate: 0,
        averageResponseTime: 24,
      },
    };
  },
});
