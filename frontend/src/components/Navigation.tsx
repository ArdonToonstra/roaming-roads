"use client";

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
// Use a plain <img> to avoid server/client markup mismatches
import { Menu, X } from 'lucide-react';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo with text in the header (always visible). Slightly larger for better presence. */}
          <Link href="/" className="flex items-center gap-3 group" onClick={closeMenu}>
            <div className="w-14 h-14 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <img
                src="/roaming-roads-logo-no-text.svg"
                alt="Roaming Roads"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="hidden sm:inline-block font-heading font-bold text-lg text-foreground">
              Roaming Roads
            </span>
          </Link>
          
          {/* Desktop Navigation Links (centered) */}
          <div className="hidden md:flex flex-1 items-center justify-center gap-8">
            <Link 
              href="/" 
              className="font-medium text-foreground hover:text-primary transition-colors"
            >
              Home
            </Link>
            <Link 
              href="/adventures" 
              className="font-medium text-foreground hover:text-primary transition-colors"
            >
              Adventures
            </Link>
            <Link 
              href="/globe" 
              className="font-medium text-foreground hover:text-primary transition-colors"
            >
              Globe
            </Link>
            <Link 
              href="/about" 
              className="font-medium text-foreground hover:text-primary transition-colors"
            >
              About
            </Link>
          </div>
          
          {/* Desktop CTA Button */}
          <Link 
            href="/adventures" 
            className="hidden md:inline-block px-6 py-2 bg-secondary text-secondary-foreground font-heading font-bold text-sm rounded-full transition-colors duration-300 hover:opacity-90"
          >
            Explore
          </Link>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-card border-t border-border">
              <Link 
                href="/"
                className="block px-3 py-2 text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                onClick={closeMenu}
              >
                Home
              </Link>
              <Link 
                href="/adventures"
                className="block px-3 py-2 text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                onClick={closeMenu}
              >
                Adventures
              </Link>
              <Link 
                href="/globe"
                className="block px-3 py-2 text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                onClick={closeMenu}
              >
                World Globe
              </Link>
              <Link 
                href="/about"
                className="block px-3 py-2 text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                onClick={closeMenu}
              >
                About
              </Link>
              
              {/* Mobile CTA */}
              <div className="pt-3 border-t border-border mt-3">
                <Link 
                  href="/adventures"
                  className="block mx-3 px-6 py-3 bg-primary text-primary-foreground text-center font-heading font-bold rounded-full transition-colors duration-300 hover:opacity-90"
                  onClick={closeMenu}
                >
                  Explore Adventures
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}