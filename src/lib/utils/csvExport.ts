import { supabase } from "@/lib/api/supabase";
import { format } from "date-fns";
import { log } from "@/lib/utils/logger";

/**
 * Creates and triggers a CSV file download, then cleans up the blob URL.
 */
export function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function exportRSVPs(userId?: string) {
  try {
    const { data, error } = await supabase
      .from("rsvps")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const csvContent = [
      "Name,Email,Attendees,Match Date,Message,WhatsApp Interest,Created At",
      ...(data || []).map(
        (rsvp) =>
          `"${rsvp.name}","${rsvp.email}",${rsvp.attendees},"${rsvp.match_date}","${rsvp.message || ""}",${rsvp.whatsapp_interest},"${rsvp.created_at}"`,
      ),
    ].join("\n");

    downloadCSV(csvContent, `rsvps-${format(new Date(), "yyyy-MM-dd")}.csv`);
  } catch (err) {
    log.error("Failed to export RSVPs", err, { userId });
  }
}

export async function exportContacts(userId?: string) {
  try {
    const { data, error } = await supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const csvContent = [
      "Name,Email,Phone,Type,Subject,Message,Status,Created At",
      ...(data || []).map(
        (contact) =>
          `"${contact.name}","${contact.email}","${contact.phone || ""}","${contact.type}","${contact.subject}","${contact.message}","${contact.status}","${contact.created_at}"`,
      ),
    ].join("\n");

    downloadCSV(csvContent, `contacts-${format(new Date(), "yyyy-MM-dd")}.csv`);
  } catch (err) {
    log.error("Failed to export contacts", err, { userId });
  }
}
