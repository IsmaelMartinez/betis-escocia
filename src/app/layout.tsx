import type { Metadata, Viewport } from "next";
import {
  Geist,
  Geist_Mono,
  Oswald,
  Source_Sans_3,
  Playfair_Display,
} from "next/font/google";
import "./globals.css";
import Layout from "@/components/Layout";
import OfflineDetector from "@/components/OfflineDetector";
import * as Sentry from "@sentry/nextjs";
import SentryUserContext from "@/components/SentryUserContext";

import { ClerkProvider } from "@clerk/nextjs";
import FacebookSDK from "@/components/FacebookSDK";

// Conditionally import Vercel Analytics/SpeedInsights only in production on Vercel
const isVercel = process.env.VERCEL === "1";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

// Core system fonts (fallbacks)
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

// Design System v2 fonts
// Display font: Oswald - bold, condensed, perfect for sports/impact headlines
const displayFont = Oswald({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

// Body/Heading font: Source Sans 3 - professional, readable, Spanish heritage
const bodyFont = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

// Accent font: Playfair Display - elegant, for taglines and ceremonial text
const accentFont = Playfair_Display({
  variable: "--font-accent",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

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
  // Environment variables are resolved at build time; no runtime initialization required
  const debugInfo = null;

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${displayFont.variable} ${bodyFont.variable} ${accentFont.variable} antialiased`}
      >
        <FacebookSDK />

        <OfflineDetector />
        <ClerkProvider
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
          signInFallbackRedirectUrl="/dashboard"
          afterSignUpUrl="/dashboard"
        >
          <SentryUserContext />
          <Sentry.ErrorBoundary fallback={<p>An error has occurred</p>}>
            <Layout debugInfo={debugInfo}>{children}</Layout>
          </Sentry.ErrorBoundary>
        </ClerkProvider>
        {isVercel && <Analytics />}
        {isVercel && <SpeedInsights />}
      </body>
    </html>
  );
}
