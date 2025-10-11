import type { Metadata } from "next";
import { Lato, Poppins } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${lato.variable} ${poppins.variable} antialiased`}>
        <Navigation />
        <main className="pt-16">
          {children}
        </main>
      </body>
    </html>
  );
}
