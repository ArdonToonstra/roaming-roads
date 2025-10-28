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
    <nav className="fixed top-0 left-0 right-0 z-50 shadow-lg">
      {/* White navigation background with curved bottom */}
      <div className="bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="relative flex items-center h-24">
            {/* Left Navigation Links - Positioned absolutely */}
            <div className="hidden md:flex absolute left-0 items-center gap-8">
              <Link 
                href="/adventures" 
                className="nav-link font-medium text-gray-700 hover:text-primary transition-colors"
              >
                Adventures
              </Link>
              <Link 
                href="/globe" 
                className="nav-link font-medium text-gray-700 hover:text-primary transition-colors"
              >
                Globe
              </Link>
            </div>
            
            {/* Center Logo - Absolutely centered */}
            <Link href="/" className="absolute left-1/2 transform -translate-x-1/2 flex items-center group" onClick={closeMenu}>
              <div className="w-32 h-16 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <img
                  src="/roaming-roads-logo.svg"
                  alt="Roaming Roads"
                  className="w-full h-full object-contain"
                />
              </div>
            </Link>
            
            {/* Right Navigation Links - Positioned absolutely */}
            <div className="hidden md:flex absolute right-0 items-center gap-8">
              <Link 
                href="/about" 
                className="nav-link font-medium text-gray-700 hover:text-primary transition-colors"
              >
                About
              </Link>
            </div>
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden ml-auto p-2 text-gray-700 hover:text-primary transition-colors"
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
              <div className="px-2 pt-2 pb-6 space-y-1 bg-white border-t border-gray-200">
                <Link 
                  href="/adventures"
                  className="block px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md transition-colors"
                  onClick={closeMenu}
                >
                  Adventures
                </Link>
                <Link 
                  href="/globe"
                  className="block px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md transition-colors"
                  onClick={closeMenu}
                >
                  Globe
                </Link>
                <Link 
                  href="/about"
                  className="block px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md transition-colors"
                  onClick={closeMenu}
                >
                  About
                </Link>
              </div>
            </div>
          )}
        </div>
        
        {/* Curved bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-8 overflow-hidden">
          <svg 
            className="w-full h-full" 
            viewBox="0 0 100 8" 
            preserveAspectRatio="none"
          >
            <path 
              d="M0,0 Q25,8 50,4 T100,0 L100,8 L0,8 Z" 
              fill="white"
            />
          </svg>
        </div>
      </div>

    </nav>
  );
}