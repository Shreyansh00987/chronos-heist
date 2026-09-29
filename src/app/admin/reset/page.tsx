import {resetDemoData} from '../../actions'
import {NavigationHeader} from '@/components/NavigationHeader'

export default function ResetPage() {
  async function handleReset() {
    'use server'
    await resetDemoData()
  }

  return (
    <div style={{minHeight: '100vh', background: '#07090e', color: '#e2e8f0', display: 'flex', flexDirection: 'column'}}>
      <NavigationHeader />
      <main style={{maxWidth: '640px', margin: '3rem auto', padding: '2rem', background: '#0d131f', border: '1px solid #1e293b', borderRadius: '10px'}}>
        <h1 style={{fontSize: '1.75rem', margin: '0 0 1rem 0', fontFamily: 'monospace', color: '#f8fafc'}}>
          Reset Demo Data
        </h1>
        <p style={{color: '#cbd5e1', lineHeight: 1.6, marginBottom: '1rem'}}>
          Deletes every temporary Temporal Action and temporary Paradox, and resets each Room&apos;s hidden compartments, structural state, and Timeline State back to their baseline values.
        </p>
        <p style={{color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem'}}>
          <strong>Era, Room, and Game Object documents remain preserved in Sanity Lake.</strong>
        </p>
        <form action={handleReset}>
          <button
            type="submit"
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              cursor: 'pointer',
              background: '#dc2626',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontFamily: 'monospace',
              fontWeight: 'bold',
            }}
          >
            Confirm &amp; Reset Demo Data
          </button>
        </form>
      </main>
    </div>
  )
}
