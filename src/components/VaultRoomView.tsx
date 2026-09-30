'use client'

import React, {useState, useTransition} from 'react'
import {proposeTemporalAction, commitCausality} from '@/app/actions'
import {Vault3DCanvas} from '@/components/Vault3DCanvas'
import {playTick, playBeep, playDiscoveryFanfare} from '@/lib/soundEffects'
import confetti from 'canvas-confetti'
import {SafeDialPuzzle} from '@/components/puzzles/SafeDialPuzzle'
import {OscilloscopePuzzle} from '@/components/puzzles/OscilloscopePuzzle'
import {EvidenceBoardModal} from '@/components/EvidenceBoardModal'
import {TemporalAudioLog} from '@/components/TemporalAudioLog'
import {JournalModal} from '@/components/JournalModal'

interface ClueData {
  _id: string
  title: string
  description?: string
  discoveryState?: string
  location?: {name?: string; era?: {year?: number}}
}

interface GameObject {
  _id: string
  name: string
  description?: string
  objectType?: string
  state?: string
  interactable?: boolean
  position?: {x?: number; y?: number}
  icon?: string
  affectsCausality?: boolean
  causalRules?: string
}

interface RoomData {
  _id: string
  name: string
  structuralState: string
  description?: string
  historicalNotes?: string
  visualConfig?: {
    ambientColor?: string
    accentColor?: string
    environmentPreset?: string
  }
  objects?: GameObject[]
  hiddenCompartments?: Array<{
    _key: string
    label: string
    revealed: boolean
    contentsDescription?: string
    position?: {x?: number; y?: number}
  }>
}

interface TimelineStateData {
  timelineId?: string
  currentStatus?: string
  healthIndicator?: number
  sealedState?: boolean
}

export function VaultRoomView({
  eras,
  initialEraYear = 1920,
  roomsByEra,
  timelinesByEra,
  pendingAction,
  clues = [],
  sessionCode = 'CHRONOS-ALPHA',
}: {
  eras: Array<{_id: string; year: number; name: string; description: string}>
  initialEraYear?: number
  roomsByEra: Record<number, RoomData>
  timelinesByEra: Record<number, TimelineStateData>
  pendingAction?: {description: string; sourceEra?: {year: number}} | null
  clues?: ClueData[]
  sessionCode?: string
}) {
  const [selectedYear, setSelectedYear] = useState<number>(initialEraYear)
  const [selectedObject, setSelectedObject] = useState<GameObject | null>(null)
  const [viewMode, setViewMode] = useState<'3d' | 'blueprint'>('3d')
  const [cameraPreset, setCameraPreset] = useState<'iso' | 'table' | 'wall'>('iso')
  const [inventory, setInventory] = useState<string[]>(['Chronos Temporal Scanner'])
  const [isPending, startTransition] = useTransition()
  const [actionStatus, setActionStatus] = useState<string | null>(null)

  // Interactive Gaming & Minigame States
  const [showSafePuzzle, setShowSafePuzzle] = useState(false)
  const [showOscilloscopePuzzle, setShowOscilloscopePuzzle] = useState(false)
  const [showEvidenceBoard, setShowEvidenceBoard] = useState(false)
  const [showJournal, setShowJournal] = useState(false)
  const [heistScore, setHeistScore] = useState(1250)
  const [puzzlesSolved, setPuzzlesSolved] = useState({safe: false, oscilloscope: false})

  const handleSafeSolved = () => {
    setShowSafePuzzle(false)
    if (!puzzlesSolved.safe) {
      setPuzzlesSolved((prev) => ({...prev, safe: true}))
      setHeistScore((prev) => prev + 500)
      if (!inventory.includes('Antique Brass Vault Key')) {
        setInventory((prev) => [...prev, 'Antique Brass Vault Key'])
      }
      setActionStatus('SUCCESS: 1920 Wall Safe opened! Antique Brass Vault Key recovered into inventory (+500 PTS).')
    }
  }

  const handleOscilloscopeSolved = () => {
    setShowOscilloscopePuzzle(false)
    if (!puzzlesSolved.oscilloscope) {
      setPuzzlesSolved((prev) => ({...prev, oscilloscope: true}))
      setHeistScore((prev) => prev + 500)
      setActionStatus('SUCCESS: Harmonic standing wave calibrated at 432 Hz! Resonance frequency decrypted (+500 PTS).')
    }
  }

  const activeEra = eras.find((e) => e.year === selectedYear) || eras[0]
  const currentRoom = roomsByEra[selectedYear]
  const currentTimeline = timelinesByEra[selectedYear]

  const accentColor =
    selectedYear === 1920 ? '#f59e0b' : selectedYear === 1970 ? '#06b6d4' : '#a855f7'
  const accentGlow =
    selectedYear === 1920
      ? 'rgba(245, 158, 11, 0.35)'
      : selectedYear === 1970
      ? 'rgba(6, 182, 212, 0.35)'
      : 'rgba(168, 85, 247, 0.35)'

  // Check if 2026 hidden compartment is revealed
  const room2026 = roomsByEra[2026]
  const isCompartmentRevealed = room2026?.hiddenCompartments?.some((c) => c.revealed)
  const hasKeyInInventory = inventory.includes('Antique Brass Vault Key')
  const hasCoreInInventory = inventory.includes('The Chronos Core Cylinder')

  // Calculate Heist Progress %
  let heistProgress = 15
  if (hasKeyInInventory) heistProgress = 35
  if (isCompartmentRevealed) heistProgress = 75
  if (hasCoreInInventory) heistProgress = 100

  // Handle Pick Up
  const handlePickup = (obj: GameObject) => {
    if (!inventory.includes(obj.name)) {
      playBeep()
      setInventory([...inventory, obj.name])
      setActionStatus(`Acquired ${obj.name} into tactical inventory.`)
      setTimeout(() => setActionStatus(null), 3000)
    }
  }

  // Handle Bury Key Action in 1920
  const handleBuryKey = (objectId: string) => {
    setActionStatus('Transmitting temporal action to Sanity Lake...')
    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append('objectId', objectId)
        formData.append('actionType', 'bury')
        formData.append('description', 'Bury Antique Brass Vault Key inside the 1920 North Wall cavity')

        await proposeTemporalAction(formData)
        setActionStatus('Temporal action committed! Initiating Causality Engine...')

        await commitCausality()
        setActionStatus('Causality Engine executed! Switch to 2026 to inspect the materialized compartment.')

        playDiscoveryFanfare()
        confetti({
          particleCount: 80,
          spread: 80,
          origin: {y: 0.8},
        })
      } catch (err: any) {
        setActionStatus(`Error: ${err.message}`)
      }
    })
  }

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '1.25rem'}}>
      {/* HEIST MISSION DOSSIER & PROGRESS HUD */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(13, 19, 31, 0.95) 0%, rgba(22, 16, 38, 0.95) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '1.1rem 1.6rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div style={{flex: 1, minWidth: '280px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem'}}>
            <span style={{background: 'linear-gradient(135deg, #7c3aed, #9333ea)', color: '#ffffff', padding: '0.2rem 0.55rem', borderRadius: '5px', fontSize: '0.7rem', fontWeight: 900, fontFamily: 'monospace', letterSpacing: '0.06em', boxShadow: '0 0 10px rgba(147, 51, 234, 0.5)'}}>
              ACTIVE HEIST DIRECTIVE
            </span>
            <span style={{fontSize: '0.85rem', color: '#f8fafc', fontWeight: 800, fontFamily: 'monospace'}}>
              {hasCoreInInventory
                ? '⭐ MISSION ACCOMPLISHED: TIMELINE STABILIZED'
                : isCompartmentRevealed
                ? 'OBJECTIVE 4/4: EXTRACT CHRONOS CORE FROM 2026 VAULT'
                : hasKeyInInventory
                ? 'OBJECTIVE 2/4: BURY BRASS KEY IN 1920 NORTH WALL'
                : 'OBJECTIVE 1/4: INSPECT 1920 VAULT & ACQUIRE BRASS KEY'}
            </span>
          </div>
          <div style={{width: '100%', height: '8px', background: '#0a0e17', borderRadius: '4px', overflow: 'hidden', border: '1px solid #1e293b'}}>
            <div
              style={{
                width: `${heistProgress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #d97706, #06b6d4, #a855f7)',
                transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 0 12px rgba(168, 85, 247, 0.6)',
              }}
            />
          </div>
        </div>

        <div style={{display: 'flex', alignItems: 'center', gap: '1.25rem', fontFamily: 'monospace', fontSize: '0.8rem', flexWrap: 'wrap'}}>
          <div>
            <span style={{color: '#94a3b8', fontSize: '0.7rem'}}>HEIST PROGRESS</span>
            <div style={{color: heistProgress === 100 ? '#10b981' : '#c084fc', fontWeight: 900, fontSize: '0.95rem'}}>
              {heistProgress}%
            </div>
          </div>
          <div style={{borderLeft: '1px solid rgba(255, 255, 255, 0.1)', paddingLeft: '1.25rem'}}>
            <span style={{color: '#94a3b8', fontSize: '0.7rem'}}>CAUSAL STATUS</span>
            <div style={{color: isCompartmentRevealed ? '#a855f7' : '#f59e0b', fontWeight: 900, fontSize: '0.95rem'}}>
              {isCompartmentRevealed ? 'MUTATED (COMPARTMENT OPEN)' : 'STABLE BASELINE'}
            </div>
          </div>
          <div style={{borderLeft: '1px solid rgba(255, 255, 255, 0.1)', paddingLeft: '1.25rem'}}>
            <span style={{color: '#94a3b8', fontSize: '0.7rem'}}>TACTICAL SCORE</span>
            <div style={{color: '#f59e0b', fontWeight: 900, fontSize: '0.95rem'}}>
              🏆 {heistScore} PTS
            </div>
          </div>
          <button
            onClick={() => {
              playBeep()
              setShowEvidenceBoard(true)
            }}
            style={{
              background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
              border: '1.5px solid #a855f7',
              color: '#f8fafc',
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              fontSize: '0.8rem',
              fontFamily: 'monospace',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 0 18px rgba(168, 85, 247, 0.45)',
              transition: 'all 0.2s ease',
            }}
          >
            <span>📋</span> EVIDENCE PINBOARD ({clues.length})
          </button>
        </div>
      </div>

      {/* TIMELINE SWITCHER HEADER */}
      <div
        style={{
          background: '#0d131f',
          border: `1px solid ${accentColor}55`,
          borderRadius: '10px',
          padding: '1rem 1.5rem',
          boxShadow: `0 0 25px ${accentGlow}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace'}}>
            TEMPORAL SURVEILLANCE MATRIX // SESSION: {sessionCode}
          </div>
          <h2 style={{margin: '0.2rem 0 0 0', color: accentColor, fontFamily: 'monospace', letterSpacing: '0.05em'}}>
            {activeEra?.name} ({selectedYear})
          </h2>
        </div>

        {/* 3-Era Switcher Control */}
        <div style={{display: 'flex', background: '#070a10', padding: '0.35rem', borderRadius: '8px', border: '1px solid #1e293b'}}>
          {eras.map((era) => {
            const isSelected = era.year === selectedYear
            const eraColor =
              era.year === 1920 ? '#f59e0b' : era.year === 1970 ? '#06b6d4' : '#a855f7'
            return (
              <button
                key={era.year}
                onClick={() => {
                  playTick()
                  setSelectedYear(era.year)
                  setSelectedObject(null)
                }}
                style={{
                  background: isSelected ? eraColor : 'transparent',
                  color: isSelected ? '#000000' : '#94a3b8',
                  fontWeight: isSelected ? 800 : 600,
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.5rem 1.25rem',
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? `0 0 14px ${eraColor}99` : 'none',
                }}
              >
                {era.year} — {era.year === 1920 ? 'ORIGIN' : era.year === 1970 ? 'ECHO' : 'CONSEQUENCE'}
              </button>
            )
          })}
        </div>

        {/* Quick Minigame Launchers for Active Era */}
        {selectedYear === 1920 && (
          <button
            onClick={() => {
              playBeep()
              setShowSafePuzzle(true)
            }}
            style={{
              background: puzzlesSolved.safe ? '#064e3b' : 'linear-gradient(135deg, #78350f, #b45309)',
              border: `1px solid ${puzzlesSolved.safe ? '#10b981' : '#f59e0b'}`,
              color: '#ffffff',
              borderRadius: '6px',
              padding: '0.4rem 0.8rem',
              fontSize: '0.75rem',
              fontFamily: 'monospace',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: puzzlesSolved.safe ? 'none' : '0 0 12px rgba(245, 158, 11, 0.4)',
            }}
          >
            <span>{puzzlesSolved.safe ? '✔' : '🔐'}</span> {puzzlesSolved.safe ? 'SAFE CRACKED' : 'CRACK ROTARY SAFE'}
          </button>
        )}

        {selectedYear === 1970 && (
          <button
            onClick={() => {
              playBeep()
              setShowOscilloscopePuzzle(true)
            }}
            style={{
              background: puzzlesSolved.oscilloscope ? '#064e3b' : 'linear-gradient(135deg, #0e7490, #0891b2)',
              border: `1px solid ${puzzlesSolved.oscilloscope ? '#10b981' : '#06b6d4'}`,
              color: '#ffffff',
              borderRadius: '6px',
              padding: '0.4rem 0.8rem',
              fontSize: '0.75rem',
              fontFamily: 'monospace',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: puzzlesSolved.oscilloscope ? 'none' : '0 0 12px rgba(6, 182, 212, 0.4)',
            }}
          >
            <span>{puzzlesSolved.oscilloscope ? '✔' : '📻'}</span> {puzzlesSolved.oscilloscope ? '432 HZ RESONANT' : 'TUNE OSCILLOSCOPE'}
          </button>
        )}

        {/* View Mode & Camera Presets */}
        <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', fontFamily: 'monospace', fontSize: '0.8rem'}}>
          {/* Camera Angles (in 3D mode) */}
          {viewMode === '3d' && (
            <div style={{display: 'flex', background: '#070a10', borderRadius: '6px', border: '1px solid #1e293b', overflow: 'hidden'}}>
              <button
                onClick={() => {
                  playBeep()
                  setCameraPreset('iso')
                }}
                title="Isometric Camera"
                style={{
                  background: cameraPreset === 'iso' ? '#1e293b' : 'transparent',
                  color: cameraPreset === 'iso' ? '#ffffff' : '#94a3b8',
                  border: 'none',
                  padding: '0.3rem 0.6rem',
                  fontSize: '0.7rem',
                  cursor: 'pointer',
                  fontFamily: 'monospace',
                }}
              >
                ISO
              </button>
              <button
                onClick={() => {
                  playBeep()
                  setCameraPreset('table')
                }}
                title="Focus Table"
                style={{
                  background: cameraPreset === 'table' ? '#1e293b' : 'transparent',
                  color: cameraPreset === 'table' ? '#ffffff' : '#94a3b8',
                  border: 'none',
                  padding: '0.3rem 0.6rem',
                  fontSize: '0.7rem',
                  cursor: 'pointer',
                  fontFamily: 'monospace',
                }}
              >
                TABLE
              </button>
              <button
                onClick={() => {
                  playBeep()
                  setCameraPreset('wall')
                }}
                title="Zoom North Wall"
                style={{
                  background: cameraPreset === 'wall' ? '#1e293b' : 'transparent',
                  color: cameraPreset === 'wall' ? '#ffffff' : '#94a3b8',
                  border: 'none',
                  padding: '0.3rem 0.6rem',
                  fontSize: '0.7rem',
                  cursor: 'pointer',
                  fontFamily: 'monospace',
                }}
              >
                WALL
              </button>
            </div>
          )}

          {/* 3D vs 2D Switch */}
          <div style={{display: 'flex', background: '#070a10', borderRadius: '6px', border: '1px solid #1e293b', overflow: 'hidden'}}>
            <button
              onClick={() => {
                playBeep()
                setViewMode('3d')
              }}
              style={{
                background: viewMode === '3d' ? '#2e1065' : 'transparent',
                color: viewMode === '3d' ? '#c084fc' : '#94a3b8',
                border: 'none',
                padding: '0.35rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontFamily: 'monospace',
              }}
            >
              🎲 3D
            </button>
            <button
              onClick={() => {
                playBeep()
                setViewMode('blueprint')
              }}
              style={{
                background: viewMode === 'blueprint' ? '#1e293b' : 'transparent',
                color: viewMode === 'blueprint' ? '#f8fafc' : '#94a3b8',
                border: 'none',
                padding: '0.35rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontFamily: 'monospace',
              }}
            >
              🗺️ 2D
            </button>
          </div>

          <div>
            <div style={{fontSize: '0.65rem', color: '#64748b'}}>INTEGRITY</div>
            <div style={{color: (currentTimeline?.healthIndicator ?? 90) > 85 ? '#10b981' : '#f59e0b', fontWeight: 700}}>
              {currentTimeline?.healthIndicator ?? 95}%
            </div>
          </div>
        </div>
      </div>

      {actionStatus && (
        <div style={{background: '#1e1b4b', border: '1px solid #7c3aed', color: '#e9d5ff', padding: '0.65rem 1rem', borderRadius: '6px', fontSize: '0.85rem', fontFamily: 'monospace'}}>
          &gt; {actionStatus}
        </div>
      )}

      {/* INTERACTIVE TEMPORAL AUDIO LOG TRANSMISSION */}
      <TemporalAudioLog eraYear={selectedYear} />

      {/* MAIN VAULT ROOM STAGE & INSPECTOR */}
      <div style={{display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '1.25rem'}}>
        {/* ROOM VIEW */}
        <div
          className="crt-overlay"
          style={{
            background: '#040711',
            border: `1px solid ${accentColor}55`,
            borderRadius: '10px',
            minHeight: '540px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {viewMode === '3d' ? (
            <Vault3DCanvas
              eraYear={selectedYear}
              objects={currentRoom?.objects || []}
              isCompartmentRevealed={Boolean(isCompartmentRevealed)}
              onSelectObject={(obj) => setSelectedObject(obj)}
              selectedObjectId={selectedObject?._id}
              cameraPreset={cameraPreset}
            />
          ) : (
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '540px',
                padding: '1.5rem',
                background:
                  selectedYear === 1920
                    ? 'radial-gradient(ellipse at center, #2e1b0e 0%, #150c05 100%)'
                    : selectedYear === 1970
                    ? 'radial-gradient(ellipse at center, #0f2e3d 0%, #06151c 100%)'
                    : 'radial-gradient(ellipse at center, #23113a 0%, #0c0514 100%)',
                backgroundImage:
                  selectedYear === 1920
                    ? 'linear-gradient(to right, rgba(245, 158, 11, 0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(245, 158, 11, 0.12) 1px, transparent 1px)'
                    : selectedYear === 1970
                    ? 'linear-gradient(to right, rgba(6, 182, 212, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(6, 182, 212, 0.15) 1px, transparent 1px)'
                    : 'linear-gradient(to right, rgba(168, 85, 247, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(168, 85, 247, 0.15) 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }}
            >
              <div style={{position: 'absolute', top: '15px', left: '15px', color: accentColor, fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 800, background: 'rgba(5, 7, 15, 0.85)', padding: '0.3rem 0.6rem', borderRadius: '4px', border: `1px solid ${accentColor}55`}}>
                📐 ARCHITECTURAL BLUEPRINT // {currentRoom?.name?.toUpperCase()}
              </div>

              {/* North Wall Blueprint Element */}
              <div
                style={{
                  position: 'absolute',
                  top: '50px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '60%',
                  padding: '0.75rem',
                  border: `2px dashed ${accentColor}aa`,
                  borderRadius: '6px',
                  background: `${accentColor}11`,
                  textAlign: 'center',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  if (selectedYear === 1920) {
                    const northWallObj = currentRoom?.objects?.find((o) => o._id === 'obj-north-wall-1920')
                    if (northWallObj) setSelectedObject(northWallObj)
                  } else if (selectedYear === 2026) {
                    const fissureObj = currentRoom?.objects?.find((o) => o._id === 'obj-north-wall-2026')
                    if (fissureObj) setSelectedObject(fissureObj)
                  }
                }}
              >
                <div style={{fontSize: '0.75rem', color: accentColor, fontWeight: 700, fontFamily: 'monospace'}}>
                  [NORTH WALL SECTION]
                </div>
                <div style={{fontSize: '0.85rem', color: '#e2e8f0', marginTop: '0.2rem'}}>
                  {selectedYear === 1920 && 'Lime Mortar Cavity behind Masonry (Loose Bricks)'}
                  {selectedYear === 1970 && 'Armored Industrial High-Voltage Conduit Covering Wall'}
                  {selectedYear === 2026 &&
                    (isCompartmentRevealed
                      ? '⚡ RESONANCE COMPARTMENT OPENED — CHRONOS CORE ACCESSIBLE!'
                      : 'Tachyon Fissure Active — Requires 1920 Causality Alteration')}
                </div>
              </div>

              {/* 2D Interactive Objects */}
              <div style={{position: 'absolute', inset: 0}}>
                {currentRoom?.objects?.map((obj) => {
                  const x = obj.position?.x ?? 50
                  const y = obj.position?.y ?? 50
                  const isSelected = selectedObject?._id === obj._id
                  const isKey = obj._id === 'obj-brass-key'
                  const isCore = obj._id === 'obj-chronos-core'

                  if (obj.state === 'hidden' && !isCompartmentRevealed) return null

                  return (
                    <div
                      key={obj._id}
                      onClick={() => {
                        playTick()
                        setSelectedObject(obj)
                      }}
                      style={{
                        position: 'absolute',
                        left: `${x}%`,
                        top: `${y}%`,
                        transform: 'translate(-50%, -50%)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        zIndex: 10,
                      }}
                    >
                      <div
                        style={{
                          width: isCore ? '44px' : '36px',
                          height: isCore ? '44px' : '36px',
                          borderRadius: '50%',
                          background: isCore ? '#a855f7' : isKey ? '#f59e0b' : '#1e293b',
                          border: isSelected ? '2px solid #ffffff' : `2px solid ${accentColor}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '1rem',
                          boxShadow: isSelected
                            ? '0 0 16px #ffffff'
                            : isCore
                            ? '0 0 24px #a855f7'
                            : `0 0 10px ${accentGlow}`,
                        }}
                      >
                        {isKey ? '🗝️' : isCore ? '🌀' : obj.icon === 'clock' ? '🕰️' : obj.icon === 'terminal' ? '💻' : obj.icon === 'scroll' ? '📜' : '📦'}
                      </div>
                      <div
                        style={{
                          marginTop: '4px',
                          background: 'rgba(5, 7, 15, 0.85)',
                          border: '1px solid #1e293b',
                          color: isSelected ? '#ffffff' : '#cbd5e1',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontFamily: 'monospace',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {obj.name}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* SIDEBAR: OBJECT INSPECTOR & INVENTORY */}
        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
          {/* Object Inspector */}
          <div style={{background: 'linear-gradient(180deg, rgba(13, 19, 31, 0.95) 0%, rgba(10, 14, 26, 0.98) 100%)', border: `1.5px solid ${accentColor}55`, borderRadius: '12px', padding: '1.4rem', flex: 1, boxShadow: `0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)`, backdropFilter: 'blur(16px)'}}>
            <div style={{fontSize: '0.7rem', color: accentColor, fontWeight: 900, textTransform: 'uppercase', fontFamily: 'monospace', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.45rem', marginBottom: '0.85rem', letterSpacing: '0.08em'}}>
              // ARTIFACT_ANALYSIS_SCANNER
            </div>

            {selectedObject ? (
              <div>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem'}}>
                  <span style={{fontSize: '1.3rem'}}>
                    {selectedObject._id === 'obj-brass-key' ? '🗝️' : selectedObject._id === 'obj-chronos-core' ? '🌀' : '📦'}
                  </span>
                  <h3 style={{margin: 0, color: '#f8fafc', fontSize: '1.15rem'}}>{selectedObject.name}</h3>
                </div>

                <div style={{display: 'flex', gap: '0.5rem', marginBottom: '0.75rem'}}>
                  <span style={{background: '#1e293b', color: accentColor, padding: '0.15rem 0.45rem', borderRadius: '4px', fontSize: '0.7rem', fontFamily: 'monospace'}}>
                    TYPE: {selectedObject.objectType?.toUpperCase()}
                  </span>
                  <span style={{background: '#1e293b', color: '#10b981', padding: '0.15rem 0.45rem', borderRadius: '4px', fontSize: '0.7rem', fontFamily: 'monospace'}}>
                    STATE: {selectedObject.state?.toUpperCase()}
                  </span>
                </div>

                <p style={{color: '#cbd5e1', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '0.75rem'}}>
                  {selectedObject.description}
                </p>

                {selectedObject.causalRules && (
                  <div style={{background: '#1e1b4b', borderLeft: '3px solid #a855f7', padding: '0.5rem 0.75rem', fontSize: '0.75rem', color: '#e9d5ff', marginBottom: '1rem'}}>
                    <strong>Causal Rule:</strong> {selectedObject.causalRules}
                  </div>
                )}

                {/* Actions */}
                <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                  <button
                    onClick={() => handlePickup(selectedObject)}
                    style={{
                      background: '#1e293b',
                      color: '#f8fafc',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      padding: '0.45rem',
                      fontSize: '0.8rem',
                      fontFamily: 'monospace',
                      cursor: 'pointer',
                    }}
                  >
                    + Pick Up into Tactical Inventory
                  </button>

                  {/* 1920 Crack Safe Minigame */}
                  {selectedYear === 1920 && (
                    <button
                      onClick={() => {
                        playBeep()
                        setShowSafePuzzle(true)
                      }}
                      style={{
                        background: puzzlesSolved.safe ? '#064e3b' : 'linear-gradient(135deg, #d97706, #b45309)',
                        color: '#ffffff',
                        fontWeight: 800,
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.6rem',
                        fontSize: '0.8rem',
                        fontFamily: 'monospace',
                        cursor: 'pointer',
                        boxShadow: puzzlesSolved.safe ? 'none' : '0 0 14px rgba(217, 119, 6, 0.5)',
                      }}
                    >
                      {puzzlesSolved.safe ? '✔ ROTARY SAFE UNLOCKED (+500)' : '🔐 CRACK ROTARY SAFE (MINIGAME)'}
                    </button>
                  )}

                  {/* 1920 Clockmaker's Journal Reader */}
                  {selectedYear === 1920 && (
                    <button
                      onClick={() => {
                        playBeep()
                        setShowJournal(true)
                      }}
                      style={{
                        background: 'linear-gradient(135deg, #78350f, #92400e)',
                        color: '#fef3c7',
                        fontWeight: 800,
                        border: '1px solid #d97706',
                        borderRadius: '6px',
                        padding: '0.6rem',
                        fontSize: '0.8rem',
                        fontFamily: 'monospace',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        boxShadow: '0 0 14px rgba(217, 119, 6, 0.4)',
                      }}
                    >
                      <span>📖</span> READ CLOCKMAKER'S JOURNAL (CLUES & SKETCHES)
                    </button>
                  )}

                  {/* 1970 Oscilloscope Minigame */}
                  {selectedYear === 1970 && (
                    <button
                      onClick={() => {
                        playBeep()
                        setShowOscilloscopePuzzle(true)
                      }}
                      style={{
                        background: puzzlesSolved.oscilloscope ? '#064e3b' : 'linear-gradient(135deg, #0891b2, #0284c7)',
                        color: '#ffffff',
                        fontWeight: 800,
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.6rem',
                        fontSize: '0.8rem',
                        fontFamily: 'monospace',
                        cursor: 'pointer',
                        boxShadow: puzzlesSolved.oscilloscope ? 'none' : '0 0 14px rgba(8, 145, 178, 0.5)',
                      }}
                    >
                      {puzzlesSolved.oscilloscope ? '✔ 432 HZ HARMONIC LOCK ENGAGED (+500)' : '📻 TUNE 1970 OSCILLOSCOPE (MINIGAME)'}
                    </button>
                  )}

                  {/* 1920 Bury Key Action */}
                  {selectedYear === 1920 && selectedObject._id === 'obj-brass-key' && (
                    <button
                      onClick={() => handleBuryKey(selectedObject._id)}
                      disabled={isPending}
                      style={{
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        color: '#000000',
                        fontWeight: 900,
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.65rem',
                        fontSize: '0.85rem',
                        fontFamily: 'monospace',
                        cursor: isPending ? 'wait' : 'pointer',
                        boxShadow: '0 0 16px rgba(245, 158, 11, 0.5)',
                      }}
                    >
                      {isPending ? 'MUTATING LAKE...' : '⚡ BURY KEY IN NORTH WALL CAVITY'}
                    </button>
                  )}

                  {/* 2026 Chronos Core Retrieval */}
                  {selectedYear === 2026 && selectedObject._id === 'obj-chronos-core' && (
                    <button
                      onClick={() => {
                        handlePickup(selectedObject)
                        playDiscoveryFanfare()
                        confetti({particleCount: 120, spread: 90})
                        setHeistScore((prev) => prev + 1000)
                        setActionStatus('MISSION ACCOMPLISHED: The Chronos Core has been recovered! History stabilized (+1000 PTS).')
                      }}
                      style={{
                        background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                        color: '#ffffff',
                        fontWeight: 900,
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.65rem',
                        fontSize: '0.85rem',
                        fontFamily: 'monospace',
                        cursor: 'pointer',
                        boxShadow: '0 0 24px rgba(168, 85, 247, 0.7)',
                      }}
                    >
                      ⭐ EXTRACT CHRONOS CORE CYLINDER
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div style={{color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic', padding: '1rem 0'}}>
                Click or drag in the 3D scene to inspect artifacts and trigger temporal mutations.
              </div>
            )}
          </div>

          {/* Tactical Inventory HUD */}
          <div style={{background: 'linear-gradient(180deg, rgba(13, 19, 31, 0.95) 0%, rgba(10, 14, 26, 0.98) 100%)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '1.2rem', boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(16px)'}}>
            <div style={{fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontFamily: 'monospace', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.4rem', marginBottom: '0.75rem', fontWeight: 800, letterSpacing: '0.08em'}}>
              🎒 TACTICAL_INVENTORY ({inventory.length})
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
              {inventory.map((item, i) => (
                <div
                  key={i}
                  style={{
                    background: 'rgba(15, 23, 42, 0.75)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '0.45rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    color: '#f8fafc',
                    fontFamily: 'monospace',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  <span style={{color: '#10b981', fontWeight: 900}}>✔</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Minigame & Evidence Modals */}
      {showSafePuzzle && (
        <SafeDialPuzzle
          onSuccess={handleSafeSolved}
          onClose={() => setShowSafePuzzle(false)}
        />
      )}

      {showOscilloscopePuzzle && (
        <OscilloscopePuzzle
          onSuccess={handleOscilloscopeSolved}
          onClose={() => setShowOscilloscopePuzzle(false)}
        />
      )}

      <EvidenceBoardModal
        clues={clues}
        isOpen={showEvidenceBoard}
        onClose={() => setShowEvidenceBoard(false)}
      />

      <JournalModal
        isOpen={showJournal}
        onClose={() => setShowJournal(false)}
      />
    </div>
  )
}
