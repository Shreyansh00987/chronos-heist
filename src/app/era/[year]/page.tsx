import {notFound} from 'next/navigation'
import Link from 'next/link'

import {sanityFetch, SanityLive} from '@/sanity/lib/live'
import {NavigationHeader} from '@/components/NavigationHeader'
import {approveGameMasterReview, commitCausality, proposeTemporalAction} from '../../actions'

const ERA_ROOM_QUERY = `*[_type == "era" && year == $year][0]{
  _id,
  name,
  year,
  description,
  "room": *[_type == "room" && era._ref == ^._id][0]{
    _id,
    name,
    description,
    structuralState,
    objects[]->{name, state, objectType},
    hiddenCompartments[]{label, revealed}
  }
}`

const ACTIONABLE_OBJECTS_QUERY = `*[_type == "gameObject" && currentLocation->era->year == $year]{
  _id,
  name,
  objectType,
  currentLocation->{
    era->{order},
    linkedRooms[]->{
      era->{order}
    }
  }
}`

const PENDING_ACTION_QUERY = `*[_type == "temporalAction" && causalityStatus == "pending"] | order(_createdAt asc)[0]{
  description,
  sourceEra->{year}
}`

const REVIEW_TRANSITION_QUERY = `*[_type == "workflowTransition" && transitionState == "GAME_MASTER_REVIEW"] | order(_createdAt desc)[0]{
  transitionState,
  agentAnalysis,
  calculatedChanges[]{changeSummary},
  sourceAction->{sourceEra->{year}}
}`

const TIMELINE_QUERY = `*[_type == "timelineState" && era->year == $year][0]{
  timelineId,
  currentStatus,
  healthIndicator,
  sealedState
}`

type ActionableObject = {
  _id: string
  name: string
  objectType: string
  currentLocation?: {
    era?: {order?: number}
    linkedRooms?: Array<{era?: {order?: number}}>
  }
}

export default async function EraPage({params}: {params: Promise<{year: string}>}) {
  const {year} = await params
  const yearNum = Number(year)

  const eraRes = (await sanityFetch({query: ERA_ROOM_QUERY, params: {year: yearNum}})) as {data: any}
  const era = eraRes?.data
  if (!era) {
    notFound()
  }

  const actRes = (await sanityFetch({query: ACTIONABLE_OBJECTS_QUERY, params: {year: yearNum}})) as {data: any}
  const pendingRes = (await sanityFetch({query: PENDING_ACTION_QUERY})) as {data: any}
  const reviewRes = (await sanityFetch({query: REVIEW_TRANSITION_QUERY})) as {data: any}
  const timelineRes = (await sanityFetch({query: TIMELINE_QUERY, params: {year: yearNum}})) as {data: any}

  const actionableObjects = actRes?.data
  const pendingAction = pendingRes?.data
  const reviewTransition = reviewRes?.data
  const timeline = timelineRes?.data

  const objectsWithReach = ((actionableObjects || []) as ActionableObject[]).map((obj) => {
    const sourceOrder = obj.currentLocation?.era?.order ?? -1
    const futureCount = (obj.currentLocation?.linkedRooms || []).filter(
      (room) => (room.era?.order ?? -1) > sourceOrder,
    ).length
    return {...obj, futureCount}
  })

  const showCommitButton = pendingAction?.sourceEra?.year === yearNum
  const showApproveButton = reviewTransition?.sourceAction?.sourceEra?.year === yearNum
  const transitionBelongsHere = reviewTransition?.sourceAction?.sourceEra?.year === yearNum

  async function handleProposeAction(formData: FormData) {
    'use server'
    await proposeTemporalAction(formData)
  }

  async function handleCommitAction() {
    'use server'
    await commitCausality()
  }

  async function handleApproveAction() {
    'use server'
    await approveGameMasterReview()
  }

  const eraColor = yearNum === 1920 ? '#d97706' : yearNum === 1970 ? '#06b6d4' : '#a855f7'

  return (
    <div style={{minHeight: '100vh', background: '#07090e', color: '#e2e8f0', display: 'flex', flexDirection: 'column'}}>
      <NavigationHeader />

      <main style={{maxWidth: '860px', margin: '2rem auto', padding: '2rem', background: '#0d131f', border: `1px solid ${eraColor}44`, borderRadius: '10px', width: '100%'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
          <p style={{letterSpacing: '2px', textTransform: 'uppercase', color: eraColor, fontFamily: 'monospace', margin: 0}}>
            Chronos-Heist // Era Inspection
          </p>
          <Link href="/game/CHRONOS-ALPHA" style={{fontSize: '0.85rem', color: '#94a3b8', fontFamily: 'monospace'}}>
            Open Interactive Vault View →
          </Link>
        </div>

        <h1 style={{color: '#f8fafc', fontFamily: 'monospace', fontSize: '2rem', margin: '0 0 0.5rem 0'}}>
          {era.name} ({era.year})
        </h1>
        <p style={{color: '#94a3b8', lineHeight: 1.6, marginBottom: '1.5rem'}}>{era.description}</p>

        {era.room ? (
          <div style={{background: '#070a10', border: '1px solid #1e293b', padding: '1.25rem', borderRadius: '8px', marginBottom: '1.5rem'}}>
            <h2 style={{color: '#f8fafc', fontSize: '1.25rem', margin: '0 0 0.5rem 0'}}>{era.room.name}</h2>
            <p style={{color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '0.5rem'}}>{era.room.description}</p>
            <p style={{fontSize: '0.85rem', color: eraColor, fontFamily: 'monospace'}}>
              Structural State: <strong>{era.room.structuralState?.toUpperCase()}</strong>
            </p>

            <h3 style={{fontSize: '1rem', marginTop: '1rem', marginBottom: '0.5rem', color: '#f8fafc'}}>
              Objects in this Room
            </h3>
            <ul style={{listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem'}}>
              {era.room.objects?.map(
                (obj: {name: string; state: string; objectType: string}, i: number) => (
                  <li key={i} style={{background: '#0d131f', padding: '0.4rem 0.75rem', borderRadius: '4px', fontSize: '0.85rem', fontFamily: 'monospace', display: 'flex', justifyContent: 'space-between'}}>
                    <span>{obj.name}</span>
                    <span style={{color: '#94a3b8'}}>
                      {obj.objectType} ({obj.state})
                    </span>
                  </li>
                ),
              )}
            </ul>

            <h3 style={{fontSize: '1rem', marginTop: '1rem', marginBottom: '0.5rem', color: '#f8fafc'}}>
              Hidden Compartments
            </h3>
            <ul style={{listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem'}}>
              {era.room.hiddenCompartments?.length ? (
                era.room.hiddenCompartments.map(
                  (c: {label: string; revealed: boolean}, i: number) => (
                    <li key={i} style={{background: c.revealed ? '#2e1065' : '#0d131f', border: c.revealed ? '1px solid #a855f7' : 'none', padding: '0.4rem 0.75rem', borderRadius: '4px', fontSize: '0.85rem', fontFamily: 'monospace', color: c.revealed ? '#e9d5ff' : '#94a3b8', display: 'flex', justifyContent: 'space-between'}}>
                      <span>{c.label}</span>
                      <span>{c.revealed ? '⚡ REVEALED' : 'SEALED'}</span>
                    </li>
                  ),
                )
              ) : (
                <li style={{color: '#64748b', fontSize: '0.85rem'}}>None recorded for this era.</li>
              )}
            </ul>
          </div>
        ) : (
          <p style={{color: '#94a3b8'}}>No room recorded for this era yet.</p>
        )}

        <div style={{background: '#070a10', border: '1px solid #1e293b', padding: '1.25rem', borderRadius: '8px', marginBottom: '1.5rem'}}>
          <h2 style={{color: '#f8fafc', fontSize: '1.2rem', margin: '0 0 1rem 0'}}>
            Propose a Temporal Action
          </h2>
          {objectsWithReach.length > 0 ? (
            <form action={handleProposeAction}>
              <div>
                <label style={{display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.3rem', fontFamily: 'monospace'}}>
                  Target Object:
                </label>
                <select
                  name="objectId"
                  style={{width: '100%', background: '#0d131f', color: '#e2e8f0', border: '1px solid #334155', padding: '0.5rem', borderRadius: '4px', fontFamily: 'monospace'}}
                >
                  {objectsWithReach.map((obj) => (
                    <option key={obj._id} value={obj._id}>
                      {obj.name} — affects {obj.futureCount} future room(s)
                    </option>
                  ))}
                </select>
              </div>
              <div style={{marginTop: '0.75rem'}}>
                <label style={{display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.3rem', fontFamily: 'monospace'}}>
                  Action Type:
                </label>
                <select
                  name="actionType"
                  style={{width: '100%', background: '#0d131f', color: '#e2e8f0', border: '1px solid #334155', padding: '0.5rem', borderRadius: '4px', fontFamily: 'monospace'}}
                >
                  <option value="bury">Bury</option>
                  <option value="hide">Hide</option>
                  <option value="move">Move</option>
                  <option value="destroy">Destroy</option>
                  <option value="reveal">Reveal</option>
                  <option value="alter">Alter</option>
                </select>
              </div>
              <button
                type="submit"
                style={{
                  marginTop: '1rem',
                  padding: '0.65rem 1.5rem',
                  fontSize: '0.9rem',
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                  background: eraColor,
                  color: '#000000',
                  fontWeight: 'bold',
                  border: 'none',
                  borderRadius: '4px',
                }}
              >
                Propose Temporal Action
              </button>
            </form>
          ) : (
            <p style={{color: '#64748b', fontSize: '0.85rem'}}>No objects available to act on in this room.</p>
          )}
        </div>

        {showCommitButton && (
          <div style={{background: '#1e1b4b', border: '1px solid #7c3aed', padding: '1.25rem', borderRadius: '8px', marginBottom: '1.5rem'}}>
            <h2 style={{color: '#e9d5ff', fontSize: '1.2rem', margin: '0 0 0.5rem 0'}}>Pending Temporal Action</h2>
            <p style={{color: '#f8fafc', fontSize: '1rem', marginBottom: '1rem'}}>&quot;{pendingAction.description}&quot;</p>
            <form action={handleCommitAction}>
              <button
                type="submit"
                style={{padding: '0.65rem 1.5rem', fontSize: '0.9rem', fontFamily: 'monospace', fontWeight: 'bold', cursor: 'pointer', background: '#7c3aed', color: '#ffffff', border: 'none', borderRadius: '4px'}}
              >
                Execute Causality Pipeline
              </button>
            </form>
          </div>
        )}

        {transitionBelongsHere && reviewTransition && (
          <div style={{background: '#070a10', border: '1px solid #1e293b', padding: '1.25rem', borderRadius: '8px', marginBottom: '1.5rem'}}>
            <h2 style={{color: '#f8fafc', fontSize: '1.2rem', margin: '0 0 0.5rem 0'}}>Workflow Status</h2>
            <p style={{fontFamily: 'monospace', color: '#f59e0b', fontSize: '0.9rem'}}>
              Stage: <strong>{reviewTransition.transitionState}</strong>
            </p>
            {reviewTransition.agentAnalysis && (
              <p style={{color: '#cbd5e1', fontSize: '0.85rem', lineHeight: 1.5}}>{reviewTransition.agentAnalysis}</p>
            )}
            {reviewTransition.calculatedChanges?.length > 0 && (
              <ul style={{listStyle: 'none', padding: 0, marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem'}}>
                {reviewTransition.calculatedChanges.map(
                  (c: {changeSummary: string}, i: number) => (
                    <li key={i} style={{fontSize: '0.8rem', color: '#34d399', fontFamily: 'monospace'}}>
                      ⚡ {c.changeSummary}
                    </li>
                  ),
                )}
              </ul>
            )}
            {showApproveButton && (
              <form action={handleApproveAction} style={{marginTop: '1rem'}}>
                <button
                  type="submit"
                  style={{padding: '0.65rem 1.5rem', fontSize: '0.9rem', fontFamily: 'monospace', fontWeight: 'bold', cursor: 'pointer', background: '#10b981', color: '#ffffff', border: 'none', borderRadius: '4px'}}
                >
                  Approve as Game Master
                </button>
              </form>
            )}
          </div>
        )}

        <div style={{background: '#070a10', border: '1px solid #1e293b', padding: '1rem', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.85rem'}}>
          <div style={{color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.3rem'}}>
            TIMELINE HEALTH INDICATOR
          </div>
          {timeline ? (
            <p style={{margin: 0, color: '#f8fafc'}}>
              {timeline.timelineId} — Status: <strong style={{color: '#38bdf8'}}>{timeline.currentStatus}</strong>, Integrity:{' '}
              <strong style={{color: '#10b981'}}>{timeline.healthIndicator}%</strong>
              {timeline.sealedState ? ' [SEALED]' : ''}
            </p>
          ) : (
            <p style={{margin: 0, color: '#64748b'}}>No timeline state recorded for this era yet.</p>
          )}
        </div>

        <SanityLive />
      </main>
    </div>
  )
}
