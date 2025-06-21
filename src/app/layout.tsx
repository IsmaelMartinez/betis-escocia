import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Layout from "@/components/Layout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Peña Bética Escocesa - Real Betis supporters in Edinburgh",
  description: "La peña del Real Betis en Edimburgo, Escocia. Nos reunimos en el Polwarth Tavern para ver todos los partidos. ¡Únete a nosotros!",
  keywords: "Real Betis, Edinburgh, Scotland, football, supporters, peña, Polwarth Tavern",
  openGraph: {
    title: "Peña Bética Escocesa",
    description: "Real Betis supporters in Edinburgh, Scotland",
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
        <Layout>
          {children}
        </Layout>
      </body>
    </html>
  );
}
