# CHRONOS-HEIST
> **A Playable Temporal Mystery Game Powered by Sanity Content Lake**

[![Live Demo](https://img.shields.io/badge/LIVE%20DEMO-chronos--heist.vercel.app-00DF8F?style=for-the-badge&logo=vercel&logoColor=black)](https://chronos-heist.vercel.app)
[![Play 3D Vault](https://img.shields.io/badge/PLAY%20NOW-ENTER%20VAULT-FFB800?style=for-the-badge&logo=three.js&logoColor=black)](https://chronos-heist.vercel.app/game/CHRONOS-ALPHA)
[![Demo Video](https://img.shields.io/badge/DEMO%20VIDEO-1%20MIN%20AI%20VOICEOVER-7928CA?style=for-the-badge&logo=youtube&logoColor=white)](https://chronos-heist.vercel.app/chronos_heist_demo.mp4)
[![Sanity Powered](https://img.shields.io/badge/SANITY-CONTENT%20LAKE-F03E2F?style=for-the-badge&logo=sanity&logoColor=white)](https://chronos-heist.vercel.app/studio)

### 🚀 **Live Production Deployment**: [https://chronos-heist.vercel.app](https://chronos-heist.vercel.app)
- 🎬 **1-Min AI Demo Video (1080p)**: [Watch / Download Video](https://chronos-heist.vercel.app/chronos_heist_demo.mp4)
- 🎮 **Direct 3D Room Play**: [https://chronos-heist.vercel.app/game/CHRONOS-ALPHA](https://chronos-heist.vercel.app/game/CHRONOS-ALPHA)
- 🛡️ **Game Master Center**: [https://chronos-heist.vercel.app/gm/CHRONOS-ALPHA](https://chronos-heist.vercel.app/gm/CHRONOS-ALPHA)
- ⚡ **D3 Causality Graph**: [https://chronos-heist.vercel.app/causality](https://chronos-heist.vercel.app/causality)
- 🎛️ **Sanity Studio Live**: [https://chronos-heist.vercel.app/studio](https://chronos-heist.vercel.app/studio)

---

## 🕰️ What is Chronos-Heist?

**Chronos-Heist** is a multi-era temporal mystery game where **changing the past changes the future in real time**. 

Three distinct historical iterations of the same physical location—**The Clockmaker's Vault**—exist concurrently:
* **1920 (The Origin)**: Mechanical clocks, ticking pendulums, gaslight amber tones, antique brass keys, and cold case archives.
* **1970 (The Echo)**: A Cold War electronics retrofit featuring cathode oscilloscopes, reel-to-reel magnetic tapes, and armored industrial conduits.
* **2026 (The Consequence)**: An abandoned cyber-temporal bunker protected by biometric laser grids, quantum surveillance terminals, and tachyon fissures.

### The Central Mechanic
> Changing the past propagates causal mutations to downstream eras with **zero page refresh**.
When a player in 1920 buries an **Antique Brass Vault Key** inside the North Wall mortar cavity:
1. A real `temporalAction` document is committed to Sanity Content Lake.
2. The server-side **Causality Engine** evaluates cross-era dependencies via `causalityLink` relationships.
3. The 1970 conduit records an anomalous density reading.
4. The 2026 vault receives an immediate transactional patch revealing a **hidden compartment** and exposing the legendary **Chronos Core Cylinder**.
5. The Game Master command center authorizes the timeline transition and seals history.

---

## 🏛️ Why Sanity?

Traditional games rely on in-memory state or rigid SQL databases. But temporal causality is fundamentally about **structured content relationships across time**:
* **Every piece of the game world is content**: Rooms, objects, eras, actions, causal rules, paradoxes, and timeline health states are all first-class Sanity documents.
* **Authoritative Truth**: Sanity Content Lake serves as the single immutable source of temporal truth. No state is faked or hardcoded in React.
* **Real-time Event Lake**: Sanity's Live Query engine propagates causal mutations to all connected clients across eras instantly.
* **Content Modeling Depth**: Relational references (`_ref`) allow the Causality Engine to follow physical space across time (`room.linkedRooms`) rather than relying on brittle string matching.

---

## 📐 System Architecture

```text
Next.js 16 (App Router + Turbopack)
       ↓
Sanity Content Lake (Live Query & Document Store)
       ↓
Temporal Actions (`temporalAction`)
       ↓
Server-Side Causality Engine (`src/lib/causalityEngine.ts`)
       ↓
Authoritative Document Mutations (Rooms & Game Objects)
       ↓
Workflow Transitions (`workflowTransition`: PAST_ACTION_COMMITTED → GAME_MASTER_REVIEW → TIMELINE_SEALED)
       ↓
Real-Time Live UI (`<SanityLive />` + D3 Causality Graph)
       ↓
Game Master Authorization (`/gm/[session]`)
```

---

## 🔍 Deep Sanity Features Used

1. **Content Lake & Document Store**: Authoritative storage of 30+ interconnected documents (`era`, `room`, `gameObject`, `temporalAction`, `causalityLink`, `paradox`, `timelineState`, `gameSession`, `player`, `workflowTransition`).
2. **Advanced GROQ Queries**: Complex relational traversal (`currentLocation->linkedRooms[]->era`), filtering, projection, and ordering.
3. **Real-time Live Functionality (`next-sanity/live`)**: Live subscriptions stream temporal changes directly to clients without polling.
4. **Custom Studio Structure**: Customized `src/sanity/structure.ts` organizing documents into an operations command hierarchy (Timelines, Vault Rooms, Artifacts, Causal Matrix, Paradoxes, Workflow).
5. **Custom Sanity Studio Tool — Causality Graph**: A bespoke D3.js force-directed graph mounted inside Sanity Studio (`/studio`) and the web application (`/causality`).
6. **Custom Sanity Tool — Temporal Preview Renderer**: A deterministic surveillance frame-sequence renderer generating CRT-filtered multi-era previews and saving metadata directly into Sanity documents.
7. **Document Mutations & Transactional Patches**: Secure, atomic updates via `client.patch().set().commit()` and `client.create()`.
8. **Structured Workflow State Machine**: 5-stage temporal workflow modeled in Sanity:
   `PAST_ACTION_COMMITTED` → `CAUSALITY_AGENT` → `FUTURE_STATE_RECALCULATION` → `GAME_MASTER_REVIEW` → `TIMELINE_SEALED`.

---

## ⚡ What Happens When History Changes?

The complete causal propagation pipeline operates as follows:

```text
1920 (Past)                                            2026 (Future)
Player discovers Brass Key
         ↓
Player buries key in North Wall
         ↓
Server Action: proposeTemporalAction()
         ↓
Sanity: temporalAction created [pending]
         ↓
Causality Engine: executeCausalityWorkflow()
         ↓
Calculates structural impact (Confidence: 0.94)
         ↓
Sanity Patch: room-vault-2026 hiddenCompartments.revealed = true
Sanity Patch: obj-chronos-core state = "discovered"
Sanity Create: workflowTransition [GAME_MASTER_REVIEW]
         ↓
Live SSE Subscription triggers reactive client update
         ↓
2026 Vault View materializes hidden compartment dynamically!
         ↓
Game Master reviews agent reasoning & authorizes timeline seal
         ↓
Sanity Patch: timeline-2026 healthIndicator = 100%, sealedState = true
```

---

## 🖥️ Custom Studio Tools

### 1. Causality Graph (`/studio` and `/causality`)
* **Technology**: D3.js force-directed topology simulation.
* **Capabilities**: Pan, zoom, node dragging, era filtering (1920/1970/2026), document-type filtering, and live document payload inspection on click.
* **Connection**: Dynamically synthesizes live GROQ queries across rooms, objects, actions, and paradoxes into an interactive causal network.

### 2. Temporal Preview Renderer (`/studio`)
* **Technology**: Canvas-based CRT temporal frame synthesizer with scanline emulation and timecode telemetry.
* **Capabilities**: Generates multi-frame surveillance playback showing the room across all three eras, persisting render payloads back into Sanity Lake.

---

## 🎮 Game Routes

| Route | Purpose |
|---|---|
| `/` | Atmospheric Mission Briefing, Era Telemetry, & Judge Architecture Panel |
| `/game/[session]` | Core Playable Vault Game with 3D Spatial Canvas, Minimap Radar, Puzzles, Audio Logs & Live Causality |
| `/game/[session]/timeline` | Timeline Intelligence, historical diff scanner, and paradox detection grid |
| `/gm/[session]` | Game Master Command Center: inspect causal shifts, review agent analysis, and seal timelines |
| `/causality` | Interactive D3 Causality Dependency Graph connected to live Sanity data |
| `/studio` | Customized Sanity Studio Operations Center mounted in Next.js |
| `/admin/reset` | Emergency data reset utility |

---

## 🧩 Interactive Gaming & Immersion Mechanics

1. **3D Spatial Room & Real-time Sector Radar (`RoomMinimap.tsx`)**:
   - 360° orbit camera with raycasting, high-contrast procedural era textures (Victorian oak/parquet with crimson velvet rug, Cold War slate with hazard walkways, and Cyberpunk titanium with glowing circuit traces).
   - Real-time schematic sector radar allows 1-click camera zooming between the heavy Bank Vault Door, Examination Workbench, and North Wall Safe.
2. **Interactive Rotary Safe Combination Minigame (`SafeDialPuzzle.tsx`)**:
   - Functional 3-dial mechanical safe lock keyed to historical coordinates (`19 - 70 - 26`).
   - Mechanical tick audio feedback and particle celebrations upon cracking.
3. **Cathode Oscilloscope Resonance Tuner (`OscilloscopePuzzle.tsx`)**:
   - Real-time sine wave frequency matching minigame. Tuning to the 432 Hz standing wave harmonic locks the temporal acoustic cipher.
4. **Detective Evidence Pinboard (`EvidenceBoardModal.tsx`)**:
   - Interactive investigative corkboard fetching live `clue` documents from Sanity Content Lake with era filtering and live search.
5. **Temporal Voice Transmissions & Equalizer (`TemporalAudioLog.tsx`)**:
   - Live procedural Web Audio transmission player featuring dramatized logs from Master Clockmaker Alistair Vance (1920), Major Gregory Stone (1970), and Sentinel AI (2026).
6. **Clockmaker's Manuscript Journal (`JournalModal.tsx`)**:
   - Interactive weathered leather journal viewer with handwritten causal theories, safe schematics, and frequency formulas.

---

## 🧪 Judge Reproduction Flow (Step-by-Step)

Follow these steps to experience the complete causal loop:

1. **Start the Application**:
   ```bash
   npm run build
   npm run start
   # Or run: npm run dev
   ```
2. **Open the Briefing**: Navigate to `http://localhost:3000`.
3. **Enter the Vault**: Click **"▶ ENTER THE VAULT"** to load `/game/CHRONOS-ALPHA`.
4. **Inspect Era 1920**:
   - Click the **Antique Brass Vault Key** on the room canvas (`🗝️`).
   - Notice its description: *Inscribed with temporal coordinates: 1920-1970-2026*.
   - Click **"⚡ BURY KEY IN NORTH WALL CAVITY"**.
5. **Observe Real-Time Propagation**:
   - Switch to **2026 (CONSEQUENCE)** via the top timeline switcher.
   - Notice the North Wall now displays: **`⚡ RESONANCE COMPARTMENT OPENED — CHRONOS CORE ACCESSIBLE!`**
   - Click the **Chronos Core Cylinder** (`🌀`) and click **"EXTRACT CHRONOS CORE CYLINDER"**.
6. **Game Master Authorization**:
   - Navigate to **Game Master** (`/gm/CHRONOS-ALPHA`).
   - Review the autonomous agent analysis explaining how the 1920 mortar cavity survived the 1970 renovation.
   - Click **"✔ AUTHORIZE & SEAL TIMELINE"** to seal the timeline with 100% integrity.
7. **Inspect the Causality Graph**:
   - Navigate to `/causality`.
   - Click the nodes to inspect the live Sanity document payloads and causal links.
8. **Explore Sanity Studio**:
   - Open `/studio` to view the custom operations navigation and custom tools.

---

## ⚖️ Tradeoffs & Engineering Decisions

* **Direct Sanity Mutations vs. Relational Database**: Using Sanity as the primary operational database introduces minor network latency compared to SQLite/PostgreSQL, but provides unparalleled live subscriptions, rich schema tooling, and built-in auditability.
* **Deterministic Local Fallback for Video/GIF Rendering**: To guarantee 100% runnable demo execution without requiring paid Replicate/Fal API keys, a deterministic multi-frame surveillance canvas engine was built that records real temporal states. When external API keys are configured, it seamlessly switches to hosted generative models.
* **Server Actions vs REST/GraphQL**: Next.js Server Actions were selected for server-side mutations to provide zero-boilerplate RPC calls with automatic path revalidation.

---

## 🚀 Future Roadmap

* **Multiplayer Room Presence**: Integrating WebRTC / Sanity presence to show collaborative agent cursors moving across historical eras in real time.
* **Expanded Era Continuum**: Expanding from 3 eras to 5 eras (1850 Victorian Foundry and 2150 Orbital Haven).
* **Audio Landscape**: Generative ambient soundscapes synthesized via Web Audio API shifting from mechanical ticking to vacuum-tube hum to cybernetic synth chords based on the active timeline.
