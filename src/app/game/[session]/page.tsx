import {client} from '@/sanity/lib/client'
import {NavigationHeader} from '@/components/NavigationHeader'
import {VaultRoomView} from '@/components/VaultRoomView'
import {HowItWorksPanel} from '@/components/HowItWorksPanel'
import {SanityLive} from '@/sanity/lib/live'

export const dynamic = 'force-dynamic'

export default async function GamePage({params}: {params: Promise<{session: string}>}) {
  const {session} = await params
  const sessionCode = session || 'CHRONOS-ALPHA'

  const [eras, rooms, timelines, pendingAction, clues] = await Promise.all([
    client.fetch<any[]>(`*[_type == "era"] | order(order asc){
      _id,
      name,
      year,
      description
    }`),
    client.fetch<any[]>(`*[_type == "room"]{
      _id,
      name,
      structuralState,
      description,
      historicalNotes,
      era->{year, name},
      visualConfig,
      hiddenCompartments[]{
        _key,
        label,
        revealed,
        contentsDescription,
        position
      },
      objects[]->{
        _id,
        name,
        description,
        objectType,
        state,
        interactable,
        position,
        icon,
        affectsCausality,
        causalRules
      }
    }`),
    client.fetch<any[]>(`*[_type == "timelineState"]{
      _id,
      timelineId,
      currentStatus,
      healthIndicator,
      sealedState,
      era->{year}
    }`),
    client.fetch<any>(`*[_type == "temporalAction" && causalityStatus == "pending"] | order(_createdAt desc)[0]{
      description,
      sourceEra->{year}
    }`),
    client.fetch<any[]>(`*[_type == "clue"]{
      _id,
      title,
      description,
      discoveryState,
      location->{
        name,
        era->{year}
      }
    }`),
  ])

  // Index rooms and timelines by year
  const roomsByEra: Record<number, any> = {}
  rooms.forEach((r) => {
    if (r.era?.year) roomsByEra[r.era.year] = r
  })

  const timelinesByEra: Record<number, any> = {}
  timelines.forEach((t) => {
    if (t.era?.year) timelinesByEra[t.era.year] = t
  })

  return (
    <div style={{minHeight: '100vh', background: '#07090e', color: '#e2e8f0', display: 'flex', flexDirection: 'column'}}>
      <NavigationHeader sessionCode={sessionCode} />

      <main style={{maxWidth: '1400px', margin: '0 auto', padding: '1.5rem', width: '100%', flex: 1}}>
        <VaultRoomView
          eras={eras}
          roomsByEra={roomsByEra}
          timelinesByEra={timelinesByEra}
          pendingAction={pendingAction}
          clues={clues}
          sessionCode={sessionCode}
        />

        <HowItWorksPanel />
      </main>

      <SanityLive />
    </div>
  )
}
