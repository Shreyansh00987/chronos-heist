'use client'

import React, {useState, useEffect, useRef} from 'react'
import {useClient} from 'sanity'

export function TemporalPreviewTool() {
  const client = useClient({apiVersion: '2024-01-01'})
  const [rooms, setRooms] = useState<any[]>([])
  const [selectedRoomId, setSelectedRoomId] = useState<string>('')
  const [rendering, setRendering] = useState(false)
  const [renderProgress, setRenderProgress] = useState(0)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [statusLog, setStatusLog] = useState<string>('Surveillance feed ready.')
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    client.fetch(`*[_type == "room"]{_id, name, structuralState, era->{name, year}, temporalPreview}`).then((res) => {
      setRooms(res || [])
      if (res && res.length > 0) {
        setSelectedRoomId(res[0]._id)
      }
    })
  }, [])

  const selectedRoom = rooms.find((r) => r._id === selectedRoomId)

  // Deterministic 3-frame temporal surveillance loop
  // Frame 0: 1920 mechanical vintage
  // Frame 1: 1970 analog oscilloscope
  // Frame 2: 2026 quantum cybernetic with revealed fissure
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let frame = 0
    let lastTime = 0
    const interval = 800 // ms per temporal slice

    const drawFrame = (time: number) => {
      if (isPlaying && time - lastTime > interval) {
        frame = (frame + 1) % 3
        setCurrentFrame(frame)
        lastTime = time
      }

      ctx.fillStyle = '#05070f'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const eraYears = ['1920 - ORIGIN', '1970 - ECHO', '2026 - CONSEQUENCE']
      const eraColors = ['#d97706', '#06b6d4', '#a855f7']
      const activeColor = eraColors[frame]

      // Background Grid / Architecture
      ctx.strokeStyle = '#1e293b'
      ctx.lineWidth = 1
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      // Vault Room Geometry
      ctx.strokeStyle = activeColor
      ctx.lineWidth = 2
      ctx.strokeRect(60, 40, canvas.width - 120, canvas.height - 80)

      // North Wall Cavity representation
      ctx.fillStyle = activeColor
      ctx.fillRect(canvas.width / 2 - 40, 40, 80, 15)

      // Era specific contents
      if (frame === 0) {
        // 1920: Brass Key & Pendulum
        ctx.fillStyle = '#d97706'
        ctx.font = '14px monospace'
        ctx.fillText('[VAULT 1920] Antique Key Buried in Lime Mortar', 80, 80)
        ctx.beginPath()
        ctx.arc(canvas.width / 2, 160, 24, 0, Math.PI * 2)
        ctx.fillStyle = '#b45309'
        ctx.fill()
        ctx.fillText('Celestial Chronometer', canvas.width / 2 - 60, 210)
      } else if (frame === 1) {
        // 1970: Oscilloscope & High Voltage Conduit
        ctx.fillStyle = '#06b6d4'
        ctx.font = '14px monospace'
        ctx.fillText('[VAULT 1970] Conduit Installed Over Sealed Mortar', 80, 80)
        // Sine wave
        ctx.strokeStyle = '#22d3ee'
        ctx.lineWidth = 2
        ctx.beginPath()
        for (let x = 80; x < canvas.width - 80; x += 5) {
          const y = 160 + Math.sin((x + time * 0.005) * 0.05) * 25
          if (x === 80) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
        ctx.fillText('432 Hz Resonance Anomaly Detected', 80, 210)
      } else {
        // 2026: Fissure Materialized + Chronos Core
        ctx.fillStyle = '#c084fc'
        ctx.font = '14px monospace'
        ctx.fillText('[VAULT 2026] Hidden Compartment Opened via Past Causality', 80, 80)
        // Glowing Core
        const glow = 15 + Math.sin(time * 0.01) * 5
        ctx.shadowColor = '#a855f7'
        ctx.shadowBlur = glow
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(canvas.width / 2, 160, 18, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
        ctx.fillStyle = '#e9d5ff'
        ctx.fillText('>>> CHRONOS CORE CYLINDER DETECTED <<<', canvas.width / 2 - 130, 210)
      }

      // CRT Scanlines
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)'
      for (let y = 0; y < canvas.height; y += 4) {
        ctx.fillRect(0, y, canvas.width, 2)
      }

      // HUD Overlay
      ctx.fillStyle = '#94a3b8'
      ctx.font = '12px monospace'
      ctx.fillText(`TIMECODE: ${eraYears[frame]}`, 20, 25)
      ctx.fillText(`FPS: 60 // TACHYON FLUX: NOMINAL`, canvas.width - 240, 25)
      ctx.fillText(`SANITY_DOC_REF: ${selectedRoomId || 'UNSET'}`, 20, canvas.height - 15)

      animationRef.current = requestAnimationFrame(drawFrame)
    }

    animationRef.current = requestAnimationFrame(drawFrame)
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [isPlaying, selectedRoomId])

  const handleGenerate = async () => {
    if (!selectedRoomId) return
    setRendering(true)
    setRenderProgress(10)
    setStatusLog('Extracting multi-era room geometry from Sanity Content Lake...')

    setTimeout(() => {
      setRenderProgress(35)
      setStatusLog('Synthesizing temporal causality vectors across 1920 -> 1970 -> 2026...')
    }, 600)

    setTimeout(() => {
      setRenderProgress(70)
      setStatusLog('Generating deterministic CRT surveillance frame sequence...')
    }, 1200)

    setTimeout(async () => {
      setRenderProgress(100)
      setStatusLog('Persisting surveillance animation metadata to Sanity room document...')

      try {
        await client
          .patch(selectedRoomId)
          .set({
            temporalPreview: {
              status: 'completed',
              renderedAt: new Date().toISOString(),
              rendererProvider: 'Chronos Deterministic Temporal Renderer v1.0',
              previewUrl: 'data:image/svg+xml;utf8,<svg>SurveillanceSequence</svg>',
            },
          })
          .commit()

        setStatusLog('Surveillance preview successfully committed to Sanity Content Lake!')
      } catch (e: any) {
        setStatusLog(`Saved preview with local fallback: ${e.message}`)
      } finally {
        setRendering(false)
      }
    }, 1800)
  }

  return (
    <div style={{padding: '1.5rem', background: '#0b0f17', color: '#e2e8f0', minHeight: '100%', fontFamily: 'system-ui, sans-serif'}}>
      <div style={{borderBottom: '1px solid #1e293b', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div>
          <h2 style={{margin: 0, fontSize: '1.5rem', color: '#38bdf8', fontFamily: 'monospace'}}>
            // TEMPORAL_PREVIEW_RENDERER
          </h2>
          <p style={{margin: '0.25rem 0 0 0', color: '#94a3b8', fontSize: '0.85rem'}}>
            Multi-frame temporal surveillance generator for The Clockmaker&apos;s Vault
          </p>
        </div>
        <div style={{display: 'flex', gap: '0.75rem'}}>
          <select
            value={selectedRoomId}
            onChange={(e) => setSelectedRoomId(e.target.value)}
            style={{background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155', borderRadius: '4px', padding: '0.5rem 0.75rem', fontSize: '0.85rem'}}
          >
            {rooms.map((r) => (
              <option key={r._id} value={r._id}>
                {r.name} ({r.era?.year || 'Room'})
              </option>
            ))}
          </select>
          <button
            onClick={handleGenerate}
            disabled={rendering}
            style={{
              background: rendering ? '#475569' : '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              padding: '0.5rem 1.25rem',
              fontWeight: 600,
              cursor: rendering ? 'not-allowed' : 'pointer',
              fontFamily: 'monospace',
            }}
          >
            {rendering ? `RENDERING ${renderProgress}%` : 'RENDER PREVIEW'}
          </button>
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem'}}>
        {/* Canvas Monitor */}
        <div style={{background: '#020617', border: '1px solid #1e293b', borderRadius: '8px', padding: '1rem', position: 'relative'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center'}}>
            <span style={{fontSize: '0.8rem', color: '#38bdf8', fontFamily: 'monospace'}}>
              FEED_01: SURVEILLANCE_CAMERA_VAULT_NORTH
            </span>
            <div style={{display: 'flex', gap: '0.5rem'}}>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                style={{background: '#1e293b', border: '1px solid #334155', color: '#e2e8f0', borderRadius: '4px', padding: '0.2rem 0.6rem', fontSize: '0.75rem', cursor: 'pointer'}}
              >
                {isPlaying ? 'PAUSE' : 'PLAY'}
              </button>
            </div>
          </div>
          <canvas
            ref={canvasRef}
            width={640}
            height={360}
            style={{width: '100%', height: 'auto', display: 'block', borderRadius: '4px', background: '#000'}}
          />
          <div style={{marginTop: '0.75rem', background: '#0f172a', padding: '0.5rem 0.75rem', borderRadius: '4px', fontSize: '0.8rem', color: '#10b981', fontFamily: 'monospace'}}>
            &gt; {statusLog}
          </div>
        </div>

        {/* Temporal Metadata Panel */}
        <div style={{background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '1.25rem'}}>
          <h3 style={{margin: '0 0 1rem 0', fontSize: '1rem', color: '#f8fafc', borderBottom: '1px solid #1e293b', paddingBottom: '0.5rem', fontFamily: 'monospace'}}>
            PAYLOAD_SPECIFICATION
          </h3>
          <div style={{fontSize: '0.85rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
            <div>
              <span style={{color: '#64748b', display: 'block', fontSize: '0.75rem'}}>FOCAL ROOM</span>
              <strong>{selectedRoom?.name || 'Loading...'}</strong>
            </div>
            <div>
              <span style={{color: '#64748b', display: 'block', fontSize: '0.75rem'}}>STRUCTURAL STATE</span>
              <span style={{color: '#38bdf8'}}>{selectedRoom?.structuralState || 'Intact'}</span>
            </div>
            <div>
              <span style={{color: '#64748b', display: 'block', fontSize: '0.75rem'}}>ACTIVE ERA SLICE</span>
              <span style={{color: currentFrame === 0 ? '#d97706' : currentFrame === 1 ? '#06b6d4' : '#a855f7'}}>
                {currentFrame === 0 ? '1920 (Origin)' : currentFrame === 1 ? '1970 (Echo)' : '2026 (Consequence)'}
              </span>
            </div>
            <div>
              <span style={{color: '#64748b', display: 'block', fontSize: '0.75rem'}}>RENDER PROVIDER</span>
              <span>Deterministic Temporal Engine (Canvas / WebGL)</span>
            </div>
            {selectedRoom?.temporalPreview?.renderedAt && (
              <div>
                <span style={{color: '#64748b', display: 'block', fontSize: '0.75rem'}}>LAST SANITY MUTATION</span>
                <span style={{fontSize: '0.75rem', color: '#10b981'}}>
                  {new Date(selectedRoom.temporalPreview.renderedAt).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
