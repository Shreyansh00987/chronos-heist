import Link from 'next/link'
import {client} from '@/sanity/lib/client'
import {NavigationHeader} from '@/components/NavigationHeader'
import {HowItWorksPanel} from '@/components/HowItWorksPanel'

export const dynamic = 'force-dynamic'

interface EraData {
  _id: string
  name: string
  year: number
  order: number
  description: string
  visualTheme?: {primaryColor?: string; ambiance?: string}
}

interface RoomData {
  _id: string
  name: string
  structuralState: string
  era?: {year?: number}
  hiddenCompartments?: Array<{revealed?: boolean}>
}

export default async function Home() {
  const [eras, rooms, paradoxes, pendingActions] = await Promise.all([
    client.fetch<EraData[]>(`*[_type == "era"] | order(order asc){
      _id,
      name,
      year,
      order,
      description,
      visualTheme
    }`),
    client.fetch<RoomData[]>(`*[_type == "room"]{
      _id,
      name,
      structuralState,
      era->{year},
      hiddenCompartments[]{revealed}
    }`),
    client.fetch<any[]>(`*[_type == "paradox"]{_id, title, severity, resolutionStatus}`),
    client.fetch<any[]>(`*[_type == "temporalAction" && causalityStatus == "pending"]{_id, description}`),
  ])

  const room2026 = rooms.find((r) => r.era?.year === 2026)
  const is2026CompartmentRevealed = room2026?.hiddenCompartments?.some((c) => c.revealed)

  return (
    <div style={{minHeight: '100vh', background: '#07090e', color: '#e2e8f0', display: 'flex', flexDirection: 'column'}}>
      <NavigationHeader />

      <main style={{maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 1.5rem', width: '100%', flex: 1}}>
        {/* HERO MISSION BRIEFING */}
        <div
          className="crt-overlay"
          style={{
            background: 'linear-gradient(180deg, #0e1526 0%, #07090e 100%)',
            border: '1px solid #1e293b',
            borderRadius: '12px',
            padding: '2.5rem',
            position: 'relative',
            marginBottom: '2rem',
            boxShadow: '0 0 40px rgba(0,0,0,0.6)',
          }}
        >
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem'}}>
            <div>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem'}}>
                <span style={{background: '#7c3aed', color: '#ffffff', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800, fontFamily: 'monospace'}}>
                  TOP SECRET // CLASSIFIED
                </span>
                <span style={{color: '#94a3b8', fontSize: '0.8rem', fontFamily: 'monospace'}}>
                  OPERATION: CHRONOS-HEIST
                </span>
              </div>
              <h1 style={{fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.02em', margin: '0 0 0.75rem 0', fontFamily: 'monospace', color: '#f8fafc'}}>
                THE CLOCKMAKER&apos;S <span style={{color: '#a855f7'}}>VAULT</span>
              </h1>
              <p style={{fontSize: '1.1rem', color: '#cbd5e1', maxWidth: '720px', lineHeight: 1.6, margin: 0}}>
                A playable temporal mystery game where <strong>changing the past changes the future in real time</strong>.
                Three versions of the vault exist concurrently across 1920, 1970, and 2026. Every object, room, action, and causal link is structured content inside Sanity Content Lake.
              </p>
            </div>

            {/* Quick Status Block */}
            <div style={{background: '#070a12', border: '1px solid #1e293b', padding: '1rem 1.25rem', borderRadius: '8px', minWidth: '220px', fontFamily: 'monospace', fontSize: '0.8rem'}}>
              <div style={{color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.4rem'}}>
                TEMPORAL LAKE STATUS
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem'}}>
                <span>Sanity Connection:</span>
                <span style={{color: '#10b981'}}>LIVE</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem'}}>
                <span>2026 Compartment:</span>
                <span style={{color: is2026CompartmentRevealed ? '#a855f7' : '#f59e0b', fontWeight: 'bold'}}>
                  {is2026CompartmentRevealed ? 'REVEALED' : 'SEALED'}
                </span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <span>Active Paradoxes:</span>
                <span style={{color: paradoxes.length > 0 ? '#ef4444' : '#10b981'}}>
                  {paradoxes.length} DETECTED
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div style={{display: 'flex', gap: '1rem', marginTop: '1.75rem', flexWrap: 'wrap'}}>
            <Link
              href="/game/CHRONOS-ALPHA"
              style={{
                background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                color: '#ffffff',
                fontWeight: 800,
                padding: '0.85rem 1.75rem',
                borderRadius: '8px',
                fontSize: '1rem',
                fontFamily: 'monospace',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)',
              }}
            >
              ▶ ENTER THE VAULT
            </Link>
            <Link
              href="/gm/CHRONOS-ALPHA"
              style={{
                background: '#1e293b',
                color: '#e2e8f0',
                border: '1px solid #334155',
                fontWeight: 600,
                padding: '0.85rem 1.5rem',
                borderRadius: '8px',
                fontSize: '1rem',
                fontFamily: 'monospace',
              }}
            >
              🛡️ GAME MASTER CENTER
            </Link>
            <Link
              href="/causality"
              style={{
                background: '#1e293b',
                color: '#e2e8f0',
                border: '1px solid #334155',
                fontWeight: 600,
                padding: '0.85rem 1.5rem',
                borderRadius: '8px',
                fontSize: '1rem',
                fontFamily: 'monospace',
              }}
            >
              ⚡ D3 CAUSALITY GRAPH
            </Link>
          </div>
        </div>

        {/* 3 ERA CARDS */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '2rem'}}>
          {eras?.map((era) => {
            const eraColor =
              era.year === 1920 ? '#d97706' : era.year === 1970 ? '#06b6d4' : '#a855f7'
            const eraGlow =
              era.year === 1920
                ? 'rgba(217, 119, 6, 0.2)'
                : era.year === 1970
                ? 'rgba(6, 182, 212, 0.2)'
                : 'rgba(168, 85, 247, 0.2)'
            const room = rooms.find((r) => r.era?.year === era.year)

            return (
              <div
                key={era.year}
                style={{
                  background: '#0a0e17',
                  border: `1px solid ${eraColor}55`,
                  borderRadius: '10px',
                  padding: '1.5rem',
                  boxShadow: `0 0 20px ${eraGlow}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem'}}>
                    <span style={{color: eraColor, fontWeight: 800, fontSize: '1.4rem', fontFamily: 'monospace'}}>
                      {era.year}
                    </span>
                    <span style={{background: '#1e293b', color: '#94a3b8', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontFamily: 'monospace'}}>
                      ERA #{era.order}
                    </span>
                  </div>
                  <h2 style={{fontSize: '1.25rem', margin: '0 0 0.5rem 0', color: '#f8fafc'}}>
                    {era.name}
                  </h2>
                  <p style={{color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5, margin: '0 0 1rem 0'}}>
                    {era.description}
                  </p>
                </div>

                <div style={{borderTop: '1px solid #1e293b', paddingTop: '0.75rem'}}>
                  <div style={{fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace', marginBottom: '0.25rem'}}>
                    VAULT STATE: <span style={{color: '#e2e8f0'}}>{room?.structuralState?.toUpperCase()}</span>
                  </div>
                  <Link
                    href={`/game/CHRONOS-ALPHA`}
                    style={{color: eraColor, fontSize: '0.85rem', fontWeight: 700, fontFamily: 'monospace'}}
                  >
                    Enter Era Vault →
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        {/* HOW IT WORKS / JUDGE ARCHITECTURE PANEL */}
        <HowItWorksPanel />
      </main>
    </div>
  )
}
