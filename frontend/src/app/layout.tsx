import type { Metadata } from "next";
import { Lato, Poppins } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ClientLayoutShell from "@/components/ClientLayoutShell";

const lato = Lato({
  variable: "--loaded-font-sans",
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--loaded-font-heading",
  weight: ["700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Roaming Roads | Authentic Travel Stories",
  description: "Authentic travel guides, honestly written. No ads. No affiliate links. Ever. Discover incredible journeys and adventures around the world.",
  icons: {
    // Prefer a raster favicon for broad browser support (Chrome prefers ICO/PNG).
    icon: '/favicon-32x32.png',
    shortcut: '/favicon-32x32.png',
    // Keep SVG logo available as mask-icon or for platforms that accept SVG
    apple: '/favicon-180x180.png',
  },
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon-180x180.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="mask-icon" href="/mask-icon.svg" color="#344BA0" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="theme-color" content="#344BA0" />
      </head>
      <body className={`${lato.variable} ${poppins.variable} antialiased`}>
        <Navigation />
        <main className="pt-16 min-h-screen">
          {children}
        </main>
        {/* Footer now handled by client wrapper below */}
        <Footer />
        <ClientLayoutShell />
      </body>
    </html>
  );
}
