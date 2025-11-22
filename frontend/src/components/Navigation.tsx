"use client";

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const pathname = usePathname();

  return (
    // drop-shadow-md applies the shadow to the curve shape, not just a box
    <nav className="fixed top-0 left-0 right-0 z-50 drop-shadow-md">
      
      {/* Main White Header Block */}
      <div className="bg-white relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center h-24">
            
            {/* Left Navigation Links */}
            <div className="hidden md:flex absolute left-0 items-center gap-8">
              <Link 
                href="/adventures" 
                className="font-medium text-gray-700 hover:text-indigo-600 transition-colors"
              >
                Adventures
              </Link>
              <Link 
                href="/globe" 
                className="font-medium text-gray-700 hover:text-indigo-600 transition-colors"
              >
                Globe
              </Link>
            </div>
            
            {/* Center Logo */}
            <Link 
              href="/" 
              className="absolute left-1/2 transform -translate-x-1/2 flex items-center group" 
              onClick={closeMenu}
            >
              <div className="w-32 h-16 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                {/* Ensure your svg exists in public folder, otherwise this alt text shows */}
                <img
                  src="/roaming-roads-logo.svg"
                  alt="Roaming Roads"
                  className="w-full h-full object-contain"
                />
              </div>
            </Link>
            
            {/* Right Navigation Links */}
            <div className="hidden md:flex absolute right-0 items-center gap-8">
              <Link 
                href="/about" 
                className="font-medium text-gray-700 hover:text-indigo-600 transition-colors"
              >
                About
              </Link>
            </div>
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden ml-auto p-2 text-gray-700 hover:text-indigo-600 transition-colors"
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

          {/* Mobile Menu Dropdown */}
          {isOpen && (
            <div className="md:hidden pb-4">
              <div className="space-y-1 border-t border-gray-200 pt-4">
                <Link 
                  href="/adventures"
                  className="block px-3 py-2 text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md transition-colors text-center"
                  onClick={closeMenu}
                >
                  Adventures
                </Link>
                <Link 
                  href="/globe"
                  className="block px-3 py-2 text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md transition-colors text-center"
                  onClick={closeMenu}
                >
                  Globe
                </Link>
                <Link 
                  href="/about"
                  className="block px-3 py-2 text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md transition-colors text-center"
                  onClick={closeMenu}
                >
                  About
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* THE ORGANIC CURVE */}
      {/* 1. absolute top-full: Pushes it right below the header */}
      {/* 2. -mt-1: Pulls it up slightly to fix sub-pixel gaps (white lines) */}
      {/* 3. leading-[0]: Removes line-height spacing issues */}
      <div className="absolute top-full left-0 w-full overflow-hidden -mt-1 leading-[0] z-10">
        <svg 
          className="relative block w-full h-[40px] md:h-[60px]" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none"
        >
          <path 
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" 
            fill="#FFFFFF"
          ></path>
        </svg>
      </div>

    </nav>
  );
}