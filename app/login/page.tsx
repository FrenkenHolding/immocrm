'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('E-Mail oder Passwort falsch.')
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>F</div>
          <div>
            <div style={styles.logoTitle}>Frenken Immobilien</div>
            <div style={styles.logoSub}>Verwaltungsportal</div>
          </div>
        </div>

        <form onSubmit={handleLogin}>
          <div style={styles.field}>
            <label style={styles.label}>E-Mail</label>
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="ihre@email.de"
              required
              autoFocus
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Passwort</label>
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          {error && <div style={styles.error}>{error}</div>}
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Wird angemeldet...' : 'Anmelden'}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f5f5f0',
  },
  card: {
    background: '#fff',
    borderRadius: 16,
    border: '1px solid #e8e8e0',
    padding: '40px 36px',
    width: '100%',
    maxWidth: 400,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    marginBottom: 32,
  },
  logoIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    background: '#1D9E75',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
    fontWeight: 600,
  },
  logoTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#1a1a1a',
  },
  logoSub: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    display: 'block',
    fontSize: 13,
    color: '#555',
    marginBottom: 6,
    fontWeight: 500,
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #ddd',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
    background: '#fafafa',
    color: '#1a1a1a',
  },
  error: {
    background: '#fff0f0',
    color: '#c0392b',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 13,
    marginBottom: 16,
  },
  btn: {
    width: '100%',
    padding: '12px',
    background: '#1D9E75',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 8,
  },
}
