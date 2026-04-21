'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

type Page = 'dashboard' | 'objekte' | 'mieter' | 'vertraege' | 'aufgaben'

const OBJEKTE = [
  { id:1, name:'Königsberger Straße 1', ort:'Düsseldorf-Pempelfort', typ:'MFH', einheiten:8, vermietet:8, miete:6240 },
  { id:2, name:'Rathausplatz 4', ort:'Meerbusch', typ:'EFH', einheiten:1, vermietet:0, miete:0 },
  { id:3, name:'Kaiserswerther Str. 88', ort:'Düsseldorf-Kaiserswerth', typ:'WEG', einheiten:6, vermietet:6, miete:4980 },
  { id:4, name:'Luisenstr. 7', ort:'Neuss-Hammfeld', typ:'MFH', einheiten:9, vermietet:8, miete:7420 },
]

const MIETER = [
  { id:1, name:'Thomas Bergmann', email:'t.bergmann@email.de', tel:'+49 211 3456789', objekt:'Gartenstr. 12, EG li.', miete:780, bis:'31.12.2026', zahlung:'ok', av:'TB', avc:'#B5D4F4', avt:'#0C447C' },
  { id:2, name:'Maria Schneider', email:'m.schneider@mail.de', tel:'+49 211 9876543', objekt:'Gartenstr. 12, 1. OG', miete:890, bis:'30.06.2027', zahlung:'ok', av:'MS', avc:'#9FE1CB', avt:'#085041' },
  { id:3, name:'Klaus Wagner', email:'wagner.k@gmx.de', tel:'+49 2131 445566', objekt:'Luisenstr. 7, DG', miete:950, bis:'28.02.2026', zahlung:'offen', av:'KW', avc:'#F5C4B3', avt:'#712B13' },
  { id:4, name:'Petra Hoffmann', email:'p.hoffmann@web.de', tel:'+49 211 7654321', objekt:'Kaiserswerther Str. 88', miete:760, bis:'31.03.2028', zahlung:'ok', av:'PH', avc:'#CECBF6', avt:'#3C3489' },
  { id:5, name:'Andreas Klein', email:'a.klein@outlook.de', tel:'+49 211 1122334', objekt:'Gartenstr. 12, 2. OG re.', miete:820, bis:'31.07.2026', zahlung:'ok', av:'AK', avc:'#C0DD97', avt:'#27500A' },
]

const VERTRAEGE = [
  { id:1, mieter:'Thomas Bergmann', einheit:'Gartenstr. 12, EG li.', beginn:'01.01.2022', ende:'31.12.2026', miete:780, status:'aktiv' },
  { id:2, mieter:'Maria Schneider', einheit:'Gartenstr. 12, 1. OG', beginn:'15.07.2020', ende:'30.06.2027', miete:890, status:'aktiv' },
  { id:3, mieter:'Klaus Wagner', einheit:'Luisenstr. 7, DG', beginn:'01.03.2021', ende:'28.02.2026', miete:950, status:'auslaufend' },
  { id:4, mieter:'Petra Hoffmann', einheit:'Kaiserswerther Str. 88', beginn:'01.04.2024', ende:'31.03.2028', miete:760, status:'aktiv' },
  { id:5, mieter:'Andreas Klein', einheit:'Gartenstr. 12, 2. OG re.', beginn:'01.08.2022', ende:'31.07.2026', miete:820, status:'aktiv' },
]

const INIT_AUFGABEN = [
  { id:1, titel:'Heizungswartung Gartenstr. 12', datum:'25.04.2026', prio:'dringend', erledigt:false },
  { id:2, titel:'Besichtigung Rathausplatz 4', datum:'22.04.2026', prio:'normal', erledigt:false },
  { id:3, titel:'NK-Abrechnung 2025 erstellen', datum:'30.06.2026', prio:'normal', erledigt:false },
  { id:4, titel:'Mahnung an Wagner versenden', datum:'22.04.2026', prio:'dringend', erledigt:false },
  { id:5, titel:'Mietvertrag Müller verlängern', datum:'18.04.2026', prio:'normal', erledigt:true },
  { id:6, titel:'Übergabeprotokoll Schneider', datum:'10.04.2026', prio:'normal', erledigt:true },
]

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [page, setPage] = useState<Page>('dashboard')
  const [aufgaben, setAufgaben] = useState(INIT_AUFGABEN)
  const [search, setSearch] = useState('')
  const [newTask, setNewTask] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login')
      else setUser(session.user)
    })
  }, [router])

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const toggleTask = (id: number) => {
    setAufgaben(prev => prev.map(a => a.id === id ? { ...a, erledigt: !a.erledigt } : a))
  }

  const addTask = () => {
    if (!newTask.trim()) return
    setAufgaben(prev => [...prev, { id: Date.now(), titel: newTask, datum: 'Kein Datum', prio: 'normal', erledigt: false }])
    setNewTask('')
  }

  const filteredMieter = MIETER.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.objekt.toLowerCase().includes(search.toLowerCase())
  )

  const offeneAufgaben = aufgaben.filter(a => !a.erledigt).length

  if (!user) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', fontSize:14, color:'#888' }}>Wird geladen...</div>

  return (
    <div style={s.app}>
      {/* Sidebar */}
      <div style={s.sidebar}>
        <div style={s.logoWrap}>
          <div style={s.logoIcon}>F</div>
          <div>
            <div style={s.logoTitle}>Frenken</div>
            <div style={s.logoSub}>Immobilien</div>
          </div>
        </div>
        <nav style={s.nav}>
          {(['dashboard','objekte','mieter','vertraege','aufgaben'] as Page[]).map(p => {
            const labels: Record<Page,string> = { dashboard:'Dashboard', objekte:'Objekte', mieter:'Mieter', vertraege:'Verträge', aufgaben:'Aufgaben' }
            const icons: Record<Page,string> = { dashboard:'▦', objekte:'🏠', mieter:'👤', vertraege:'📄', aufgaben:'✓' }
            return (
              <div key={p} onClick={() => setPage(p)} style={{ ...s.navItem, ...(page===p ? s.navActive : {}) }}>
                <span style={{ fontSize:14 }}>{icons[p]}</span>
                <span>{labels[p]}</span>
                {p==='aufgaben' && offeneAufgaben > 0 && <span style={s.badge}>{offeneAufgaben}</span>}
              </div>
            )
          })}
        </nav>
        <div style={s.userBox}>
          <div style={s.userEmail}>{user.email}</div>
          <button onClick={logout} style={s.logoutBtn}>Abmelden</button>
        </div>
      </div>

      {/* Main */}
      <div style={s.main}>
        <div style={s.topbar}>
          <div style={s.pageTitle}>
            {{ dashboard:'Dashboard', objekte:'Objekte', mieter:'Mieter & Kontakte', vertraege:'Verträge & Dokumente', aufgaben:'Aufgaben & Termine' }[page]}
          </div>
        </div>

        <div style={s.content}>

          {/* DASHBOARD */}
          {page === 'dashboard' && (
            <>
              <div style={s.kpiGrid}>
                <div style={s.kpi}><div style={s.kpiL}>Einheiten gesamt</div><div style={s.kpiV}>24</div><div style={{...s.kpiS, color:'#1D9E75'}}>22 vermietet</div></div>
                <div style={s.kpi}><div style={s.kpiL}>Leerstand</div><div style={s.kpiV}>2</div><div style={{...s.kpiS, color:'#d4a017'}}>8,3% Quote</div></div>
                <div style={s.kpi}><div style={s.kpiL}>Monatsmieten</div><div style={s.kpiV}>18.640 €</div><div style={{...s.kpiS, color:'#1D9E75'}}>+2,1% gg. Vorjahr</div></div>
                <div style={s.kpi}><div style={s.kpiL}>Offene Posten</div><div style={s.kpiV}>1.240 €</div><div style={{...s.kpiS, color:'#e74c3c'}}>2 Mahnungen</div></div>
              </div>
              <div style={s.grid2}>
                <div style={s.card}>
                  <div style={s.cardHead}><span style={s.cardTitle}>Objekte</span><span style={s.cardLink} onClick={() => setPage('objekte')}>Alle →</span></div>
                  {OBJEKTE.map(o => (
                    <div key={o.id} style={s.row}>
                      <div style={s.rowIcon}>🏠</div>
                      <div style={{ flex:1 }}>
                        <div style={s.rowName}>{o.name}</div>
                        <div style={s.rowMeta}>{o.einheiten} Einheiten · {o.typ}</div>
                      </div>
                      <span style={{ ...s.pill, ...(o.vermietet===o.einheiten ? s.pillGreen : s.pillAmber) }}>
                        {o.vermietet===o.einheiten ? 'Voll' : `${o.einheiten-o.vermietet} frei`}
                      </span>
                    </div>
                  ))}
                </div>
                <div style={s.card}>
                  <div style={s.cardHead}><span style={s.cardTitle}>Offene Aufgaben</span><span style={s.cardLink} onClick={() => setPage('aufgaben')}>Alle →</span></div>
                  {aufgaben.filter(a => !a.erledigt).slice(0,4).map(a => (
                    <div key={a.id} style={s.taskRow}>
                      <div onClick={() => toggleTask(a.id)} style={{ ...s.check, ...(a.erledigt ? s.checkDone : {}) }} />
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, color:'#1a1a1a' }}>{a.titel}</div>
                        <div style={{ fontSize:11, color:'#888', marginTop:2 }}>{a.datum}</div>
                      </div>
                      <span style={{ ...s.pill, ...(a.prio==='dringend' ? s.pillRed : s.pillAmber) }}>
                        {a.prio==='dringend' ? 'Dringend' : 'Offen'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* OBJEKTE */}
          {page === 'objekte' && (
            <div style={s.card}>
              <table style={s.table}>
                <thead>
                  <tr>{['Objekt','Typ','Einheiten','Auslastung','Monatsmiete','Status'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {OBJEKTE.map(o => {
                    const pct = Math.round((o.vermietet/o.einheiten)*100)
                    return (
                      <tr key={o.id} style={s.tr}>
                        <td style={s.td}><strong>{o.name}</strong><br/><span style={{ fontSize:11, color:'#888' }}>{o.ort}</span></td>
                        <td style={s.td}>{o.typ}</td>
                        <td style={s.td}>{o.einheiten}</td>
                        <td style={s.td}>
                          <div style={{ fontSize:12, marginBottom:3 }}>{pct}%</div>
                          <div style={s.progBar}><div style={{ ...s.progFill, width:`${pct}%`, background: pct===100 ? '#1D9E75' : '#d4a017' }} /></div>
                        </td>
                        <td style={s.td}>{o.miete > 0 ? `${o.miete.toLocaleString('de-DE')} €` : '–'}</td>
                        <td style={s.td}><span style={{ ...s.pill, ...(pct===100 ? s.pillGreen : s.pillAmber) }}>{pct===100 ? 'Voll vermietet' : `${o.einheiten-o.vermietet} Leerstand`}</span></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* MIETER */}
          {page === 'mieter' && (
            <>
              <input style={s.searchBar} placeholder="Mieter suchen..." value={search} onChange={e => setSearch(e.target.value)} />
              <div style={s.card}>
                <table style={s.table}>
                  <thead>
                    <tr>{['Name','Einheit','Kaltmiete','Vertrag bis','Zahlung','Status'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {filteredMieter.map(m => (
                      <tr key={m.id} style={s.tr}>
                        <td style={s.td}>
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <div style={{ width:30, height:30, borderRadius:'50%', background:m.avc, color:m.avt, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:600, minWidth:30 }}>{m.av}</div>
                            <div><strong>{m.name}</strong><br/><span style={{ fontSize:11, color:'#888' }}>{m.email}</span></div>
                          </div>
                        </td>
                        <td style={s.td}>{m.objekt}</td>
                        <td style={s.td}>{m.miete} €</td>
                        <td style={s.td}>{m.bis}</td>
                        <td style={s.td}><span style={{ ...s.pill, ...(m.zahlung==='ok' ? s.pillGreen : s.pillRed) }}>{m.zahlung==='ok' ? 'Aktuell' : 'Offen'}</span></td>
                        <td style={s.td}><span style={{ ...s.pill, ...(m.zahlung==='ok' ? s.pillGreen : s.pillAmber) }}>{m.zahlung==='ok' ? 'Aktiv' : 'Mahnung'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* VERTRÄGE */}
          {page === 'vertraege' && (
            <div style={s.card}>
              <table style={s.table}>
                <thead>
                  <tr>{['Mieter','Objekt / Einheit','Beginn','Ende','Kaltmiete','Status'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {VERTRAEGE.map(v => (
                    <tr key={v.id} style={s.tr}>
                      <td style={s.td}><strong>{v.mieter}</strong></td>
                      <td style={s.td}>{v.einheit}</td>
                      <td style={s.td}>{v.beginn}</td>
                      <td style={s.td}>{v.ende}</td>
                      <td style={s.td}>{v.miete} €</td>
                      <td style={s.td}><span style={{ ...s.pill, ...(v.status==='aktiv' ? s.pillGreen : s.pillAmber) }}>{v.status==='aktiv' ? 'Aktiv' : 'Läuft aus'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* AUFGABEN */}
          {page === 'aufgaben' && (
            <>
              <div style={{ display:'flex', gap:10, marginBottom:16 }}>
                <input style={{ ...s.searchBar, margin:0, flex:1 }} placeholder="Neue Aufgabe..." value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key==='Enter' && addTask()} />
                <button onClick={addTask} style={s.addBtn}>+ Hinzufügen</button>
              </div>
              <div style={s.grid2}>
                <div>
                  <div style={s.sectionLabel}>Offen ({aufgaben.filter(a=>!a.erledigt).length})</div>
                  <div style={s.card}>
                    {aufgaben.filter(a => !a.erledigt).map(a => (
                      <div key={a.id} style={s.taskRow}>
                        <div onClick={() => toggleTask(a.id)} style={s.check} />
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:13, color:'#1a1a1a' }}>{a.titel}</div>
                          <div style={{ fontSize:11, color:'#888', marginTop:2 }}>{a.datum}</div>
                        </div>
                        <span style={{ ...s.pill, ...(a.prio==='dringend' ? s.pillRed : s.pillAmber) }}>{a.prio==='dringend' ? 'Dringend' : 'Offen'}</span>
                      </div>
                    ))}
                    {aufgaben.filter(a=>!a.erledigt).length === 0 && <div style={{ fontSize:13, color:'#888', padding:'8px 0' }}>Alle Aufgaben erledigt!</div>}
                  </div>
                </div>
                <div>
                  <div style={s.sectionLabel}>Erledigt ({aufgaben.filter(a=>a.erledigt).length})</div>
                  <div style={s.card}>
                    {aufgaben.filter(a => a.erledigt).map(a => (
                      <div key={a.id} style={s.taskRow}>
                        <div onClick={() => toggleTask(a.id)} style={{ ...s.check, ...s.checkDone }} />
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:13, color:'#aaa', textDecoration:'line-through' }}>{a.titel}</div>
                          <div style={{ fontSize:11, color:'#bbb', marginTop:2 }}>{a.datum}</div>
                        </div>
                        <span style={{ ...s.pill, ...s.pillGreen }}>Fertig</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  app: { display:'flex', minHeight:'100vh', background:'#f5f5f0' },
  sidebar: { width:220, minWidth:220, background:'#fff', borderRight:'1px solid #e8e8e0', display:'flex', flexDirection:'column' },
  logoWrap: { padding:'20px 16px 16px', borderBottom:'1px solid #e8e8e0', display:'flex', alignItems:'center', gap:12 },
  logoIcon: { width:36, height:36, borderRadius:8, background:'#1D9E75', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:700, minWidth:36 },
  logoTitle: { fontSize:14, fontWeight:600, color:'#1a1a1a' },
  logoSub: { fontSize:11, color:'#888', marginTop:1 },
  nav: { padding:'12px 8px', flex:1 },
  navItem: { display:'flex', alignItems:'center', gap:10, padding:'9px 10px', borderRadius:8, cursor:'pointer', fontSize:13, color:'#666', marginBottom:2, transition:'background 0.1s' },
  navActive: { background:'#e8f5f0', color:'#0F6E56', fontWeight:600 },
  badge: { marginLeft:'auto', background:'#fde8e8', color:'#c0392b', fontSize:10, padding:'1px 6px', borderRadius:10, fontWeight:600 },
  userBox: { padding:'16px', borderTop:'1px solid #e8e8e0' },
  userEmail: { fontSize:11, color:'#888', marginBottom:8, wordBreak:'break-all' },
  logoutBtn: { width:'100%', padding:'7px', border:'1px solid #ddd', borderRadius:7, fontSize:12, cursor:'pointer', background:'#fafafa', color:'#555' },
  main: { flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 },
  topbar: { background:'#fff', borderBottom:'1px solid #e8e8e0', padding:'14px 20px' },
  pageTitle: { fontSize:16, fontWeight:600, color:'#1a1a1a' },
  content: { flex:1, overflowY:'auto', padding:20 },
  kpiGrid: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:16 },
  kpi: { background:'#f5f5f0', borderRadius:10, padding:'14px 16px' },
  kpiL: { fontSize:11, color:'#888', textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:5 },
  kpiV: { fontSize:22, fontWeight:600, color:'#1a1a1a' },
  kpiS: { fontSize:11, marginTop:2 },
  grid2: { display:'grid', gridTemplateColumns:'repeat(2,minmax(0,1fr))', gap:16, marginBottom:16 },
  card: { background:'#fff', border:'1px solid #e8e8e0', borderRadius:12, padding:'14px 16px' },
  cardHead: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 },
  cardTitle: { fontSize:13, fontWeight:600, color:'#1a1a1a' },
  cardLink: { fontSize:12, color:'#1D9E75', cursor:'pointer' },
  row: { display:'flex', alignItems:'center', gap:10, padding:'9px 0', borderBottom:'1px solid #f0f0e8' },
  rowIcon: { width:32, height:32, borderRadius:8, background:'#e8f5f0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, minWidth:32 },
  rowName: { fontSize:13, fontWeight:500, color:'#1a1a1a' },
  rowMeta: { fontSize:11, color:'#888', marginTop:1 },
  pill: { display:'inline-block', padding:'2px 9px', borderRadius:10, fontSize:11, fontWeight:600 },
  pillGreen: { background:'#e8f5f0', color:'#0F6E56' },
  pillAmber: { background:'#fef3e0', color:'#854F0B' },
  pillRed: { background:'#fde8e8', color:'#991f1f' },
  taskRow: { display:'flex', alignItems:'flex-start', gap:10, padding:'9px 0', borderBottom:'1px solid #f0f0e8' },
  check: { width:16, height:16, borderRadius:4, border:'1.5px solid #ccc', cursor:'pointer', minWidth:16, marginTop:1, background:'#fafafa' },
  checkDone: { background:'#1D9E75', borderColor:'#1D9E75' },
  table: { width:'100%', borderCollapse:'collapse', fontSize:13 },
  th: { textAlign:'left', padding:'8px 12px', fontSize:11, fontWeight:600, color:'#888', textTransform:'uppercase', letterSpacing:'0.04em', borderBottom:'1px solid #e8e8e0' },
  td: { padding:'11px 12px', borderBottom:'1px solid #f0f0e8', verticalAlign:'middle' },
  tr: { cursor:'pointer' },
  progBar: { height:4, borderRadius:2, background:'#e8e8e0', overflow:'hidden' },
  progFill: { height:'100%', borderRadius:2 },
  searchBar: { width:'100%', padding:'9px 14px', border:'1px solid #ddd', borderRadius:8, fontSize:13, marginBottom:14, background:'#fafafa', color:'#1a1a1a', outline:'none' },
  addBtn: { padding:'9px 18px', background:'#1D9E75', color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap' },
  sectionLabel: { fontSize:11, fontWeight:600, color:'#888', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 },
}
