import DebugInfoPanel, {
  type DebugInfo,
} from "@/components/layout/DebugInfoPanel";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { type NavigationItem } from "@/lib/features/featureFlags";

interface LayoutProps {
  readonly children: React.ReactNode;
  readonly debugInfo: DebugInfo | null;
  readonly navigationItems: NavigationItem[];
}

export default function Layout({
  children,
  debugInfo,
  navigationItems,
}: LayoutProps) {
  // Derive auth enabled from debugInfo features (passed from server) to avoid hydration mismatch
  const isAuthEnabled = debugInfo?.features?.["show-clerk-auth"] ?? false;

  return (
    <div className="min-h-screen bg-canvas-warm flex flex-col">
      <Header navigationItems={navigationItems} isAuthEnabled={isAuthEnabled} />

      <main className="flex-1">{children}</main>

      <Footer />

      <DebugInfoPanel debugInfo={debugInfo} />
    </div>
  );
}
