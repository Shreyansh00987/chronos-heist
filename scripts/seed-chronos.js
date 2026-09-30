const fs = require('fs');
const https = require('https');

const lines = fs.readFileSync('.env.local', 'utf8').split(/\r?\n/);
const env = {};
for (const l of lines) {
  const idx = l.indexOf('=');
  if (idx > 0) {
    let val = l.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[l.slice(0, idx).trim()] = val;
  }
}

const projectId = env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = env.NEXT_PUBLIC_SANITY_DATASET;
const token = env.SANITY_API_WRITE_TOKEN;

function sanityMutate(mutations) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ mutations });
    const req = https.request({
      hostname: `${projectId}.api.sanity.io`,
      path: `/v2024-01-01/data/mutate/${dataset}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`Sanity HTTP ${res.statusCode}: ${body}`));
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function seed() {
  console.log('Seeding Chronos-Heist into Sanity Lake...');

  const docs = [
    // 1. ERAS
    {
      _id: 'era-1920',
      _type: 'era',
      name: 'The Origin',
      year: 1920,
      order: 1,
      description: 'The golden age of mechanical clocks. Hand-carved walnut walls, ticking pendulums, brass locks, and cold case archives.',
      visualTheme: {
        primaryColor: '#d97706',
        ambiance: 'gaslight amber, ticking gears, sepia shadows'
      }
    },
    {
      _id: 'era-1970',
      _type: 'era',
      name: 'The Echo',
      year: 1970,
      order: 2,
      description: 'A Cold-War era electronics research lab. Cathode monitors, reel-to-reel magnetic tapes, and reinforced conduits.',
      visualTheme: {
        primaryColor: '#06b6d4',
        ambiance: 'oscilloscope phosphor, hum of vacuum tubes, analog static'
      }
    },
    {
      _id: 'era-2026',
      _type: 'era',
      name: 'The Consequence',
      year: 2026,
      order: 3,
      description: 'A fortified cyber-temporal research bunker. Quantum terminals, biometric laser tripwires, and fractured timeline anomalies.',
      visualTheme: {
        primaryColor: '#a855f7',
        ambiance: 'neon violet, quantum cooling hiss, holographic glitch'
      }
    },

    // 2. TIMELINE STATES
    {
      _id: 'timeline-1920',
      _type: 'timelineState',
      timelineId: 'era-1920',
      era: { _type: 'reference', _ref: 'era-1920' },
      currentStatus: 'stable',
      healthIndicator: 98,
      sealedState: false
    },
    {
      _id: 'timeline-1970',
      _type: 'timelineState',
      timelineId: 'era-1970',
      era: { _type: 'reference', _ref: 'era-1970' },
      currentStatus: 'stable',
      healthIndicator: 94,
      sealedState: false
    },
    {
      _id: 'timeline-2026',
      _type: 'timelineState',
      timelineId: 'era-2026',
      era: { _type: 'reference', _ref: 'era-2026' },
      currentStatus: 'fluctuating',
      healthIndicator: 82,
      sealedState: false
    },

    // 3. ROOMS
    {
      _id: 'room-vault-1920',
      _type: 'room',
      name: "The Clockmaker's Vault (1920)",
      era: { _type: 'reference', _ref: 'era-1920' },
      linkedRooms: [
        { _type: 'reference', _ref: 'room-vault-1970', _key: 'link-70' },
        { _type: 'reference', _ref: 'room-vault-2026', _key: 'link-26' }
      ],
      description: 'A dimly lit secret vault room beneath the clocktower. Ticking pendulums reverberate through the floor.',
      historicalNotes: 'Built in 1918 by master horologist Valerius to conceal prototypes of temporal chronometers.',
      structuralState: 'intact',
      timelineState: { _type: 'reference', _ref: 'timeline-1920' },
      visualConfig: {
        ambientColor: '#2d1804',
        accentColor: '#d97706',
        environmentPreset: 'steampunk_sepia'
      },
      hiddenCompartments: [
        {
          _key: 'hollow-1920',
          label: 'North Wall Lime Mortar Cavity',
          revealed: false,
          contentsDescription: 'A loose brick cavity allowing an object to be buried.',
          position: { x: 48, y: 22 }
        }
      ]
    },
    {
      _id: 'room-vault-1970',
      _type: 'room',
      name: "The Clockmaker's Vault (1970)",
      era: { _type: 'reference', _ref: 'era-1970' },
      linkedRooms: [
        { _type: 'reference', _ref: 'room-vault-1920', _key: 'link-20' },
        { _type: 'reference', _ref: 'room-vault-2026', _key: 'link-26' }
      ],
      description: 'Requisitioned by Project Chronos in 1968. Wood panelling replaced with acoustic tiles and heavy cables.',
      historicalNotes: 'Renovation crews noted strange thermal fluctuations along the north wall.',
      structuralState: 'reconstructed',
      timelineState: { _type: 'reference', _ref: 'timeline-1970' },
      visualConfig: {
        ambientColor: '#03232a',
        accentColor: '#06b6d4',
        environmentPreset: 'analog_cyan'
      },
      hiddenCompartments: [
        {
          _key: 'conduit-1970',
          label: 'Electrical Conduit Junction',
          revealed: false,
          contentsDescription: 'High-voltage junction concealing older wall structures.',
          position: { x: 48, y: 22 }
        }
      ]
    },
    {
      _id: 'room-vault-2026',
      _type: 'room',
      name: "The Clockmaker's Vault (2026)",
      era: { _type: 'reference', _ref: 'era-2026' },
      linkedRooms: [
        { _type: 'reference', _ref: 'room-vault-1920', _key: 'link-20' },
        { _type: 'reference', _ref: 'room-vault-1970', _key: 'link-70' }
      ],
      description: 'An abandoned black-site archive. Biometric laser tripwires protect the perimeter, but the north wall shows signs of temporal resonance.',
      historicalNotes: 'Timeline stability collapsed during the 2024 rupture. The north wall is experiencing tachyon decay.',
      structuralState: 'damaged',
      timelineState: { _type: 'reference', _ref: 'timeline-2026' },
      visualConfig: {
        ambientColor: '#170624',
        accentColor: '#a855f7',
        environmentPreset: 'cyber_synth'
      },
      hiddenCompartments: [
        {
          _key: 'north-wall-compartment',
          label: 'North Wall Resonance Compartment',
          revealed: false,
          contentsDescription: 'Materializes only when past causal actions alter the mortar cavity.',
          position: { x: 48, y: 22 }
        }
      ]
    },

    // 4. GAME OBJECTS (15 Items across 3 Eras)
    // 1920
    {
      _id: 'obj-brass-key',
      _type: 'gameObject',
      name: 'Antique Brass Vault Key',
      description: "An intricately forged brass clockmaker's key. Its teeth match the celestial locking mechanism.",
      objectType: 'key',
      currentLocation: { _type: 'reference', _ref: 'room-vault-1920' },
      originEra: { _type: 'reference', _ref: 'era-1920' },
      state: 'visible',
      interactable: true,
      position: { x: 26, y: 68, z: 2 },
      icon: 'key',
      affectsCausality: true,
      causalRules: 'Burying this key inside the North Wall mortar cavity causes it to survive through 1970 and unlock the hidden chamber in 2026.'
    },
    {
      _id: 'obj-clockmakers-journal',
      _type: 'gameObject',
      name: "Clockmaker's Secret Ledger",
      description: "Handwritten journal by Valerius. Entry 1920: 'If the Chronos Core is discovered, I will entomb the key within the north wall stones.'",
      objectType: 'document',
      currentLocation: { _type: 'reference', _ref: 'room-vault-1920' },
      originEra: { _type: 'reference', _ref: 'era-1920' },
      state: 'visible',
      interactable: true,
      position: { x: 68, y: 72, z: 2 },
      icon: 'scroll',
      affectsCausality: false
    },
    {
      _id: 'obj-grandfather-clock',
      _type: 'gameObject',
      name: 'Celestial Pendulum Clock',
      description: 'A 7-foot tall grandfather clock ticking precisely 1.4 seconds slower than real time.',
      objectType: 'furniture',
      currentLocation: { _type: 'reference', _ref: 'room-vault-1920' },
      originEra: { _type: 'reference', _ref: 'era-1920' },
      state: 'visible',
      interactable: true,
      position: { x: 84, y: 38, z: 1 },
      icon: 'clock',
      affectsCausality: false
    },
    {
      _id: 'obj-north-wall-1920',
      _type: 'gameObject',
      name: 'North Wall Loose Brickwork',
      description: 'A hollow cavity behind the mortar where contraband or keys can be concealed for decades.',
      objectType: 'wall',
      currentLocation: { _type: 'reference', _ref: 'room-vault-1920' },
      originEra: { _type: 'reference', _ref: 'era-1920' },
      state: 'visible',
      interactable: true,
      position: { x: 48, y: 22, z: 1 },
      icon: 'wall',
      affectsCausality: true,
      causalRules: 'Primary causal focal point for timeline divergence.'
    },
    {
      _id: 'obj-safe-dial-1920',
      _type: 'gameObject',
      name: 'Iron Vault Safe',
      description: 'A heavy iron safe with brass rotary dials.',
      objectType: 'furniture',
      currentLocation: { _type: 'reference', _ref: 'room-vault-1920' },
      originEra: { _type: 'reference', _ref: 'era-1920' },
      state: 'visible',
      interactable: true,
      position: { x: 16, y: 34, z: 1 },
      icon: 'safe',
      affectsCausality: false
    },

    // 1970
    {
      _id: 'obj-oscilloscope-1970',
      _type: 'gameObject',
      name: 'Cathode Ray Oscilloscope',
      description: 'Green phosphor screen displaying a 432 Hz standing wave generated by temporal flux.',
      objectType: 'terminal',
      currentLocation: { _type: 'reference', _ref: 'room-vault-1970' },
      originEra: { _type: 'reference', _ref: 'era-1970' },
      state: 'visible',
      interactable: true,
      position: { x: 26, y: 64, z: 2 },
      icon: 'terminal',
      affectsCausality: false
    },
    {
      _id: 'obj-tape-recorder-1970',
      _type: 'gameObject',
      name: 'Reel-to-Reel Audio Log #44',
      description: 'Audio recording: "North wall acoustic scan revealed metallic density embedded in mortar."',
      objectType: 'document',
      currentLocation: { _type: 'reference', _ref: 'room-vault-1970' },
      originEra: { _type: 'reference', _ref: 'era-1970' },
      state: 'visible',
      interactable: true,
      position: { x: 68, y: 70, z: 2 },
      icon: 'tape',
      affectsCausality: false
    },
    {
      _id: 'obj-electrical-junction',
      _type: 'gameObject',
      name: 'High-Voltage Wall Conduit',
      description: 'Soviet-spec armored conduit running across the north masonry.',
      objectType: 'furniture',
      currentLocation: { _type: 'reference', _ref: 'room-vault-1970' },
      originEra: { _type: 'reference', _ref: 'era-1970' },
      state: 'visible',
      interactable: true,
      position: { x: 48, y: 22, z: 1 },
      icon: 'zap',
      affectsCausality: false
    },
    {
      _id: 'obj-cctv-1970',
      _type: 'gameObject',
      name: 'Analog Surveillance Camera',
      description: 'Motorized surveillance camera recording the vault interior.',
      objectType: 'evidence',
      currentLocation: { _type: 'reference', _ref: 'room-vault-1970' },
      originEra: { _type: 'reference', _ref: 'era-1970' },
      state: 'visible',
      interactable: true,
      position: { x: 84, y: 20, z: 1 },
      icon: 'camera',
      affectsCausality: false
    },
    {
      _id: 'obj-transistor-safe',
      _type: 'gameObject',
      name: 'Transistorized Vault Safe',
      description: 'Reinforced 1970 safe with punch-card electronic lock.',
      objectType: 'furniture',
      currentLocation: { _type: 'reference', _ref: 'room-vault-1970' },
      originEra: { _type: 'reference', _ref: 'era-1970' },
      state: 'visible',
      interactable: true,
      position: { x: 16, y: 34, z: 1 },
      icon: 'safe',
      affectsCausality: false
    },

    // 2026
    {
      _id: 'obj-quantum-console',
      _type: 'gameObject',
      name: 'Quantum Surveillance Console',
      description: 'Holographic terminal computing probability waves across timelines.',
      objectType: 'terminal',
      currentLocation: { _type: 'reference', _ref: 'room-vault-2026' },
      originEra: { _type: 'reference', _ref: 'era-2026' },
      state: 'visible',
      interactable: true,
      position: { x: 26, y: 64, z: 2 },
      icon: 'terminal',
      affectsCausality: false
    },
    {
      _id: 'obj-laser-grid',
      _type: 'gameObject',
      name: 'Holographic Laser Grid',
      description: 'Tri-beam security lasers sealing the primary chamber.',
      objectType: 'furniture',
      currentLocation: { _type: 'reference', _ref: 'room-vault-2026' },
      originEra: { _type: 'reference', _ref: 'era-2026' },
      state: 'visible',
      interactable: true,
      position: { x: 16, y: 34, z: 1 },
      icon: 'laser',
      affectsCausality: false
    },
    {
      _id: 'obj-north-wall-2026',
      _type: 'gameObject',
      name: 'North Wall Tachyon Fissure',
      description: 'A structural seam in the wall emitting an eerie violet glow. Ready to materialize hidden compartments.',
      objectType: 'wall',
      currentLocation: { _type: 'reference', _ref: 'room-vault-2026' },
      originEra: { _type: 'reference', _ref: 'era-2026' },
      state: 'visible',
      interactable: true,
      position: { x: 48, y: 22, z: 1 },
      icon: 'wall',
      affectsCausality: false
    },
    {
      _id: 'obj-chronos-core',
      _type: 'gameObject',
      name: 'The Chronos Core Cylinder',
      description: 'The ultimate temporal artifact! Crystalline tachyon containment matrix.',
      objectType: 'artifact',
      currentLocation: { _type: 'reference', _ref: 'room-vault-2026' },
      originEra: { _type: 'reference', _ref: 'era-2026' },
      state: 'hidden',
      interactable: true,
      position: { x: 48, y: 32, z: 3 },
      icon: 'artifact',
      affectsCausality: true
    },
    {
      _id: 'obj-drone-probe',
      _type: 'gameObject',
      name: 'Temporal Recon Drone',
      description: 'Autonomous hovering probe scanning for paradox signatures.',
      objectType: 'evidence',
      currentLocation: { _type: 'reference', _ref: 'room-vault-2026' },
      originEra: { _type: 'reference', _ref: 'era-2026' },
      state: 'visible',
      interactable: true,
      position: { x: 80, y: 44, z: 2 },
      icon: 'drone',
      affectsCausality: false
    },

    // 5. PLAYERS
    {
      _id: 'player-vance',
      _type: 'player',
      name: 'Agent Vance',
      callsign: 'ORIGIN-01',
      role: 'origin_infiltrator',
      assignedEra: { _type: 'reference', _ref: 'era-1920' },
      currentRoom: { _type: 'reference', _ref: 'room-vault-1920' },
      status: 'synchronized'
    },
    {
      _id: 'player-thorne',
      _type: 'player',
      name: 'Dr. Aris Thorne',
      callsign: 'ECHO-02',
      role: 'signal_specialist',
      assignedEra: { _type: 'reference', _ref: 'era-1970' },
      currentRoom: { _type: 'reference', _ref: 'room-vault-1970' },
      status: 'synchronized'
    },
    {
      _id: 'player-nova',
      _type: 'player',
      name: 'Cipher Nova',
      callsign: 'NEXUS-03',
      role: 'cyber_operator',
      assignedEra: { _type: 'reference', _ref: 'era-2026' },
      currentRoom: { _type: 'reference', _ref: 'room-vault-2026' },
      status: 'synchronized'
    },

    // 6. GAME SESSION
    {
      _id: 'session-alpha',
      _type: 'gameSession',
      sessionCode: 'CHRONOS-ALPHA',
      title: "Operation Chronos: The Clockmaker's Vault",
      currentMission: 'Recover the Chronos Core: Bury the Brass Key in the 1920 North Wall to materialize the hidden compartment in 2026.',
      players: [
        { _type: 'reference', _ref: 'player-vance', _key: 'p1' },
        { _type: 'reference', _ref: 'player-thorne', _key: 'p2' },
        { _type: 'reference', _ref: 'player-nova', _key: 'p3' }
      ],
      playerNames: ['Agent Vance', 'Dr. Aris Thorne', 'Cipher Nova'],
      activeTimeline: { _type: 'reference', _ref: 'timeline-2026' },
      currentEra: { _type: 'reference', _ref: 'era-1920' },
      currentRoom: { _type: 'reference', _ref: 'room-vault-1920' },
      sessionStatus: 'active',
      startTime: new Date().toISOString()
    },

    // 7. INITIAL PARADOX
    {
      _id: 'paradox-disp',
      _type: 'paradox',
      title: 'Tachyon Resonance Echo: North Wall Displacement',
      severity: 'moderate',
      description: 'Historical records in 1970 and 2026 indicate an impending causal divergence originating from a potential 1920 alteration.',
      resolutionStatus: 'unresolved',
      affectedDocuments: [
        { _type: 'reference', _ref: 'room-vault-1920', _key: 'r1' },
        { _type: 'reference', _ref: 'room-vault-2026', _key: 'r2' }
      ]
    },

    // 8. CAUSALITY LINK
    {
      _id: 'link-key-vault',
      _type: 'causalityLink',
      sourceEra: { _type: 'reference', _ref: 'era-1920' },
      targetEra: { _type: 'reference', _ref: 'era-2026' },
      relationshipType: 'reveals',
      strength: 95,
      explanation: 'Burying the Antique Brass Key in the 1920 North Wall preserves it through the 1970 renovation, causing the secret compartment to materialize in the 2026 vault.'
    },

    // 9. CLUES & INVESTIGATION EVIDENCE
    {
      _id: 'clue-safe-cipher',
      _type: 'clue',
      title: "The Horologist's Safe Combination",
      description: "A secret sequence engraved behind the celestial pendulum: '19 - 70 - 26' representing the three temporal coordinates.",
      location: { _type: 'reference', _ref: 'room-vault-1920' },
      discoveryState: 'discovered',
      relatedObjects: [{ _type: 'reference', _ref: 'obj-safe-dial-1920', _key: 'c1' }]
    },
    {
      _id: 'clue-mortar-void',
      _type: 'clue',
      title: "Lime Mortar Degradation Analysis",
      description: "1920 Ledger Note: 'The mortar along the north vault stones is intentionally porous, allowing an artifact to rest unharmed across decades.'",
      location: { _type: 'reference', _ref: 'room-vault-1920' },
      discoveryState: 'discovered',
      relatedObjects: [{ _type: 'reference', _ref: 'obj-brass-key', _key: 'c2' }, { _type: 'reference', _ref: 'obj-north-wall-1920', _key: 'c3' }]
    },
    {
      _id: 'clue-resonance-shift',
      _type: 'clue',
      title: "432 Hz Standing Wave Anomaly",
      description: "1970 Tape Log #44: 'Acoustic resonance spikes at 432 Hz whenever current runs through the north junction conduit.'",
      location: { _type: 'reference', _ref: 'room-vault-1970' },
      discoveryState: 'discovered',
      relatedObjects: [{ _type: 'reference', _ref: 'obj-oscilloscope-1970', _key: 'c4' }]
    },
    {
      _id: 'clue-chronos-core',
      _type: 'clue',
      title: "Tachyon Matrix Coordinates",
      description: "2026 Quantum Scan: 'Tachyon density in the north fissure reaches peak coherence when past timeline divergence is sealed.'",
      location: { _type: 'reference', _ref: 'room-vault-2026' },
      discoveryState: 'discovered',
      relatedObjects: [{ _type: 'reference', _ref: 'obj-chronos-core', _key: 'c5' }]
    }
  ];

  // Also update room objects arrays
  const room1920Objects = [
    { _type: 'reference', _ref: 'obj-brass-key', _key: 'o1' },
    { _type: 'reference', _ref: 'obj-clockmakers-journal', _key: 'o2' },
    { _type: 'reference', _ref: 'obj-grandfather-clock', _key: 'o3' },
    { _type: 'reference', _ref: 'obj-north-wall-1920', _key: 'o4' },
    { _type: 'reference', _ref: 'obj-safe-dial-1920', _key: 'o5' }
  ];
  const room1970Objects = [
    { _type: 'reference', _ref: 'obj-oscilloscope-1970', _key: 'o1' },
    { _type: 'reference', _ref: 'obj-tape-recorder-1970', _key: 'o2' },
    { _type: 'reference', _ref: 'obj-electrical-junction', _key: 'o3' },
    { _type: 'reference', _ref: 'obj-cctv-1970', _key: 'o4' },
    { _type: 'reference', _ref: 'obj-transistor-safe', _key: 'o5' }
  ];
  const room2026Objects = [
    { _type: 'reference', _ref: 'obj-quantum-console', _key: 'o1' },
    { _type: 'reference', _ref: 'obj-laser-grid', _key: 'o2' },
    { _type: 'reference', _ref: 'obj-north-wall-2026', _key: 'o3' },
    { _type: 'reference', _ref: 'obj-chronos-core', _key: 'o4' },
    { _type: 'reference', _ref: 'obj-drone-probe', _key: 'o5' }
  ];

  docs.find(d => d._id === 'room-vault-1920').objects = room1920Objects;
  docs.find(d => d._id === 'room-vault-1970').objects = room1970Objects;
  docs.find(d => d._id === 'room-vault-2026').objects = room2026Objects;

  const mutations = docs.map(doc => ({ createOrReplace: doc }));

  console.log(`Sending ${mutations.length} createOrReplace mutations to Sanity...`);
  const result = await sanityMutate(mutations);
  console.log('Seeding successful! Transaction ID:', result.transactionId);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
