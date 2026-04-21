'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import Sidebar from '../../../components/Sidebar'

export default function ObjektDetail({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [objekt, setObjekt] = useState<any>(null)
  const [mieter, setMieter] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ vorname:'', nachname:'', email:'', telefon:'', einheit:'', kaltmiete:'', nebenkosten:'', kaution:'', vertrag_von:'', vertrag_bis:'', status:'aktiv' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setUser(session.user)
      loadData()
    })
  }, [router])

  const loadData = async () => {
    const { data: obj } = await supabase.from('objekte').select('*').eq('id', params.id).single()
    setObjekt(obj)
    const { data: mts } = await supabase.from('mieter').select('*').eq('objekt_id', params.id).order('created_at', { ascending: false })
    setMieter(mts || [])
  }

  const saveMieter = async () => {
    setSaving(true)
    await supabase.from('mieter').insert([{ ...form, objekt_id: params.id, kaltmiete: parseFloat(form.kaltmiete)||0, nebenkosten: parseFloat(form.nebenkosten)||0, kaution: parseFloat(form.kaution)||0 }])
    setShowForm(false)
    setForm({ vorname:'', nachname:'', email:'', telefon:'', einheit:'', kaltmiete:'', nebenkosten:'', kaution:'', vertrag_von:'', vertrag_bis:'', status:'aktiv' })
    setSaving(false)
    loadData()
  }

  const deleteMieter = async (id: string) => {
    if (!confirm('Mieter wirklich löschen?')) return
    await supabase.from('mieter').delete().eq('id', id)
    loadData()
  }

  if (!user || !objekt) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',color:'#888',fontSize:14}}>Laden...</div>

  const initials = (v: string, n: string) => `${v?.[0]||''}${n?.[0]||''}`.toUpperCase()
  const colors = ['#B5D4F4','#9FE1CB','#F5C4B3','#CECBF6','#C0DD97','#FAC775']
  const textColors = ['#0C447C','#085041','#712B13','#3C3489','#27500A','#633806']

  return (
    <div style={{display:'flex',minHeight:'100vh'}}>
      <Sidebar user={user} />
      <div style={{flex:1,padding:28}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:20,fontSize:13,color:'#888'}}>
          <span onClick={() => router.push('/objekte')} style={{cursor:'pointer',color:'#1a3c5e'}}>Objekte</span>
          <span>›</span>
          <span style={{color:'#1a1a1a'}}>{objekt.name}</span>
        </div>

        <div style={{background:'#fff',borderRadius:12,border:'1px solid #e5e5e0',padding:20,marginBottom:20}}>
          <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
            <div>
              <h1 style={{fontSize:20,fontWeight:600}}>{objekt.name}</h1>
              <div style={{fontSize:13,color:'#888',marginTop:4}}>{objekt.adresse}{objekt.plz ? `, ${objekt.plz}` : ''}{objekt.ort ? ` ${objekt.ort}` : ''}</div>
              <div style={{display:'flex',gap:16,marginTop:12,fontSize:13,color:'#555'}}>
                <span style={{background:'#eef2f7',color:'#1a3c5e',padding:'3px 10px',borderRadius:6,fontWeight:600,fontSize:12}}>{objekt.typ}</span>
                <span>🏢 {objekt.einheiten} Einheiten</span>
                {objekt.baujahr && <span>🔨 Baujahr {objekt.baujahr}</span>}
                <span>👤 {mieter.filter(m=>m.status==='aktiv').length} Mieter aktiv</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
          <h2 style={{fontSize:16,fontWeight:600}}>Mieter in diesem Objekt</h2>
          <button onClick={() => setShowForm(!showForm)}
            style={{padding:'9px 16px',background:'#1a3c5e',color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer'}}>
            + Neuer Mieter
          </button>
        </div>

        {showForm && (
          <div style={{background:'#fff',borderRadius:12,border:'1px solid #e5e5e0',padding:20,marginBottom:20}}>
            <h3 style={{fontSize:14,fontWeight:600,marginBottom:16}}>Neuen Mieter anlegen</h3>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              {[
                { key:'vorname', label:'Vorname', placeholder:'Max' },
                { key:'nachname', label:'Nachname', placeholder:'Mustermann' },
                { key:'email', label:'E-Mail', placeholder:'max@email.de' },
                { key:'telefon', label:'Telefon', placeholder:'+49 211 ...' },
                { key:'einheit', label:'Einheit', placeholder:'EG links, 1. OG ...' },
                { key:'kaltmiete', label:'Kaltmiete (€)', placeholder:'800' },
                { key:'nebenkosten', label:'Nebenkosten (€)', placeholder:'200' },
                { key:'kaution', label:'Kaution (€)', placeholder:'2400' },
                { key:'vertrag_von', label:'Vertrag von', placeholder:'' },
                { key:'vertrag_bis', label:'Vertrag bis', placeholder:'' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{display:'block',fontSize:12,color:'#666',marginBottom:4,fontWeight:500}}>{f.label}</label>
                  <input value={(form as any)[f.key]} onChange={e => setForm({...form,[f.key]:e.target.value})}
                    type={f.key.includes('_von')||f.key.includes('_bis') ? 'date' : 'text'}
                    placeholder={f.placeholder}
                    style={{width:'100%',padding:'9px 12px',border:'1px solid #ddd',borderRadius:7,fontSize:13,outline:'none'}}/>
                </div>
              ))}
              <div>
                <label style={{display:'block',fontSize:12,color:'#666',marginBottom:4,fontWeight:500}}>Status</label>
                <select value={form.status} onChange={e => setForm({...form,status:e.target.value})}
                  style={{width:'100%',padding:'9px 12px',border:'1px solid #ddd',borderRadius:7,fontSize:13,outline:'none',background:'#fff'}}>
                  <option value="aktiv">Aktiv</option>
                  <option value="ausgezogen">Ausgezogen</option>
                  <option value="kuendigung">Kündigung</option>
                </select>
              </div>
            </div>
            <div style={{display:'flex',gap:10,marginTop:16}}>
              <button onClick={saveMieter} disabled={saving || !form.vorname || !form.nachname}
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

        {mieter.length === 0 ? (
          <div style={{background:'#fff',borderRadius:12,border:'1px solid #e5e5e0',padding:40,textAlign:'center',color:'#888'}}>
            <div style={{fontSize:32,marginBottom:12}}>👤</div>
            <div style={{fontSize:15,fontWeight:500,marginBottom:6}}>Noch keine Mieter</div>
            <div style={{fontSize:13}}>Legen Sie den ersten Mieter für dieses Objekt an</div>
          </div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:14}}>
            {mieter.map((m, i) => {
              const ci = i % colors.length
              return (
                <div key={m.id} style={{background:'#fff',borderRadius:12,border:'1px solid #e5e5e0',padding:18,position:'relative'}}>
                  <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:14}}>
                    <div style={{width:42,height:42,borderRadius:'50%',background:colors[ci],color:textColors[ci],display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:700,minWidth:42}}>
                      {initials(m.vorname, m.nachname)}
                    </div>
                    <div>
                      <div style={{fontSize:14,fontWeight:600}}>{m.vorname} {m.nachname}</div>
                      <div style={{fontSize:12,color:'#888',marginTop:2}}>{m.einheit || 'Einheit nicht angegeben'}</div>
                    </div>
                  </div>
                  <div style={{fontSize:12,color:'#555',display:'flex',flexDirection:'column',gap:5,marginBottom:14}}>
                    {m.email && <span>✉️ {m.email}</span>}
                    {m.telefon && <span>📞 {m.telefon}</span>}
                    {m.kaltmiete > 0 && <span>💶 {m.kaltmiete} € Kaltmiete</span>}
                    {m.vertrag_bis && <span>📅 Vertrag bis {new Date(m.vertrag_bis).toLocaleDateString('de-DE')}</span>}
                  </div>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <span style={{
                      fontSize:11,fontWeight:600,padding:'3px 9px',borderRadius:6,
                      background: m.status==='aktiv' ? '#f0fdf4' : m.status==='kuendigung' ? '#fef3e0' : '#f5f5f0',
                      color: m.status==='aktiv' ? '#166534' : m.status==='kuendigung' ? '#92400e' : '#555'
                    }}>{m.status==='aktiv' ? 'Aktiv' : m.status==='kuendigung' ? 'Kündigung' : 'Ausgezogen'}</span>
                    <div style={{display:'flex',gap:8}}>
                      <button onClick={() => router.push(`/objekte/${params.id}/mieter/${m.id}`)}
                        style={{padding:'6px 12px',background:'#1a3c5e',color:'#fff',border:'none',borderRadius:6,fontSize:12,fontWeight:600,cursor:'pointer'}}>
                        Öffnen
                      </button>
                      <button onClick={() => deleteMieter(m.id)}
                        style={{padding:'6px 10px',background:'#fef2f2',color:'#b91c1c',border:'none',borderRadius:6,fontSize:12,cursor:'pointer'}}>
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
