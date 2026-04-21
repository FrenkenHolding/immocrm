'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const login = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('E-Mail oder Passwort falsch.'); setLoading(false) }
    else router.push('/dashboard')
  }

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f4f4f0'}}>
      <div style={{background:'#fff',borderRadius:16,border:'1px solid #e5e5e0',padding:'40px 36px',width:'100%',maxWidth:400}}>
        <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:32}}>
          <div style={{width:44,height:44,borderRadius:10,background:'#1a3c5e',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,fontWeight:700}}>F</div>
          <div>
            <div style={{fontSize:16,fontWeight:600}}>Frenken Immobilien</div>
            <div style={{fontSize:12,color:'#888',marginTop:2}}>Verwaltungsportal</div>
          </div>
        </div>
        <form onSubmit={login}>
          <div style={{marginBottom:14}}>
            <label style={{display:'block',fontSize:13,color:'#555',marginBottom:5,fontWeight:500}}>E-Mail</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="ihre@email.de" required autoFocus
              style={{width:'100%',padding:'10px 14px',border:'1px solid #ddd',borderRadius:8,fontSize:14,background:'#fafafa',color:'#1a1a1a',outline:'none'}}/>
          </div>
          <div style={{marginBottom:14}}>
            <label style={{display:'block',fontSize:13,color:'#555',marginBottom:5,fontWeight:500}}>Passwort</label>
            <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="••••••••" required
              style={{width:'100%',padding:'10px 14px',border:'1px solid #ddd',borderRadius:8,fontSize:14,background:'#fafafa',color:'#1a1a1a',outline:'none'}}/>
          </div>
          {error && <div style={{background:'#fef2f2',color:'#b91c1c',borderRadius:8,padding:'10px 14px',fontSize:13,marginBottom:14}}>{error}</div>}
          <button type="submit" disabled={loading}
            style={{width:'100%',padding:12,background:'#1a3c5e',color:'#fff',border:'none',borderRadius:8,fontSize:14,fontWeight:600,cursor:'pointer',marginTop:4}}>
            {loading ? 'Wird angemeldet...' : 'Anmelden'}
          </button>
        </form>
      </div>
    </div>
  )
}
