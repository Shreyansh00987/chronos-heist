'use client'

import React, {useState} from 'react'
import {playTick, playDiscoveryFanfare} from '@/lib/soundEffects'
import confetti from 'canvas-confetti'

interface SafeDialPuzzleProps {
  onSuccess: () => void
  onClose: () => void
}

export function SafeDialPuzzle({onSuccess, onClose}: SafeDialPuzzleProps) {
  const [dial1, setDial1] = useState(10)
  const [dial2, setDial2] = useState(50)
  const [dial3, setDial3] = useState(15)
  const [unlocked, setUnlocked] = useState(false)
  const [feedback, setFeedback] = useState<string>('Rotate the three dials to match the temporal coordinates.')

  const handleRotate = (dialIndex: 1 | 2 | 3, delta: number) => {
    playTick()
    if (dialIndex === 1) setDial1((prev) => (prev + delta + 100) % 100)
    if (dialIndex === 2) setDial2((prev) => (prev + delta + 100) % 100)
    if (dialIndex === 3) setDial3((prev) => (prev + delta + 100) % 100)
  }

  const handleCheckUnlock = () => {
    // Correct combination: 19 - 70 - 26 (representing 1920, 1970, 2026)
    if (dial1 === 19 && dial2 === 70 && dial3 === 26) {
      setUnlocked(true)
      setFeedback('CLICK! The heavy mechanical triple-bolt slides back. Safe opened!')
      playDiscoveryFanfare()
      confetti({particleCount: 60, spread: 60})
      setTimeout(() => {
        onSuccess()
      }, 1500)
    } else {
      playTick()
      setFeedback(`Combination rejected [${dial1.toString().padStart(2, '0')}-${dial2.toString().padStart(2, '0')}-${dial3.toString().padStart(2, '0')}]. Hint: The three historical eras of the vault.`)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(3, 5, 12, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        fontFamily: 'monospace',
      }}
    >
      <div
        style={{
          background: '#0d131f',
          border: '2px solid #d97706',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '520px',
          padding: '1.75rem',
          boxShadow: '0 0 40px rgba(217, 119, 6, 0.3)',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            fontSize: '1.25rem',
            cursor: 'pointer',
          }}
        >
          ✕
        </button>

        <div style={{fontSize: '0.75rem', color: '#f59e0b', textTransform: 'uppercase', marginBottom: '0.25rem'}}>
          // MECHANICAL_VAULT_MINIGAME
        </div>
        <h2 style={{margin: '0 0 0.5rem 0', color: '#f8fafc', fontSize: '1.4rem'}}>
          The Clockmaker&apos;s Rotary Safe
        </h2>
        <p style={{color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.5, margin: '0 0 1.5rem 0'}}>
          Align the heavy brass dials to the temporal sequence inscribed on the clockmaker&apos;s celestial pendulum.
        </p>

        {/* 3 Dial Rotators */}
        <div style={{display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '1.5rem'}}>
          {[
            {val: dial1, idx: 1 as const, label: 'ORIGIN'},
            {val: dial2, idx: 2 as const, label: 'ECHO'},
            {val: dial3, idx: 3 as const, label: 'CONSEQUENCE'},
          ].map((dial) => (
            <div key={dial.idx} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem'}}>
              <button
                onClick={() => handleRotate(dial.idx, 1)}
                style={{
                  background: '#1e293b',
                  color: '#f59e0b',
                  border: '1px solid #334155',
                  borderRadius: '4px',
                  width: '36px',
                  height: '28px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                ▲
              </button>

              <div
                style={{
                  width: '74px',
                  height: '74px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, #29180c 0%, #0c0702 100%)',
                  border: '3px solid #d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                  fontWeight: 900,
                  color: '#fef3c7',
                  boxShadow: '0 0 16px rgba(217, 119, 6, 0.4), inset 0 0 8px #000',
                }}
              >
                {dial.val.toString().padStart(2, '0')}
              </div>

              <button
                onClick={() => handleRotate(dial.idx, -1)}
                style={{
                  background: '#1e293b',
                  color: '#f59e0b',
                  border: '1px solid #334155',
                  borderRadius: '4px',
                  width: '36px',
                  height: '28px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                ▼
              </button>

              <span style={{fontSize: '0.65rem', color: '#64748b', marginTop: '0.2rem'}}>
                {dial.label}
              </span>
            </div>
          ))}
        </div>

        {/* Feedback message */}
        <div style={{background: '#070a10', border: '1px solid #1e293b', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', color: unlocked ? '#10b981' : '#cbd5e1', marginBottom: '1.25rem', textAlign: 'center'}}>
          {feedback}
        </div>

        <div style={{display: 'flex', gap: '0.75rem'}}>
          <button
            onClick={handleCheckUnlock}
            disabled={unlocked}
            style={{
              flex: 1,
              background: unlocked ? '#059669' : 'linear-gradient(135deg, #d97706, #b45309)',
              color: '#000000',
              border: 'none',
              borderRadius: '6px',
              padding: '0.75rem',
              fontWeight: 900,
              fontSize: '0.9rem',
              cursor: unlocked ? 'default' : 'pointer',
              boxShadow: '0 0 20px rgba(217, 119, 6, 0.4)',
            }}
          >
            {unlocked ? '✔ SAFE UNLOCKED (+500 PTS)' : '⚡ TEST COMBINATION'}
          </button>
        </div>
      </div>
    </div>
  )
}
