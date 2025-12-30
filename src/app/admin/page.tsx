export const dynamic = "force-dynamic";

import { hasFeature } from "@/lib/featureFlags";
import AdminPageClient from "./AdminPageClient";

export default function AdminPage() {
  const showPartidos = hasFeature("show-partidos");
  const showSoylenti = hasFeature("show-soylenti");

  return <AdminPageClient showPartidos={showPartidos} showSoylenti={showSoylenti} />;
}
