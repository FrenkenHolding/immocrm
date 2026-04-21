'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import Sidebar from '../../components/Sidebar'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({ objekte: 0, mieter: 0, einheiten: 0, leerstand: 0 })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setUser(session.user)
      loadStats()
    })
  }, [router])

  const loadStats = async () => {
    const { data: objekte } = await supabase.from('objekte').select('id, einheiten')
    const { data: mieter } = await supabase.from('mieter').select('id, status')
    const totalEinheiten = objekte?.reduce((s, o) => s + (o.einheiten || 0), 0) || 0
    const aktiveMieter = mieter?.filter(m => m.status === 'aktiv').length || 0
    setStats({
      objekte: objekte?.length || 0,
      mieter: mieter?.length || 0,
      einheiten: totalEinheiten,
      leerstand: totalEinheiten - aktiveMieter
    })
  }

  if (!user) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',fontSize:14,color:'#888'}}>Laden...</div>

  return (
    <div style={{display:'flex',minHeight:'100vh'}}>
      <Sidebar user={user} />
      <div style={{flex:1,padding:28}}>
        <div style={{marginBottom:24}}>
          <h1 style={{fontSize:22,fontWeight:600,color:'#1a1a1a'}}>Willkommen zurück</h1>
          <p style={{fontSize:14,color:'#888',marginTop:4}}>Übersicht Ihrer Immobilienverwaltung</p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:24}}>
          {[
            { label:'Objekte', value: stats.objekte, sub:'Liegenschaften', color:'#1a3c5e' },
            { label:'Mieter', value: stats.mieter, sub:'Aktive Mietverhältnisse', color:'#1D9E75' },
            { label:'Einheiten', value: stats.einheiten, sub:'Gesamt', color:'#7c3aed' },
            { label:'Leerstand', value: stats.leerstand, sub:'Freie Einheiten', color:'#d97706' },
          ].map(k => (
            <div key={k.label} style={{background:'#fff',borderRadius:12,border:'1px solid #e5e5e0',padding:'16px 18px'}}>
              <div style={{fontSize:11,color:'#888',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:6}}>{k.label}</div>
              <div style={{fontSize:28,fontWeight:700,color:k.color}}>{k.value}</div>
              <div style={{fontSize:12,color:'#aaa',marginTop:3}}>{k.sub}</div>
            </div>
          ))}
        </div>
        <div style={{background:'#fff',borderRadius:12,border:'1px solid #e5e5e0',padding:'20px 24px'}}>
          <h2 style={{fontSize:15,fontWeight:600,marginBottom:14}}>Schnellzugriff</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12}}>
            <button onClick={() => router.push('/objekte')}
              style={{padding:'14px 18px',background:'#eef2f7',border:'none',borderRadius:10,cursor:'pointer',textAlign:'left',fontSize:14,fontWeight:500,color:'#1a3c5e'}}>
              🏠 Alle Objekte anzeigen
            </button>
            <button onClick={() => router.push('/objekte')}
              style={{padding:'14px 18px',background:'#f0fdf4',border:'none',borderRadius:10,cursor:'pointer',textAlign:'left',fontSize:14,fontWeight:500,color:'#166534'}}>
              👤 Mieter verwalten
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
