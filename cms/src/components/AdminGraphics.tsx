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
      <img 
        src="/roaming-roads-logo.png" 
        alt="Roaming Roads" 
        style={{ height: 32, width: 'auto' }} 
      />
      <span>Roaming Roads CMS</span>
    </div>
  )
}

export const Icon: React.FC = () => {
  return (
    <img 
      src="/roaming-roads-logo.png" 
      alt="RR" 
      style={{ height: 24, width: 24, objectFit: 'contain' }} 
    />
  )
}