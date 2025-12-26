"use client";

import Link from 'next/link';
import { MapPin, Github, Heart } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();

  // Hide footer on steps pages
  if (pathname?.includes('/steps')) {
    return null;
  }

  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <MapPin className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-heading font-bold text-lg text-muted-foreground">
                Roaming Roads
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              Authentic travel itineraries, honestly written. No ads. No affiliate links.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Heart className="w-3 h-3 text-primary" />
              <span>Made with passion for travel</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading font-bold text-foreground mb-4">Explore</h3>
            <nav className="space-y-2">
              <Link
                href="/"
                className="block text-muted-foreground hover:text-primary transition-colors text-sm"
              >
                Home
              </Link>
              <Link
                href="/adventures"
                className="block text-muted-foreground hover:text-primary transition-colors text-sm"
              >
                All Adventures
              </Link>
              <Link
                href="/globe"
                className="block text-muted-foreground hover:text-primary transition-colors text-sm"
              >
                World Map
              </Link>
              <Link
                href="/about"
                className="block text-muted-foreground hover:text-primary transition-colors text-sm"
              >
                About Us
              </Link>
            </nav>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-heading font-bold text-foreground mb-4">Adventure Types</h3>
            <nav className="space-y-2">
              <Link
                href="/adventures?category=city_trip"
                className="block text-muted-foreground hover:text-primary transition-colors text-sm"
              >
                City Trips
              </Link>
              <Link
                href="/adventures?category=road_trip"
                className="block text-muted-foreground hover:text-primary transition-colors text-sm"
              >
                Road Trips
              </Link>
              <Link
                href="/adventures?category=backpacking"
                className="block text-muted-foreground hover:text-primary transition-colors text-sm"
              >
                Backpacking
              </Link>
              <Link
                href="/adventures?category=hiking"
                className="block text-muted-foreground hover:text-primary transition-colors text-sm"
              >
                Hiking Adventures
              </Link>
            </nav>
          </div>

          {/* Contact & Info */}
          <div>
            <h3 className="font-heading font-bold text-foreground mb-4">Connect</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Github className="w-4 h-4 text-primary" />
                <a
                  href="https://github.com/ArdonToonstra/roaming-roads/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Report an issue
                </a>
              </div>

            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {currentYear} Roaming Roads. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs">
            <Link
              href="/privacy"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}