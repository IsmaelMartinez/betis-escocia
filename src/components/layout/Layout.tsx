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
  return (
    <div className="min-h-screen bg-canvas-warm flex flex-col">
      <Header navigationItems={navigationItems} />

      <main className="flex-1">{children}</main>

      <Footer />

      <DebugInfoPanel debugInfo={debugInfo} />
    </div>
  );
}
