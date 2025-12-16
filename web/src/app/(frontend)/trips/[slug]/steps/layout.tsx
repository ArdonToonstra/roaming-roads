import type { Metadata } from "next";
import { Lato, Poppins } from "next/font/google";
import "../../../globals.css";

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
  title: "Trip Steps | Roaming Roads",
  description: "Detailed itinerary and map view.",
};

export default function StepsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${lato.variable} ${poppins.variable} antialiased min-h-screen bg-background`}>
      {children}
    </div>
  );
}