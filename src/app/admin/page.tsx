export const dynamic = "force-dynamic";

import { hasFeature } from "@/lib/featureFlags";
import AdminPageClient from "./AdminPageClient";

export default function AdminPage() {
  const showPartidos = hasFeature("show-partidos");

  return <AdminPageClient showPartidos={showPartidos} />;
}
