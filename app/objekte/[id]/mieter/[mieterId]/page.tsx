'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../../lib/supabase'
import Sidebar from '../../../../components/Sidebar'

type Tab = 'uebersicht' | 'vertrag' | 'dokumente' | 'kommunikation'

export default function MieterDetail({ params }: { params: { id: string; mieterId: string } }) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [objekt, setObjekt] = useState<any>(null)
  const [mieter, setMieter] = useState<any>(null)
  const [tab, setTab] = useState<Tab>('uebersicht')
  const [dokumente, setDokumente] = useState<any[]>([])
  const [nachrichten, setNachrichten] = useState<any[]>([])
  const [newMsg, setNewMsg] = useState('')
  const [uploading, setUploading] = useState(false)
  const [sending, setSending] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setUser(session.user)
      loadAll()
    })
  }, [router])

  const loadAll = async () => {
    const { data: obj } = await supabase.from('objekte').select('*').eq('id', params.id).single()
    setObjekt(obj)
    const { data: m } = await supabase.from('mieter').select('*').eq('id', params.mieterId).single()
    setMieter(m)
    const { data: docs } = await supabase.from('dokumente').select('*').eq('mieter_id', params.mieterId).order('created_at', { ascending: false })
    setDokumente(docs || [])
    const { data: msgs } = await supabase.from('kommunikation').select('*').eq('mieter_id', params.mieterId).order('created_at', { ascending: true })
    setNachrichten(msgs || [])
  }

  const uploadDokument = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const path = `${params.mieterId}/${Date.now()}_${file.name}`
    const { error: uploadError } = await supabase.storage.from('dokumente').upload(path, file)
    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage.from('dokumente').getPublicUrl(path)
      await supabase.from('dokumente').insert([{
        mieter_id: params.mieterId,
        objekt_id: params.id,
        name: file.name,
        typ: file.type,
        groesse: file.size,
        url: publicUrl,
        pfad: path
      }])
      loadAll()
    }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const deleteDokument = async (doc: any) => {
    if (!confirm(`"${doc.name}" wirklich löschen?`)) return
    await supabase.storage.from('dokumente').remove([doc.pfad])
    await supabase.from('dokumente').delete().eq('id', doc.id)
    loadAll()
  }

  const sendNachricht = async () => {
    if (!newMsg.trim()) return
    setSending(true)
    await supabase.from('kommunikation').insert([{
      mieter_id: params.mieterId,
      objekt_id: params.id,
      nachricht: newMsg,
      richtung: 'intern',
      autor: user.email
    }])
    setNewMsg('')
    setSending(false)
    loadAll()
  }

  const formatBytes = (b: number) => b > 1048576 ? `${(b/1048576).toFixed(1)} MB` : `${Math.round(b/1024)} KB`
  const formatDate = (d: string) => new Date(d).toLocaleDateString('de-DE', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })

  if (!user || !mieter) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',color:'#888',fontSize:14}}>Laden...</div>

  const tabs: { key: Tab; label: string }[] = [
    { key:'uebersicht', label:'Übersicht' },
    { key:'vertrag', label:'Vertrag' },
    { key:'dokumente', label:`Dokumente (${dokumente.length})` },
    { key:'kommunikation', label:`Notizen (${nachrichten.length})` },
  ]

  return (
    <div style={{display:'flex',minHeight:'100vh'}}>
      <Sidebar user={user} />
      <div style={{flex:1,padding:28}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:20,fontSize:13,color:'#888'}}>
          <span onClick={() => router.push('/objekte')} style={{cursor:'pointer',color:'#1a3c5e'}}>Objekte</span>
          <span>›</span>
          <span onClick={() => router.push(`/objekte/${params.id}`)} style={{cursor:'pointer',color:'#1a3c5e'}}>{objekt?.name}</span>
          <span>›</span>
          <span style={{color:'#1a1a1a'}}>{mieter.vorname} {mieter.nachname}</span>
        </div>

        <div style={{background:'#fff',borderRadius:12,border:'1px solid #e5e5e0',padding:20,marginBottom:20}}>
          <div style={{display:'flex',alignItems:'center',gap:16}}>
            <div style={{width:52,height:52,borderRadius:'50%',background:'#B5D4F4',color:'#0C447C',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:700}}>
              {mieter.vorname?.[0]}{mieter.nachname?.[0]}
            </div>
            <div>
              <h1 style={{fontSize:20,fontWeight:600}}>{mieter.vorname} {mieter.nachname}</h1>
              <div style={{fontSize:13,color:'#888',marginTop:3}}>{mieter.einheit} · {objekt?.name}</div>
              <div style={{display:'flex',gap:12,marginTop:8,fontSize:12,color:'#555'}}>
                {mieter.email && <span>✉️ {mieter.email}</span>}
                {mieter.telefon && <span>📞 {mieter.telefon}</span>}
                <span style={{
                  background: mieter.status==='aktiv' ? '#f0fdf4' : '#fef3e0',
                  color: mieter.status==='aktiv' ? '#166534' : '#92400e',
                  padding:'2px 8px',borderRadius:5,fontWeight:600,fontSize:11
                }}>{mieter.status==='aktiv' ? 'Aktiv' : mieter.status}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{display:'flex',gap:4,marginBottom:20,borderBottom:'1px solid #e5e5e0',paddingBottom:0}}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{padding:'10px 18px',border:'none',background:'transparent',cursor:'pointer',fontSize:13,fontWeight: tab===t.key ? 600 : 400,
                color: tab===t.key ? '#1a3c5e' : '#888',
                borderBottom: tab===t.key ? '2px solid #1a3c5e' : '2px solid transparent',
                marginBottom:-1}}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'uebersicht' && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            <div style={{background:'#fff',borderRadius:12,border:'1px solid #e5e5e0',padding:20}}>
              <h3 style={{fontSize:14,fontWeight:600,marginBottom:14}}>Kontaktdaten</h3>
              {[
                { label:'Vorname', value: mieter.vorname },
                { label:'Nachname', value: mieter.nachname },
                { label:'E-Mail', value: mieter.email },
                { label:'Telefon', value: mieter.telefon },
                { label:'Einheit', value: mieter.einheit },
              ].map(r => (
                <div key={r.label} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #f5f5f0',fontSize:13}}>
                  <span style={{color:'#888'}}>{r.label}</span>
                  <span style={{fontWeight:500}}>{r.value || '–'}</span>
                </div>
              ))}
            </div>
            <div style={{background:'#fff',borderRadius:12,border:'1px solid #e5e5e0',padding:20}}>
              <h3 style={{fontSize:14,fontWeight:600,marginBottom:14}}>Finanzen</h3>
              {[
                { label:'Kaltmiete', value: mieter.kaltmiete ? `${mieter.kaltmiete} €` : '–' },
                { label:'Nebenkosten', value: mieter.nebenkosten ? `${mieter.nebenkosten} €` : '–' },
                { label:'Warmmiete', value: (mieter.kaltmiete && mieter.nebenkosten) ? `${parseFloat(mieter.kaltmiete)+parseFloat(mieter.nebenkosten)} €` : '–' },
                { label:'Kaution', value: mieter.kaution ? `${mieter.kaution} €` : '–' },
              ].map(r => (
                <div key={r.label} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #f5f5f0',fontSize:13}}>
                  <span style={{color:'#888'}}>{r.label}</span>
                  <span style={{fontWeight:500,color: r.label==='Warmmiete' ? '#1a3c5e' : '#1a1a1a'}}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'vertrag' && (
          <div style={{background:'#fff',borderRadius:12,border:'1px solid #e5e5e0',padding:24}}>
            <h3 style={{fontSize:14,fontWeight:600,marginBottom:18}}>Vertragsdaten</h3>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:0}}>
              {[
                { label:'Vertragsbeginn', value: mieter.vertrag_von ? new Date(mieter.vertrag_von).toLocaleDateString('de-DE') : '–' },
                { label:'Vertragsende', value: mieter.vertrag_bis ? new Date(mieter.vertrag_bis).toLocaleDateString('de-DE') : 'Unbefristet' },
                { label:'Kaltmiete', value: mieter.kaltmiete ? `${mieter.kaltmiete} €/Monat` : '–' },
                { label:'Nebenkosten (Vorauszahlung)', value: mieter.nebenkosten ? `${mieter.nebenkosten} €/Monat` : '–' },
                { label:'Gesamtmiete', value: (mieter.kaltmiete && mieter.nebenkosten) ? `${parseFloat(mieter.kaltmiete)+parseFloat(mieter.nebenkosten)} €/Monat` : '–' },
                { label:'Kaution', value: mieter.kaution ? `${mieter.kaution} €` : '–' },
                { label:'Einheit', value: mieter.einheit || '–' },
                { label:'Status', value: mieter.status },
              ].map(r => (
                <div key={r.label} style={{display:'flex',justifyContent:'space-between',padding:'12px 0',borderBottom:'1px solid #f5f5f0',fontSize:13,gridColumn:'span 1'}}>
                  <span style={{color:'#888',minWidth:200}}>{r.label}</span>
                  <span style={{fontWeight:500}}>{r.value}</span>
                </div>
              ))}
            </div>
            <div style={{marginTop:20,padding:14,background:'#eef2f7',borderRadius:8,fontSize:12,color:'#1a3c5e'}}>
              💡 Vertragsdokumente können Sie im Tab "Dokumente" hochladen.
            </div>
          </div>
        )}

        {tab === 'dokumente' && (
          <div>
            <div style={{background:'#fff',borderRadius:12,border:'2px dashed #ddd',padding:28,textAlign:'center',marginBottom:16,cursor:'pointer'}}
              onClick={() => fileRef.current?.click()}>
              <input ref={fileRef} type="file" style={{display:'none'}} onChange={uploadDokument}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"/>
              <div style={{fontSize:28,marginBottom:8}}>📎</div>
              <div style={{fontSize:14,fontWeight:500,color:'#555',marginBottom:4}}>
                {uploading ? 'Wird hochgeladen...' : 'Datei hochladen'}
              </div>
              <div style={{fontSize:12,color:'#aaa'}}>PDF, Word, Excel, Bilder – max. 50 MB</div>
            </div>

            {dokumente.length === 0 ? (
              <div style={{background:'#fff',borderRadius:12,border:'1px solid #e5e5e0',padding:32,textAlign:'center',color:'#aaa',fontSize:13}}>
                Noch keine Dokumente hochgeladen
              </div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {dokumente.map(doc => (
                  <div key={doc.id} style={{background:'#fff',borderRadius:10,border:'1px solid #e5e5e0',padding:'12px 16px',display:'flex',alignItems:'center',gap:14}}>
                    <div style={{width:36,height:36,borderRadius:8,background:'#fef3e0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:'#92400e',minWidth:36}}>
                      {doc.name.split('.').pop()?.toUpperCase().slice(0,3)}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{doc.name}</div>
                      <div style={{fontSize:11,color:'#aaa',marginTop:2}}>{formatBytes(doc.groesse)} · {formatDate(doc.created_at)}</div>
                    </div>
                    <div style={{display:'flex',gap:8}}>
                      <a href={doc.url} target="_blank" rel="noreferrer"
                        style={{padding:'6px 12px',background:'#eef2f7',color:'#1a3c5e',borderRadius:6,fontSize:12,fontWeight:600,border:'none',cursor:'pointer'}}>
                        Öffnen
                      </a>
                      <button onClick={() => deleteDokument(doc)}
                        style={{padding:'6px 10px',background:'#fef2f2',color:'#b91c1c',border:'none',borderRadius:6,fontSize:12,cursor:'pointer'}}>
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'kommunikation' && (
          <div>
            <div style={{background:'#fff',borderRadius:12,border:'1px solid #e5e5e0',padding:16,marginBottom:14,minHeight:300,maxHeight:500,overflowY:'auto',display:'flex',flexDirection:'column',gap:10}}>
              {nachrichten.length === 0 ? (
                <div style={{display:'flex',alignItems:'center',justifyContent:'center',flex:1,color:'#aaa',fontSize:13}}>
                  Noch keine Notizen vorhanden
                </div>
              ) : nachrichten.map(n => (
                <div key={n.id} style={{background:'#f5f9ff',borderRadius:10,padding:'10px 14px',maxWidth:'80%'}}>
                  <div style={{fontSize:11,color:'#888',marginBottom:4}}>{n.autor} · {formatDate(n.created_at)}</div>
                  <div style={{fontSize:13,color:'#1a1a1a',lineHeight:1.5}}>{n.nachricht}</div>
                </div>
              ))}
            </div>
            <div style={{display:'flex',gap:10}}>
              <textarea value={newMsg} onChange={e => setNewMsg(e.target.value)}
                placeholder="Notiz oder Kommunikation eintragen..."
                onKeyDown={e => { if(e.key==='Enter' && !e.shiftKey) { e.preventDefault(); sendNachricht() }}}
                style={{flex:1,padding:'10px 14px',border:'1px solid #ddd',borderRadius:8,fontSize:13,outline:'none',resize:'none',height:60,fontFamily:'inherit'}}/>
              <button onClick={sendNachricht} disabled={sending || !newMsg.trim()}
                style={{padding:'0 20px',background:'#1a3c5e',color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer'}}>
                {sending ? '...' : 'Speichern'}
              </button>
            </div>
            <div style={{fontSize:11,color:'#aaa',marginTop:6}}>Enter zum Speichern · Shift+Enter für neue Zeile</div>
          </div>
        )}
      </div>
    </div>
  )
}
