'use client'

import React, {useState, useEffect} from 'react'
import {commitCausality, resetDemoData} from '@/app/actions'
import {playBeep, playDiscoveryFanfare} from '@/lib/soundEffects'

export function AppSdkConsole({sessionCode = 'CHRONOS-ALPHA'}: {sessionCode?: string}) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'telemetry' | 'workflow' | 'lake'>('telemetry')
  const [lakeStatus, setLakeStatus] = useState({latency: 18, shard: 'gcp-eu-w1-prod', connected: true})
  const [customLog, setCustomLog] = useState<string>('App SDK connected to Content Lake.')

  useEffect(() => {
    const interval = setInterval(() => {
      setLakeStatus((prev) => ({
        ...prev,
        latency: Math.floor(14 + Math.random() * 8),
      }))
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {/* Floating App SDK Trigger Badge */}
      <button
        onClick={() => {
          playBeep()
          setIsOpen(!isOpen)
        }}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 999,
          background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
          color: '#ffffff',
          border: '1px solid #c084fc',
          borderRadius: '30px',
          padding: '0.6rem 1.25rem',
          fontSize: '0.85rem',
          fontFamily: 'monospace',
          fontWeight: 800,
          cursor: 'pointer',
          boxShadow: '0 0 25px rgba(124, 58, 237, 0.6)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <span style={{width: '8px', height: '8px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399'}} />
        SANITY APP SDK {isOpen ? '✕ CLOSE' : '⚙ CONSOLE'}
      </button>

      {/* Slide-out App SDK Modal / Drawer */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: '80px',
            right: '20px',
            width: '420px',
            maxHeight: 'calc(100vh - 120px)',
            background: '#0a0f1a',
            border: '2px solid #7c3aed',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.8), 0 0 30px rgba(124, 58, 237, 0.3)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: 'monospace',
          }}
        >
          {/* Header */}
          <div style={{background: '#131b2e', padding: '0.85rem 1.25rem', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div>
              <div style={{fontSize: '0.7rem', color: '#c084fc', textTransform: 'uppercase'}}>
                // SANITY_APP_SDK_OPERATIONS
              </div>
              <div style={{fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc'}}>
                Content Lake Operations Engine
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer'}}
            >
              ✕
            </button>
          </div>

          {/* Navigation Tabs */}
          <div style={{display: 'flex', borderBottom: '1px solid #1e293b', background: '#070a12'}}>
            {(['telemetry', 'workflow', 'lake'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  playBeep()
                  setActiveTab(tab)
                }}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  background: activeTab === tab ? '#1e1b4b' : 'transparent',
                  color: activeTab === tab ? '#c084fc' : '#94a3b8',
                  border: 'none',
                  borderBottom: activeTab === tab ? '2px solid #a855f7' : 'none',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{padding: '1.25rem', overflowY: 'auto', flex: 1, fontSize: '0.85rem', color: '#e2e8f0'}}>
            {activeTab === 'telemetry' && (
              <div>
                <div style={{background: '#030712', border: '1px solid #1e293b', borderRadius: '6px', padding: '0.75rem', marginBottom: '1rem'}}>
                  <div style={{fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.4rem'}}>
                    CONTENT LAKE TELEMETRY
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem'}}>
                    <span>Session:</span>
                    <strong style={{color: '#a855f7'}}>{sessionCode}</strong>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem'}}>
                    <span>Round-Trip Latency:</span>
                    <strong style={{color: '#34d399'}}>{lakeStatus.latency} ms</strong>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem'}}>
                    <span>Sanity Shard:</span>
                    <span style={{color: '#cbd5e1'}}>{lakeStatus.shard}</span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <span>Authoritative Lake:</span>
                    <span style={{color: '#10b981'}}>ed3z3z76/production</span>
                  </div>
                </div>

                <div style={{fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1rem'}}>
                  This custom App SDK interface directly reads and writes content to Sanity without standard read-only frontend layers.
                </div>

                <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                  <button
                    onClick={async () => {
                      playBeep()
                      setCustomLog('Triggering manual server-side causality execution...')
                      try {
                        await commitCausality()
                        setCustomLog('Causality engine executed. Lake updated.')
                        playDiscoveryFanfare()
                      } catch (e: any) {
                        setCustomLog(`Error: ${e.message}`)
                      }
                    }}
                    style={{
                      background: '#7c3aed',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.55rem',
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                    }}
                  >
                    ⚡ Force Causality Evaluation
                  </button>

                  <button
                    onClick={async () => {
                      playBeep()
                      setCustomLog('Resetting timeline states in Content Lake...')
                      try {
                        await resetDemoData()
                        setCustomLog('Lake reset to baseline state.')
                      } catch (e: any) {
                        setCustomLog(`Error: ${e.message}`)
                      }
                    }}
                    style={{
                      background: '#1e293b',
                      color: '#cbd5e1',
                      border: '1px solid #334155',
                      padding: '0.55rem',
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                      cursor: 'pointer',
                    }}
                  >
                    🔄 Reset Lake State
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'workflow' && (
              <div>
                <div style={{fontSize: '0.7rem', color: '#c084fc', textTransform: 'uppercase', marginBottom: '0.5rem'}}>
                  SANITY WORKFLOW PIPELINE MODEL
                </div>
                <p style={{fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1rem'}}>
                  Workflows are modeled as first-class Sanity documents (<code>workflowTransition</code>). Agents advance drafts autonomously; humans authorize transitions.
                </p>

                <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                  {[
                    {step: '1', title: 'PAST_ACTION_COMMITTED', desc: '1920 action persisted in Lake'},
                    {step: '2', title: 'CAUSALITY_AGENT', desc: 'Downstream rooms evaluated'},
                    {step: '3', title: 'FUTURE_RECALCULATION', desc: '2026 vault mutated'},
                    {step: '4', title: 'GAME_MASTER_REVIEW', desc: 'Awaiting human authorization'},
                    {step: '5', title: 'TIMELINE_SEALED', desc: 'Integrity locked at 100%'},
                  ].map((w, i) => (
                    <div
                      key={i}
                      style={{
                        background: '#030712',
                        border: '1px solid #1e293b',
                        borderRadius: '4px',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.75rem',
                      }}
                    >
                      <div style={{color: '#a855f7', fontWeight: 'bold'}}>
                        {w.step}. {w.title}
                      </div>
                      <div style={{color: '#64748b', fontSize: '0.7rem'}}>{w.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'lake' && (
              <div>
                <div style={{fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem'}}>
                  LIVE DOCUMENT INSPECTION
                </div>
                <div style={{background: '#030712', border: '1px solid #1e293b', borderRadius: '4px', padding: '0.75rem', fontSize: '0.75rem', color: '#34d399', whiteSpace: 'pre-wrap', maxHeight: '220px', overflowY: 'auto'}}>
{`// Live Content Lake Schema Map
Document Types:
- era (3 eras: 1920, 1970, 2026)
- room (Vault 1920, Vault 1970, Vault 2026)
- gameObject (15 interactive items)
- temporalAction (past player mutations)
- causalityLink (cross-era matrix)
- paradox (resonance conflicts)
- timelineState (health integrity %)
- gameSession (operation state)
- workflowTransition (state machine)`}
                </div>
              </div>
            )}

            {/* Status Footer */}
            <div style={{marginTop: '1rem', borderTop: '1px solid #1e293b', paddingTop: '0.75rem', fontSize: '0.75rem', color: '#34d399'}}>
              &gt; {customLog}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
