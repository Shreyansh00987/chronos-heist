'use client'

import React, {useState} from 'react'
import {playTick} from '@/lib/soundEffects'

interface JournalModalProps {
  isOpen: boolean
  onClose: () => void
}

const JOURNAL_PAGES = [
  {
    pageNumber: 1,
    title: 'THE THREE PILLARS OF CAUSALITY',
    date: 'August 12, 1920',
    content: `Time is not a tranquil river flowing towards a single sea. It is a lattice of tense vibration.
    
When I forged the Chronos Core in this underground vault, I realized three moments in history would become forever linked:
1. 1920 — The Anchor of Origin (where mass is fixed).
2. 1970 — The Resonance Harmonic (where frequency oscillates).
3. 2026 — The Consequence Horizon (where matter materializes).

Whatever physical artifact is placed into the North Wall mortar cavity while the lime is still wet will endure untouched through the 1970 electrical conduit overhaul, finally emerging when the 2026 tachyon fissure opens.`,
    sketch: '📐 [Diagram: 1920 Key -> 1970 Conduit -> 2026 Fissure]',
  },
  {
    pageNumber: 2,
    title: 'THE MECHANICAL ROTARY CIPHER',
    date: 'September 28, 1920',
    content: `To protect the vault from greedy thieves who lack temporal vision, I have secured the central rotary safe.
    
Its triple brass discs are keyed to the three chronological coordinates of our experiment:
- Dial 1 (Origin): 19
- Dial 2 (Echo): 70
- Dial 3 (Consequence): 26

Aligning all three coordinates releases the mechanical counterweights and slides back the hardened steel deadbolts, revealing the Antique Brass Key.`,
    sketch: '🔐 [Schematic: Three-dial combination 19-70-26]',
  },
  {
    pageNumber: 3,
    title: 'THE 432 HERTZ RESONANCE WARNING',
    date: 'October 04, 1920',
    content: `Should future investigators seek the Core, heed this law of acoustic causality:
    
The atomic structure of the Chronos Core vibrates at precisely 432 Hz. If the intermediate era attempts to scan the chamber with cathode rays without matching this harmonic frequency, the timeline collapses into paradox.
    
Calibrate the standing wave before approaching the 2026 breach.`,
    sketch: '〰️ [Standing Wave Harmonic: λ = 432 Hz]',
  },
]

export function JournalModal({isOpen, onClose}: JournalModalProps) {
  const [currentPage, setCurrentPage] = useState(0)

  if (!isOpen) return null

  const page = JOURNAL_PAGES[currentPage]

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(5, 7, 15, 0.88)',
        backdropFilter: 'blur(8px)',
        zIndex: 1200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        fontFamily: 'monospace',
      }}
    >
      <div
        style={{
          background: '#23150d',
          border: '3px solid #d97706',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '680px',
          boxShadow: '0 0 45px rgba(217, 119, 6, 0.45)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Vintage Leather Header */}
        <div
          style={{
            background: '#1a0e08',
            padding: '1rem 1.5rem',
            borderBottom: '1px solid #78350f',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{fontSize: '0.7rem', color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.05em'}}>
              // HISTORICAL_ARCHIVE // CLOCKMAKER_MANUSCRIPT
            </div>
            <h3 style={{margin: '0.2rem 0 0 0', color: '#fef3c7', fontSize: '1.2rem', fontFamily: 'serif'}}>
              📖 Alistair Vance's Leatherbound Journal
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#3d1a08',
              border: '1px solid #92400e',
              color: '#fde68a',
              borderRadius: '6px',
              padding: '0.35rem 0.75rem',
              cursor: 'pointer',
              fontWeight: 800,
            }}
          >
            ✕ CLOSE
          </button>
        </div>

        {/* Aged Parchment Page */}
        <div
          style={{
            background: '#fef3c7',
            color: '#451a03',
            padding: '2rem',
            minHeight: '340px',
            fontFamily: 'Georgia, serif',
            lineHeight: 1.7,
            position: 'relative',
          }}
        >
          <div style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #d97706', paddingBottom: '0.5rem', marginBottom: '1.25rem', fontFamily: 'monospace', fontSize: '0.8rem', color: '#92400e'}}>
            <strong>{page.title}</strong>
            <span>{page.date}</span>
          </div>

          <div style={{fontSize: '1rem', whiteSpace: 'pre-line', marginBottom: '1.5rem'}}>
            {page.content}
          </div>

          <div
            style={{
              background: '#fde68a',
              border: '1px dashed #b45309',
              padding: '0.65rem 1rem',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              color: '#78350f',
              fontWeight: 700,
            }}
          >
            {page.sketch}
          </div>

          <div style={{position: 'absolute', bottom: '15px', right: '25px', fontFamily: 'monospace', fontSize: '0.75rem', color: '#b45309'}}>
            Page {page.pageNumber} of {JOURNAL_PAGES.length}
          </div>
        </div>

        {/* Page Turner Footer */}
        <div
          style={{
            background: '#1a0e08',
            padding: '0.75rem 1.5rem',
            borderTop: '1px solid #78350f',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <button
            onClick={() => {
              playTick()
              setCurrentPage((prev) => Math.max(0, prev - 1))
            }}
            disabled={currentPage === 0}
            style={{
              background: currentPage === 0 ? '#261208' : '#78350f',
              color: currentPage === 0 ? '#78350f' : '#fef3c7',
              border: 'none',
              borderRadius: '5px',
              padding: '0.4rem 1rem',
              fontSize: '0.8rem',
              cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
              fontWeight: 700,
            }}
          >
            ◀ PREVIOUS PAGE
          </button>

          <span style={{color: '#fbbf24', fontSize: '0.8rem'}}>
            Turn pages to discover safe codes & causal formulas
          </span>

          <button
            onClick={() => {
              playTick()
              setCurrentPage((prev) => Math.min(JOURNAL_PAGES.length - 1, prev + 1))
            }}
            disabled={currentPage === JOURNAL_PAGES.length - 1}
            style={{
              background: currentPage === JOURNAL_PAGES.length - 1 ? '#261208' : '#78350f',
              color: currentPage === JOURNAL_PAGES.length - 1 ? '#78350f' : '#fef3c7',
              border: 'none',
              borderRadius: '5px',
              padding: '0.4rem 1rem',
              fontSize: '0.8rem',
              cursor: currentPage === JOURNAL_PAGES.length - 1 ? 'not-allowed' : 'pointer',
              fontWeight: 700,
            }}
          >
            NEXT PAGE ▶
          </button>
        </div>
      </div>
    </div>
  )
}
