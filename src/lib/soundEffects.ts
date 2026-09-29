/**
 * Web Audio API Sound Synthesizer
 * Zero-dependency procedural retro-futuristic sound effects & ambient loops
 */

let audioCtx: AudioContext | null = null
let soundEnabled = true
let ambientSource: OscillatorNode | null = null
let ambientGain: GainNode | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

export function toggleSound(): boolean {
  soundEnabled = !soundEnabled
  if (!soundEnabled && ambientSource) {
    try {
      ambientSource.stop()
      ambientSource = null
    } catch {}
  }
  return soundEnabled
}

export function isSoundEnabled(): boolean {
  return soundEnabled
}

export function playTick() {
  if (!soundEnabled) return
  const ctx = getAudioContext()
  if (!ctx) return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(800, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.04)
  gain.gain.setValueAtTime(0.12, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + 0.04)
}

export function playBeep() {
  if (!soundEnabled) return
  const ctx = getAudioContext()
  if (!ctx) return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(587.33, ctx.currentTime) // D5
  gain.gain.setValueAtTime(0.1, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + 0.1)
}

export function playWarp() {
  if (!soundEnabled) return
  const ctx = getAudioContext()
  if (!ctx) return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(110, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2)
  osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.45)
  gain.gain.setValueAtTime(0.15, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + 0.45)
}

export function playDiscoveryFanfare() {
  if (!soundEnabled) return
  const ctx = getAudioContext()
  if (!ctx) return
  // Grand C Major Arpeggio with temporal shimmer
  const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5]
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    const start = ctx.currentTime + idx * 0.08
    osc.frequency.setValueAtTime(freq, start)
    gain.gain.setValueAtTime(0.18, start)
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(start)
    osc.stop(start + 0.55)
  })
}

export function playLaserSolve() {
  if (!soundEnabled) return
  const ctx = getAudioContext()
  if (!ctx) return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(1200, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.25)
  gain.gain.setValueAtTime(0.15, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + 0.25)
}
