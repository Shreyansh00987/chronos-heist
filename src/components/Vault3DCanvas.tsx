'use client'

import React, {useEffect, useRef, useState, useMemo} from 'react'
import * as THREE from 'three'
import {playTick, playBeep, playWarp} from '@/lib/soundEffects'
import {RoomMinimap} from '@/components/RoomMinimap'

interface GameObject {
  _id: string
  name: string
  description?: string
  objectType?: string
  state?: string
  interactable?: boolean
  icon?: string
}

interface Vault3DProps {
  eraYear: number
  objects: GameObject[]
  isCompartmentRevealed: boolean
  onSelectObject: (obj: GameObject) => void
  selectedObjectId?: string | null
  cameraPreset?: 'iso' | 'table' | 'wall'
}

interface ScreenMarker {
  id: string
  name: string
  icon: string
  screenX: number
  screenY: number
  visible: boolean
  color: string
  gameObject: GameObject
}

// Procedural texture generators for vibrant, distinct era aesthetics
function create1920ParquetTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!

  // Warm rich mahogany and oak parquet checkerboard
  ctx.fillStyle = '#6b3212'
  ctx.fillRect(0, 0, 512, 512)

  const tileSize = 64
  for (let y = 0; y < 512; y += tileSize) {
    for (let x = 0; x < 512; x += tileSize) {
      const isAlt = ((x / tileSize) + (y / tileSize)) % 2 === 0
      ctx.fillStyle = isAlt ? '#8b4513' : '#a0522d'
      ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4)

      // Wood grain lines
      ctx.strokeStyle = isAlt ? '#5c2b0c' : '#6b3212'
      ctx.lineWidth = 1
      for (let i = 0; i < 4; i++) {
        ctx.beginPath()
        if (isAlt) {
          ctx.moveTo(x + 4, y + 8 + i * 14)
          ctx.lineTo(x + tileSize - 4, y + 8 + i * 14)
        } else {
          ctx.moveTo(x + 8 + i * 14, y + 4)
          ctx.lineTo(x + 8 + i * 14, y + tileSize - 4)
        }
        ctx.stroke()
      }

      // Brass border studs
      ctx.fillStyle = '#d4af37'
      ctx.fillRect(x, y, 3, 3)
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(4, 4)
  return texture
}

function create1970BunkerFloorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!

  // Slate grey industrial flooring with hazard border
  ctx.fillStyle = '#334155'
  ctx.fillRect(0, 0, 512, 512)

  const tileSize = 128
  for (let y = 0; y < 512; y += tileSize) {
    for (let x = 0; x < 512; x += tileSize) {
      const isAlt = ((x / tileSize) + (y / tileSize)) % 2 === 0
      ctx.fillStyle = isAlt ? '#475569' : '#1e293b'
      ctx.fillRect(x + 3, y + 3, tileSize - 6, tileSize - 6)

      // Steel floor rivets in corners
      ctx.fillStyle = '#94a3b8'
      ctx.beginPath()
      ctx.arc(x + 10, y + 10, 3, 0, Math.PI * 2)
      ctx.arc(x + tileSize - 10, y + 10, 3, 0, Math.PI * 2)
      ctx.arc(x + 10, y + tileSize - 10, 3, 0, Math.PI * 2)
      ctx.arc(x + tileSize - 10, y + tileSize - 10, 3, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // Yellow & black hazard stripes along borders
  ctx.lineWidth = 14
  ctx.strokeStyle = '#eab308'
  ctx.strokeRect(7, 7, 498, 498)

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(2, 2)
  return texture
}

function create2026QuantumFloorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!

  // Deep obsidian titanium with neon circuit grid
  ctx.fillStyle = '#0a0e1a'
  ctx.fillRect(0, 0, 512, 512)

  ctx.strokeStyle = '#1e293b'
  ctx.lineWidth = 2
  for (let i = 0; i <= 512; i += 64) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i, 512)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, i)
    ctx.lineTo(512, i)
    ctx.stroke()
  }

  // Cyan and purple glowing circuit nodes
  ctx.fillStyle = '#06b6d4'
  for (let y = 64; y < 512; y += 128) {
    for (let x = 64; x < 512; x += 128) {
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  ctx.fillStyle = '#a855f7'
  for (let y = 128; y < 512; y += 128) {
    for (let x = 128; x < 512; x += 128) {
      ctx.beginPath()
      ctx.arc(x, y, 5, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(3, 3)
  return texture
}

export function Vault3DCanvas({
  eraYear,
  objects,
  isCompartmentRevealed,
  onSelectObject,
  selectedObjectId,
  cameraPreset = 'iso',
}: Vault3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const [hoveredName, setHoveredName] = useState<string | null>(null)
  const [screenMarkers, setScreenMarkers] = useState<ScreenMarker[]>([])
  const isDraggingRef = useRef(false)
  const previousMousePositionRef = useRef({x: 0, y: 0})
  
  const [activeSector, setActiveSector] = useState<'iso' | 'table' | 'wall'>(cameraPreset)

  // Camera angles
  const cameraAngleRef = useRef({
    theta: Math.PI / 4,
    phi: Math.PI / 6,
    radius: 17,
    targetY: 2.2,
  })

  const handleFocusSector = (sector: 'iso' | 'table' | 'wall') => {
    setActiveSector(sector)
    if (sector === 'table') {
      cameraAngleRef.current = {theta: Math.PI / 3.2, phi: Math.PI / 4.5, radius: 9.5, targetY: 2.2}
    } else if (sector === 'wall') {
      cameraAngleRef.current = {theta: 0.05, phi: Math.PI / 8, radius: 11, targetY: 4.5}
    } else {
      cameraAngleRef.current = {theta: Math.PI / 4, phi: Math.PI / 6, radius: 17, targetY: 2.2}
    }
  }

  // Camera Presets
  useEffect(() => {
    handleFocusSector(cameraPreset)
  }, [cameraPreset])

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    playWarp()

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene()
    const width = container.clientWidth
    const height = container.clientHeight || 540

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    
    const updateCameraPos = () => {
      const {theta, phi, radius, targetY} = cameraAngleRef.current
      camera.position.x = radius * Math.sin(theta) * Math.cos(phi)
      camera.position.y = radius * Math.sin(phi) + targetY
      camera.position.z = radius * Math.cos(theta) * Math.cos(phi)
      camera.lookAt(0, targetY, 0)
    }
    updateCameraPos()

    const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true, powerPreference: 'high-performance'})
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.35
    container.innerHTML = ''
    container.appendChild(renderer.domElement)

    // Vibrant Era Color Themes & Lighting (High-Contrast & Impeccable)
    const eraThemes = {
      1920: {
        bg: 0x22150d, // Warm dark espresso
        ambient: 0xfef08a, // Luminous warm amber ambient
        primary: 0xfbbf24, // Bright warm gold
        accent: 0xd97706, // Rich amber
        wallColor: 0xded2be, // Luminous antique limestone cream (High Contrast!)
        wallTrim: 0xf59e0b, // Polished brass trim
        chandelier: 0xffedd5, // Warm lantern light
      },
      1970: {
        bg: 0x0c1929, // Deep slate navy
        ambient: 0x67e8f9, // Cold War electric cyan ambient
        primary: 0x22d3ee, // Crisp cyan
        accent: 0x0284c7, // Deep industrial blue
        wallColor: 0x94a3b8, // High-visibility clean bunker concrete
        wallTrim: 0xfacc15, // Bright hazard yellow warning trim
        chandelier: 0xe0f2fe, // Fluorescent white-cyan
      },
      2026: {
        bg: 0x0a0c1a, // Cyberpunk deep obsidian
        ambient: 0xc4b5fd, // Indigo-violet ambient
        primary: 0xc084fc, // Bright neon violet
        accent: 0x38bdf8, // Electric laser cyan
        wallColor: 0xe2e8f0, // Clean sci-fi white composite panels
        wallTrim: 0xa855f7, // Glowing violet trim
        chandelier: 0xffffff, // Holographic white-cyan keylight
      },
    }[eraYear as 1920 | 1970 | 2026] || {
      bg: 0x0f172a,
      ambient: 0x94a3b8,
      primary: 0xa855f7,
      accent: 0x38bdf8,
      wallColor: 0xe2e8f0,
      wallTrim: 0xa855f7,
      chandelier: 0xffffff,
    }

    scene.background = new THREE.Color(eraThemes.bg)

    // 2. High-Visibility Multi-Source Illumination (Crisp & High-Contrast)
    const ambientLight = new THREE.AmbientLight(eraThemes.ambient, 2.6)
    scene.add(ambientLight)

    // Overhead Center Light (Chandelier / Fluorescent Bank / Hologram Emitter)
    const ceilingLight = new THREE.PointLight(eraThemes.chandelier, 5.0, 36)
    ceilingLight.position.set(0, 7.8, 0)
    ceilingLight.castShadow = true
    ceilingLight.shadow.mapSize.width = 1024
    ceilingLight.shadow.mapSize.height = 1024
    scene.add(ceilingLight)

    // Hanging Chandelier / Fixture Mesh
    const chandelierGeo = new THREE.CylinderGeometry(0.8, 1.2, 0.4, 16)
    const chandelierMat = new THREE.MeshStandardMaterial({
      color: eraYear === 1920 ? 0xd4af37 : eraYear === 1970 ? 0x94a3b8 : 0x38bdf8,
      metalness: 0.9,
      emissive: eraThemes.primary,
      emissiveIntensity: 0.8,
    })
    const chandelier = new THREE.Mesh(chandelierGeo, chandelierMat)
    chandelier.position.set(0, 8.4, 0)
    scene.add(chandelier)

    // Directional Fill Light for sharp depth definition
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5)
    dirLight.position.set(6, 12, 8)
    dirLight.castShadow = true
    scene.add(dirLight)

    // Corner Architectural Sconces
    const sconceLight1 = new THREE.PointLight(eraThemes.primary, 2.0, 14)
    sconceLight1.position.set(-6.8, 5, -7)
    scene.add(sconceLight1)

    const sconceLight2 = new THREE.PointLight(eraThemes.primary, 2.0, 14)
    sconceLight2.position.set(6.8, 5, -7)
    scene.add(sconceLight2)

    // 3. Vault Architectural Geometry (Floor, Walls, Molding, Pillars)
    let floorTexture: THREE.CanvasTexture
    if (eraYear === 1920) floorTexture = create1920ParquetTexture()
    else if (eraYear === 1970) floorTexture = create1970BunkerFloorTexture()
    else floorTexture = create2026QuantumFloorTexture()

    const floorGeo = new THREE.PlaneGeometry(16, 16)
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTexture,
      roughness: eraYear === 2026 ? 0.2 : 0.45,
      metalness: eraYear === 2026 ? 0.75 : 0.25,
    })
    const floor = new THREE.Mesh(floorGeo, floorMat)
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    scene.add(floor)

    // Era-Specific Center Focal Rug / Walkway
    if (eraYear === 1920) {
      const rugGeo = new THREE.PlaneGeometry(8.2, 5.2)
      const rugCanvas = document.createElement('canvas')
      rugCanvas.width = 512
      rugCanvas.height = 320
      const rCtx = rugCanvas.getContext('2d')!
      rCtx.fillStyle = '#7f1d1d' // Luxurious deep crimson velvet
      rCtx.fillRect(0, 0, 512, 320)
      rCtx.strokeStyle = '#f59e0b' // Gold filigree border
      rCtx.lineWidth = 14
      rCtx.strokeRect(10, 10, 492, 300)
      rCtx.strokeStyle = '#fef08a'
      rCtx.lineWidth = 4
      rCtx.strokeRect(24, 24, 464, 272)
      // Center Medallion
      rCtx.fillStyle = '#991b1b'
      rCtx.beginPath()
      rCtx.ellipse(256, 160, 100, 60, 0, 0, Math.PI * 2)
      rCtx.fill()
      rCtx.strokeStyle = '#fbbf24'
      rCtx.lineWidth = 3
      rCtx.stroke()
      const rugTex = new THREE.CanvasTexture(rugCanvas)
      const rugMat = new THREE.MeshStandardMaterial({map: rugTex, roughness: 0.85})
      const rug = new THREE.Mesh(rugGeo, rugMat)
      rug.rotation.x = -Math.PI / 2
      rug.position.set(0, 0.015, 0)
      rug.receiveShadow = true
      scene.add(rug)
    } else if (eraYear === 1970) {
      const hazardGeo = new THREE.PlaneGeometry(8.2, 5.2)
      const hCanvas = document.createElement('canvas')
      hCanvas.width = 512
      hCanvas.height = 320
      const hCtx = hCanvas.getContext('2d')!
      hCtx.fillStyle = '#1e293b'
      hCtx.fillRect(0, 0, 512, 320)
      // Yellow hazard perimeter
      hCtx.strokeStyle = '#eab308'
      hCtx.lineWidth = 16
      hCtx.strokeRect(8, 8, 496, 304)
      const hTex = new THREE.CanvasTexture(hCanvas)
      const hMat = new THREE.MeshStandardMaterial({map: hTex, roughness: 0.5})
      const hMesh = new THREE.Mesh(hazardGeo, hMat)
      hMesh.rotation.x = -Math.PI / 2
      hMesh.position.set(0, 0.015, 0)
      hMesh.receiveShadow = true
      scene.add(hMesh)
    }

    // Ceiling Beams / Grid Structure
    const beamGeo = new THREE.BoxGeometry(16, 0.5, 0.6)
    const beamMat = new THREE.MeshStandardMaterial({
      color: eraYear === 1920 ? 0x451a03 : 0x1e293b,
      metalness: 0.4,
    })
    ;[-4, 0, 4].forEach((z) => {
      const beam = new THREE.Mesh(beamGeo, beamMat)
      beam.position.set(0, 8.8, z)
      scene.add(beam)
    })

    // NORTH WALL (Masonry / Concrete / Composite)
    const northWallGeo = new THREE.BoxGeometry(16, 9, 0.6)
    const northWallMat = new THREE.MeshStandardMaterial({
      color: eraThemes.wallColor,
      roughness: 0.6,
      metalness: 0.2,
    })
    const northWall = new THREE.Mesh(northWallGeo, northWallMat)
    northWall.position.set(0, 4.5, -8)
    northWall.receiveShadow = true
    scene.add(northWall)

    // Wainscoting / Base Panel along North Wall (1920 rich wood / 1970 hazard stripe / 2026 neon strip)
    const wainscotGeo = new THREE.BoxGeometry(16, 2.4, 0.7)
    const wainscotMat = new THREE.MeshStandardMaterial({
      color: eraYear === 1920 ? 0x4a220b : eraYear === 1970 ? 0x1e293b : 0x0f172a,
      metalness: eraYear === 2026 ? 0.8 : 0.3,
    })
    const wainscot = new THREE.Mesh(wainscotGeo, wainscotMat)
    wainscot.position.set(0, 1.2, -7.95)
    scene.add(wainscot)

    // Baseboard Molding
    const moldingGeo = new THREE.BoxGeometry(16, 0.35, 0.45)
    const moldingMat = new THREE.MeshStandardMaterial({
      color: eraThemes.wallTrim,
      metalness: 0.85,
      roughness: 0.2,
      emissive: eraThemes.wallTrim,
      emissiveIntensity: 0.35,
    })
    const molding = new THREE.Mesh(moldingGeo, moldingMat)
    molding.position.set(0, 0.18, -7.65)
    scene.add(molding)

    // WEST WALL
    const westWallGeo = new THREE.BoxGeometry(0.6, 9, 16)
    const westWall = new THREE.Mesh(westWallGeo, northWallMat)
    westWall.position.set(-8, 4.5, 0)
    westWall.receiveShadow = true
    scene.add(westWall)

    // Architectural Pillars in Corners
    const pillarGeo = new THREE.BoxGeometry(1, 9, 1)
    const pillarMat = new THREE.MeshStandardMaterial({
      color: eraYear === 1920 ? 0x3d1a08 : 0x1e293b,
      metalness: 0.5,
    })
    ;[
      [-7.5, 4.5, -7.5],
      [7.5, 4.5, -7.5],
    ].forEach(([px, py, pz]) => {
      const pillar = new THREE.Mesh(pillarGeo, pillarMat)
      pillar.position.set(px, py, pz)
      scene.add(pillar)
    })

    // 4. MASSIVE VAULT DOOR ON WEST WALL (Immediately identifiable as a VAULT!)
    const vaultDoorGroup = new THREE.Group()
    vaultDoorGroup.position.set(-7.7, 4.2, -1.5)
    vaultDoorGroup.rotation.y = Math.PI / 2

    // Circular Vault Frame
    const doorFrameGeo = new THREE.TorusGeometry(2.4, 0.25, 16, 32)
    const doorFrameMat = new THREE.MeshStandardMaterial({
      color: eraYear === 1920 ? 0xd4af37 : 0x94a3b8,
      metalness: 0.95,
      roughness: 0.2,
    })
    const doorFrame = new THREE.Mesh(doorFrameGeo, doorFrameMat)
    vaultDoorGroup.add(doorFrame)

    // Solid Heavy Vault Door Disc
    const doorDiscGeo = new THREE.CylinderGeometry(2.35, 2.35, 0.35, 32)
    const doorDiscMat = new THREE.MeshStandardMaterial({
      color: eraYear === 1920 ? 0x78350f : eraYear === 1970 ? 0x334155 : 0x0f172a,
      metalness: 0.85,
      roughness: 0.3,
    })
    const doorDisc = new THREE.Mesh(doorDiscGeo, doorDiscMat)
    doorDisc.rotation.x = Math.PI / 2
    vaultDoorGroup.add(doorDisc)

    // Central Spoked Wheel
    const wheelHubGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.3, 16)
    const wheelHub = new THREE.Mesh(wheelHubGeo, doorFrameMat)
    wheelHub.rotation.x = Math.PI / 2
    wheelHub.position.z = 0.25
    vaultDoorGroup.add(wheelHub)

    const wheelSpokeGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.8, 8)
    ;[0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4].forEach((angle) => {
      const spoke = new THREE.Mesh(wheelSpokeGeo, doorFrameMat)
      spoke.rotation.z = angle
      spoke.position.z = 0.32
      vaultDoorGroup.add(spoke)
    })
    scene.add(vaultDoorGroup)

    // 5. CENTRAL EXAMINATION WORKBENCH
    const tableGeo = new THREE.BoxGeometry(6.6, 0.38, 3.4)
    const tableMat = new THREE.MeshStandardMaterial({
      color: eraYear === 1920 ? 0x542308 : eraYear === 1970 ? 0x1e293b : 0x0f172a,
      roughness: 0.3,
      metalness: eraYear === 2026 ? 0.9 : 0.25,
    })
    const table = new THREE.Mesh(tableGeo, tableMat)
    table.position.set(0, 2, 0)
    table.castShadow = true
    table.receiveShadow = true
    scene.add(table)

    // Table Brass/Steel Edge Trim
    const tableTrimGeo = new THREE.BoxGeometry(6.7, 0.08, 3.5)
    const tableTrimMat = new THREE.MeshStandardMaterial({color: eraThemes.primary, metalness: 0.9})
    const tableTrim = new THREE.Mesh(tableTrimGeo, tableTrimMat)
    tableTrim.position.set(0, 2.16, 0)
    scene.add(tableTrim)

    // Sturdy Table Legs with Foot Pads
    const legGeo = new THREE.CylinderGeometry(0.14, 0.16, 2, 16)
    const legMat = new THREE.MeshStandardMaterial({color: 0x0f172a, metalness: 0.85})
    ;[
      [-2.9, 1, -1.4],
      [2.9, 1, -1.4],
      [-2.9, 1, 1.4],
      [2.9, 1, 1.4],
    ].forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(legGeo, legMat)
      leg.position.set(x, y, z)
      scene.add(leg)
    })

    // Green Banker's Desk Lamp in 1920
    if (eraYear === 1920) {
      const lampBaseGeo = new THREE.CylinderGeometry(0.25, 0.3, 0.1, 16)
      const lampBaseMat = new THREE.MeshStandardMaterial({color: 0xd4af37, metalness: 0.9})
      const lampBase = new THREE.Mesh(lampBaseGeo, lampBaseMat)
      lampBase.position.set(2.4, 2.25, -1)
      scene.add(lampBase)

      const lampShadeGeo = new THREE.CylinderGeometry(0.2, 0.45, 0.3, 16)
      const lampShadeMat = new THREE.MeshStandardMaterial({color: 0x15803d, roughness: 0.2})
      const lampShade = new THREE.Mesh(lampShadeGeo, lampShadeMat)
      lampShade.position.set(2.4, 2.65, -1)
      lampShade.rotation.z = Math.PI / 6
      scene.add(lampShade)

      const lampLight = new THREE.PointLight(0xfef08a, 1.8, 6)
      lampLight.position.set(2.4, 2.5, -1)
      scene.add(lampLight)
    }

    // 6. INTERACTIVE 3D OBJECTS & ANCHORS
    const interactiveMeshes: THREE.Mesh[] = []
    const markerAnchors: Array<{
      id: string
      name: string
      icon: string
      color: string
      position: THREE.Vector3
      gameObject: GameObject
    }> = []

    // NORTH WALL CAVITY / COMPARTMENT
    const cavityGroup = new THREE.Group()
    cavityGroup.position.set(0, 4.8, -7.6)

    const cavityFrameGeo = new THREE.BoxGeometry(3.6, 2.4, 0.5)
    const cavityFrameMat = new THREE.MeshStandardMaterial({
      color: eraYear === 2026 && isCompartmentRevealed ? 0xa855f7 : 0x475569,
      emissive: eraYear === 2026 && isCompartmentRevealed ? 0x9333ea : 0x000000,
      emissiveIntensity: 0.9,
      metalness: 0.8,
    })
    const cavityFrame = new THREE.Mesh(cavityFrameGeo, cavityFrameMat)
    cavityGroup.add(cavityFrame)

    // Sliding Door (moves aside when revealed in 2026)
    const doorGeo = new THREE.BoxGeometry(3.1, 2.0, 0.2)
    const doorMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.9,
      roughness: 0.2,
    })
    const door = new THREE.Mesh(doorGeo, doorMat)
    door.position.set(isCompartmentRevealed ? 2.6 : 0, 0, 0.15)
    cavityGroup.add(door)

    const cavityObj = objects.find((o) => o._id.includes('north-wall')) || {
      _id: 'obj-north-wall-1920',
      name: eraYear === 1920 ? 'North Wall Mortar Cavity' : 'North Wall Resonance Compartment',
      description: 'Hidden architectural chamber inside the vault wall masonry.',
      objectType: 'wall',
    }
    cavityFrame.userData = {gameObject: cavityObj}
    scene.add(cavityGroup)
    interactiveMeshes.push(cavityFrame)

    markerAnchors.push({
      id: cavityObj._id,
      name: cavityObj.name,
      icon: isCompartmentRevealed ? '🔮' : '🔐',
      color: isCompartmentRevealed ? '#c084fc' : '#f59e0b',
      position: new THREE.Vector3(0, 5.8, -7.5),
      gameObject: cavityObj,
    })

    // Dynamic Prop Variables
    let pendulumMesh: THREE.Mesh | null = null
    let clockGears: THREE.Mesh[] = []
    let tapeReels: THREE.Mesh[] = []
    let oscCanvas: HTMLCanvasElement | null = null
    let oscTexture: THREE.CanvasTexture | null = null
    let coreGroup: THREE.Group | null = null
    let brassKeyGroup: THREE.Group | null = null

    // 1920 PROPS
    if (eraYear === 1920) {
      // Grandfather Clock in Corner
      const clockBodyGeo = new THREE.BoxGeometry(1.8, 7.8, 1.5)
      const clockBodyMat = new THREE.MeshStandardMaterial({color: 0x4a1d05, roughness: 0.3})
      const clock = new THREE.Mesh(clockBodyGeo, clockBodyMat)
      clock.position.set(5.8, 3.9, -6.5)
      clock.castShadow = true
      scene.add(clock)

      // Clock face
      const faceGeo = new THREE.CircleGeometry(0.65, 32)
      const faceMat = new THREE.MeshBasicMaterial({color: 0xfffbeb})
      const face = new THREE.Mesh(faceGeo, faceMat)
      face.position.set(5.8, 6.4, -5.74)
      scene.add(face)

      // Pendulum
      const penGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.8)
      const penMat = new THREE.MeshStandardMaterial({color: 0xf59e0b, metalness: 0.95})
      pendulumMesh = new THREE.Mesh(penGeo, penMat)
      pendulumMesh.position.set(5.8, 4.0, -5.75)
      scene.add(pendulumMesh)

      const penBobGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.1, 32)
      const penBob = new THREE.Mesh(penBobGeo, penMat)
      penBob.rotation.x = Math.PI / 2
      penBob.position.set(0, -1.3, 0)
      pendulumMesh.add(penBob)

      // Clockmaker's Journal on Table
      const bookGeo = new THREE.BoxGeometry(1.5, 0.22, 1.1)
      const bookMat = new THREE.MeshStandardMaterial({color: 0x78350f, roughness: 0.6})
      const book = new THREE.Mesh(bookGeo, bookMat)
      book.position.set(1.4, 2.3, 0)
      const ledgerObj = objects.find((o) => o._id === 'obj-clockmakers-journal') || {
        _id: 'obj-clockmakers-journal',
        name: "Clockmaker's Secret Journal",
        description: 'Bound parchment containing encrypted safe codes and temporal diagrams.',
      }
      book.userData = {gameObject: ledgerObj}
      interactiveMeshes.push(book)
      scene.add(book)

      markerAnchors.push({
        id: ledgerObj._id,
        name: ledgerObj.name,
        icon: '📖',
        color: '#f59e0b',
        position: new THREE.Vector3(1.4, 2.8, 0),
        gameObject: ledgerObj,
      })

      // CLOCKMAKER'S VAULT KEY ON TABLE
      const keyObj = objects.find((o) => o._id === 'obj-brass-key') || {
        _id: 'obj-brass-key',
        name: 'Antique Brass Vault Key',
        description: 'Ornate 1920 solid brass key capable of surviving a century within mortar.',
      }
      if (keyObj.state !== 'buried') {
        brassKeyGroup = new THREE.Group()
        const keyMat = new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          metalness: 0.95,
          roughness: 0.15,
          emissive: 0xd97706,
          emissiveIntensity: 0.65,
        })
        const shaftGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.2)
        const shaft = new THREE.Mesh(shaftGeo, keyMat)
        shaft.rotation.z = Math.PI / 2
        brassKeyGroup.add(shaft)

        const bowGeo = new THREE.TorusGeometry(0.24, 0.07, 16, 32)
        const bow = new THREE.Mesh(bowGeo, keyMat)
        bow.position.set(-0.65, 0, 0)
        brassKeyGroup.add(bow)

        const bitGeo = new THREE.BoxGeometry(0.25, 0.3, 0.08)
        const bit = new THREE.Mesh(bitGeo, keyMat)
        bit.position.set(0.48, 0.15, 0)
        brassKeyGroup.add(bit)

        const keyPointLight = new THREE.PointLight(0xf59e0b, 2.2, 5)
        keyPointLight.position.set(0, 0.5, 0)
        brassKeyGroup.add(keyPointLight)

        brassKeyGroup.position.set(-1.6, 2.45, 0)
        scene.add(brassKeyGroup)

        const keyHitGeo = new THREE.BoxGeometry(1.8, 1.4, 1.2)
        const keyHitMat = new THREE.MeshBasicMaterial({visible: false})
        const keyHitbox = new THREE.Mesh(keyHitGeo, keyHitMat)
        keyHitbox.position.copy(brassKeyGroup.position)
        keyHitbox.userData = {gameObject: keyObj}
        scene.add(keyHitbox)
        interactiveMeshes.push(keyHitbox)

        markerAnchors.push({
          id: keyObj._id,
          name: keyObj.name,
          icon: '🗝️',
          color: '#fbbf24',
          position: new THREE.Vector3(-1.6, 3.1, 0),
          gameObject: keyObj,
        })
      }
    } else if (eraYear === 1970) {
      // Oscilloscope on Desk
      oscCanvas = document.createElement('canvas')
      oscCanvas.width = 256
      oscCanvas.height = 256
      oscTexture = new THREE.CanvasTexture(oscCanvas)

      const scopeGeo = new THREE.BoxGeometry(1.8, 1.4, 2)
      const scopeMat = new THREE.MeshStandardMaterial({color: 0x1e293b, metalness: 0.7})
      const scope = new THREE.Mesh(scopeGeo, scopeMat)
      scope.position.set(-1.8, 2.9, 0)
      scene.add(scope)

      const screenGeo = new THREE.PlaneGeometry(1.2, 1.0)
      const screenMat = new THREE.MeshBasicMaterial({map: oscTexture})
      const screen = new THREE.Mesh(screenGeo, screenMat)
      screen.position.set(-1.8, 2.9, 1.01)
      scene.add(screen)

      const scopeObj = objects.find((o) => o._id === 'obj-oscilloscope-1970') || {
        _id: 'obj-oscilloscope-1970',
        name: 'Cathode Resonance Oscilloscope',
        description: 'Tubes tuned to detect spatial acoustic anomalies.',
      }
      scope.userData = {gameObject: scopeObj}
      interactiveMeshes.push(scope)

      markerAnchors.push({
        id: scopeObj._id,
        name: scopeObj.name,
        icon: '📻',
        color: '#22d3ee',
        position: new THREE.Vector3(-1.8, 3.8, 0),
        gameObject: scopeObj,
      })

      // Reel-to-Reel Tape Recorder with rotating reels
      const tapeDeckGeo = new THREE.BoxGeometry(2.0, 1.2, 1.5)
      const tapeDeckMat = new THREE.MeshStandardMaterial({color: 0x334155, metalness: 0.6})
      const tapeDeck = new THREE.Mesh(tapeDeckGeo, tapeDeckMat)
      tapeDeck.position.set(1.8, 2.8, 0)
      scene.add(tapeDeck)

      const reelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.09, 24)
      const reelMat = new THREE.MeshStandardMaterial({color: 0x94a3b8, metalness: 0.9})
      const reel1 = new THREE.Mesh(reelGeo, reelMat)
      reel1.rotation.x = Math.PI / 2
      reel1.position.set(1.3, 3.0, 0.76)
      scene.add(reel1)
      tapeReels.push(reel1)

      const reel2 = new THREE.Mesh(reelGeo, reelMat)
      reel2.rotation.x = Math.PI / 2
      reel2.position.set(2.3, 3.0, 0.76)
      scene.add(reel2)
      tapeReels.push(reel2)

      const tapeObj = objects.find((o) => o._id === 'obj-tape-recorder-1970') || {
        _id: 'obj-tape-recorder-1970',
        name: 'Reel-to-Reel Magnetic Recorder',
        description: 'Magnetic audio archive documenting spatial frequency tests.',
      }
      tapeDeck.userData = {gameObject: tapeObj}
      interactiveMeshes.push(tapeDeck)

      markerAnchors.push({
        id: tapeObj._id,
        name: tapeObj.name,
        icon: '📼',
        color: '#38bdf8',
        position: new THREE.Vector3(1.8, 3.6, 0),
        gameObject: tapeObj,
      })

      // High-voltage wall conduit
      const conduitGeo = new THREE.CylinderGeometry(0.16, 0.16, 16, 16)
      const conduitMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        metalness: 0.9,
        emissive: 0x0284c7,
        emissiveIntensity: 0.7,
      })
      const conduit = new THREE.Mesh(conduitGeo, conduitMat)
      conduit.rotation.z = Math.PI / 2
      conduit.position.set(0, 6.4, -7.5)
      scene.add(conduit)
    } else {
      // 2026: QUANTUM ERA
      // Hologram Console on Desk
      const holoBaseGeo = new THREE.CylinderGeometry(1.0, 1.2, 0.4, 32)
      const holoBaseMat = new THREE.MeshStandardMaterial({color: 0x0f172a, metalness: 0.95})
      const holoBase = new THREE.Mesh(holoBaseGeo, holoBaseMat)
      holoBase.position.set(-1.8, 2.4, 0)
      scene.add(holoBase)

      const holoRingGeo = new THREE.TorusGeometry(0.8, 0.04, 16, 64)
      const holoRingMat = new THREE.MeshBasicMaterial({color: 0x38bdf8})
      const holoRing = new THREE.Mesh(holoRingGeo, holoRingMat)
      holoRing.rotation.x = Math.PI / 2
      holoRing.position.set(-1.8, 3.1, 0)
      scene.add(holoRing)

      const quantumObj = objects.find((o) => o._id === 'obj-quantum-console') || {
        _id: 'obj-quantum-console',
        name: 'Quantum Analysis Console',
        description: 'High-density terminal reading timeline divergences and lake mutations.',
      }
      holoBase.userData = {gameObject: quantumObj}
      interactiveMeshes.push(holoBase)

      markerAnchors.push({
        id: quantumObj._id,
        name: quantumObj.name,
        icon: '🔮',
        color: '#a855f7',
        position: new THREE.Vector3(-1.8, 3.6, 0),
        gameObject: quantumObj,
      })

      // If hidden compartment is revealed in 2026, render THE CHRONOS CORE CYLINDER!
      if (isCompartmentRevealed) {
        coreGroup = new THREE.Group()
        coreGroup.position.set(0, 4.8, -7.0)

        const coreGeo = new THREE.DodecahedronGeometry(0.65, 0)
        const coreMat = new THREE.MeshStandardMaterial({
          color: 0xf8fafc,
          emissive: 0xa855f7,
          emissiveIntensity: 1.8,
          roughness: 0.1,
          metalness: 0.95,
        })
        const coreDodec = new THREE.Mesh(coreGeo, coreMat)
        coreGroup.add(coreDodec)

        const ring1Geo = new THREE.TorusGeometry(0.95, 0.035, 16, 48)
        const ring1 = new THREE.Mesh(ring1Geo, new THREE.MeshBasicMaterial({color: 0x38bdf8}))
        coreGroup.add(ring1)

        const ring2Geo = new THREE.TorusGeometry(1.15, 0.035, 16, 48)
        const ring2 = new THREE.Mesh(ring2Geo, new THREE.MeshBasicMaterial({color: 0xf43f5e}))
        ring2.rotation.x = Math.PI / 3
        coreGroup.add(ring2)

        const coreLight = new THREE.PointLight(0xa855f7, 4.5, 12)
        coreGroup.add(coreLight)

        const coreObj = objects.find((o) => o._id === 'obj-chronos-core') || {
          _id: 'obj-chronos-core',
          name: 'The Chronos Core Cylinder',
          description: 'The ultimate temporal artifact materialized from 1920 causality.',
          objectType: 'artifact',
        }
        coreDodec.userData = {gameObject: coreObj}
        scene.add(coreGroup)
        interactiveMeshes.push(coreDodec)

        markerAnchors.push({
          id: coreObj._id,
          name: coreObj.name,
          icon: '🌀',
          color: '#ec4899',
          position: new THREE.Vector3(0, 6.0, -7.0),
          gameObject: coreObj,
        })
      }
    }

    // 7. Interactive Raycasting & Mouse Controls
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    const onMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      if (isDraggingRef.current) {
        const deltaX = event.clientX - previousMousePositionRef.current.x
        const deltaY = event.clientY - previousMousePositionRef.current.y

        cameraAngleRef.current.theta -= deltaX * 0.007
        cameraAngleRef.current.phi = Math.max(
          0.05,
          Math.min(Math.PI / 2.2, cameraAngleRef.current.phi + deltaY * 0.007),
        )
        updateCameraPos()

        previousMousePositionRef.current = {x: event.clientX, y: event.clientY}
        return
      }

      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(interactiveMeshes, true)
      if (intersects.length > 0) {
        let hitMesh: THREE.Object3D | null = intersects[0].object
        while (hitMesh && !hitMesh.userData.gameObject) {
          hitMesh = hitMesh.parent
        }
        if (hitMesh?.userData.gameObject) {
          setHoveredName(hitMesh.userData.gameObject.name)
          renderer.domElement.style.cursor = 'pointer'
          return
        }
      }
      setHoveredName(null)
      renderer.domElement.style.cursor = isDraggingRef.current ? 'grabbing' : 'grab'
    }

    const onMouseDown = (event: MouseEvent) => {
      isDraggingRef.current = true
      previousMousePositionRef.current = {x: event.clientX, y: event.clientY}
      renderer.domElement.style.cursor = 'grabbing'
    }

    const onMouseUp = () => {
      isDraggingRef.current = false
      renderer.domElement.style.cursor = 'grab'

      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(interactiveMeshes, true)
      if (intersects.length > 0) {
        let hitMesh: THREE.Object3D | null = intersects[0].object
        while (hitMesh && !hitMesh.userData.gameObject) {
          hitMesh = hitMesh.parent
        }
        if (hitMesh?.userData.gameObject) {
          playTick()
          onSelectObject(hitMesh.userData.gameObject)
        }
      }
    }

    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      cameraAngleRef.current.radius = Math.max(
        7,
        Math.min(25, cameraAngleRef.current.radius + event.deltaY * 0.015),
      )
      updateCameraPos()
    }

    const domElement = renderer.domElement
    domElement.addEventListener('mousemove', onMouseMove)
    domElement.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    domElement.addEventListener('wheel', onWheel, {passive: false})

    // 8. Animation & Dynamic Marker Projection Loop
    let animationFrameId: number
    let clockTime = 0
    const projVec = new THREE.Vector3()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      clockTime += 0.03

      // Grandfather clock pendulum oscillation
      if (pendulumMesh) {
        pendulumMesh.rotation.z = Math.sin(clockTime * 2.2) * 0.28
      }

      // Rotate clock gears
      clockGears.forEach((g) => {
        g.rotation.z += 0.02
      })

      // Brass Key gentle hovering rotation
      if (brassKeyGroup) {
        brassKeyGroup.rotation.y = Math.sin(clockTime * 1.5) * 0.35
        brassKeyGroup.position.y = 2.45 + Math.sin(clockTime * 2.2) * 0.08
      }

      // Tape reels spinning
      tapeReels.forEach((r) => {
        r.rotation.z += 0.07
      })

      // Chronos core multidimensional spinning
      if (coreGroup) {
        coreGroup.children[0].rotation.x += 0.025
        coreGroup.children[0].rotation.y += 0.035
        coreGroup.children[1].rotation.z += 0.045
        coreGroup.children[2].rotation.x -= 0.03
        coreGroup.position.y = 4.8 + Math.sin(clockTime * 2.5) * 0.15
      }

      // Oscilloscope live waveform
      if (oscCanvas && oscTexture) {
        const ctx = oscCanvas.getContext('2d')
        if (ctx) {
          ctx.fillStyle = '#051b1f'
          ctx.fillRect(0, 0, 256, 256)
          ctx.strokeStyle = '#22d3ee'
          ctx.lineWidth = 4
          ctx.beginPath()
          for (let x = 0; x < 256; x += 4) {
            const y = 128 + Math.sin(x * 0.09 + clockTime * 3.5) * 45
            if (x === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
          }
          ctx.stroke()
          oscTexture.needsUpdate = true
        }
      }

      // Project 3D Anchors to 2D Screen Markers
      const currentMarkers: ScreenMarker[] = []
      markerAnchors.forEach((m) => {
        projVec.copy(m.position)
        projVec.project(camera)

        const isVisible = projVec.z < 1.0 && projVec.x >= -1.1 && projVec.x <= 1.1 && projVec.y >= -1.1 && projVec.y <= 1.1
        const screenX = (projVec.x * 0.5 + 0.5) * width
        const screenY = (-projVec.y * 0.5 + 0.5) * height

        currentMarkers.push({
          id: m.id,
          name: m.name,
          icon: m.icon,
          screenX,
          screenY,
          visible: isVisible,
          color: m.color,
          gameObject: m.gameObject,
        })
      })
      setScreenMarkers(currentMarkers)

      renderer.render(scene, camera)
    }

    animate()

    const handleResize = () => {
      if (!container) return
      const newW = container.clientWidth
      const newH = container.clientHeight || 540
      camera.aspect = newW / newH
      camera.updateProjectionMatrix()
      renderer.setSize(newW, newH)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationFrameId)
      domElement.removeEventListener('mousemove', onMouseMove)
      domElement.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      domElement.removeEventListener('wheel', onWheel)
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      scene.clear()
    }
  }, [eraYear, objects, isCompartmentRevealed])

  const eraTag =
    eraYear === 1920
      ? "THE CLOCKMAKER'S SECRET BANK VAULT (1920)"
      : eraYear === 1970
      ? 'COLD WAR CYBERNETIC BUNKER (1970)'
      : 'QUANTUM CHRONO-CORE CHAMBER (2026)'

  return (
    <div style={{position: 'relative', width: '100%', height: '540px', borderRadius: '10px', overflow: 'hidden', background: '#0b0f19'}}>
      <div ref={mountRef} style={{width: '100%', height: '100%', cursor: 'grab'}} />

      {/* Floating 3D Projected Screen Badges (Clickable & Super Clear!) */}
      {screenMarkers.map((marker) => {
        if (!marker.visible) return null
        const isSelected = selectedObjectId === marker.id
        return (
          <div
            key={marker.id}
            onClick={() => {
              playTick()
              onSelectObject(marker.gameObject)
            }}
            style={{
              position: 'absolute',
              left: `${marker.screenX}px`,
              top: `${marker.screenY}px`,
              transform: 'translate(-50%, -100%)',
              zIndex: 100,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.3rem 0.65rem',
              borderRadius: '20px',
              background: isSelected
                ? 'rgba(15, 23, 42, 0.95)'
                : 'rgba(10, 15, 29, 0.85)',
              border: `2px solid ${isSelected ? '#ffffff' : marker.color}`,
              boxShadow: isSelected
                ? `0 0 20px ${marker.color}`
                : `0 0 10px rgba(0,0,0,0.5)`,
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 800,
              fontFamily: 'monospace',
              pointerEvents: 'auto',
              whiteSpace: 'nowrap',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translate(-50%, -115%) scale(1.08)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translate(-50%, -100%) scale(1)'
            }}
          >
            <span>{marker.icon}</span>
            <span>{marker.name}</span>
          </div>
        )
      })}

      {/* Interactive 3D Room Minimap & Radar Guide */}
      <RoomMinimap
        eraYear={eraYear}
        isCompartmentRevealed={isCompartmentRevealed}
        onFocusSector={handleFocusSector}
        activeSector={activeSector}
      />

      {/* 3D HUD Telemetry & Sector Banner */}
      <div
        style={{
          position: 'absolute',
          top: '15px',
          left: '15px',
          color: '#94a3b8',
          fontFamily: 'monospace',
          fontSize: '0.75rem',
          pointerEvents: 'none',
          background: 'rgba(5, 7, 15, 0.9)',
          padding: '0.5rem 0.9rem',
          borderRadius: '8px',
          border: '1px solid #334155',
          boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
        }}
      >
        <div style={{color: '#f8fafc', fontWeight: 800, letterSpacing: '0.05em', marginBottom: '2px'}}>
          📍 {eraTag}
        </div>
        <div style={{color: '#38bdf8', fontSize: '0.7rem'}}>
          Drag: 360° Orbit | Scroll: Zoom | Click Badges or Artifacts to Inspect
        </div>
      </div>

      {/* Target Locked HUD Banner */}
      {hoveredName && (
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(15, 23, 42, 0.95)',
            border: '2px solid #38bdf8',
            color: '#ffffff',
            padding: '0.5rem 1.5rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontFamily: 'monospace',
            fontWeight: 800,
            pointerEvents: 'none',
            boxShadow: '0 0 25px rgba(56, 189, 248, 0.7)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span style={{color: '#38bdf8'}}>⚡ SCANNER TARGET ACQUIRED:</span>
          <span>{hoveredName}</span>
        </div>
      )}
    </div>
  )
}
