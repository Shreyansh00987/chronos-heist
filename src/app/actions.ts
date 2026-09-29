'use server'

import {createClient} from 'next-sanity'
import {revalidatePath} from 'next/cache'

import {apiVersion, dataset, projectId} from '@/sanity/env'
import {executeCausalityWorkflow, approveAndSealTimeline} from '@/lib/causalityEngine'

const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

export async function proposeTemporalAction(formData: FormData) {
  const objectId = formData.get('objectId') as string
  const actionType = (formData.get('actionType') as string) || 'hide'
  const customDescription = formData.get('description') as string

  if (!objectId) {
    throw new Error('Missing target object ID.')
  }

  const object = await writeClient.fetch(
    `*[_type == "gameObject" && _id == $objectId][0]{
      _id,
      name,
      currentLocation->{
        _id,
        name,
        era->{_id, year}
      }
    }`,
    {objectId},
  )

  if (!object?._id || !object.currentLocation?.era?._id) {
    throw new Error("Could not resolve the selected object's location or era.")
  }

  const desc = customDescription || `Bury the ${object.name} inside the North Wall mortar cavity`

  const action = await writeClient.create({
    _type: 'temporalAction',
    description: desc,
    sourceEra: {_type: 'reference', _ref: object.currentLocation.era._id},
    targetObject: {_type: 'reference', _ref: object._id},
    actionType,
    causalityStatus: 'pending',
    timestamp: new Date().toISOString(),
    paradoxRisk: 'medium',
  })

  revalidatePath('/')
  revalidatePath('/game/demo-session')
  revalidatePath('/gm/demo-session')
  return action
}

export async function commitCausality(actionId?: string) {
  let targetActionId = actionId
  if (!targetActionId) {
    const pendingAction = await writeClient.fetch(
      `*[_type == "temporalAction" && causalityStatus == "pending"] | order(_createdAt desc)[0]._id`,
    )
    targetActionId = pendingAction
  }

  if (!targetActionId) {
    throw new Error('No pending temporal actions to commit.')
  }

  const result = await executeCausalityWorkflow(targetActionId)

  revalidatePath('/')
  revalidatePath('/game/demo-session')
  revalidatePath('/gm/demo-session')
  revalidatePath('/causality')
  return result
}

export async function approveGameMasterReview(transitionId?: string) {
  const result = await approveAndSealTimeline(transitionId)

  revalidatePath('/')
  revalidatePath('/game/demo-session')
  revalidatePath('/gm/demo-session')
  revalidatePath('/causality')
  return result
}

/**
 * Autonomous Full Causal Demo Trigger
 * Executes the complete judge demo flow:
 * 1. Simulates 1920 Brass Key action
 * 2. Writes action to Sanity
 * 3. Executes server-side causality engine
 * 4. Recalculates 2026 future state and reveals secret compartment
 * 5. Creates workflow transitions
 */
export async function executeDemoRun() {
  // 1. Propose Action in 1920
  const action = await writeClient.create({
    _type: 'temporalAction',
    description: 'Bury the Antique Brass Vault Key inside the 1920 North Wall cavity',
    sourceEra: {_type: 'reference', _ref: 'era-1920'},
    targetObject: {_type: 'reference', _ref: 'obj-brass-key'},
    actionType: 'bury',
    causalityStatus: 'pending',
    timestamp: new Date().toISOString(),
    paradoxRisk: 'low',
  })

  // 2. Execute Causality Pipeline
  const result = await executeCausalityWorkflow(action._id)

  revalidatePath('/')
  revalidatePath('/game/demo-session')
  revalidatePath('/gm/demo-session')
  revalidatePath('/causality')

  return {action, result}
}

export async function resetDemoData() {
  // 1. Reset Timeline States
  const timelineStates: Array<{_id: string; timelineId?: string}> = await writeClient.fetch(
    `*[_type == "timelineState"]{_id, timelineId}`,
  )
  for (const ts of timelineStates) {
    await writeClient
      .patch(ts._id)
      .unset(['activeParadoxes', 'lastCommittedAction'])
      .set({
        currentStatus: ts.timelineId === 'era-2026' ? 'fluctuating' : 'stable',
        healthIndicator: ts.timelineId === 'era-2026' ? 82 : 96,
        sealedState: false,
      })
      .commit()
  }

  // 2. Reset Rooms & Hidden Compartments
  const rooms: Array<{
    _id: string
    era?: {year?: number}
    hiddenCompartments?: Array<{_key: string}>
  }> = await writeClient.fetch(`*[_type == "room"]{_id, era->{year}, hiddenCompartments}`)

  for (const r of rooms) {
    const patch = writeClient.patch(r._id).set({
      structuralState: r.era?.year === 1920 ? 'intact' : r.era?.year === 1970 ? 'reconstructed' : 'damaged',
    })
    if (r.hiddenCompartments?.length) {
      const setOps: Record<string, unknown> = {}
      const unsetPaths: string[] = []
      for (const c of r.hiddenCompartments) {
        setOps[`hiddenCompartments[_key=="${c._key}"].revealed`] = false
        unsetPaths.push(`hiddenCompartments[_key=="${c._key}"].triggeredBy`)
      }
      patch.set(setOps)
      patch.unset(unsetPaths)
    }
    await patch.commit()
  }

  // 3. Reset Game Objects (Key & Core)
  await writeClient
    .patch('obj-brass-key')
    .set({
      state: 'visible',
      description: "An intricately forged brass clockmaker's key. Its teeth match the celestial locking mechanism.",
    })
    .commit()

  await writeClient
    .patch('obj-chronos-core')
    .set({
      state: 'hidden',
    })
    .commit()

  // 4. Clean up transitions & temporary actions
  await writeClient.delete({query: '*[_type == "workflowTransition"]'})
  await writeClient.delete({query: '*[_type == "temporalAction"]'})
  await writeClient.delete({query: '*[_type == "paradox" && _id != "paradox-disp"]'})

  revalidatePath('/')
  revalidatePath('/game/demo-session')
  revalidatePath('/gm/demo-session')
  revalidatePath('/causality')

  return {success: true}
}
