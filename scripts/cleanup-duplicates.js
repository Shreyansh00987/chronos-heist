const fs = require('fs');
const lines = fs.readFileSync('.env.local', 'utf8').split(/\r?\n/);
const env = {};
for (const l of lines) {
  const idx = l.indexOf('=');
  if (idx > 0) env[l.slice(0, idx).trim()] = l.slice(idx + 1).trim();
}

const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: env.SANITY_API_WRITE_TOKEN,
});

async function cleanup() {
  console.log('Unsetting references on old rooms...');
  const oldRooms = await client.fetch('*[_type == "room" && !(_id in ["room-vault-1920", "room-vault-1970", "room-vault-2026"])]{_id}');
  for (const r of oldRooms) {
    await client.patch(r._id).unset(['hiddenCompartments', 'objects', 'linkedRooms', 'timelineState', 'era']).commit();
  }

  const oldObjects = await client.fetch('*[_type == "gameObject" && !(string::startsWith(_id, "obj-"))]{_id}');
  for (const o of oldObjects) {
    await client.patch(o._id).unset(['currentLocation', 'originEra']).commit();
  }

  const oldTransitions = await client.fetch('*[_type == "workflowTransition"]{_id}');
  for (const t of oldTransitions) {
    await client.delete(t._id);
  }

  const oldActions = await client.fetch('*[_type == "temporalAction"]{_id}');
  for (const a of oldActions) {
    await client.delete(a._id);
  }

  for (const r of oldRooms) {
    await client.delete(r._id);
  }

  for (const o of oldObjects) {
    await client.delete(o._id);
  }

  const oldTimelines = await client.fetch('*[_type == "timelineState" && !(_id in ["timeline-1920", "timeline-1970", "timeline-2026"])]{_id}');
  for (const ts of oldTimelines) {
    await client.delete(ts._id);
  }

  const oldEras = await client.fetch('*[_type == "era" && !(_id in ["era-1920", "era-1970", "era-2026"])]{_id}');
  for (const e of oldEras) {
    await client.delete(e._id);
  }

  console.log('Successfully cleaned all legacy documents!');
}

cleanup().catch(console.error);
