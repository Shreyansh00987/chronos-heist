'use client'

import React, {useState, useTransition} from 'react'
import {proposeTemporalAction, commitCausality} from '@/app/actions'
import {Vault3DCanvas} from '@/components/Vault3DCanvas'
import {playTick, playBeep, playDiscoveryFanfare} from '@/lib/soundEffects'
import confetti from 'canvas-confetti'

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
  sessionCode = 'CHRONOS-ALPHA',
}: {
  eras: Array<{_id: string; year: number; name: string; description: string}>
  initialEraYear?: number
  roomsByEra: Record<number, RoomData>
  timelinesByEra: Record<number, TimelineStateData>
  pendingAction?: {description: string; sourceEra?: {year: number}} | null
  sessionCode?: string
}) {
  const [selectedYear, setSelectedYear] = useState<number>(initialEraYear)
  const [selectedObject, setSelectedObject] = useState<GameObject | null>(null)
  const [viewMode, setViewMode] = useState<'3d' | 'blueprint'>('3d')
  const [inventory, setInventory] = useState<string[]>(['Chronos Scanner Device'])
  const [isPending, startTransition] = useTransition()
  const [actionStatus, setActionStatus] = useState<string | null>(null)

  const activeEra = eras.find((e) => e.year === selectedYear) || eras[0]
  const currentRoom = roomsByEra[selectedYear]
  const currentTimeline = timelinesByEra[selectedYear]

  const accentColor =
    selectedYear === 1920 ? '#d97706' : selectedYear === 1970 ? '#06b6d4' : '#a855f7'
  const accentGlow =
    selectedYear === 1920
      ? 'rgba(217, 119, 6, 0.3)'
      : selectedYear === 1970
      ? 'rgba(6, 182, 212, 0.3)'
      : 'rgba(168, 85, 247, 0.3)'

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

        // Trigger Causality
        await commitCausality()
        setActionStatus('Causality Engine executed! Switch to 2026 to inspect the materialized compartment.')

        playDiscoveryFanfare()
        confetti({
          particleCount: 70,
          spread: 70,
          origin: {y: 0.8},
        })
      } catch (err: any) {
        setActionStatus(`Error: ${err.message}`)
      }
    })
  }

  // Check if 2026 hidden compartment is revealed
  const room2026 = roomsByEra[2026]
  const isCompartmentRevealed = room2026?.hiddenCompartments?.some((c) => c.revealed)

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '1.25rem'}}>
      {/* TIMELINE SWITCHER HEADER */}
      <div
        style={{
          background: '#0d131f',
          border: `1px solid ${accentColor}44`,
          borderRadius: '10px',
          padding: '1rem 1.5rem',
          boxShadow: `0 0 20px ${accentGlow}`,
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
              era.year === 1920 ? '#d97706' : era.year === 1970 ? '#06b6d4' : '#a855f7'
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
                  boxShadow: isSelected ? `0 0 12px ${eraColor}88` : 'none',
                }}
              >
                {era.year} — {era.year === 1920 ? 'ORIGIN' : era.year === 1970 ? 'ECHO' : 'CONSEQUENCE'}
              </button>
            )
          })}
        </div>

        {/* View Mode Toggle & Health Indicator */}
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem', fontFamily: 'monospace', fontSize: '0.85rem'}}>
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
              🎲 3D SPATIAL
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
              🗺️ 2D BLUEPRINT
            </button>
          </div>

          <div>
            <div style={{fontSize: '0.65rem', color: '#64748b'}}>CAUSALITY INTEGRITY</div>
            <div style={{color: (currentTimeline?.healthIndicator ?? 90) > 85 ? '#10b981' : '#f59e0b', fontWeight: 700}}>
              {currentTimeline?.healthIndicator ?? 95}% [
              {currentTimeline?.sealedState ? 'SEALED' : currentTimeline?.currentStatus?.toUpperCase() ?? 'STABLE'}]
            </div>
          </div>
        </div>
      </div>

      {actionStatus && (
        <div style={{background: '#1e1b4b', border: '1px solid #7c3aed', color: '#e9d5ff', padding: '0.6rem 1rem', borderRadius: '6px', fontSize: '0.85rem', fontFamily: 'monospace'}}>
          &gt; {actionStatus}
        </div>
      )}

      {/* MAIN VAULT ROOM STAGE & INSPECTOR */}
      <div style={{display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '1.25rem'}}>
        {/* ROOM VIEW: 3D THREE.JS CANVAS OR 2D BLUEPRINT */}
        <div
          className="crt-overlay"
          style={{
            background: '#05070e',
            border: `1px solid ${accentColor}55`,
            borderRadius: '10px',
            minHeight: '520px',
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
            />
          ) : (
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '520px',
                padding: '1.5rem',
                background:
                  selectedYear === 1920
                    ? 'radial-gradient(ellipse at center, #261607 0%, #0a0602 100%)'
                    : selectedYear === 1970
                    ? 'radial-gradient(ellipse at center, #06222b 0%, #030c0f 100%)'
                    : 'radial-gradient(ellipse at center, #1b0a29 0%, #08030d 100%)',
              }}
            >
              {/* Header Watermark */}
              <div style={{position: 'absolute', top: '15px', left: '15px', color: `${accentColor}88`, fontFamily: 'monospace', fontSize: '0.75rem', pointerEvents: 'none'}}>
                SURVEILLANCE_CAMERA_01 // {currentRoom?.name || "The Clockmaker's Vault"}
                <br />
                STRUCTURAL_STATE: {currentRoom?.structuralState?.toUpperCase()}
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

              {/* Interactive Object Nodes */}
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
                          background: isCore ? '#a855f7' : isKey ? '#d97706' : '#1e293b',
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
          <div style={{background: '#0d131f', border: '1px solid #1e293b', borderRadius: '8px', padding: '1.25rem', flex: 1}}>
            <div style={{fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontFamily: 'monospace', borderBottom: '1px solid #1e293b', paddingBottom: '0.4rem', marginBottom: '0.75rem'}}>
              // OBJECT_ANALYSIS_SCANNER
            </div>

            {selectedObject ? (
              <div>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem'}}>
                  <span style={{fontSize: '1.25rem'}}>
                    {selectedObject._id === 'obj-brass-key' ? '🗝️' : selectedObject._id === 'obj-chronos-core' ? '🌀' : '📦'}
                  </span>
                  <h3 style={{margin: 0, color: '#f8fafc', fontSize: '1.1rem'}}>{selectedObject.name}</h3>
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
                    <strong>Causal Impact:</strong> {selectedObject.causalRules}
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
                    + Pick Up / Stash in Inventory
                  </button>

                  {/* 1920 Bury Key Action */}
                  {selectedYear === 1920 && selectedObject._id === 'obj-brass-key' && (
                    <button
                      onClick={() => handleBuryKey(selectedObject._id)}
                      disabled={isPending}
                      style={{
                        background: 'linear-gradient(135deg, #d97706, #b45309)',
                        color: '#000000',
                        fontWeight: 800,
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.6rem',
                        fontSize: '0.85rem',
                        fontFamily: 'monospace',
                        cursor: isPending ? 'wait' : 'pointer',
                        boxShadow: '0 0 15px rgba(217, 119, 6, 0.4)',
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
                        confetti({particleCount: 100, spread: 80})
                        setActionStatus('MISSION ACCOMPLISHED: The Chronos Core has been recovered from the future!')
                      }}
                      style={{
                        background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                        color: '#ffffff',
                        fontWeight: 800,
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.6rem',
                        fontSize: '0.85rem',
                        fontFamily: 'monospace',
                        cursor: 'pointer',
                        boxShadow: '0 0 20px rgba(168, 85, 247, 0.6)',
                      }}
                    >
                      ⭐ EXTRACT CHRONOS CORE CYLINDER
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div style={{color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic', padding: '1rem 0'}}>
                Click or drag in the 3D scene to inspect artifacts and trigger temporal actions.
              </div>
            )}
          </div>

          {/* Tactical Inventory HUD */}
          <div style={{background: '#0d131f', border: '1px solid #1e293b', borderRadius: '8px', padding: '1rem'}}>
            <div style={{fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontFamily: 'monospace', borderBottom: '1px solid #1e293b', paddingBottom: '0.3rem', marginBottom: '0.6rem'}}>
              TACTICAL_INVENTORY ({inventory.length})
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: '0.4rem'}}>
              {inventory.map((item, i) => (
                <div
                  key={i}
                  style={{
                    background: '#070a10',
                    border: '1px solid #1e293b',
                    padding: '0.35rem 0.6rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    color: '#e2e8f0',
                    fontFamily: 'monospace',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <span style={{color: '#10b981'}}>✔</span> {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
