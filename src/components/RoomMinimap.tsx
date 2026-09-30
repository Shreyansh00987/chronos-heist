'use client'

import React from 'react'
import {playBeep} from '@/lib/soundEffects'

interface RoomMinimapProps {
  eraYear: number
  isCompartmentRevealed: boolean
  onFocusSector: (sector: 'iso' | 'table' | 'wall') => void
  activeSector: 'iso' | 'table' | 'wall'
}

export function RoomMinimap({
  eraYear,
  isCompartmentRevealed,
  onFocusSector,
  activeSector,
}: RoomMinimapProps) {
  const accentColor =
    eraYear === 1920 ? '#f59e0b' : eraYear === 1970 ? '#06b6d4' : '#a855f7'

  return (
    <div
      style={{
        position: 'absolute',
        top: '15px',
        right: '15px',
        background: 'rgba(7, 11, 20, 0.92)',
        border: `1.5px solid ${accentColor}`,
        borderRadius: '8px',
        padding: '0.65rem 0.85rem',
        zIndex: 90,
        boxShadow: `0 0 20px ${accentColor}44`,
        fontFamily: 'monospace',
        width: '185px',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.3rem'}}>
        <span style={{fontSize: '0.65rem', fontWeight: 800, color: accentColor}}>
          🗺️ SECTOR RADAR
        </span>
        <span style={{fontSize: '0.6rem', color: '#94a3b8'}}>
          {eraYear} VAULT
        </span>
      </div>

      {/* Schematic Floorplan Grid */}
      <div
        style={{
          width: '100%',
          height: '110px',
          background: '#040711',
          border: '1px solid #1e293b',
          borderRadius: '4px',
          position: 'relative',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateRows: '26px 1fr',
          gridTemplateColumns: '26px 1fr 26px',
        }}
      >
        {/* North Wall Cavity Sector */}
        <button
          onClick={() => {
            playBeep()
            onFocusSector('wall')
          }}
          title="Click to Zoom North Wall"
          style={{
            gridColumn: '2 / 3',
            gridRow: '1 / 2',
            background: activeSector === 'wall' ? `${accentColor}44` : '#131e32',
            border: `1px solid ${isCompartmentRevealed ? '#a855f7' : accentColor}`,
            color: isCompartmentRevealed ? '#e9d5ff' : '#f8fafc',
            fontSize: '0.55rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.2rem',
            padding: 0,
            transition: 'all 0.15s',
          }}
        >
          <span>{isCompartmentRevealed ? '🔮' : '🔐'}</span>
          <span>NORTH WALL</span>
        </button>

        {/* West Vault Door */}
        <div
          style={{
            gridColumn: '1 / 2',
            gridRow: '2 / 3',
            background: '#1e293b',
            borderRight: `2px solid ${accentColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            fontSize: '0.5rem',
            color: '#cbd5e1',
            fontWeight: 700,
          }}
        >
          🚪 VAULT DOOR
        </div>

        {/* Center Investigation Table Sector */}
        <button
          onClick={() => {
            playBeep()
            onFocusSector('table')
          }}
          title="Click to Zoom Center Table"
          style={{
            gridColumn: '2 / 3',
            gridRow: '2 / 3',
            margin: '10px 14px',
            background: activeSector === 'table' ? `${accentColor}44` : '#0f172a',
            border: `1.5px solid ${accentColor}`,
            borderRadius: '4px',
            color: '#f8fafc',
            fontSize: '0.58rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.1rem',
            transition: 'all 0.15s',
          }}
        >
          <span>{eraYear === 1920 ? '🗝️' : eraYear === 1970 ? '📻' : '🌀'}</span>
          <span>{eraYear === 1920 ? 'WORKBENCH' : eraYear === 1970 ? 'CONSOLE' : 'PEDESTAL'}</span>
        </button>

        {/* East Corner: Clock / Server Racks */}
        <div
          style={{
            gridColumn: '3 / 4',
            gridRow: '2 / 3',
            background: '#131e32',
            borderLeft: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.65rem',
          }}
          title={eraYear === 1920 ? 'Grandfather Clock' : 'Server Mainframe'}
        >
          {eraYear === 1920 ? '🕰️' : '🖥️'}
        </div>
      </div>

      {/* Quick Camera Preset Buttons */}
      <div style={{display: 'flex', gap: '0.3rem', marginTop: '0.45rem'}}>
        <button
          onClick={() => {
            playBeep()
            onFocusSector('iso')
          }}
          style={{
            flex: 1,
            background: activeSector === 'iso' ? accentColor : '#1e293b',
            color: activeSector === 'iso' ? '#000000' : '#cbd5e1',
            border: 'none',
            borderRadius: '3px',
            padding: '0.2rem',
            fontSize: '0.6rem',
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          OVERVIEW
        </button>
        <button
          onClick={() => {
            playBeep()
            onFocusSector('table')
          }}
          style={{
            flex: 1,
            background: activeSector === 'table' ? accentColor : '#1e293b',
            color: activeSector === 'table' ? '#000000' : '#cbd5e1',
            border: 'none',
            borderRadius: '3px',
            padding: '0.2rem',
            fontSize: '0.6rem',
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          TABLE
        </button>
        <button
          onClick={() => {
            playBeep()
            onFocusSector('wall')
          }}
          style={{
            flex: 1,
            background: activeSector === 'wall' ? accentColor : '#1e293b',
            color: activeSector === 'wall' ? '#000000' : '#cbd5e1',
            border: 'none',
            borderRadius: '3px',
            padding: '0.2rem',
            fontSize: '0.6rem',
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          SAFE
        </button>
      </div>
    </div>
  )
}
