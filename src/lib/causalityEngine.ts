import {createClient} from 'next-sanity'
import {apiVersion, dataset, projectId} from '@/sanity/env'

const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

export interface CausalityResult {
  impact: 'structural' | 'metaphysical' | 'temporal_paradox' | 'subtle'
  confidence: number
  affectedRooms: string[]
  changes: Array<{
    target: string
    change: string
  }>
  reasoning: string
}

/**
 * Server-side Causality Engine
 * Follows the 5-stage temporal workflow:
 * PAST ACTION COMMITTED -> CAUSALITY AGENT -> FUTURE STATE RECALCULATION -> GAME MASTER REVIEW -> TIMELINE SEALED
 */
export async function executeCausalityWorkflow(actionId: string): Promise<CausalityResult> {
  // 1. Fetch action and target object details
  const action = await writeClient.fetch(
    `*[_type == "temporalAction" && _id == $actionId][0]{
      _id,
      description,
      actionType,
      sourceEra->{_id, name, year, order},
      targetObject->{
        _id,
        name,
        objectType,
        currentLocation->{
          _id,
          name,
          era->{_id, name, year, order},
          linkedRooms[]->{
            _id,
            name,
            era->{_id, name, year, order},
            hiddenCompartments
          }
        }
      }
    }`,
    {actionId},
  )

  if (!action?._id) {
    throw new Error(`Temporal action ${actionId} not found in Sanity Content Lake.`)
  }

  const sourceRoom = action.targetObject?.currentLocation
  if (!sourceRoom?._id || !sourceRoom.era) {
    throw new Error('Target object has no valid room or era reference.')
  }

  // Find downstream future rooms
  const futureRooms = (sourceRoom.linkedRooms || []).filter(
    (r: any) => (r.era?.order ?? -1) > (sourceRoom.era?.order ?? -1),
  )

  // 2. Stage 1: Commit Action in Sanity
  await writeClient
    .patch(action._id)
    .set({
      causalityStatus: 'committed',
      affectedRooms: futureRooms.map((r: any) => ({
        _type: 'reference',
        _ref: r._id,
        _key: `aff-${r._id}`,
      })),
    })
    .commit()

  // 3. Stage 2: Create Workflow Transition (PAST_ACTION_COMMITTED)
  const transition = await writeClient.create({
    _type: 'workflowTransition',
    sourceAction: {_type: 'reference', _ref: action._id},
    transitionState: 'PAST_ACTION_COMMITTED',
  })

  // 4. Calculate Consequential Mutations
  const calculatedChanges: Array<{
    _type: 'calculatedChange'
    _key: string
    targetDocument: {_type: 'reference'; _ref: string}
    changeSummary: string
  }> = []

  let changeCounter = 0

  for (const r of futureRooms) {
    changeCounter += 1
    const unrevealed = (r.hiddenCompartments || []).filter((c: any) => !c.revealed)

    // Reveal hidden compartment if present
    for (const comp of unrevealed) {
      await writeClient
        .patch(r._id)
        .set({
          [`hiddenCompartments[_key=="${comp._key}"].revealed`]: true,
          [`hiddenCompartments[_key=="${comp._key}"].triggeredBy`]: {
            _type: 'reference',
            _ref: action._id,
          },
          structuralState: 'fissure',
        })
        .commit()

      calculatedChanges.push({
        _type: 'calculatedChange',
        _key: `change-${changeCounter}`,
        targetDocument: {_type: 'reference', _ref: r._id},
        changeSummary: `Materialized hidden compartment "${comp.label}" in ${r.name} (${r.era?.name || 'Future'})`,
      })
    }

    // In 2026, also set the Chronos Core object state to discovered!
    if (r.era?.year === 2026) {
      const coreObject = await writeClient.fetch(
        `*[_type == "gameObject" && _id == "obj-chronos-core"][0]._id`,
      )
      if (coreObject) {
        await writeClient
          .patch('obj-chronos-core')
          .set({state: 'discovered', interactable: true})
          .commit()

        calculatedChanges.push({
          _type: 'calculatedChange',
          _key: `change-core`,
          targetDocument: {_type: 'reference', _ref: 'obj-chronos-core'},
          changeSummary: 'The Chronos Core Cylinder became reachable inside the north fissure!',
        })
      }
    }
  }

  // 5. Update Target Object State in 1920 (e.g. buried/moved)
  if (action.targetObject?._id) {
    await writeClient
      .patch(action.targetObject._id)
      .set({
        state: 'buried',
        description: 'Embedded deep within the North Wall mortar cavity since 1920.',
      })
      .commit()
  }

  // 6. Check for Paradoxes
  const conflictCount: number = await writeClient.fetch(
    `count(*[_type == "temporalAction" && causalityStatus == "committed" && targetObject._ref == $objId && _id != $actionId])`,
    {objId: action.targetObject?._id, actionId: action._id},
  )

  let paradoxRef: {_type: 'reference'; _ref: string} | null = null
  if (conflictCount > 0) {
    const p = await writeClient.create({
      _type: 'paradox',
      title: `Causal Overlap on ${action.targetObject?.name || 'Object'}`,
      severity: 'moderate',
      description: 'Multiple committed actions modify this object concurrently.',
      sourceAction: {_type: 'reference', _ref: action._id},
      resolutionStatus: 'unresolved',
    })
    paradoxRef = {_type: 'reference', _ref: p._id}
  }

  // 7. Causality Analysis Summary
  const affectedRoomNames = futureRooms.map((r: any) => `${r.name} (${r.era?.year || 'Future'})`)
  const reasoning = `The ${action.targetObject?.name || 'item'} was buried in 1920 inside the north wall mortar. This structural deviation withstood the 1970 conduit renovation, causing electromagnetic field divergence and materializing the secret vault compartment in 2026.`

  const result: CausalityResult = {
    impact: 'structural',
    confidence: 0.94,
    affectedRooms: futureRooms.map((r: any) => r._id),
    changes: calculatedChanges.map((c) => ({
      target: c.targetDocument._ref,
      change: c.changeSummary,
    })),
    reasoning,
  }

  // 8. Progress to Stage 3 & 4 (GAME_MASTER_REVIEW)
  await writeClient
    .patch(transition._id)
    .set({
      transitionState: 'GAME_MASTER_REVIEW',
      agentAnalysis: `${reasoning} Affects ${futureRooms.length} future era(s): ${affectedRoomNames.join(', ')}.`,
      calculatedChanges,
      ...(paradoxRef ? {paradoxFlags: [paradoxRef]} : {}),
    })
    .commit()

  // 9. Update 2026 Timeline State Integrity
  const timeline2026 = await writeClient.fetch(
    `*[_type == "timelineState" && era->year == 2026][0]._id`,
  )
  if (timeline2026) {
    await writeClient
      .patch(timeline2026)
      .set({
        currentStatus: 'fluctuating',
        healthIndicator: 88,
        lastCommittedAction: {_type: 'reference', _ref: action._id},
      })
      .commit()
  }

  return result
}

/**
 * Approve Game Master Review and Seal Timeline
 */
export async function approveAndSealTimeline(transitionId?: string): Promise<{success: boolean; sealedEra: number}> {
  // Find transition
  const query = transitionId
    ? `*[_type == "workflowTransition" && _id == $transitionId][0]`
    : `*[_type == "workflowTransition" && transitionState == "GAME_MASTER_REVIEW"] | order(_createdAt desc)[0]`

  const transition = await writeClient.fetch(
    `${query}{
      _id,
      sourceAction->{
        _id,
        sourceEra->{_id, year}
      }
    }`,
    transitionId ? {transitionId} : {},
  )

  if (!transition?._id) {
    throw new Error('No pending Game Master review transition found.')
  }

  const eraYear = transition.sourceAction?.sourceEra?.year ?? 2026
  const eraId = transition.sourceAction?.sourceEra?._id

  // 1. Mark transition as TIMELINE_SEALED
  await writeClient
    .patch(transition._id)
    .set({
      transitionState: 'TIMELINE_SEALED',
      finalSealedState: true,
      gmApproval: {
        approved: true,
        approvedAt: new Date().toISOString(),
      },
    })
    .commit()

  // 2. Seal all timelineState documents
  const timelineStates: Array<{_id: string}> = await writeClient.fetch(
    `*[_type == "timelineState"]{_id}`,
  )

  for (const ts of timelineStates) {
    await writeClient
      .patch(ts._id)
      .set({
        currentStatus: 'sealed',
        healthIndicator: 100,
        sealedState: true,
        lastCommittedAction: {_type: 'reference', _ref: transition.sourceAction._id},
      })
      .commit()
  }

  // 3. Mark unresolved paradoxes as resolved
  const paradoxes: Array<{_id: string}> = await writeClient.fetch(
    `*[_type == "paradox" && resolutionStatus == "unresolved"]{_id}`,
  )
  for (const p of paradoxes) {
    await writeClient
      .patch(p._id)
      .set({
        resolutionStatus: 'resolved',
        gmNotes: 'Stabilized by Game Master authorization. Timeline sealed.',
      })
      .commit()
  }

  return {success: true, sealedEra: eraYear}
}
