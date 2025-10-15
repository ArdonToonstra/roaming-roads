'use client'
import React from 'react'

export const Logo: React.FC = () => {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '0.5rem', 
      fontWeight: 600, 
      fontSize: '1rem' 
    }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img 
        src="/roaming-roads-logo-transparent.png" 
        alt="Roaming Roads" 
        style={{ height: 32, width: 'auto' }} 
      />
      <span>Roaming Roads CMS</span>
    </div>
  )
}

export const Icon: React.FC = () => {
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img 
      src="/roaming-roads-logo-transparent.png" 
      alt="RR" 
      style={{ height: 24, width: 24, objectFit: 'contain' }} 
    />
  )
}