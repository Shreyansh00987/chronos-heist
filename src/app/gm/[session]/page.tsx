import {client} from '@/sanity/lib/client'
import {NavigationHeader} from '@/components/NavigationHeader'
import {GameMasterControls} from '@/components/GameMasterControls'
import {SanityLive} from '@/sanity/lib/live'

export const dynamic = 'force-dynamic'

export default async function GameMasterPage({params}: {params: Promise<{session: string}>}) {
  const {session} = await params
  const sessionCode = session || 'CHRONOS-ALPHA'

  const [transitions, paradoxes, timelines] = await Promise.all([
    client.fetch<any[]>(`*[_type == "workflowTransition"] | order(_createdAt desc){
      _id,
      transitionState,
      agentAnalysis,
      calculatedChanges[]{changeSummary},
      sourceAction->{
        description,
        sourceEra->{year}
      }
    }`),
    client.fetch<any[]>(`*[_type == "paradox"]{
      _id,
      title,
      severity,
      description,
      resolutionStatus
    }`),
    client.fetch<any[]>(`*[_type == "timelineState"]{
      _id,
      timelineId,
      currentStatus,
      healthIndicator,
      sealedState,
      era->{year, name}
    }`),
  ])

  return (
    <div style={{minHeight: '100vh', background: '#07090e', color: '#e2e8f0', display: 'flex', flexDirection: 'column'}}>
      <NavigationHeader sessionCode={sessionCode} />

      <main style={{maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem', width: '100%', flex: 1}}>
        <div style={{borderBottom: '1px solid #1e293b', paddingBottom: '1rem', marginBottom: '2rem'}}>
          <div style={{fontSize: '0.75rem', color: '#10b981', fontFamily: 'monospace'}}>
            // OPERATIONS_COMMAND // LEVEL_4_AUTHORIZATION
          </div>
          <h1 style={{fontSize: '2rem', margin: '0.3rem 0', fontFamily: 'monospace', color: '#f8fafc'}}>
            Game Master Command Center
          </h1>
          <p style={{color: '#94a3b8', margin: 0, fontSize: '0.95rem'}}>
            Authoritative nexus for inspecting causal shifts, resolving temporal paradoxes, and sealing timelines.
          </p>
        </div>

        <GameMasterControls
          transitions={transitions}
          paradoxes={paradoxes}
          timelines={timelines}
          sessionCode={sessionCode}
        />
      </main>

      <SanityLive />
    </div>
  )
}
