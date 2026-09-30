'use client'

import React, {useState, useEffect, useRef} from 'react'
import {playBeep, playDiscoveryFanfare} from '@/lib/soundEffects'
import confetti from 'canvas-confetti'

interface OscilloscopePuzzleProps {
  onSuccess: () => void
  onClose: () => void
}

export function OscilloscopePuzzle({onSuccess, onClose}: OscilloscopePuzzleProps) {
  const [frequency, setFrequency] = useState(280)
  const [locked, setLocked] = useState(false)
  const [feedback, setFeedback] = useState('Tune the frequency slider to match the 432 Hz harmonic spike.')
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animRef = useRef<number | null>(null)

  const isMatched = Math.abs(frequency - 432) <= 6

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let time = 0
    const draw = () => {
      animRef.current = requestAnimationFrame(draw)
      time += 0.05

      ctx.fillStyle = '#031217'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Oscilloscope grid lines
      ctx.strokeStyle = '#063a44'
      ctx.lineWidth = 1
      for (let x = 0; x < canvas.width; x += 30) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }
      for (let y = 0; y < canvas.height; y += 30) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      // Target Reference Waveform (Dashed, at 432 Hz)
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.35)'
      ctx.lineWidth = 2
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      for (let x = 0; x < canvas.width; x += 4) {
        const y = canvas.height / 2 + Math.sin(x * 0.0432 + time) * 45
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
      ctx.setLineDash([])

      // Current Player Waveform
      const waveColor = isMatched ? '#10b981' : '#06b6d4'
      ctx.strokeStyle = waveColor
      ctx.lineWidth = 3
      ctx.shadowColor = waveColor
      ctx.shadowBlur = isMatched ? 15 : 6

      ctx.beginPath()
      const factor = frequency * 0.0001
      for (let x = 0; x < canvas.width; x += 4) {
        const y = canvas.height / 2 + Math.sin(x * factor * 10 + time) * 45
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
      ctx.shadowBlur = 0
    }

    draw()
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [frequency, isMatched])

  const handleTune = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value)
    setFrequency(val)
    if (Math.abs(val - 432) <= 15) {
      playBeep()
    }
  }

  const handleLockFrequency = () => {
    if (isMatched) {
      setLocked(true)
      setFeedback('HARMONIC LOCKED: Standing wave matches 432 Hz. Conduit stabilized!')
      playDiscoveryFanfare()
      confetti({particleCount: 50, spread: 60})
      setTimeout(() => {
        onSuccess()
      }, 1500)
    } else {
      setFeedback(`Drift detected: ${frequency} Hz. Target is 432 Hz.`)
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
          background: '#0a141d',
          border: '2px solid #06b6d4',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '520px',
          padding: '1.75rem',
          boxShadow: '0 0 40px rgba(6, 182, 212, 0.3)',
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

        <div style={{fontSize: '0.75rem', color: '#22d3ee', textTransform: 'uppercase', marginBottom: '0.25rem'}}>
          // 1970_SIGNAL_CALIBRATION_MINIGAME
        </div>
        <h2 style={{margin: '0 0 0.5rem 0', color: '#f8fafc', fontSize: '1.4rem'}}>
          Cathode Resonance Tuner
        </h2>
        <p style={{color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.5, margin: '0 0 1.25rem 0'}}>
          Adjust the oscillation frequency to sync with the hidden magnetic density embedded inside the north conduit.
        </p>

        {/* CRT Canvas Monitor */}
        <div style={{borderRadius: '8px', overflow: 'hidden', border: '1px solid #164e63', marginBottom: '1.25rem'}}>
          <canvas ref={canvasRef} width={460} height={180} style={{width: '100%', height: 'auto', display: 'block'}} />
        </div>

        {/* Slider & Reading */}
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem'}}>
          <span style={{fontSize: '0.8rem', color: '#64748b'}}>FREQUENCY TUNING:</span>
          <span style={{fontSize: '1.1rem', fontWeight: 900, color: isMatched ? '#10b981' : '#22d3ee'}}>
            {frequency} Hz {isMatched ? '✔ [HARMONIC SYNC]' : ''}
          </span>
        </div>

        <input
          type="range"
          min={200}
          max={600}
          value={frequency}
          onChange={handleTune}
          disabled={locked}
          style={{width: '100%', accentColor: '#06b6d4', cursor: 'pointer', marginBottom: '1.25rem'}}
        />

        {/* Feedback message */}
        <div style={{background: '#030d12', border: '1px solid #164e63', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', color: locked ? '#10b981' : '#cbd5e1', marginBottom: '1.25rem', textAlign: 'center'}}>
          {feedback}
        </div>

        <button
          onClick={handleLockFrequency}
          disabled={locked}
          style={{
            width: '100%',
            background: locked ? '#059669' : 'linear-gradient(135deg, #06b6d4, #0891b2)',
            color: '#000000',
            border: 'none',
            borderRadius: '6px',
            padding: '0.75rem',
            fontWeight: 900,
            fontSize: '0.9rem',
            cursor: locked ? 'default' : 'pointer',
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)',
          }}
        >
          {locked ? '✔ RESONANCE STABILIZED (+500 PTS)' : '⚡ LOCK FREQUENCY HARMONIC'}
        </button>
      </div>
    </div>
  )
}
