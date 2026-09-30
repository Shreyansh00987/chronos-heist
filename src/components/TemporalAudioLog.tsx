'use client'

import React, {useState, useEffect} from 'react'
import {playBeep, playTick} from '@/lib/soundEffects'

interface AudioLogProps {
  eraYear: number
}

const AUDIO_TRANSCRIPTS: Record<number, {title: string; speaker: string; date: string; transcript: string; duration: string}> = {
  1920: {
    title: 'Gramophone Cylinder Recording #04',
    speaker: 'Alistair Vance (Master Clockmaker)',
    date: 'October 14, 1920',
    transcript:
      '"If you are hearing this cylinder, the Chronos syndicate has already discovered my workshop. The master vault key cannot fall into their possession. I have concealed it behind the third mortar course of the North Wall masonry, precisely where the resonance lines intersect. It shall slumber undisturbed until future temporal mechanics uncover it. The combination to the mechanical dial is the triad of time: 19... 70... 26."',
    duration: '0:34',
  },
  1970: {
    title: 'Declassified Magnetic Tape Reel #77-B',
    speaker: 'Major Gregory Stone (DARPA Project Chronos)',
    date: 'August 22, 1970',
    transcript:
      '"Surveillance log, Sector 7 vault installation. Seismic tremors were detected within the masonry behind our high-voltage conduits. The cathode oscilloscope is registering persistent standing waves locked at 432 Hertz. Whatever was buried in this wall fifty years ago is radiating tachyon displacement. Do not breach the concrete without frequency neutralization."',
    duration: '0:42',
  },
  2026: {
    title: 'Quantum Sentinel AI System Intercept',
    speaker: 'SENTINEL-9 Temporal Defense Core',
    date: 'April 09, 2026',
    transcript:
      '"ALERT: Chrono-Lake mutation detected. Downstream causality calculation confirmed. 1920 micro-action in North Wall has propagated across 106 solar cycles. Resonance chamber integrity compromised. The Chronos Core Cylinder is now vulnerable to extraction. Operatives: stabilize the timeline immediately."',
    duration: '0:28',
  },
}

export function TemporalAudioLog({eraYear}: AudioLogProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)

  const currentLog = AUDIO_TRANSCRIPTS[eraYear] || AUDIO_TRANSCRIPTS[1920]
  const accentColor =
    eraYear === 1920 ? '#f59e0b' : eraYear === 1970 ? '#06b6d4' : '#a855f7'

  useEffect(() => {
    let interval: any
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false)
            return 0
          }
          return prev + 4
        })
      }, 300)
    } else {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [isPlaying])

  const handleTogglePlay = () => {
    playBeep()
    if (!isPlaying) {
      setIsPlaying(true)
      setProgress(0)
    } else {
      setIsPlaying(false)
    }
  }

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #0b111e 0%, #161b2a 100%)',
        border: `1.5px solid ${accentColor}66`,
        borderRadius: '8px',
        padding: '0.85rem 1.25rem',
        boxShadow: `0 4px 20px rgba(0,0,0,0.5)`,
        fontFamily: 'monospace',
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem'}}>
        {/* Play Button & Waveform Status */}
        <div style={{display: 'flex', alignItems: 'center', gap: '0.85rem'}}>
          <button
            onClick={handleTogglePlay}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: isPlaying
                ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                : `linear-gradient(135deg, ${accentColor}, #d97706)`,
              border: 'none',
              color: '#ffffff',
              fontSize: '1.1rem',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 16px ${accentColor}88`,
              transition: 'transform 0.15s',
            }}
            title={isPlaying ? 'Pause Transmission' : 'Play Transmission'}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>

          <div>
            <div style={{fontSize: '0.65rem', color: accentColor, fontWeight: 800, textTransform: 'uppercase'}}>
              // TEMPORAL_AUDIO_TRANSMISSION // {currentLog.speaker}
            </div>
            <div style={{fontSize: '0.85rem', color: '#f8fafc', fontWeight: 700}}>
              {currentLog.title} ({currentLog.date})
            </div>
          </div>
        </div>

        {/* Audio Visualizer Waves & Expand Transcript Toggle */}
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
          {/* Animated Equalizer Bars */}
          <div style={{display: 'flex', alignItems: 'flex-end', gap: '3px', height: '22px'}}>
            {[18, 12, 22, 14, 20, 10, 16, 24].map((h, i) => (
              <div
                key={i}
                style={{
                  width: '3px',
                  height: isPlaying ? `${Math.max(4, (h * Math.sin(progress + i * 0.8) + 16))}%` : '4px',
                  background: accentColor,
                  borderRadius: '2px',
                  transition: 'height 0.1s ease',
                }}
              />
            ))}
          </div>

          <button
            onClick={() => {
              playTick()
              setIsExpanded(!isExpanded)
            }}
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              color: '#94a3b8',
              borderRadius: '5px',
              padding: '0.3rem 0.65rem',
              fontSize: '0.7rem',
              cursor: 'pointer',
              fontFamily: 'monospace',
            }}
          >
            {isExpanded ? '▲ HIDE TRANSCRIPT' : '▼ READ TRANSCRIPT'}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {isPlaying && (
        <div style={{marginTop: '0.6rem', width: '100%', height: '4px', background: '#0a0f1d', borderRadius: '2px', overflow: 'hidden'}}>
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              background: accentColor,
              transition: 'width 0.25s linear',
            }}
          />
        </div>
      )}

      {/* Audio Transcript Drawer */}
      {isExpanded && (
        <div
          style={{
            marginTop: '0.75rem',
            paddingTop: '0.75rem',
            borderTop: '1px dashed #334155',
            fontSize: '0.8rem',
            color: '#cbd5e1',
            lineHeight: 1.6,
            fontStyle: 'italic',
            background: 'rgba(0, 0, 0, 0.25)',
            padding: '0.65rem 0.85rem',
            borderRadius: '6px',
          }}
        >
          {currentLog.transcript}
        </div>
      )}
    </div>
  )
}
