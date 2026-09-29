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

async function reset() {
  console.log('Resetting 2026 Vault hidden compartment to sealed...');
  await client.patch('room-vault-2026').set({
    'hiddenCompartments[_key=="north-wall-compartment"].revealed': false,
    structuralState: 'damaged'
  }).unset(['hiddenCompartments[_key=="north-wall-compartment"].triggeredBy']).commit();

  console.log('Resetting 1920 Brass Key to visible...');
  await client.patch('obj-brass-key').set({
    state: 'visible',
    description: "An intricately forged brass clockmaker's key. Its teeth match the celestial locking mechanism."
  }).commit();

  console.log('Resetting Chronos Core to hidden...');
  await client.patch('obj-chronos-core').set({
    state: 'hidden'
  }).commit();

  console.log('Resetting timeline states...');
  await client.patch('timeline-2026').set({
    currentStatus: 'fluctuating',
    healthIndicator: 82,
    sealedState: false
  }).commit();

  console.log('Cleaning up temporary actions and transitions...');
  await client.delete({ query: '*[_type in ["temporalAction", "workflowTransition"]]' });

  console.log('=== VAULT SUCCESSFULLY RESET TO INITIAL DEMO STATE ===');
}

reset().catch(console.error);
