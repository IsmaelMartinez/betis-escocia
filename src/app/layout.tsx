import type { Metadata, Viewport } from "next";
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://betis-escocia.vercel.app'),
  title: {
    default: "No busques más que no hay - Peña Bética Escocesa",
    template: "%s | Peña Bética Escocesa"
  },
  description: "La peña del Real Betis en Edimburgo, Escocia. Más de 14 años compartiendo la pasión bética en el Polwarth Tavern. Eventos, RSVP, galería y comunidad familiar.",
  keywords: [
    "Real Betis",
    "Edinburgh", 
    "Scotland",
    "Escocia",
    "peña bética",
    "No busques más que no hay",
    "Polwarth Tavern",
    "José María Conde",
    "La Liga",
    "fútbol español",
    "comunidad española",
    "béticos en Escocia",
    "Sevilla FC",
    "Villamarín"
  ],
  authors: [{ name: "Peña Bética Escocesa" }],
  creator: "Peña Bética Escocesa",
  publisher: "Peña Bética Escocesa",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: "/images/logo_no_texto.jpg", sizes: "32x32", type: "image/jpeg" },
      { url: "/images/logo_no_texto.jpg", sizes: "192x192", type: "image/jpeg" },
    ],
    apple: [
      { url: "/images/logo_no_texto.jpg", sizes: "180x180", type: "image/jpeg" },
    ],
    shortcut: "/images/logo_no_texto.jpg",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "es_ES",
    alternateLocale: "en_GB",
    title: "No busques más que no hay - Peña Bética Escocesa",
    description: "La peña del Real Betis en Edimburgo, Escocia. Más de 14 años compartiendo la pasión bética en el Polwarth Tavern.",
    siteName: "Peña Bética Escocesa",
    url: "https://betis-escocia.vercel.app",
    images: [
      {
        url: "/images/logo_no_texto.jpg",
        width: 1200,
        height: 630,
        alt: "Peña Bética Escocesa - No busques más que no hay",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@rbetisescocia",
    creator: "@rbetisescocia",
    title: "No busques más que no hay - Peña Bética Escocesa",
    description: "La peña del Real Betis en Edimburgo, Escocia. Más de 14 años compartiendo la pasión bética.",
    images: ["/images/logo_no_texto.jpg"],
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  category: "Sports",
  classification: "Community Organization",
  referrer: "origin-when-cross-origin",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        {/* Performance optimizations */}
        <link rel="preconnect" href="https://connect.facebook.net" />
        <link rel="preconnect" href="https://vercel.live" />
        <link rel="dns-prefetch" href="https://www.facebook.com" />
        <link rel="dns-prefetch" href="https://www.instagram.com" />
        <link rel="dns-prefetch" href="https://www.youtube.com" />
      </head>
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
