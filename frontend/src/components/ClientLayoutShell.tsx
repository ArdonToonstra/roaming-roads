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
    if (hideFooter) {
      const footers = document.querySelectorAll('body > footer');
      footers.forEach(f => (f as HTMLElement).style.display = 'none');
    }
  }, [hideFooter]);
  // Optionally render dynamic footer logic later; currently inert.
  return null;
}
