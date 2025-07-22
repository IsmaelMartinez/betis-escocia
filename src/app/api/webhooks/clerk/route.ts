import { WebhookEvent } from "@clerk/nextjs/server";
import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { linkExistingSubmissionsToUser, unlinkUserSubmissions, supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local");
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  // Get the ID and type
  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`Webhook with ID of ${id} and type of ${eventType}`);
  console.log("Webhook body:", body);

  if (eventType === "user.created" || eventType === "user.updated") {
    const { id: clerkUserId, email_addresses } = evt.data;
    const primaryEmail = email_addresses[0]?.email_address;

    if (clerkUserId && primaryEmail) {
      console.log(`Attempting to link submissions for user ${clerkUserId} with email ${primaryEmail}`);
      const { rsvpLinked, contactLinked, errors } = await linkExistingSubmissionsToUser(clerkUserId, primaryEmail);
      if (errors.length > 0) {
        console.error("Errors linking submissions:", errors);
      }
      console.log(`Linked ${rsvpLinked} RSVPs and ${contactLinked} contact submissions.`);
    }
  } else if (eventType === "user.deleted") {
    const { id: clerkUserId } = evt.data;
    if (clerkUserId) {
      console.log(`Attempting to unlink submissions for deleted user ${clerkUserId}`);
      const { rsvpUnlinked, contactUnlinked, errors } = await unlinkUserSubmissions(clerkUserId);
      if (errors.length > 0) {
        console.error("Errors unlinking submissions:", errors);
      }
      console.log(`Unlinked ${rsvpUnlinked} RSVPs and ${contactUnlinked} contact submissions.`);
    }
  }

  return NextResponse.json({ status: 200, success: true });
}
