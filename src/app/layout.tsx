import type { Metadata, Viewport } from "next";
import "./globals.css";
import Layout from "@/components/Layout";
import OfflineDetector from "@/components/OfflineDetector";
import {
  getFeatureFlagsStatus,
  getEnabledNavigationItems,
} from "@/lib/featureFlags";
import * as Sentry from "@sentry/nextjs";
import SentryUserContext from "@/components/SentryUserContext";

import ConditionalClerkProvider from "@/components/ConditionalClerkProvider";
import FacebookSDK from "@/components/FacebookSDK";

// Conditionally import Vercel Analytics/SpeedInsights only in production on Vercel
const isVercel = process.env.VERCEL === "1";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

// Fonts are now loaded via fontsource CSS imports in globals.css
// This avoids Google Fonts API calls during build which can fail in CI environments

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://betis-escocia.vercel.app",
  ),
  title: {
    default: "No busques más que no hay - Peña Bética Escocesa",
    template: "%s | Peña Bética Escocesa",
  },
  description:
    "La peña del Real Betis en Edimburgo, Escocia. Más de 15 años compartiendo la pasión bética en el Polwarth Tavern. Eventos, RSVP, galería y comunidad familiar.",
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
    "Villamarín",
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
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/images/logo_no_texto.jpg", sizes: "32x32", type: "image/jpeg" },
      {
        url: "/images/logo_no_texto.jpg",
        sizes: "192x192",
        type: "image/jpeg",
      },
    ],
    apple: [
      {
        url: "/images/logo_no_texto.jpg",
        sizes: "180x180",
        type: "image/jpeg",
      },
    ],
    shortcut: "/images/logo_no_texto.jpg",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "es_ES",
    alternateLocale: "en_GB",
    title: "No busques más que no hay - Peña Bética Escocesa",
    description:
      "La peña del Real Betis en Edimburgo, Escocia. Más de 15 años compartiendo la pasión bética en el Polwarth Tavern.",
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
    description:
      "La peña del Real Betis en Edimburgo, Escocia. Más de 15 años compartiendo la pasión bética.",
    images: ["/images/logo_no_texto.jpg"],
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  category: "Sports",
  classification: "Community Organization",
  referrer: "origin-when-cross-origin",
  other: {
    preconnect: "https://connect.facebook.net",
    "dns-prefetch": "https://www.facebook.com",
  },
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
  // Get feature flags debug info (returns null if debug mode is disabled)
  const debugInfo = getFeatureFlagsStatus();
  // Get navigation items on the server to avoid hydration mismatch
  const navigationItems = getEnabledNavigationItems();

  return (
    <html lang="es">
      <head>
        {/* Preconnect to third-party domains for faster loading */}
        <link
          rel="preconnect"
          href="https://clerk.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://clerk.com" />
        <link
          rel="preconnect"
          href="https://connect.facebook.net"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />
      </head>
      <body className="antialiased">
        <FacebookSDK />

        <OfflineDetector />
        <ConditionalClerkProvider>
          <SentryUserContext />
          <Sentry.ErrorBoundary fallback={<p>An error has occurred</p>}>
            <Layout debugInfo={debugInfo} navigationItems={navigationItems}>
              {children}
            </Layout>
          </Sentry.ErrorBoundary>
        </ConditionalClerkProvider>
        {isVercel && <Analytics />}
        {isVercel && <SpeedInsights />}
      </body>
    </html>
  );
}
