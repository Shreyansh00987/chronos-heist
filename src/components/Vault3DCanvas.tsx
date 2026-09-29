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
}

export function Vault3DCanvas({
  eraYear,
  objects,
  isCompartmentRevealed,
  onSelectObject,
  selectedObjectId,
}: Vault3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const [hoveredName, setHoveredName] = useState<string | null>(null)
  const isDraggingRef = useRef(false)
  const previousMousePositionRef = useRef({x: 0, y: 0})
  const cameraAngleRef = useRef({theta: Math.PI / 4, phi: Math.PI / 6, radius: 18})

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    playWarp()

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene()
    const width = container.clientWidth
    const height = container.clientHeight || 520

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    
    // Set initial camera position from spherical angles
    const updateCameraPos = () => {
      const {theta, phi, radius} = cameraAngleRef.current
      camera.position.x = radius * Math.sin(theta) * Math.cos(phi)
      camera.position.y = radius * Math.sin(phi) + 2
      camera.position.z = radius * Math.cos(theta) * Math.cos(phi)
      camera.lookAt(0, 2, 0)
    }
    updateCameraPos()

    const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true})
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.innerHTML = ''
    container.appendChild(renderer.domElement)

    // Era-based color palettes
    const eraColors = {
      1920: {ambient: 0x451a03, primary: 0xd97706, bg: 0x0c0702, fog: 0x140a04},
      1970: {ambient: 0x083344, primary: 0x06b6d4, bg: 0x020f14, fog: 0x031820},
      2026: {ambient: 0x2e1065, primary: 0xa855f7, bg: 0x090312, fog: 0x11051e},
    }[eraYear as 1920 | 1970 | 2026] || {ambient: 0x1e293b, primary: 0xa855f7, bg: 0x07090e, fog: 0x0a0f1d}

    scene.background = new THREE.Color(eraColors.bg)
    scene.fog = new THREE.FogExp2(eraColors.fog, 0.04)

    // Lighting
    const ambientLight = new THREE.AmbientLight(eraColors.ambient, 1.2)
    scene.add(ambientLight)

    const mainLight = new THREE.PointLight(eraColors.primary, 2.8, 25)
    mainLight.position.set(0, 7, 0)
    mainLight.castShadow = true
    scene.add(mainLight)

    // Subtle wall lantern / beacon lights
    const lantern1 = new THREE.PointLight(eraColors.primary, 1.5, 12)
    lantern1.position.set(-6, 4, -6)
    scene.add(lantern1)

    const lantern2 = new THREE.PointLight(eraColors.primary, 1.5, 12)
    lantern2.position.set(6, 4, -6)
    scene.add(lantern2)

    // 2. Room Geometry (Floor, Walls, Molding)
    // Floor
    const floorGeo = new THREE.PlaneGeometry(16, 16)
    const floorMat = new THREE.MeshStandardMaterial({
      color: eraYear === 1920 ? 0x29180c : eraYear === 1970 ? 0x1e293b : 0x0b0f19,
      roughness: 0.6,
      metalness: eraYear === 2026 ? 0.7 : 0.1,
    })
    const floor = new THREE.Mesh(floorGeo, floorMat)
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    scene.add(floor)

    // Floor Grid wireframe overlay for 2026 / 1970
    if (eraYear !== 1920) {
      const grid = new THREE.GridHelper(16, 16, eraColors.primary, 0x1e293b)
      grid.position.y = 0.02
      scene.add(grid)
    }

    // North Wall (Back)
    const wallMat = new THREE.MeshStandardMaterial({
      color: eraYear === 1920 ? 0x3d2314 : eraYear === 1970 ? 0x334155 : 0x181424,
      roughness: 0.8,
    })
    const northWallGeo = new THREE.BoxGeometry(16, 8, 0.5)
    const northWall = new THREE.Mesh(northWallGeo, wallMat)
    northWall.position.set(0, 4, -8)
    northWall.receiveShadow = true
    scene.add(northWall)

    // West Wall
    const westWallGeo = new THREE.BoxGeometry(0.5, 8, 16)
    const westWall = new THREE.Mesh(westWallGeo, wallMat)
    westWall.position.set(-8, 4, 0)
    westWall.receiveShadow = true
    scene.add(westWall)

    // 3. Central Investigation Table / Workbench
    const tableGeo = new THREE.BoxGeometry(6, 0.3, 3)
    const tableMat = new THREE.MeshStandardMaterial({
      color: eraYear === 1920 ? 0x451a03 : 0x1f2937,
      roughness: 0.4,
      metalness: eraYear === 2026 ? 0.8 : 0.2,
    })
    const table = new THREE.Mesh(tableGeo, tableMat)
    table.position.set(0, 2, 0)
    table.castShadow = true
    table.receiveShadow = true
    scene.add(table)

    // Table legs
    const legGeo = new THREE.CylinderGeometry(0.1, 0.1, 2)
    const legMat = new THREE.MeshStandardMaterial({color: 0x111827})
    ;[
      [-2.6, 1, -1.2],
      [2.6, 1, -1.2],
      [-2.6, 1, 1.2],
      [2.6, 1, 1.2],
    ].forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(legGeo, legMat)
      leg.position.set(x, y, z)
      scene.add(leg)
    })

    // 4. Interactive 3D Objects Setup
    const interactiveMeshes: THREE.Mesh[] = []

    // NORTH WALL CAVITY / COMPARTMENT
    const cavityFrameGeo = new THREE.BoxGeometry(3, 2, 0.4)
    const cavityMat = new THREE.MeshStandardMaterial({
      color: eraYear === 2026 && isCompartmentRevealed ? 0xa855f7 : 0x1e293b,
      emissive: eraYear === 2026 && isCompartmentRevealed ? 0x6b21a8 : 0x000000,
      emissiveIntensity: 0.8,
    })
    const cavity = new THREE.Mesh(cavityFrameGeo, cavityMat)
    cavity.position.set(0, 4.5, -7.7)
    const cavityObj = objects.find((o) => o._id.includes('north-wall')) || {
      _id: 'north-wall',
      name: eraYear === 1920 ? 'North Wall Mortar Cavity' : 'North Wall Compartment',
      description: 'Hidden architectural chamber in the north masonry.',
      objectType: 'wall',
    }
    cavity.userData = {gameObject: cavityObj}
    scene.add(cavity)
    interactiveMeshes.push(cavity)

    // Pendulum for Grandfather Clock (1920)
    let pendulumMesh: THREE.Mesh | null = null

    // Oscilloscope canvas dynamic texture (1970)
    let oscCanvas: HTMLCanvasElement | null = null
    let oscTexture: THREE.CanvasTexture | null = null

    // Spinning Core (2026)
    let coreMesh: THREE.Mesh | null = null

    // ERA SPECIFIC 3D PROPS
    if (eraYear === 1920) {
      // Grandfather Clock in corner
      const clockBodyGeo = new THREE.BoxGeometry(1.6, 7, 1.4)
      const clockBodyMat = new THREE.MeshStandardMaterial({color: 0x3b1c09, roughness: 0.3})
      const clock = new THREE.Mesh(clockBodyGeo, clockBodyMat)
      clock.position.set(6, 3.5, -6.5)
      scene.add(clock)

      // Clock face
      const faceGeo = new THREE.CircleGeometry(0.5, 32)
      const faceMat = new THREE.MeshBasicMaterial({color: 0xfef3c7})
      const face = new THREE.Mesh(faceGeo, faceMat)
      face.position.set(6, 5.8, -5.79)
      scene.add(face)

      // Pendulum
      const penGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.5)
      const penMat = new THREE.MeshStandardMaterial({color: 0xd97706, metalness: 0.9})
      pendulumMesh = new THREE.Mesh(penGeo, penMat)
      pendulumMesh.position.set(6, 3.8, -5.8)
      scene.add(pendulumMesh)

      // BRASS KEY on table
      const keyObj = objects.find((o) => o._id === 'obj-brass-key')
      if (keyObj && keyObj.state !== 'buried') {
        const keyGroup = new THREE.Group()
        const keyShaftGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.8)
        const keyMat = new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          metalness: 0.9,
          roughness: 0.2,
          emissive: 0xd97706,
          emissiveIntensity: 0.3,
        })
        const shaft = new THREE.Mesh(keyShaftGeo, keyMat)
        shaft.rotation.z = Math.PI / 2
        keyGroup.add(shaft)

        const bowGeo = new THREE.TorusGeometry(0.16, 0.05, 16, 32)
        const bow = new THREE.Mesh(bowGeo, keyMat)
        bow.position.set(-0.45, 0, 0)
        keyGroup.add(bow)

        keyGroup.position.set(-1.5, 2.3, 0)
        scene.add(keyGroup)

        // Make key clickable
        const keyHitGeo = new THREE.BoxGeometry(1.2, 0.8, 0.8)
        const keyHitMat = new THREE.MeshBasicMaterial({visible: false})
        const keyHitbox = new THREE.Mesh(keyHitGeo, keyHitMat)
        keyHitbox.position.copy(keyGroup.position)
        keyHitbox.userData = {gameObject: keyObj}
        scene.add(keyHitbox)
        interactiveMeshes.push(keyHitbox)
      }

      // Ledger Book on table
      const bookGeo = new THREE.BoxGeometry(1.2, 0.15, 0.9)
      const bookMat = new THREE.MeshStandardMaterial({color: 0x78350f})
      const book = new THREE.Mesh(bookGeo, bookMat)
      book.position.set(1.5, 2.2, 0)
      const ledgerObj = objects.find((o) => o._id === 'obj-clockmakers-journal')
      if (ledgerObj) {
        book.userData = {gameObject: ledgerObj}
        interactiveMeshes.push(book)
      }
      scene.add(book)
    } else if (eraYear === 1970) {
      // High-voltage wall conduit
      const conduitGeo = new THREE.CylinderGeometry(0.12, 0.12, 16)
      const conduitMat = new THREE.MeshStandardMaterial({color: 0x64748b, metalness: 0.8})
      const conduit = new THREE.Mesh(conduitGeo, conduitMat)
      conduit.rotation.z = Math.PI / 2
      conduit.position.set(0, 5.8, -7.6)
      scene.add(conduit)

      // Oscilloscope on table
      oscCanvas = document.createElement('canvas')
      oscCanvas.width = 256
      oscCanvas.height = 256
      oscTexture = new THREE.CanvasTexture(oscCanvas)

      const scopeGeo = new THREE.BoxGeometry(1.4, 1.2, 1.6)
      const scopeMat = new THREE.MeshStandardMaterial({color: 0x1e293b})
      const scope = new THREE.Mesh(scopeGeo, scopeMat)
      scope.position.set(-1.6, 2.7, 0)
      scene.add(scope)

      const screenGeo = new THREE.PlaneGeometry(0.9, 0.8)
      const screenMat = new THREE.MeshBasicMaterial({map: oscTexture})
      const screen = new THREE.Mesh(screenGeo, screenMat)
      screen.position.set(-1.6, 2.7, 0.81)
      scene.add(screen)

      const scopeObj = objects.find((o) => o._id === 'obj-oscilloscope-1970')
      if (scopeObj) {
        scope.userData = {gameObject: scopeObj}
        interactiveMeshes.push(scope)
      }

      // Reel to reel on right table
      const tapeGeo = new THREE.BoxGeometry(1.6, 1, 1.2)
      const tapeMat = new THREE.MeshStandardMaterial({color: 0x334155})
      const tape = new THREE.Mesh(tapeGeo, tapeMat)
      tape.position.set(1.6, 2.6, 0)
      const tapeObj = objects.find((o) => o._id === 'obj-tape-recorder-1970')
      if (tapeObj) {
        tape.userData = {gameObject: tapeObj}
        interactiveMeshes.push(tape)
      }
      scene.add(tape)
    } else {
      // 2026: Holographic Laser Grid Barrier
      const laserGeo = new THREE.CylinderGeometry(0.03, 0.03, 6)
      const laserMat = new THREE.MeshBasicMaterial({color: 0xa855f7})
      ;[-2, 0, 2].forEach((x) => {
        const laser = new THREE.Mesh(laserGeo, laserMat)
        laser.position.set(x, 3, -4)
        scene.add(laser)
      })

      // Quantum Hologram Console on table
      const holoBaseGeo = new THREE.CylinderGeometry(0.8, 1, 0.3, 32)
      const holoMat = new THREE.MeshStandardMaterial({color: 0x0f172a, metalness: 0.9})
      const holoBase = new THREE.Mesh(holoBaseGeo, holoMat)
      holoBase.position.set(-1.8, 2.3, 0)
      scene.add(holoBase)

      const holoRingGeo = new THREE.TorusGeometry(0.6, 0.03, 16, 64)
      const holoRingMat = new THREE.MeshBasicMaterial({color: 0x38bdf8})
      const holoRing = new THREE.Mesh(holoRingGeo, holoRingMat)
      holoRing.rotation.x = Math.PI / 2
      holoRing.position.set(-1.8, 2.9, 0)
      scene.add(holoRing)

      const quantumObj = objects.find((o) => o._id === 'obj-quantum-console')
      if (quantumObj) {
        holoBase.userData = {gameObject: quantumObj}
        interactiveMeshes.push(holoBase)
      }

      // If hidden compartment is revealed, render THE CHRONOS CORE!
      if (isCompartmentRevealed) {
        const coreGeo = new THREE.DodecahedronGeometry(0.5, 0)
        const coreMat = new THREE.MeshStandardMaterial({
          color: 0xc084fc,
          emissive: 0x9333ea,
          emissiveIntensity: 1.2,
          roughness: 0.1,
          metalness: 0.8,
        })
        coreMesh = new THREE.Mesh(coreGeo, coreMat)
        coreMesh.position.set(0, 4.5, -7.2)

        const coreHaloGeo = new THREE.RingGeometry(0.7, 0.85, 32)
        const coreHaloMat = new THREE.MeshBasicMaterial({color: 0xa855f7, side: THREE.DoubleSide})
        const coreHalo = new THREE.Mesh(coreHaloGeo, coreHaloMat)
        coreMesh.add(coreHalo)

        const coreLight = new THREE.PointLight(0xa855f7, 3, 8)
        coreLight.position.set(0, 0, 0.5)
        coreMesh.add(coreLight)

        const coreObj = objects.find((o) => o._id === 'obj-chronos-core') || {
          _id: 'obj-chronos-core',
          name: 'The Chronos Core Cylinder',
          description: 'The ultimate temporal artifact materialized from 1920 causality.',
          objectType: 'artifact',
        }
        coreMesh.userData = {gameObject: coreObj}
        scene.add(coreMesh)
        interactiveMeshes.push(coreMesh)
      }
    }

    // 5. Dust / Tachyon Floating Particles
    const particleCount = 120
    const particleGeo = new THREE.BufferGeometry()
    const particlePositions = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 14
      particlePositions[i + 1] = Math.random() * 7
      particlePositions[i + 2] = (Math.random() - 0.5) * 14
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
    const particleMat = new THREE.PointsMaterial({
      color: eraColors.primary,
      size: 0.1,
      transparent: true,
      opacity: 0.7,
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

      // Handle Orbit Dragging
      if (isDraggingRef.current) {
        const deltaX = event.clientX - previousMousePositionRef.current.x
        const deltaY = event.clientY - previousMousePositionRef.current.y

        cameraAngleRef.current.theta -= deltaX * 0.008
        cameraAngleRef.current.phi = Math.max(
          0.1,
          Math.min(Math.PI / 2.2, cameraAngleRef.current.phi + deltaY * 0.008),
        )
        updateCameraPos()

        previousMousePositionRef.current = {x: event.clientX, y: event.clientY}
        return
      }

      // Raycast hover
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

    const onMouseUp = (event: MouseEvent) => {
      isDraggingRef.current = false
      renderer.domElement.style.cursor = 'grab'

      // Check click raycast
      const rect = renderer.domElement.getBoundingClientRect()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
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
        10,
        Math.min(26, cameraAngleRef.current.radius + event.deltaY * 0.015),
      )
      updateCameraPos()
    }

    const domElement = renderer.domElement
    domElement.addEventListener('mousemove', onMouseMove)
    domElement.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    domElement.addEventListener('wheel', onWheel, {passive: false})

    // 7. Animation Loop
    let animationFrameId: number
    let clockTime = 0

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      clockTime += 0.025

      // Grandfather clock pendulum oscillation
      if (pendulumMesh) {
        pendulumMesh.rotation.z = Math.sin(clockTime * 2.2) * 0.25
      }

      // Chronos core spinning & pulse
      if (coreMesh) {
        coreMesh.rotation.x += 0.02
        coreMesh.rotation.y += 0.03
        coreMesh.position.y = 4.5 + Math.sin(clockTime * 2) * 0.1
      }

      // Oscilloscope sine wave draw
      if (oscCanvas && oscTexture) {
        const ctx = oscCanvas.getContext('2d')
        if (ctx) {
          ctx.fillStyle = '#051b1f'
          ctx.fillRect(0, 0, 256, 256)
          ctx.strokeStyle = '#22d3ee'
          ctx.lineWidth = 4
          ctx.beginPath()
          for (let x = 0; x < 256; x += 4) {
            const y = 128 + Math.sin(x * 0.08 + clockTime * 3) * 45
            if (x === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
          }
          ctx.stroke()
          oscTexture.needsUpdate = true
        }
      }

      // Particle subtle drifting
      const positions = particleGeo.attributes.position.array as Float32Array
      for (let i = 1; i < particleCount * 3; i += 3) {
        positions[i] -= 0.01
        if (positions[i] < 0) positions[i] = 7
      }
      particleGeo.attributes.position.needsUpdate = true

      renderer.render(scene, camera)
    }

    animate()

    // Handle Window Resize
    const handleResize = () => {
      if (!container) return
      const newW = container.clientWidth
      const newH = container.clientHeight || 520
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
    <div style={{position: 'relative', width: '100%', height: '520px', borderRadius: '10px', overflow: 'hidden'}}>
      <div ref={mountRef} style={{width: '100%', height: '100%', cursor: 'grab'}} />

      {/* 3D HUD Overlay */}
      <div style={{position: 'absolute', top: '15px', left: '15px', color: '#94a3b8', fontFamily: 'monospace', fontSize: '0.75rem', pointerEvents: 'none', background: 'rgba(5, 7, 15, 0.75)', padding: '0.4rem 0.75rem', borderRadius: '4px', border: '1px solid #1e293b'}}>
        <div>// 3D_TEMPORAL_PERSPECTIVE_ENGINE</div>
        <div style={{color: '#f8fafc', fontWeight: 'bold'}}>
          DRAG TO ORBIT ROOM // SCROLL TO ZOOM // CLICK OBJECTS
        </div>
      </div>

      {hoveredName && (
        <div style={{position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(15, 23, 42, 0.95)', border: '1px solid #a855f7', color: '#ffffff', padding: '0.4rem 1rem', borderRadius: '6px', fontSize: '0.85rem', fontFamily: 'monospace', pointerEvents: 'none', boxShadow: '0 0 16px rgba(168, 85, 247, 0.4)'}}>
          ⚡ TARGET: {hoveredName}
        </div>
      )}
    </div>
  )
}
