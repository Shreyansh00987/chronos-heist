'use client'

import React from 'react'

interface ClueData {
  _id: string
  title: string
  description?: string
  discoveryState?: string
  location?: {name?: string; era?: {year?: number}}
}

interface EvidenceBoardProps {
  clues: ClueData[]
  isOpen: boolean
  onClose: () => void
}

export function EvidenceBoardModal({clues, isOpen, onClose}: EvidenceBoardProps) {
  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(3, 5, 12, 0.9)',
        backdropFilter: 'blur(10px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        fontFamily: 'monospace',
      }}
    >
      <div
        style={{
          background: '#090e18',
          border: '2px solid #a855f7',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '920px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 0 50px rgba(168, 85, 247, 0.35)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{background: '#121829', padding: '1rem 1.5rem', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div>
            <div style={{fontSize: '0.75rem', color: '#c084fc', textTransform: 'uppercase'}}>
              // TEMPORAL_DOSSIER // EVIDENCE_BOARD
            </div>
            <h2 style={{margin: '0.2rem 0 0 0', color: '#f8fafc', fontSize: '1.3rem'}}>
              Operation Chronos: Investigation Pinboard
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.4rem', cursor: 'pointer'}}
          >
            ✕
          </button>
        </div>

        {/* Pinboard Content */}
        <div style={{padding: '1.5rem', overflowY: 'auto', flex: 1}}>
          <p style={{color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.5, margin: '0 0 1.5rem 0'}}>
            Authoritative investigative clues retrieved directly from <code>clue</code> documents in Sanity Content Lake. Each document maps a physical breadcrumb across the 106-year timeline.
          </p>

          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem'}}>
            {clues.map((clue, idx) => {
              const borderColors = ['#f59e0b', '#06b6d4', '#a855f7', '#10b981']
              const color = borderColors[idx % borderColors.length]
              return (
                <div
                  key={clue._id}
                  style={{
                    background: '#040711',
                    border: `1px solid ${color}55`,
                    borderRadius: '8px',
                    padding: '1.25rem',
                    position: 'relative',
                    boxShadow: `0 0 15px ${color}22`,
                  }}
                >
                  <div style={{width: '10px', height: '10px', borderRadius: '50%', background: color, position: 'absolute', top: '12px', right: '12px', boxShadow: `0 0 8px ${color}`}} />
                  <div style={{fontSize: '0.65rem', color, textTransform: 'uppercase', marginBottom: '0.3rem'}}>
                    SANITY_CLUE_DOC // #{idx + 1}
                  </div>
                  <h3 style={{color: '#f8fafc', fontSize: '1.05rem', margin: '0 0 0.6rem 0'}}>
                    {clue.title}
                  </h3>
                  <p style={{color: '#cbd5e1', fontSize: '0.85rem', lineHeight: 1.5, margin: '0 0 1rem 0'}}>
                    {clue.description}
                  </p>
                  <div style={{borderTop: '1px solid #1e293b', paddingTop: '0.6rem', fontSize: '0.7rem', color: '#64748b', display: 'flex', justifyContent: 'space-between'}}>
                    <span>STATUS: {clue.discoveryState?.toUpperCase() || 'DISCOVERED'}</span>
                    <span style={{color: '#38bdf8'}}>ID: {clue._id}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
