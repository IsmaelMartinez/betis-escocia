import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

interface LayoutProps {
  readonly children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-canvas-warm flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
