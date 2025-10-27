import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "material-symbols";
import "@/styles/tokens.css";
import "@/styles/globals.css";
import "@/styles/distribution.css";

import { ToasterClient } from '@/components/atoms/ToasterClient';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { AuthProvider } from '@/lib/auth-context';

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://scansocial.app"),
  title: {
    default: "Scan Social — TikTok Campaign Intelligence",
    template: "%s | Scan Social",
  },
  description:
    "Scan Social helps brands discover TikTok creators, manage campaigns, and analyze transcript-driven insights in one workspace.",
  keywords: [
    "Scan Social",
    "TikTok influencer marketing",
    "creator campaigns",
    "transcript analytics",
    "brand collaborations",
  ],
  authors: [{ name: "Scan Social" }],
  openGraph: {
    title: "Scan Social — TikTok Campaign Intelligence",
    description:
      "Discover creators, brief them with clarity, and track performance with transcript-level insights.",
    url: "https://scansocial.app",
    siteName: "Scan Social",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Scan Social",
    description:
      "The TikTok campaign cockpit for brands and creators to collaborate with data-backed insights.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#147951",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${manrope.variable} antialiased`} suppressHydrationWarning>
        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryProvider>
        <ToasterClient />
      </body>
    </html>
  );
}
