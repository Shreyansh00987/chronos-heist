'use client'

import React, {useState, useTransition} from 'react'
import {approveGameMasterReview, commitCausality, resetDemoData} from '@/app/actions'
import confetti from 'canvas-confetti'

interface TransitionData {
  _id: string
  transitionState: string
  agentAnalysis?: string
  calculatedChanges?: Array<{changeSummary: string}>
  sourceAction?: {
    description?: string
    sourceEra?: {year?: number}
  }
}

interface ParadoxData {
  _id: string
  title: string
  severity: string
  description?: string
  resolutionStatus: string
}

interface TimelineData {
  _id: string
  timelineId: string
  currentStatus: string
  healthIndicator: number
  sealedState: boolean
  era?: {year?: number; name?: string}
}

export function GameMasterControls({
  transitions,
  paradoxes,
  timelines,
  sessionCode = 'CHRONOS-ALPHA',
}: {
  transitions: TransitionData[]
  paradoxes: ParadoxData[]
  timelines: TimelineData[]
  sessionCode?: string
}) {
  const [isPending, startTransition] = useTransition()
  const [statusLog, setStatusLog] = useState<string | null>(null)

  const reviewTransition = transitions.find((t) => t.transitionState === 'GAME_MASTER_REVIEW')

  const handleApprove = (transitionId: string) => {
    setStatusLog('Authorizing timeline transition & sealing temporal lake...')
    startTransition(async () => {
      try {
        await approveGameMasterReview(transitionId)
        setStatusLog('AUTHORIZATION CONFIRMED: Timeline sealed with 100% integrity.')
        confetti({particleCount: 70, spread: 70})
      } catch (err: any) {
        setStatusLog(`Approval failed: ${err.message}`)
      }
    })
  }

  const handleCommitPending = () => {
    setStatusLog('Triggering manual causality processing...')
    startTransition(async () => {
      try {
        await commitCausality()
        setStatusLog('Causality engine executed. Review updated.')
      } catch (err: any) {
        setStatusLog(`Causality error: ${err.message}`)
      }
    })
  }

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
      {statusLog && (
        <div style={{background: '#1e1b4b', border: '1px solid #7c3aed', color: '#e9d5ff', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.85rem', fontFamily: 'monospace'}}>
          &gt; {statusLog}
        </div>
      )}

      {/* PENDING GM REVIEW CARD */}
      <div
        style={{
          background: '#0d131f',
          border: reviewTransition ? '2px solid #a855f7' : '1px solid #1e293b',
          borderRadius: '10px',
          padding: '1.5rem',
          boxShadow: reviewTransition ? '0 0 25px rgba(168, 85, 247, 0.25)' : 'none',
        }}
      >
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.6rem'}}>
            <span style={{width: '10px', height: '10px', borderRadius: '50%', background: reviewTransition ? '#f59e0b' : '#10b981'}} />
            <h2 style={{margin: 0, fontSize: '1.25rem', fontFamily: 'monospace', color: '#f8fafc'}}>
              {reviewTransition ? 'ACTION AWAITING GAME MASTER SIGN-OFF' : 'ALL WORKFLOW STAGES STABILIZED'}
            </h2>
          </div>
          <span style={{background: '#1e293b', color: '#cbd5e1', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontFamily: 'monospace'}}>
            STAGE: {reviewTransition ? reviewTransition.transitionState : 'IDLE'}
          </span>
        </div>

        {reviewTransition ? (
          <div>
            <div style={{background: '#070a10', border: '1px solid #1e293b', padding: '1rem', borderRadius: '6px', marginBottom: '1rem'}}>
              <div style={{fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontFamily: 'monospace', marginBottom: '0.3rem'}}>
                SOURCE ACTION ({reviewTransition.sourceAction?.sourceEra?.year ?? '1920'})
              </div>
              <div style={{fontSize: '1.05rem', color: '#f8fafc', fontWeight: 600}}>
                &ldquo;{reviewTransition.sourceAction?.description}&rdquo;
              </div>
            </div>

            {reviewTransition.agentAnalysis && (
              <div style={{background: '#170624', borderLeft: '3px solid #a855f7', padding: '0.85rem 1rem', borderRadius: '4px', marginBottom: '1rem'}}>
                <div style={{fontSize: '0.75rem', color: '#c084fc', textTransform: 'uppercase', fontFamily: 'monospace', marginBottom: '0.3rem'}}>
                  AUTONOMOUS CAUSALITY AGENT ANALYSIS
                </div>
                <p style={{margin: 0, fontSize: '0.9rem', color: '#e9d5ff', lineHeight: 1.5}}>
                  {reviewTransition.agentAnalysis}
                </p>
              </div>
            )}

            {reviewTransition.calculatedChanges && reviewTransition.calculatedChanges.length > 0 && (
              <div style={{marginBottom: '1.25rem'}}>
                <div style={{fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontFamily: 'monospace', marginBottom: '0.5rem'}}>
                  CALCULATED STATE MUTATIONS ({reviewTransition.calculatedChanges.length})
                </div>
                <ul style={{listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem'}}>
                  {reviewTransition.calculatedChanges.map((c, idx) => (
                    <li
                      key={idx}
                      style={{
                        background: '#070a10',
                        border: '1px solid #1e293b',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        fontFamily: 'monospace',
                        color: '#34d399',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <span>⚡</span> {c.changeSummary}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* GM Action Buttons */}
            <div style={{display: 'flex', gap: '1rem'}}>
              <button
                onClick={() => handleApprove(reviewTransition._id)}
                disabled={isPending}
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#ffffff',
                  fontWeight: 800,
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.75rem 1.75rem',
                  fontSize: '0.9rem',
                  fontFamily: 'monospace',
                  cursor: isPending ? 'wait' : 'pointer',
                  boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)',
                }}
              >
                {isPending ? 'COMMITTING...' : '✔ AUTHORIZE & SEAL TIMELINE'}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p style={{color: '#94a3b8', fontSize: '0.9rem', margin: '0 0 1rem 0'}}>
              All timelines are currently synchronized. If a player performs a temporal action in 1920 or 1970, it will appear here for authoritative review.
            </p>
            <button
              onClick={handleCommitPending}
              disabled={isPending}
              style={{
                background: '#1e293b',
                color: '#e2e8f0',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                fontFamily: 'monospace',
                cursor: 'pointer',
              }}
            >
              Evaluate Pending Actions
            </button>
          </div>
        )}
      </div>

      {/* TIMELINE HEALTH GAUGES */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem'}}>
        {timelines.map((ts) => {
          const year = ts.era?.year ?? (ts.timelineId.includes('1920') ? 1920 : ts.timelineId.includes('1970') ? 1970 : 2026)
          const color = year === 1920 ? '#d97706' : year === 1970 ? '#06b6d4' : '#a855f7'
          return (
            <div
              key={ts._id}
              style={{
                background: '#0d131f',
                border: `1px solid ${color}44`,
                borderRadius: '8px',
                padding: '1.25rem',
              }}
            >
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem'}}>
                <span style={{color, fontWeight: 800, fontFamily: 'monospace'}}>{year} TIMELINE</span>
                <span
                  style={{
                    background: ts.sealedState ? '#064e3b' : '#1e293b',
                    color: ts.sealedState ? '#34d399' : '#cbd5e1',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontFamily: 'monospace',
                  }}
                >
                  {ts.sealedState ? 'SEALED' : ts.currentStatus.toUpperCase()}
                </span>
              </div>
              <div style={{fontSize: '1.8rem', fontWeight: 900, fontFamily: 'monospace', color: '#f8fafc', margin: '0.5rem 0'}}>
                {ts.healthIndicator}%
              </div>
              <div style={{width: '100%', height: '6px', background: '#1e293b', borderRadius: '3px', overflow: 'hidden'}}>
                <div
                  style={{
                    width: `${ts.healthIndicator}%`,
                    height: '100%',
                    background: color,
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
