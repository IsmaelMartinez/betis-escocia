import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Layout from "@/components/Layout";
import OfflineDetector from "@/components/OfflineDetector";
import { Analytics } from "@vercel/analytics/next";
import * as Sentry from "@sentry/nextjs";
import { SpeedInsights } from "@vercel/speed-insights/next";
import SentryUserContext from "@/components/SentryUserContext";

import { ClerkProvider } from '@clerk/nextjs';
import { getEnabledNavigationItems, initializeFeatureFlags } from '@/lib/featureFlags';
import FlagsmithRefresher from '@/components/FlagsmithRefresher';
import FacebookSDK from "@/components/FacebookSDK";

export const dynamic = 'force-dynamic';

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
  other: {
    'preconnect': 'https://connect.facebook.net',
    'dns-prefetch': 'https://www.facebook.com',
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let enabledNavigation: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const debugInfo: any = null;
  try {
    await initializeFeatureFlags();
    enabledNavigation = await getEnabledNavigationItems();
    console.debug('[RootLayout] Flagsmith initialized successfully. Enabled Navigation:', enabledNavigation);
  } catch (error) {
    console.error('[RootLayout] Error during Flagsmith initialization or flag fetching:', error);
    // Fallback to an empty array or default navigation items if initialization fails
    enabledNavigation = []; 
  }

  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <FacebookSDK />
        
        <OfflineDetector />
        <ClerkProvider
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
          signInFallbackRedirectUrl="/dashboard"
          afterSignUpUrl="/dashboard"
        >
          <FlagsmithRefresher />
          <SentryUserContext />
          <Sentry.ErrorBoundary fallback={<p>An error has occurred</p>}>
            <Layout debugInfo={debugInfo}>
              {children}
            </Layout>
          </Sentry.ErrorBoundary>
        </ClerkProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
