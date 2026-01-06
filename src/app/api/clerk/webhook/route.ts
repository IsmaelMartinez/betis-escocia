import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { Webhook } from "svix";
import { supabase } from "@/lib/supabase";
import { log } from "@/lib/logger";

// Clerk webhook secret - should be set in environment variables
const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  if (!CLERK_WEBHOOK_SECRET) {
    log.error(
      "CLERK_WEBHOOK_SECRET is not set",
      new Error("Missing webhook secret"),
    );
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 },
    );
  }

  // Get headers
  const headersList = await headers();
  const svixId = headersList.get("svix-id");
  const svixTimestamp = headersList.get("svix-timestamp");
  const svixSignature = headersList.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: "Missing required headers" },
      { status: 400 },
    );
  }

  // Get body
  const payload = await request.text();

  // Verify webhook signature
  const webhook = new Webhook(CLERK_WEBHOOK_SECRET);
  let event: { type: string; data: Record<string, unknown> };

  try {
    event = webhook.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as { type: string; data: Record<string, unknown> };
  } catch (error) {
    log.error("Webhook verification failed", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle different event types
  switch (event.type) {
    case "user.created":
      await handleUserCreated(
        event.data as {
          id: string;
          email_addresses?: { email_address: string }[];
        },
      );
      break;
    case "user.updated":
      await handleUserUpdated(
        event.data as {
          id: string;
          email_addresses?: { email_address: string }[];
        },
      );
      break;
    case "user.deleted":
      await handleUserDeleted(event.data as { id: string });
      break;
    default:
      log.info(`Unhandled Clerk webhook event type: ${event.type}`);
  }

  return NextResponse.json({ message: "Webhook processed successfully" });
}

async function handleUserCreated(userData: {
  id: string;
  email_addresses?: { email_address: string }[];
}) {
  log.business("clerk_user_created", { userId: userData.id });

  // Get user email for linking existing submissions
  const email = userData.email_addresses?.[0]?.email_address;
  if (!email) {
    log.warn("No email found for Clerk user", { userId: userData.id });
    return;
  }

  try {
    // Link existing RSVP submissions to this user
    const { error: rsvpError } = await supabase
      .from("rsvps")
      .update({ user_id: userData.id })
      .eq("email", email)
      .is("user_id", null);

    if (rsvpError) {
      log.error(
        "Error linking RSVP submissions",
        new Error(rsvpError.message),
        { userId: userData.id, email },
      );
    } else {
      log.business("rsvp_submissions_linked", { userId: userData.id, email });
    }

    // Link existing contact submissions to this user
    const { error: contactError } = await supabase
      .from("contact_submissions")
      .update({ user_id: userData.id })
      .eq("email", email)
      .is("user_id", null);

    if (contactError) {
      log.error(
        "Error linking contact submissions",
        new Error(contactError.message),
        { userId: userData.id, email },
      );
    } else {
      log.business("contact_submissions_linked", {
        userId: userData.id,
        email,
      });
    }
  } catch (error) {
    log.error("Error in handleUserCreated", error, { userId: userData.id });
  }
}

async function handleUserUpdated(userData: {
  id: string;
  email_addresses?: { email_address: string }[];
}) {
  log.business("clerk_user_updated", { userId: userData.id });

  // Handle email changes - re-link submissions if email changed
  const email = userData.email_addresses?.[0]?.email_address;
  if (email) {
    try {
      // Re-link any new submissions with this email
      await supabase
        .from("rsvps")
        .update({ user_id: userData.id })
        .eq("email", email)
        .is("user_id", null);

      await supabase
        .from("contact_submissions")
        .update({ user_id: userData.id })
        .eq("email", email)
        .is("user_id", null);
    } catch (error) {
      log.error("Error in handleUserUpdated", error, { userId: userData.id });
    }
  }
}

async function handleUserDeleted(userData: { id: string }) {
  log.business("clerk_user_deleted", { userId: userData.id });

  try {
    // Remove user association from submissions (keep submissions but unlink them)
    await supabase
      .from("rsvps")
      .update({ user_id: null })
      .eq("user_id", userData.id);

    await supabase
      .from("contact_submissions")
      .update({ user_id: null })
      .eq("user_id", userData.id);

    log.business("submissions_unlinked", { userId: userData.id });
  } catch (error) {
    log.error("Error in handleUserDeleted", error, { userId: userData.id });
  }
}
