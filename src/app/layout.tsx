// Root layout is a simple pass-through.
// The actual layout logic (fonts, providers, etc.) is in [locale]/layout.tsx
// which handles internationalization via next-intl.

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
