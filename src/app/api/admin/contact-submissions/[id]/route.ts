import { createApiHandler } from "@/lib/api/apiUtils";
import { z } from "zod";
import { log } from "@/lib/utils/logger";

const updateStatusSchema = z.object({
  status: z.enum(["new", "in progress", "resolved"]),
});

export const PUT = createApiHandler({
  auth: "admin",
  schema: updateStatusSchema,
  handler: async (validatedData, context) => {
    const { status } = validatedData;
    const { user, authenticatedSupabase, params } = context;

    if (!params) {
      throw new Error("Parámetros de ruta no encontrados");
    }
    const { id: idStr } = await params;
    if (!idStr) {
      throw new Error("El ID no fue proporcionado en la ruta");
    }

    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      throw new Error("Invalid ID");
    }

    const { data, error } = await authenticatedSupabase!
      .from("contact_submissions")
      .update({ status: status, updated_by: user!.id })
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      log.error("Supabase update error:", error);
      throw new Error("Failed to update status");
    }

    if (!data) {
      throw new Error("Submission not found or not authorized");
    }

    return { success: true, data };
  },
});
