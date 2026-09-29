'use client'

import React, {useEffect, useRef, useState} from 'react'
import * as THREE from 'three'
import {playTick, playBeep, playWarp} from '@/lib/soundEffects'

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
  const isDraggingRef = useRef(false)
  const previousMousePositionRef = useRef({x: 0, y: 0})
  
  // Camera angles
  const cameraAngleRef = useRef({
    theta: Math.PI / 4,
    phi: Math.PI / 6,
    radius: 17,
    targetY: 2,
  })

  // Set camera angle preset
  useEffect(() => {
    if (cameraPreset === 'table') {
      cameraAngleRef.current = {theta: Math.PI / 3, phi: Math.PI / 4, radius: 10, targetY: 2.2}
    } else if (cameraPreset === 'wall') {
      cameraAngleRef.current = {theta: 0.1, phi: Math.PI / 8, radius: 11, targetY: 4.2}
    } else {
      cameraAngleRef.current = {theta: Math.PI / 4, phi: Math.PI / 6, radius: 17, targetY: 2}
    }
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
    renderer.toneMappingExposure = 1.2
    container.innerHTML = ''
    container.appendChild(renderer.domElement)

    // Era-based color palettes
    const eraColors = {
      1920: {ambient: 0x451a03, primary: 0xf59e0b, accent: 0xd97706, bg: 0x090502, fog: 0x120803},
      1970: {ambient: 0x083344, primary: 0x22d3ee, accent: 0x06b6d4, bg: 0x020f14, fog: 0x031820},
      2026: {ambient: 0x2e1065, primary: 0xc084fc, accent: 0xa855f7, bg: 0x06020c, fog: 0x0e0319},
    }[eraYear as 1920 | 1970 | 2026] || {ambient: 0x1e293b, primary: 0xa855f7, accent: 0x9333ea, bg: 0x07090e, fog: 0x0a0f1d}

    scene.background = new THREE.Color(eraColors.bg)
    scene.fog = new THREE.FogExp2(eraColors.fog, 0.035)

    // Lighting
    const ambientLight = new THREE.AmbientLight(eraColors.ambient, 1.4)
    scene.add(ambientLight)

    const mainLight = new THREE.PointLight(eraColors.primary, 3.2, 28)
    mainLight.position.set(0, 7.5, 0)
    mainLight.castShadow = true
    scene.add(mainLight)

    const fillLight = new THREE.DirectionalLight(eraColors.accent, 1.2)
    fillLight.position.set(5, 10, 5)
    scene.add(fillLight)

    // Lanterns / Beacons
    const lantern1 = new THREE.PointLight(eraColors.primary, 1.8, 14)
    lantern1.position.set(-6, 4.5, -6)
    scene.add(lantern1)

    const lantern2 = new THREE.PointLight(eraColors.primary, 1.8, 14)
    lantern2.position.set(6, 4.5, -6)
    scene.add(lantern2)

    // 2. Room Architecture (Floor, Walls, Baseboards)
    const floorGeo = new THREE.PlaneGeometry(16, 16)
    const floorMat = new THREE.MeshStandardMaterial({
      color: eraYear === 1920 ? 0x27150a : eraYear === 1970 ? 0x1a2634 : 0x090d16,
      roughness: 0.5,
      metalness: eraYear === 2026 ? 0.75 : 0.15,
    })
    const floor = new THREE.Mesh(floorGeo, floorMat)
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    scene.add(floor)

    // Floor Grid lines for 1970/2026
    if (eraYear !== 1920) {
      const grid = new THREE.GridHelper(16, 16, eraColors.primary, 0x1e293b)
      grid.position.y = 0.02
      scene.add(grid)
    }

    // North Wall
    const wallMat = new THREE.MeshStandardMaterial({
      color: eraYear === 1920 ? 0x361f12 : eraYear === 1970 ? 0x283548 : 0x140f20,
      roughness: 0.8,
    })
    const northWallGeo = new THREE.BoxGeometry(16, 9, 0.6)
    const northWall = new THREE.Mesh(northWallGeo, wallMat)
    northWall.position.set(0, 4.5, -8)
    northWall.receiveShadow = true
    scene.add(northWall)

    // West Wall
    const westWallGeo = new THREE.BoxGeometry(0.6, 9, 16)
    const westWall = new THREE.Mesh(westWallGeo, wallMat)
    westWall.position.set(-8, 4.5, 0)
    westWall.receiveShadow = true
    scene.add(westWall)

    // Molding / Trim
    const moldingGeo = new THREE.BoxGeometry(16, 0.4, 0.4)
    const moldingMat = new THREE.MeshStandardMaterial({color: eraColors.accent, metalness: 0.8, roughness: 0.3})
    const baseMolding = new THREE.Mesh(moldingGeo, moldingMat)
    baseMolding.position.set(0, 0.2, -7.7)
    scene.add(baseMolding)

    // 3. Central Investigation Table
    const tableGeo = new THREE.BoxGeometry(6.4, 0.35, 3.2)
    const tableMat = new THREE.MeshStandardMaterial({
      color: eraYear === 1920 ? 0x421b05 : 0x1e293b,
      roughness: 0.3,
      metalness: eraYear === 2026 ? 0.85 : 0.25,
    })
    const table = new THREE.Mesh(tableGeo, tableMat)
    table.position.set(0, 2, 0)
    table.castShadow = true
    table.receiveShadow = true
    scene.add(table)

    // Table legs
    const legGeo = new THREE.CylinderGeometry(0.12, 0.12, 2, 16)
    const legMat = new THREE.MeshStandardMaterial({color: 0x0f172a, metalness: 0.8})
    ;[
      [-2.8, 1, -1.3],
      [2.8, 1, -1.3],
      [-2.8, 1, 1.3],
      [2.8, 1, 1.3],
    ].forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(legGeo, legMat)
      leg.position.set(x, y, z)
      scene.add(leg)
    })

    // 4. Interactive 3D Objects
    const interactiveMeshes: THREE.Mesh[] = []

    // NORTH WALL CAVITY / SECRET COMPARTMENT
    const cavityGroup = new THREE.Group()
    cavityGroup.position.set(0, 4.6, -7.6)

    const cavityFrameGeo = new THREE.BoxGeometry(3.2, 2.2, 0.4)
    const cavityFrameMat = new THREE.MeshStandardMaterial({
      color: eraYear === 2026 && isCompartmentRevealed ? 0xa855f7 : 0x334155,
      emissive: eraYear === 2026 && isCompartmentRevealed ? 0x7e22ce : 0x000000,
      emissiveIntensity: 0.9,
    })
    const cavityFrame = new THREE.Mesh(cavityFrameGeo, cavityFrameMat)
    cavityGroup.add(cavityFrame)

    // Sliding Door (opens if 2026 revealed)
    const doorGeo = new THREE.BoxGeometry(2.8, 1.8, 0.2)
    const doorMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.9,
      roughness: 0.2,
    })
    const door = new THREE.Mesh(doorGeo, doorMat)
    door.position.set(isCompartmentRevealed ? 2.4 : 0, 0, 0.1)
    cavityGroup.add(door)

    const cavityObj = objects.find((o) => o._id.includes('north-wall')) || {
      _id: 'north-wall',
      name: eraYear === 1920 ? 'North Wall Mortar Cavity' : 'North Wall Resonance Compartment',
      description: 'Hidden architectural chamber in the north masonry.',
      objectType: 'wall',
    }
    cavityFrame.userData = {gameObject: cavityObj}
    scene.add(cavityGroup)
    interactiveMeshes.push(cavityFrame)

    // Dynamic props references
    let pendulumMesh: THREE.Mesh | null = null
    let clockGears: THREE.Mesh[] = []
    let tapeReels: THREE.Mesh[] = []
    let oscCanvas: HTMLCanvasElement | null = null
    let oscTexture: THREE.CanvasTexture | null = null
    let coreGroup: THREE.Group | null = null
    let brassKeyGroup: THREE.Group | null = null

    // 1920 SPECIFIC PROPS
    if (eraYear === 1920) {
      // Grandfather Clock
      const clockBodyGeo = new THREE.BoxGeometry(1.6, 7.5, 1.4)
      const clockBodyMat = new THREE.MeshStandardMaterial({color: 0x361604, roughness: 0.3})
      const clock = new THREE.Mesh(clockBodyGeo, clockBodyMat)
      clock.position.set(6, 3.75, -6.5)
      scene.add(clock)

      // Clock face
      const faceGeo = new THREE.CircleGeometry(0.55, 32)
      const faceMat = new THREE.MeshBasicMaterial({color: 0xfef3c7})
      const face = new THREE.Mesh(faceGeo, faceMat)
      face.position.set(6, 6.2, -5.79)
      scene.add(face)

      // Clock gear ring
      const gearGeo = new THREE.TorusGeometry(0.4, 0.05, 16, 24)
      const gearMat = new THREE.MeshStandardMaterial({color: 0xf59e0b, metalness: 0.9, roughness: 0.2})
      const gear1 = new THREE.Mesh(gearGeo, gearMat)
      gear1.position.set(6, 4.6, -5.75)
      scene.add(gear1)
      clockGears.push(gear1)

      // Pendulum
      const penGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.6)
      const penMat = new THREE.MeshStandardMaterial({color: 0xf59e0b, metalness: 0.9})
      pendulumMesh = new THREE.Mesh(penGeo, penMat)
      pendulumMesh.position.set(6, 3.8, -5.8)
      scene.add(pendulumMesh)

      const penBobGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.08, 32)
      const penBob = new THREE.Mesh(penBobGeo, penMat)
      penBob.rotation.x = Math.PI / 2
      penBob.position.set(0, -1.2, 0)
      pendulumMesh.add(penBob)

      // CLOCKMAKER'S VAULT KEY on table
      const keyObj = objects.find((o) => o._id === 'obj-brass-key')
      if (keyObj && keyObj.state !== 'buried') {
        brassKeyGroup = new THREE.Group()
        const keyMat = new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          metalness: 0.95,
          roughness: 0.15,
          emissive: 0xd97706,
          emissiveIntensity: 0.5,
        })
        const shaftGeo = new THREE.CylinderGeometry(0.07, 0.07, 1)
        const shaft = new THREE.Mesh(shaftGeo, keyMat)
        shaft.rotation.z = Math.PI / 2
        brassKeyGroup.add(shaft)

        const bowGeo = new THREE.TorusGeometry(0.2, 0.06, 16, 32)
        const bow = new THREE.Mesh(bowGeo, keyMat)
        bow.position.set(-0.55, 0, 0)
        brassKeyGroup.add(bow)

        const bitGeo = new THREE.BoxGeometry(0.2, 0.25, 0.06)
        const bit = new THREE.Mesh(bitGeo, keyMat)
        bit.position.set(0.4, 0.12, 0)
        brassKeyGroup.add(bit)

        // Point light on the key
        const keyLight = new THREE.PointLight(0xf59e0b, 1.5, 4)
        keyLight.position.set(0, 0.4, 0)
        brassKeyGroup.add(keyLight)

        brassKeyGroup.position.set(-1.6, 2.4, 0)
        scene.add(brassKeyGroup)

        const keyHitGeo = new THREE.BoxGeometry(1.6, 1.2, 1)
        const keyHitMat = new THREE.MeshBasicMaterial({visible: false})
        const keyHitbox = new THREE.Mesh(keyHitGeo, keyHitMat)
        keyHitbox.position.copy(brassKeyGroup.position)
        keyHitbox.userData = {gameObject: keyObj}
        scene.add(keyHitbox)
        interactiveMeshes.push(keyHitbox)
      }

      // Ledger Book on table
      const bookGeo = new THREE.BoxGeometry(1.4, 0.18, 1)
      const bookMat = new THREE.MeshStandardMaterial({color: 0x78350f, roughness: 0.7})
      const book = new THREE.Mesh(bookGeo, bookMat)
      book.position.set(1.5, 2.25, 0)
      const ledgerObj = objects.find((o) => o._id === 'obj-clockmakers-journal')
      if (ledgerObj) {
        book.userData = {gameObject: ledgerObj}
        interactiveMeshes.push(book)
      }
      scene.add(book)
    } else if (eraYear === 1970) {
      // High-voltage wall conduit
      const conduitGeo = new THREE.CylinderGeometry(0.14, 0.14, 16, 16)
      const conduitMat = new THREE.MeshStandardMaterial({color: 0x94a3b8, metalness: 0.9, roughness: 0.2})
      const conduit = new THREE.Mesh(conduitGeo, conduitMat)
      conduit.rotation.z = Math.PI / 2
      conduit.position.set(0, 6.2, -7.5)
      scene.add(conduit)

      // Oscilloscope
      oscCanvas = document.createElement('canvas')
      oscCanvas.width = 256
      oscCanvas.height = 256
      oscTexture = new THREE.CanvasTexture(oscCanvas)

      const scopeGeo = new THREE.BoxGeometry(1.6, 1.3, 1.8)
      const scopeMat = new THREE.MeshStandardMaterial({color: 0x1e293b, metalness: 0.6})
      const scope = new THREE.Mesh(scopeGeo, scopeMat)
      scope.position.set(-1.8, 2.8, 0)
      scene.add(scope)

      const screenGeo = new THREE.PlaneGeometry(1, 0.9)
      const screenMat = new THREE.MeshBasicMaterial({map: oscTexture})
      const screen = new THREE.Mesh(screenGeo, screenMat)
      screen.position.set(-1.8, 2.8, 0.91)
      scene.add(screen)

      const scopeObj = objects.find((o) => o._id === 'obj-oscilloscope-1970')
      if (scopeObj) {
        scope.userData = {gameObject: scopeObj}
        interactiveMeshes.push(scope)
      }

      // Reel-to-Reel Recorder with 2 rotating reels
      const tapeDeckGeo = new THREE.BoxGeometry(1.8, 1.1, 1.4)
      const tapeDeckMat = new THREE.MeshStandardMaterial({color: 0x334155})
      const tapeDeck = new THREE.Mesh(tapeDeckGeo, tapeDeckMat)
      tapeDeck.position.set(1.8, 2.7, 0)
      scene.add(tapeDeck)

      const reelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.08, 24)
      const reelMat = new THREE.MeshStandardMaterial({color: 0x94a3b8, metalness: 0.9})
      const reel1 = new THREE.Mesh(reelGeo, reelMat)
      reel1.rotation.x = Math.PI / 2
      reel1.position.set(1.3, 2.9, 0.72)
      scene.add(reel1)
      tapeReels.push(reel1)

      const reel2 = new THREE.Mesh(reelGeo, reelMat)
      reel2.rotation.x = Math.PI / 2
      reel2.position.set(2.3, 2.9, 0.72)
      scene.add(reel2)
      tapeReels.push(reel2)

      const tapeObj = objects.find((o) => o._id === 'obj-tape-recorder-1970')
      if (tapeObj) {
        tapeDeck.userData = {gameObject: tapeObj}
        interactiveMeshes.push(tapeDeck)
      }
    } else {
      // 2026: Glowing Laser Grid
      const laserMat = new THREE.MeshBasicMaterial({color: 0xa855f7})
      ;[-2.4, 0, 2.4].forEach((x) => {
        const laser = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 6.5), laserMat)
        laser.position.set(x, 3.2, -4.5)
        scene.add(laser)
      })

      // Quantum Hologram Console
      const holoBaseGeo = new THREE.CylinderGeometry(0.9, 1.1, 0.35, 32)
      const holoBaseMat = new THREE.MeshStandardMaterial({color: 0x0f172a, metalness: 0.95})
      const holoBase = new THREE.Mesh(holoBaseGeo, holoBaseMat)
      holoBase.position.set(-1.8, 2.35, 0)
      scene.add(holoBase)

      const holoRingGeo = new THREE.TorusGeometry(0.7, 0.04, 16, 64)
      const holoRingMat = new THREE.MeshBasicMaterial({color: 0x38bdf8})
      const holoRing = new THREE.Mesh(holoRingGeo, holoRingMat)
      holoRing.rotation.x = Math.PI / 2
      holoRing.position.set(-1.8, 3, 0)
      scene.add(holoRing)

      const quantumObj = objects.find((o) => o._id === 'obj-quantum-console')
      if (quantumObj) {
        holoBase.userData = {gameObject: quantumObj}
        interactiveMeshes.push(holoBase)
      }

      // If hidden compartment is revealed, render THE CHRONOS CORE CYLINDER!
      if (isCompartmentRevealed) {
        coreGroup = new THREE.Group()
        coreGroup.position.set(0, 4.6, -7.1)

        const coreGeo = new THREE.DodecahedronGeometry(0.55, 0)
        const coreMat = new THREE.MeshStandardMaterial({
          color: 0xe9d5ff,
          emissive: 0xa855f7,
          emissiveIntensity: 1.6,
          roughness: 0.1,
          metalness: 0.9,
        })
        const coreDodec = new THREE.Mesh(coreGeo, coreMat)
        coreGroup.add(coreDodec)

        // Multiple orbital rings
        const ring1Geo = new THREE.TorusGeometry(0.85, 0.03, 16, 48)
        const ringMat = new THREE.MeshBasicMaterial({color: 0x38bdf8})
        const ring1 = new THREE.Mesh(ring1Geo, ringMat)
        coreGroup.add(ring1)

        const ring2Geo = new THREE.TorusGeometry(1, 0.03, 16, 48)
        const ring2 = new THREE.Mesh(ring2Geo, new THREE.MeshBasicMaterial({color: 0xf43f5e}))
        ring2.rotation.x = Math.PI / 3
        coreGroup.add(ring2)

        const coreLight = new THREE.PointLight(0xa855f7, 4, 10)
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
      }
    }

    // 5. Floating Dust / Tachyon Nebula Particles
    const particleCount = 160
    const particleGeo = new THREE.BufferGeometry()
    const particlePositions = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 15
      particlePositions[i + 1] = Math.random() * 8
      particlePositions[i + 2] = (Math.random() - 0.5) * 15
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
    const particleMat = new THREE.PointsMaterial({
      color: eraColors.primary,
      size: 0.14,
      transparent: true,
      opacity: 0.8,
    })
    const particles = new THREE.Points(particleGeo, particleMat)
    scene.add(particles)

    // 6. Interactive Raycasting & Mouse Controls
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

      // Check click raycast
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
        8,
        Math.min(26, cameraAngleRef.current.radius + event.deltaY * 0.015),
      )
      updateCameraPos()
    }

    const domElement = renderer.domElement
    domElement.addEventListener('mousemove', onMouseMove)
    domElement.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    domElement.addEventListener('wheel', onWheel, {passive: false})

    // 7. Render Loop with Continuous Dynamics
    let animationFrameId: number
    let clockTime = 0

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
        brassKeyGroup.rotation.y = Math.sin(clockTime * 1.5) * 0.3
        brassKeyGroup.position.y = 2.4 + Math.sin(clockTime * 2) * 0.06
      }

      // Tape reels spinning
      tapeReels.forEach((r) => {
        r.rotation.z += 0.06
      })

      // Chronos core multidimensional spinning
      if (coreGroup) {
        coreGroup.children[0].rotation.x += 0.025
        coreGroup.children[0].rotation.y += 0.035
        coreGroup.children[1].rotation.z += 0.04
        coreGroup.children[2].rotation.x -= 0.03
        coreGroup.position.y = 4.6 + Math.sin(clockTime * 2.5) * 0.12
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
            const y = 128 + Math.sin(x * 0.09 + clockTime * 3) * 45
            if (x === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
          }
          ctx.stroke()
          oscTexture.needsUpdate = true
        }
      }

      // Particle drifting
      const positions = particleGeo.attributes.position.array as Float32Array
      for (let i = 1; i < particleCount * 3; i += 3) {
        positions[i] -= 0.012
        if (positions[i] < 0) positions[i] = 8
      }
      particleGeo.attributes.position.needsUpdate = true

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

  return (
    <div style={{position: 'relative', width: '100%', height: '540px', borderRadius: '10px', overflow: 'hidden'}}>
      <div ref={mountRef} style={{width: '100%', height: '100%', cursor: 'grab'}} />

      {/* 3D HUD Telemetry */}
      <div style={{position: 'absolute', top: '15px', left: '15px', color: '#94a3b8', fontFamily: 'monospace', fontSize: '0.75rem', pointerEvents: 'none', background: 'rgba(5, 7, 15, 0.85)', padding: '0.45rem 0.8rem', borderRadius: '6px', border: '1px solid #1e293b'}}>
        <div style={{color: '#f8fafc', fontWeight: 'bold'}}>
          // 3D_SPATIAL_ORBIT_CAMERA
        </div>
        <div style={{color: '#cbd5e1', fontSize: '0.7rem'}}>
          Drag: Rotate 360° | Scroll: Zoom | Click: Inspect Artifact
        </div>
      </div>

      {hoveredName && (
        <div style={{position: 'absolute', bottom: '25px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(15, 23, 42, 0.95)', border: '1px solid #a855f7', color: '#ffffff', padding: '0.5rem 1.25rem', borderRadius: '6px', fontSize: '0.9rem', fontFamily: 'monospace', pointerEvents: 'none', boxShadow: '0 0 20px rgba(168, 85, 247, 0.6)'}}>
          ⚡ SCANNER LOCKED: {hoveredName}
        </div>
      )}
    </div>
  )
}
