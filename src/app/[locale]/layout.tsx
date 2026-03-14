import type { Metadata, Viewport } from "next";
import {
  Geist,
  Geist_Mono,
  Oswald,
  Source_Sans_3,
  Playfair_Display,
} from "next/font/google";
import "../globals.css";
import Layout from "@/components/layout/Layout";
import OfflineDetector from "@/components/OfflineDetector";
import BackgroundMatchSync from "@/components/match/BackgroundMatchSync";
import {
  getFeatureFlagsStatus,
  getEnabledNavigationItems,
} from "@/lib/features/featureFlags";
import * as Sentry from "@sentry/nextjs";
import SentryUserContext from "@/components/SentryUserContext";

import { ClerkProvider } from "@clerk/nextjs";
import FacebookSDK from "@/components/social/FacebookSDK";

import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";

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
const displayFont = Oswald({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const bodyFont = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const accentFont = Playfair_Display({
  variable: "--font-accent",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

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
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const debugInfo = getFeatureFlagsStatus();
  const navigationItems = getEnabledNavigationItems();

  return (
    <html lang={locale}>
      <head>
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
        <BackgroundMatchSync />
        <ClerkProvider
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
          signInFallbackRedirectUrl="/dashboard"
          afterSignUpUrl="/dashboard"
        >
          <SentryUserContext />
          <Sentry.ErrorBoundary fallback={<p>An error has occurred</p>}>
            <NextIntlClientProvider messages={messages}>
              <Layout
                debugInfo={debugInfo}
                navigationItems={navigationItems}
                locale={locale}
              >
                {children}
              </Layout>
            </NextIntlClientProvider>
          </Sentry.ErrorBoundary>
        </ClerkProvider>
        {isVercel && <Analytics />}
        {isVercel && <SpeedInsights />}
      </body>
    </html>
  );
}
