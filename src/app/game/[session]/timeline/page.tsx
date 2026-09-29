import {client} from '@/sanity/lib/client'
import {NavigationHeader} from '@/components/NavigationHeader'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function TimelineIntelligencePage({params}: {params: Promise<{session: string}>}) {
  const {session} = await params
  const sessionCode = session || 'CHRONOS-ALPHA'

  const [eras, rooms, paradoxes, actions, transitions] = await Promise.all([
    client.fetch<any[]>(`*[_type == "era"] | order(order asc){_id, name, year, description}`),
    client.fetch<any[]>(`*[_type == "room"]{
      _id,
      name,
      structuralState,
      era->{year, name},
      objects[]->{name, objectType, state},
      hiddenCompartments[]{label, revealed}
    }`),
    client.fetch<any[]>(`*[_type == "paradox"]{_id, title, severity, description, resolutionStatus}`),
    client.fetch<any[]>(`*[_type == "temporalAction"] | order(_createdAt desc){
      _id,
      description,
      actionType,
      causalityStatus,
      timestamp,
      sourceEra->{year}
    }`),
    client.fetch<any[]>(`*[_type == "workflowTransition"] | order(_createdAt desc){
      _id,
      transitionState,
      agentAnalysis,
      sourceAction->{description}
    }`),
  ])

  return (
    <div style={{minHeight: '100vh', background: '#07090e', color: '#e2e8f0', display: 'flex', flexDirection: 'column'}}>
      <NavigationHeader sessionCode={sessionCode} />

      <main style={{maxWidth: '1300px', margin: '0 auto', padding: '2rem 1.5rem', width: '100%', flex: 1}}>
        <div style={{borderBottom: '1px solid #1e293b', paddingBottom: '1rem', marginBottom: '2rem'}}>
          <div style={{fontSize: '0.75rem', color: '#a855f7', fontFamily: 'monospace'}}>
            // HISTORICAL_DIFF_ENGINE &amp; TEMPORAL_SCANNER
          </div>
          <h1 style={{fontSize: '2rem', margin: '0.3rem 0', fontFamily: 'monospace', color: '#f8fafc'}}>
            Timeline Intelligence // {sessionCode}
          </h1>
          <p style={{color: '#94a3b8', margin: 0, fontSize: '0.95rem'}}>
            Comparative analysis of the Clockmaker&apos;s Vault across the 106-year temporal axis.
          </p>
        </div>

        {/* 3-ERA COMPARATIVE MATRIX */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '2rem'}}>
          {eras.map((era) => {
            const room = rooms.find((r) => r.era?.year === era.year)
            const color = era.year === 1920 ? '#d97706' : era.year === 1970 ? '#06b6d4' : '#a855f7'
            return (
              <div
                key={era.year}
                style={{
                  background: '#0d131f',
                  border: `1px solid ${color}44`,
                  borderRadius: '8px',
                  padding: '1.25rem',
                }}
              >
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                  <span style={{color, fontWeight: 800, fontSize: '1.3rem', fontFamily: 'monospace'}}>
                    {era.year} — {era.name}
                  </span>
                  <span style={{background: '#1e293b', color: '#cbd5e1', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontFamily: 'monospace'}}>
                    {room?.structuralState?.toUpperCase()}
                  </span>
                </div>

                <div style={{marginBottom: '1rem'}}>
                  <div style={{fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.4rem', fontFamily: 'monospace'}}>
                    ACTIVE OBJECTS &amp; ARTIFACTS
                  </div>
                  <ul style={{listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem'}}>
                    {room?.objects?.map((obj: any, idx: number) => (
                      <li
                        key={idx}
                        style={{
                          background: '#070a10',
                          padding: '0.35rem 0.6rem',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          fontFamily: 'monospace',
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span>{obj.name}</span>
                        <span style={{color: '#94a3b8'}}>{obj.state}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div style={{fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.4rem', fontFamily: 'monospace'}}>
                    HIDDEN COMPARTMENTS
                  </div>
                  {room?.hiddenCompartments?.length ? (
                    room.hiddenCompartments.map((c: any, i: number) => (
                      <div
                        key={i}
                        style={{
                          background: c.revealed ? '#2e1065' : '#070a10',
                          border: c.revealed ? '1px solid #a855f7' : '1px solid #1e293b',
                          padding: '0.4rem 0.6rem',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          fontFamily: 'monospace',
                          color: c.revealed ? '#e9d5ff' : '#64748b',
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span>{c.label}</span>
                        <span>{c.revealed ? '⚡ REVEALED' : 'SEALED'}</span>
                      </div>
                    ))
                  ) : (
                    <div style={{color: '#64748b', fontSize: '0.75rem', fontStyle: 'italic'}}>
                      No compartments recorded.
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* PARADOXES & MUTATION LOG */}
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem'}}>
          {/* Paradox Monitor */}
          <div style={{background: '#0d131f', border: '1px solid #1e293b', borderRadius: '8px', padding: '1.25rem'}}>
            <div style={{fontSize: '0.75rem', color: '#ef4444', fontFamily: 'monospace', textTransform: 'uppercase', marginBottom: '0.75rem'}}>
              // PARADOX_DETECTION_GRID ({paradoxes.length})
            </div>
            {paradoxes.length > 0 ? (
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                {paradoxes.map((p) => (
                  <div
                    key={p._id}
                    style={{
                      background: '#1c1017',
                      border: '1px solid #7f1d1d',
                      padding: '0.75rem',
                      borderRadius: '6px',
                    }}
                  >
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem'}}>
                      <strong style={{color: '#fca5a5', fontSize: '0.85rem', fontFamily: 'monospace'}}>{p.title}</strong>
                      <span style={{fontSize: '0.7rem', background: '#450a0a', color: '#f87171', padding: '0.1rem 0.4rem', borderRadius: '3px', fontFamily: 'monospace'}}>
                        {p.severity?.toUpperCase()}
                      </span>
                    </div>
                    <p style={{margin: 0, fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.4}}>
                      {p.description}
                    </p>
                    <div style={{fontSize: '0.7rem', color: '#fca5a5', marginTop: '0.4rem', fontFamily: 'monospace'}}>
                      Status: {p.resolutionStatus}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{color: '#10b981', fontSize: '0.85rem', fontStyle: 'italic'}}>
                No active paradoxes detected. Timeline harmonics are stable.
              </div>
            )}
          </div>

          {/* Temporal Actions & Transitions */}
          <div style={{background: '#0d131f', border: '1px solid #1e293b', borderRadius: '8px', padding: '1.25rem'}}>
            <div style={{fontSize: '0.75rem', color: '#38bdf8', fontFamily: 'monospace', textTransform: 'uppercase', marginBottom: '0.75rem'}}>
              // RECENT_TEMPORAL_ACTIONS ({actions.length})
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '360px', overflowY: 'auto'}}>
              {actions.map((act) => (
                <div
                  key={act._id}
                  style={{
                    background: '#070a10',
                    border: '1px solid #1e293b',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontFamily: 'monospace',
                  }}
                >
                  <div style={{display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.7rem'}}>
                    <span>{act.sourceEra?.year || '1920'} / ACTION</span>
                    <span style={{color: act.causalityStatus === 'committed' ? '#10b981' : '#f59e0b'}}>
                      {act.causalityStatus?.toUpperCase()}
                    </span>
                  </div>
                  <div style={{color: '#f8fafc', marginTop: '0.2rem'}}>{act.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
