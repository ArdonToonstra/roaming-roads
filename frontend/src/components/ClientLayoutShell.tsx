"use client";
import { usePathname } from 'next/navigation';
import Footer from '@/components/Footer';
import React from 'react';

// This component can be mounted at the end of body to conditionally hide the footer.
export default function ClientLayoutShell() {
  const pathname = usePathname();
  // If we're on a /steps page, we hide any existing footer by setting display none.
  const hideFooter = pathname?.includes('/steps');
  React.useEffect(() => {
    const footers = Array.from(document.querySelectorAll('body > footer')) as HTMLElement[];
    if (hideFooter) {
      // store previous display value so we can restore it later
      footers.forEach(f => {
        try {
          (f as any).__prevDisplay = f.style.display ?? '';
        } catch (e) {
          // ignore
        }
        f.style.display = 'none';
      });
    } else {
      // restore any previously hidden footers
      footers.forEach(f => {
        try {
          const prev = (f as any).__prevDisplay;
          if (prev !== undefined) {
            f.style.display = prev;
            delete (f as any).__prevDisplay;
          } else {
            f.style.display = '';
          }
        } catch (e) {
          // ignore
        }
      });
    }
    // cleanup: restore on unmount as well
    return () => {
      const current = Array.from(document.querySelectorAll('body > footer')) as HTMLElement[];
      current.forEach(f => {
        try {
          const prev = (f as any).__prevDisplay;
          if (prev !== undefined) {
            f.style.display = prev;
            delete (f as any).__prevDisplay;
          } else {
            f.style.display = '';
          }
        } catch (e) {
          // ignore
        }
      });
    };
  }, [hideFooter]);
  // Optionally render dynamic footer logic later; currently inert.
  return null;
}
