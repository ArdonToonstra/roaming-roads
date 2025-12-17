"use client"
import React from 'react'
import Link from 'next/link'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  console.error('Trip page error:', error)
  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ backgroundColor: '#F4F1ED' }}>
      <div className="max-w-xl w-full text-center bg-white rounded-xl p-8 shadow">
        <h2 className="text-2xl font-heading font-bold mb-4" style={{ color: '#4C3A7A' }}>Something went wrong</h2>
        <p className="mb-6" style={{ color: '#263238' }}>We couldn't load this trip. This might be a temporary problem.</p>
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => reset()} className="px-4 py-2 rounded bg-[#2A9D8F] text-white">Try again</button>
          <Link href="/trips" className="px-4 py-2 rounded border">Back to trips</Link>
        </div>
      </div>
    </div>
  )
}
