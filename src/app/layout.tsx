import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Layout from "@/components/Layout";
import OfflineDetector from "@/components/OfflineDetector";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "No busques más que no hay - Peña Bética Escocesa",
  description: "La peña del Real Betis en Edimburgo, Escocia. No busques más que no hay - comunidad bética en el Polwarth Tavern con eventos, RSVP y galería.",
  keywords: "Real Betis, Edinburgh, Scotland, No busques más que no hay, peña bética, Polwarth Tavern, José María Conde",
  icons: {
    icon: "/images/logo_no_texto.jpg",
    apple: "/images/logo_no_texto.jpg",
  },
  openGraph: {
    title: "No busques más que no hay - Peña Bética Escocesa",
    description: "La peña del Real Betis en Edimburgo, Escocia. No busques más que no hay.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Facebook SDK */}
        <div id="fb-root"></div>
        <script 
          async 
          defer 
          crossOrigin="anonymous" 
          src="https://connect.facebook.net/en_GB/sdk.js#xfbml=1&version=v23.0"
        ></script>
        
        <OfflineDetector />
        <Layout>
          {children}
        </Layout>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
