"use client";
import React, { useEffect, useState, useRef } from 'react';

interface HeroRotatorProps {
  images: { url: string; title?: string; description?: string; href?: string }[];
  intervalMs?: number;
}

export default function HeroRotator({ images, intervalMs = 60000 }: HeroRotatorProps) {
  const [index, setIndex] = useState(0);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!images || images.length === 0) return;

    // start interval
    const tick = () => {
      setIndex((i) => (i + 1) % images.length);
    };

    // set initial timeout to change after intervalMs
    timeoutRef.current = window.setInterval(tick, intervalMs);

    return () => {
      if (timeoutRef.current) window.clearInterval(timeoutRef.current);
    };
  }, [images, intervalMs]);

  if (!images || images.length === 0) return null;

  return (
    <div className="absolute inset-0">
      {images.map((img, i) => (
        <img
          key={i}
          src={img.url}
          alt={img.title || 'Hero image'}
          className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-1000 ${i === index ? 'opacity-100' : 'opacity-0'}`}
          style={{
            transitionTimingFunction: 'ease',
          }}
        />
      ))}
    </div>
  );
}
