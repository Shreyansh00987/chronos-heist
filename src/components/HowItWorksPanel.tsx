'use client'

import React, {useState} from 'react'

const PIPELINE_STAGES = [
  {
    id: 'player-action',
    title: '1. Player Action',
    subtitle: '1920 Origin Era',
    description: 'A player in the 1920 vault discovers the Antique Brass Key and selects "Bury in North Wall Mortar".',
    sanityDetail: 'Creates a mutable client-side proposal before committing to Content Lake.',
    groqSnippet: `*[_type == "gameObject" && _id == "obj-brass-key"]`,
  },
  {
    id: 'sanity-doc',
    title: '2. Sanity Document',
    subtitle: 'temporalAction',
    description: 'Server Action persists a new temporalAction document into Sanity Content Lake with status "pending".',
    sanityDetail: 'Document contains sourceEra, targetObject, actionType, timestamp, and paradoxRisk.',
    groqSnippet: `writeClient.create({ _type: "temporalAction", sourceEra: "era-1920", ... })`,
  },
  {
    id: 'workflow',
    title: '3. Workflow State',
    subtitle: 'workflowTransition',
    description: 'A workflowTransition document is created in Sanity Lake moving state to "PAST_ACTION_COMMITTED".',
    sanityDetail: 'Represents the authoritative state machine transition in Sanity.',
    groqSnippet: `writeClient.create({ _type: "workflowTransition", transitionState: "PAST_ACTION_COMMITTED" })`,
  },
  {
    id: 'causality-agent',
    title: '4. Causality Engine',
    subtitle: 'Server-Side Evaluation',
    description: 'The server reads the action, examines cross-era linkedRooms, and calculates downstream physical consequences.',
    sanityDetail: 'Autonomous causality logic calculates changes across 1970 and 2026 without hardcoded client state.',
    groqSnippet: `executeCausalityWorkflow(actionId) -> { impact: "structural", confidence: 0.94 }`,
  },
  {
    id: 'dependency-graph',
    title: '5. Causality Links',
    subtitle: 'causalityLink Matrix',
    description: 'Links past action to future consequences, determining that a weakened mortar cavity in 1920 results in a secret compartment in 2026.',
    sanityDetail: 'Documented in causalityLink schema with strength score and explanation notes.',
    groqSnippet: `*[_type == "causalityLink" && sourceEra->year == 1920]`,
  },
  {
    id: 'future-mutation',
    title: '6. Future Mutation',
    subtitle: 'Sanity Lake Patch',
    description: 'Sanity patches the 2026 room document: reveals hidden compartment & transitions Chronos Core object state to "discovered".',
    sanityDetail: 'Direct transactional mutation on Sanity document room-vault-2026 and obj-chronos-core.',
    groqSnippet: `writeClient.patch("room-vault-2026").set({ "hiddenCompartments[_key=='...'].revealed": true })`,
  },
  {
    id: 'realtime-ui',
    title: '7. Real-Time UI',
    subtitle: 'Live Subscription',
    description: 'The 2026 game client receives the Sanity Live update instantly without page refresh, rendering the secret compartment opening.',
    sanityDetail: 'Powered by SanityLive / GROQ Live query subscriptions.',
    groqSnippet: `<SanityLive /> triggers live reactive update via Server-Sent Events`,
  },
  {
    id: 'gm-approval',
    title: '8. GM Review & Seal',
    subtitle: 'TIMELINE_SEALED',
    description: 'Game Master inspects the causal shift and paradox risk, approves the transition, and officially seals the timeline.',
    sanityDetail: 'Updates timelineState healthIndicator to 100% and marks sealedState: true.',
    groqSnippet: `writeClient.patch("timeline-2026").set({ currentStatus: "sealed", sealedState: true })`,
  },
]

export function HowItWorksPanel() {
  const [activeStageIndex, setActiveStageIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  const activeStage = PIPELINE_STAGES[activeStageIndex]

  return (
    <div style={{background: '#0d131f', border: '1px solid #1e293b', borderRadius: '8px', overflow: 'hidden', marginTop: '1.5rem'}}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '0.85rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          background: '#0a0f1a',
          borderBottom: isOpen ? '1px solid #1e293b' : 'none',
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
          <span style={{color: '#a855f7', fontWeight: 'bold', fontFamily: 'monospace'}}>// ARCHITECTURE_INSPECTOR</span>
          <span style={{fontSize: '0.85rem', color: '#94a3b8'}}>
            How Causality &amp; Sanity Power Chronos-Heist (Judge Walkthrough)
          </span>
        </div>
        <button
          style={{
            background: '#1e293b',
            border: 'none',
            color: '#c084fc',
            fontSize: '0.75rem',
            padding: '0.25rem 0.6rem',
            borderRadius: '4px',
            fontFamily: 'monospace',
            cursor: 'pointer',
          }}
        >
          {isOpen ? 'COLLAPSE' : 'EXPAND PIPELINE'}
        </button>
      </div>

      {isOpen && (
        <div style={{padding: '1.25rem'}}>
          {/* Stage Progress Bar / Steps */}
          <div style={{display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.75rem', marginBottom: '1rem'}}>
            {PIPELINE_STAGES.map((stage, idx) => {
              const isCurrent = idx === activeStageIndex
              return (
                <button
                  key={stage.id}
                  onClick={() => setActiveStageIndex(idx)}
                  style={{
                    flex: '0 0 auto',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    border: isCurrent ? '1px solid #a855f7' : '1px solid #1e293b',
                    background: isCurrent ? '#2e1065' : '#080d16',
                    color: isCurrent ? '#f3e8ff' : '#94a3b8',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                  }}
                >
                  <div style={{fontWeight: 700}}>{stage.title}</div>
                  <div style={{fontSize: '0.65rem', opacity: 0.8}}>{stage.subtitle}</div>
                </button>
              )
            })}
          </div>

          {/* Active Stage Details */}
          <div style={{background: '#060a12', border: '1px solid #1e293b', borderRadius: '6px', padding: '1.25rem', display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.25rem'}}>
            <div>
              <div style={{display: 'inline-block', background: '#3b0764', color: '#e9d5ff', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', fontFamily: 'monospace', marginBottom: '0.5rem'}}>
                STAGE {activeStageIndex + 1} OF {PIPELINE_STAGES.length}
              </div>
              <h3 style={{margin: '0 0 0.5rem 0', color: '#f8fafc', fontSize: '1.15rem'}}>{activeStage.title}</h3>
              <p style={{color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '0.75rem'}}>
                {activeStage.description}
              </p>
              <div style={{borderLeft: '2px solid #a855f7', paddingLeft: '0.75rem', color: '#c084fc', fontSize: '0.8rem', fontStyle: 'italic'}}>
                {activeStage.sanityDetail}
              </div>
            </div>

            {/* Code / Query Preview */}
            <div style={{background: '#02050b', border: '1px solid #1e293b', borderRadius: '4px', padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.75rem', overflowX: 'auto'}}>
              <div style={{color: '#64748b', marginBottom: '0.4rem', textTransform: 'uppercase', fontSize: '0.65rem'}}>
                Sanity GROQ / Mutation Pattern
              </div>
              <pre style={{color: '#34d399', whiteSpace: 'pre-wrap'}}>{activeStage.groqSnippet}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
