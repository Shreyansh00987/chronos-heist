import {client} from '@/sanity/lib/client'
import {NavigationHeader} from '@/components/NavigationHeader'
import {CausalityGraphWeb} from '@/components/CausalityGraphWeb'
import {HowItWorksPanel} from '@/components/HowItWorksPanel'

export const dynamic = 'force-dynamic'

export default async function CausalityPage() {
  const [actions, rooms, objects, paradoxes, transitions] = await Promise.all([
    client.fetch<any[]>(
      `*[_type == "temporalAction"]{_id, description, actionType, causalityStatus, sourceEra->{name, year}, targetObject->{name, _id}}`,
    ),
    client.fetch<any[]>(
      `*[_type == "room"]{_id, name, structuralState, era->{name, year}, linkedRooms[]->{_id, era->{year}}}`,
    ),
    client.fetch<any[]>(
      `*[_type == "gameObject"]{_id, name, objectType, state, originEra->{year}, currentLocation->{name, _id}}`,
    ),
    client.fetch<any[]>(`*[_type == "paradox"]{_id, title, severity, resolutionStatus}`),
    client.fetch<any[]>(
      `*[_type == "workflowTransition"]{_id, transitionState, agentAnalysis, sourceAction->{description}}`,
    ),
  ])

  const nodes: any[] = []
  const links: any[] = []

  // Add rooms
  rooms.forEach((r) => {
    const year = r.era?.year ? String(r.era.year) : 'Unknown'
    const color = year === '1920' ? '#d97706' : year === '1970' ? '#06b6d4' : '#a855f7'
    nodes.push({
      id: r._id,
      label: `${r.name} (${year})`,
      type: 'room',
      era: year,
      color,
      status: r.structuralState,
      details: r,
    })

    if (r.linkedRooms && Array.isArray(r.linkedRooms)) {
      r.linkedRooms.forEach((lr: any) => {
        if (lr?._id) {
          links.push({
            source: r._id,
            target: lr._id,
            label: 'cross-era continuity',
            relationshipType: 'continuity',
          })
        }
      })
    }
  })

  // Add objects
  objects.forEach((obj) => {
    const year = obj.originEra?.year ? String(obj.originEra.year) : 'Unknown'
    nodes.push({
      id: obj._id,
      label: obj.name,
      type: 'object',
      era: year,
      color: '#10b981',
      status: obj.state,
      details: obj,
    })
  })

  // Add actions
  actions.forEach((act) => {
    const year = act.sourceEra?.year ? String(act.sourceEra.year) : 'Unknown'
    nodes.push({
      id: act._id,
      label: act.description || 'Temporal Action',
      type: 'action',
      era: year,
      color: '#ef4444',
      status: act.causalityStatus,
      details: act,
    })

    if (act.targetObject?._id) {
      links.push({
        source: act._id,
        target: act.targetObject._id,
        label: 'targets',
        relationshipType: 'mutation',
      })
    }
  })

  // Add paradoxes
  paradoxes.forEach((p) => {
    nodes.push({
      id: p._id,
      label: p.title,
      type: 'paradox',
      color: '#f59e0b',
      status: p.resolutionStatus,
      details: p,
    })
  })

  // Add workflow transitions
  transitions.forEach((t) => {
    nodes.push({
      id: t._id,
      label: `Stage: ${t.transitionState}`,
      type: 'transition',
      color: '#3b82f6',
      status: t.transitionState,
      details: t,
    })
  })

  // Causal link between 1920 key action and 2026 Vault
  const brassAction = actions.find((a) => a.description?.toLowerCase().includes('key'))
  const vault2026 = rooms.find((r) => r.era?.year === 2026)
  if (brassAction && vault2026) {
    links.push({
      source: brassAction._id,
      target: vault2026._id,
      label: 'CAUSAL PROPAGATION',
      relationshipType: 'reveals',
    })
  }

  return (
    <div style={{minHeight: '100vh', background: '#07090e', color: '#e2e8f0', display: 'flex', flexDirection: 'column'}}>
      <NavigationHeader />

      <main style={{maxWidth: '1360px', margin: '0 auto', padding: '2rem 1.5rem', width: '100%', flex: 1}}>
        <div style={{borderBottom: '1px solid #1e293b', paddingBottom: '1rem', marginBottom: '1.5rem'}}>
          <div style={{fontSize: '0.75rem', color: '#a855f7', fontFamily: 'monospace'}}>
            // D3_FORCE_SIMULATION // LIVE_GROQ_SYNTHESIS
          </div>
          <h1 style={{fontSize: '2rem', margin: '0.3rem 0', fontFamily: 'monospace', color: '#f8fafc'}}>
            Causality Dependency Graph
          </h1>
          <p style={{color: '#94a3b8', margin: 0, fontSize: '0.95rem'}}>
            Interactive topological mapping of all temporal actions, physical rooms, game artifacts, and workflow states in Sanity Content Lake.
          </p>
        </div>

        <CausalityGraphWeb initialData={{nodes, links}} />

        <HowItWorksPanel />
      </main>
    </div>
  )
}
