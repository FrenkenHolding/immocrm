'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import Sidebar from '../../components/Sidebar'

export default function ObjekteListe() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [objekte, setObjekte] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name:'', adresse:'', plz:'', ort:'', typ:'MFH', einheiten:'1', baujahr:'' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setUser(session.user)
      loadObjekte()
    })
  }, [router])

  const loadObjekte = async () => {
    setLoading(true)
    const { data } = await supabase.from('objekte').select('*').order('created_at', { ascending: false })
    setObjekte(data || [])
    setLoading(false)
  }

  const saveObjekt = async () => {
    setSaving(true)
    await supabase.from('objekte').insert([{
      name: form.name,
      adresse: form.adresse,
      plz: form.plz,
      ort: form.ort,
      typ: form.typ,
      einheiten: parseInt(form.einheiten) || 1,
      baujahr: form.baujahr || null
    }])
    setShowForm(false)
    setForm({ name:'', adresse:'', plz:'', ort:'', typ:'MFH', einheiten:'1', baujahr:'' })
    setSaving(false)
    loadObjekte()
  }

  if (!user) return null

  return (
    <div style={{display:'flex',minHeight:'100vh'}}>
      <Sidebar user={user} />
      <div style={{flex:1,padding:28}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
          <div>
            <h1 style={{fontSize:22,fontWeight:600}}>Objekte</h1>
            <p style={{fontSize:14,color:'#888',marginTop:4}}>Alle Liegenschaften im Überblick</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            style={{padding:'10px 18px',background:'#1a3c5e',color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer'}}>
            + Neues Objekt
          </button>
        </div>

        {showForm && (
          <div style={{background:'#fff',borderRadius:12,border:'1px solid #e5e5e0',padding:20,marginBottom:20}}>
            <h3 style={{fontSize:14,fontWeight:600,marginBottom:16}}>Neues Objekt anlegen</h3>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              {[
                { key:'name', label:'Bezeichnung', placeholder:'z.B. Gartenstr. 12' },
                { key:'adresse', label:'Straße & Hausnr.', placeholder:'Gartenstraße 12' },
                { key:'plz', label:'PLZ', placeholder:'40213' },
                { key:'ort', label:'Ort', placeholder:'Düsseldorf' },
                { key:'baujahr', label:'Baujahr', placeholder:'1972' },
                { key:'einheiten', label:'Anzahl Einheiten', placeholder:'8' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{display:'block',fontSize:12,color:'#666',marginBottom:4,fontWeight:500}}>{f.label}</label>
                  <input value={(form as any)[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})}
                    placeholder={f.placeholder}
                    style={{width:'100%',padding:'9px 12px',border:'1px solid #ddd',borderRadius:7,fontSize:13,outline:'none'}}/>
                </div>
              ))}
              <div>
                <label style={{display:'block',fontSize:12,color:'#666',marginBottom:4,fontWeight:500}}>Typ</label>
                <select value={form.typ} onChange={e => setForm({...form, typ: e.target.value})}
                  style={{width:'100%',padding:'9px 12px',border:'1px solid #ddd',borderRadius:7,fontSize:13,outline:'none',background:'#fff'}}>
                  {['MFH','EFH','WEG','Gewerbe','Sonstiges'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div style={{display:'flex',gap:10,marginTop:16}}>
              <button onClick={saveObjekt} disabled={saving || !form.name}
                style={{padding:'9px 20px',background:'#1a3c5e',color:'#fff',border:'none',borderRadius:7,fontSize:13,fontWeight:600,cursor:'pointer'}}>
                {saving ? 'Speichern...' : 'Speichern'}
              </button>
              <button onClick={() => setShowForm(false)}
                style={{padding:'9px 20px',background:'#f5f5f0',color:'#555',border:'1px solid #ddd',borderRadius:7,fontSize:13,cursor:'pointer'}}>
                Abbrechen
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{color:'#888',fontSize:14}}>Wird geladen...</div>
        ) : objekte.length === 0 ? (
          <div style={{background:'#fff',borderRadius:12,border:'1px solid #e5e5e0',padding:40,textAlign:'center',color:'#888'}}>
            <div style={{fontSize:32,marginBottom:12}}>🏠</div>
            <div style={{fontSize:15,fontWeight:500,marginBottom:6}}>Noch keine Objekte</div>
            <div style={{fontSize:13}}>Legen Sie Ihr erstes Objekt an</div>
          </div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:16}}>
            {objekte.map(o => {
              return (
                <div key={o.id} onClick={() => router.push(`/objekte/${o.id}`)}
                  style={{background:'#fff',borderRadius:12,border:'1px solid #e5e5e0',padding:20,cursor:'pointer',transition:'border-color 0.15s'}}
                  onMouseEnter={e => (e.currentTarget.style.borderColor='#1a3c5e')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor='#e5e5e0')}>
                  <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:12}}>
                    <div>
                      <div style={{fontSize:15,fontWeight:600,color:'#1a1a1a'}}>{o.name}</div>
                      <div style={{fontSize:12,color:'#888',marginTop:3}}>{o.adresse}{o.plz ? `, ${o.plz}` : ''}{o.ort ? ` ${o.ort}` : ''}</div>
                    </div>
                    <span style={{background:'#eef2f7',color:'#1a3c5e',fontSize:11,fontWeight:600,padding:'3px 8px',borderRadius:6}}>{o.typ}</span>
                  </div>
                  <div style={{display:'flex',gap:16,fontSize:12,color:'#666',borderTop:'1px solid #f0f0ea',paddingTop:12}}>
                    <span>🏢 {o.einheiten || 1} Einheit{(o.einheiten||1) > 1 ? 'en' : ''}</span>
                    {o.baujahr && <span>🔨 Bj. {o.baujahr}</span>}
                  </div>
                  <div style={{marginTop:10,fontSize:12,color:'#1a3c5e',fontWeight:500}}>Details anzeigen →</div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
