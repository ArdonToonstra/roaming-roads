import Link from 'next/link';
import { MapPin } from 'lucide-react';

export default function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200"
              style={{ backgroundColor: '#F57D50' }}
            >
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-bold text-xl group-hover:text-[#F57D50] transition-colors" style={{ color: '#4C3A7A' }}>
              Roaming Roads
            </span>
          </Link>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              href="/" 
              className="font-medium hover:text-[#F57D50] transition-colors" 
              style={{ fontFamily: 'Lato, sans-serif', color: '#263238' }}
            >
              Home
            </Link>
            <Link 
              href="/trips" 
              className="font-medium hover:text-[#F57D50] transition-colors" 
              style={{ fontFamily: 'Lato, sans-serif', color: '#263238' }}
            >
              Adventures
            </Link>
            <Link 
              href="/about" 
              className="font-medium hover:text-[#F57D50] transition-colors" 
              style={{ fontFamily: 'Lato, sans-serif', color: '#263238' }}
            >
              About
            </Link>
          </div>
          
          {/* CTA Button */}
          <Link 
            href="/trips" 
            className="hidden sm:inline-block px-6 py-2 text-white font-heading font-bold text-sm rounded-full transition-colors duration-300 hover:opacity-90"
            style={{ backgroundColor: '#2A9D8F' }}
          >
            Explore
          </Link>
          
          {/* Mobile Menu Button */}
          <button className="md:hidden p-2" style={{ color: '#263238' }}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}