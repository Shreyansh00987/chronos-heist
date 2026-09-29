'use client'

import React, {useState, useTransition} from 'react'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {executeDemoRun, resetDemoData} from '@/app/actions'

export function NavigationHeader({sessionCode = 'CHRONOS-ALPHA'}: {sessionCode?: string}) {
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [demoMessage, setDemoMessage] = useState<string | null>(null)

  const navLinks = [
    {href: '/', label: 'Briefing'},
    {href: `/game/${sessionCode}`, label: 'Vault Room'},
    {href: `/game/${sessionCode}/timeline`, label: 'Timeline Scanner'},
    {href: '/causality', label: 'Causality Graph'},
    {href: `/gm/${sessionCode}`, label: 'Game Master'},
    {href: '/studio', label: 'Sanity Studio', target: '_blank'},
  ]

  const handleRunDemo = () => {
    setDemoMessage('Triggering 1920 Brass Key action & executing Causality Engine...')
    startTransition(async () => {
      try {
        await executeDemoRun()
        setDemoMessage('Temporal causality propagated! Check 2026 Vault & Game Master.')
        setTimeout(() => setDemoMessage(null), 5000)
      } catch (err: any) {
        setDemoMessage(`Error: ${err.message}`)
        setTimeout(() => setDemoMessage(null), 6000)
      }
    })
  }

  const handleReset = () => {
    setDemoMessage('Resetting timeline states & hidden compartments in Sanity Lake...')
    startTransition(async () => {
      try {
        await resetDemoData()
        setDemoMessage('Timeline successfully reset to baseline.')
        setTimeout(() => setDemoMessage(null), 4000)
      } catch (err: any) {
        setDemoMessage(`Reset Error: ${err.message}`)
        setTimeout(() => setDemoMessage(null), 5000)
      }
    })
  }

  return (
    <header style={{background: '#0a0e17', borderBottom: '1px solid #1e293b', position: 'sticky', top: 0, zIndex: 100}}>
      {demoMessage && (
        <div style={{background: '#581c87', color: '#f3e8ff', padding: '0.4rem 1rem', fontSize: '0.8rem', textAlign: 'center', fontFamily: 'monospace', borderBottom: '1px solid #7e22ce'}}>
          {demoMessage}
        </div>
      )}
      <div style={{maxWidth: '1400px', margin: '0 auto', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem'}}>
        {/* Brand */}
        <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
          <div style={{width: '10px', height: '10px', borderRadius: '50%', background: '#a855f7', boxShadow: '0 0 10px #a855f7'}} />
          <Link href="/" style={{fontWeight: 800, letterSpacing: '0.12em', fontSize: '1.05rem', color: '#f8fafc', fontFamily: 'monospace'}}>
            CHRONOS<span style={{color: '#a855f7'}}>-HEIST</span>
          </Link>
          <span style={{background: '#1e293b', color: '#94a3b8', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontFamily: 'monospace'}}>
            SANITY_LAKE_LIVE
          </span>
        </div>

        {/* Navigation Links */}
        <nav style={{display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap'}}>
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
            return (
              <Link
                key={link.href}
                href={link.href}
                target={link.target}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  fontFamily: 'monospace',
                  transition: 'all 0.15s ease',
                  background: isActive ? '#1e1b4b' : 'transparent',
                  color: isActive ? '#c084fc' : '#94a3b8',
                  border: isActive ? '1px solid #7c3aed' : '1px solid transparent',
                }}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Actions */}
        <div style={{display: 'flex', alignItems: 'center', gap: '0.6rem'}}>
          <button
            onClick={handleRunDemo}
            disabled={isPending}
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '0.45rem 1rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              fontFamily: 'monospace',
              cursor: isPending ? 'wait' : 'pointer',
              boxShadow: '0 0 12px rgba(124, 58, 237, 0.4)',
            }}
          >
            {isPending ? 'MUTATING...' : '⚡ RUN CAUSALITY DEMO'}
          </button>
          <button
            onClick={handleReset}
            disabled={isPending}
            style={{
              background: '#1e293b',
              color: '#cbd5e1',
              border: '1px solid #334155',
              borderRadius: '6px',
              padding: '0.45rem 0.75rem',
              fontSize: '0.8rem',
              fontFamily: 'monospace',
              cursor: isPending ? 'wait' : 'pointer',
            }}
          >
            RESET
          </button>
        </div>
      </div>
    </header>
  )
}
