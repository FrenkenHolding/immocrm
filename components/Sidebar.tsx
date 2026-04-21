'use client'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function Sidebar({ user }: { user: any }) {
  const router = useRouter()
  const path = usePathname()

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: '▦' },
    { href: '/objekte', label: 'Objekte', icon: '🏠' },
  ]

  return (
    <div style={{width:220,minWidth:220,background:'#fff',borderRight:'1px solid #e5e5e0',display:'flex',flexDirection:'column',minHeight:'100vh'}}>
      <div style={{padding:'20px 16px 16px',borderBottom:'1px solid #e5e5e0',display:'flex',alignItems:'center',gap:12}}>
        <div style={{width:36,height:36,borderRadius:8,background:'#1a3c5e',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:700,minWidth:36}}>F</div>
        <div>
          <div style={{fontSize:14,fontWeight:600}}>Frenken</div>
          <div style={{fontSize:11,color:'#888',marginTop:1}}>Immobilien</div>
        </div>
      </div>
      <nav style={{padding:'10px 8px',flex:1}}>
        {links.map(l => (
          <div key={l.href} onClick={() => router.push(l.href)}
            style={{display:'flex',alignItems:'center',gap:10,padding:'9px 10px',borderRadius:8,cursor:'pointer',fontSize:13,marginBottom:2,
              background: path.startsWith(l.href) ? '#eef2f7' : 'transparent',
              color: path.startsWith(l.href) ? '#1a3c5e' : '#666',
              fontWeight: path.startsWith(l.href) ? 600 : 400}}>
            <span style={{fontSize:14}}>{l.icon}</span>
            <span>{l.label}</span>
          </div>
        ))}
      </nav>
      <div style={{padding:16,borderTop:'1px solid #e5e5e0'}}>
        <div style={{fontSize:11,color:'#888',marginBottom:8,wordBreak:'break-all'}}>{user?.email}</div>
        <button onClick={logout} style={{width:'100%',padding:7,border:'1px solid #ddd',borderRadius:7,fontSize:12,cursor:'pointer',background:'#fafafa',color:'#555'}}>
          Abmelden
        </button>
      </div>
    </div>
  )
}
