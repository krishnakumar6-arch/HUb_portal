import { useState, useMemo, useEffect, useCallback } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area } from "recharts";
import { api, setToken, clearToken, getStoredUser, storeUser, wakeBackend } from "./api";

const FONT = `@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap');*{box-sizing:border-box;margin:0;padding:0;}body{font-family:'Poppins',sans-serif;}::-webkit-scrollbar{width:5px;}::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:10px;}@keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}.fu{animation:fadeUp .3s ease both;}`;

const C = { yellow:"#F5C518", yellowDk:"#D4A800", yellowBg:"#FFFBEA", dark:"#1A1A1A", white:"#FFFFFF", bg:"#F4F5F7", card:"#FFFFFF", border:"#E8EAED", t1:"#111111", t2:"#555", t3:"#999", green:"#1DB87E", greenBg:"#E8FBF3", red:"#E53935", redBg:"#FEF2F2", amber:"#F59E0B", amberBg:"#FFFBEB", blue:"#1565C0", blueBg:"#E3F2FD" };
const CATS = [{key:"Housekeeping",color:"#F5C518",icon:"🧹"},{key:"Tea / Coffee / Water",color:"#1DB87E",icon:"☕"},{key:"Printing & Stationery",color:"#2196F3",icon:"🖨️"},{key:"Repair & Maintenance",color:"#9C27B0",icon:"🔧"},{key:"Electricity",color:"#FF9800",icon:"⚡"},{key:"Internet & Mobile",color:"#00BCD4",icon:"📶"},{key:"Rent",color:"#E53935",icon:"🏠"}];
const fmt = n => "₹"+Number(Math.round(n||0)).toLocaleString("en-IN");
const fmtK = n => !n?"₹0":n>=100000?"₹"+(n/100000).toFixed(1)+"L":n>=1000?"₹"+(n/1000).toFixed(0)+"K":"₹"+Math.round(n);
const pct = (a,b) => b===0?0:Math.round(((a-b)/b)*100);

const SFLogo = ({size=26}) => (<svg width={size} height={size} viewBox="0 0 28 28" fill="none"><path d="M4 22L11 8L18 15L23 6" stroke={C.yellow} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="23" cy="6" r="2.5" fill={C.yellow}/></svg>);
const Chip = ({label,color="dark"}) => { const m={yellow:[C.yellowBg,C.yellowDk],green:[C.greenBg,C.green],red:[C.redBg,C.red],amber:[C.amberBg,C.amber],dark:["#2A2A2A",C.white],gray:["#F1F3F5",C.t2],blue:[C.blueBg,C.blue]}; const [bg,tc]=m[color]||m.gray; return <span style={{display:"inline-flex",alignItems:"center",padding:"2px 9px",borderRadius:20,background:bg,color:tc,fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>{label}</span>; };
const CTip = ({active,payload,label}) => { if(!active||!payload?.length) return null; return <div style={{background:C.dark,border:"1px solid #333",borderRadius:10,padding:"10px 14px",minWidth:160}}><p style={{fontSize:12,fontWeight:700,color:C.yellow,marginBottom:6}}>{label}</p>{payload.map((p,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",gap:16,fontSize:12,color:"#aaa",marginTop:3}}><span style={{display:"flex",alignItems:"center",gap:5}}><span style={{width:7,height:7,borderRadius:"50%",background:p.color,flexShrink:0}}/>{p.name}</span><span style={{fontWeight:700,color:C.white}}>{fmt(p.value)}</span></div>)}</div>; };

/* ══ LOADING SPINNER ══ */
const Spinner = () => <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:200,color:C.t3,fontSize:13}}>Loading...</div>;

/* ══ LOGIN ══ */
function Login({onLogin}) {
  const [role,setRole]=useState("admin");
  const [email,setEmail]=useState(""); const [pass,setPass]=useState("");
  const [err,setErr]=useState(""); const [busy,setBusy]=useState(false);
  const [serverStatus,setServerStatus]=useState("checking");

  useEffect(()=>{
    // Ping backend on mount to wake it up
    setServerStatus("waking");
    fetch("https://hub-portal-backend.onrender.com/health", {signal:AbortSignal.timeout(8000)})
      .then(()=>setServerStatus("online"))
      .catch(()=>setServerStatus("slow"));
  },[]);

  const go = async () => {
    setErr(""); setBusy(true);
    try {
      const res = await api.login(email.trim(), pass);
      setToken(res.access_token);
      storeUser(res.user);
      onLogin(res.user);
    } catch(e) {
      setErr(e.message || "Invalid credentials");
    } finally { setBusy(false); }
  };
  return (
    <div style={{display:"flex",fontFamily:"'Poppins',sans-serif",minHeight:"100vh"}}>
      <style>{FONT}</style>
      <div style={{width:"42%",background:C.dark,display:"flex",flexDirection:"column",justifyContent:"space-between",padding:"40px 48px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",bottom:-60,left:-40,width:280,height:280,borderRadius:"50%",background:"rgba(245,197,24,0.07)",pointerEvents:"none"}}/>
        <div style={{display:"flex",alignItems:"center",gap:10}}><SFLogo size={30}/><div><div style={{color:C.white,fontWeight:900,fontSize:16,letterSpacing:"0.02em",lineHeight:1}}>SHADOWFAX</div><div style={{color:C.yellow,fontSize:9,fontWeight:700,letterSpacing:"0.1em"}}>Think ahead!</div></div></div>
        <div>
          <div style={{fontSize:34,fontWeight:800,color:C.yellow,lineHeight:1.2,letterSpacing:"-0.02em",marginBottom:16}}>Hub Intelligence<br/>Portal</div>
          <p style={{color:"rgba(255,255,255,0.5)",fontSize:13,lineHeight:1.8,maxWidth:290,marginBottom:26}}>Track every facility expense across 4,000+ Shadowfax hubs — powered by your Happy reimbursement data.</p>
          <div style={{display:"flex",gap:11,flexWrap:"wrap"}}>
            {[["4,000+","Active Hubs"],["7","Expense Categories"],["Real-time","Data Sync"]].map(([v,l])=>(<div key={l} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:9,padding:"10px 14px"}}><div style={{color:C.yellow,fontSize:16,fontWeight:800}}>{v}</div><div style={{color:"rgba(255,255,255,0.35)",fontSize:9,marginTop:1}}>{l}</div></div>))}
          </div>
        </div>
        <div style={{fontSize:10,color:"rgba(255,255,255,0.18)"}}>© 2025 Shadowfax Technologies Pvt. Ltd.</div>
      </div>
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",background:C.white,padding:48}}>
        <div style={{width:"100%",maxWidth:390}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:26}}><SFLogo size={22}/><span style={{fontWeight:800,fontSize:14,color:C.dark}}>Hub Portal</span></div>
          <h2 style={{fontSize:26,fontWeight:800,color:C.dark,marginBottom:5,letterSpacing:"-0.02em"}}>Sign in to continue</h2>
          <p style={{color:C.t3,fontSize:13,marginBottom:20}}>Enter your Shadowfax credentials below</p>

          {/* Server status indicator */}
          {serverStatus==="waking"&&<div style={{background:"#FFF8E1",border:"1px solid #FFE082",borderRadius:8,padding:"9px 12px",fontSize:12,color:"#F59E0B",marginBottom:14,display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:16}}>⏳</span>Server is waking up — may take 30 seconds on first load...</div>}
          {serverStatus==="online"&&<div style={{background:C.greenBg,border:"1px solid #86EFAC",borderRadius:8,padding:"9px 12px",fontSize:12,color:C.green,marginBottom:14,display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:16}}>✅</span>Server is online — ready to login</div>}

          {/* Role selector */}
          <div style={{display:"flex",gap:8,marginBottom:20,background:"#F1F3F5",padding:4,borderRadius:10}}>
            {[["admin","Admin / Finance / Ops"],["hi","Hub Incharge (HI)"]].map(([r,lbl])=>(
              <button key={r} onClick={()=>{setRole(r);setEmail("");setPass("");setErr("");}}
                style={{flex:1,padding:"9px 0",borderRadius:8,border:"none",cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"'Poppins',sans-serif",
                  background:role===r?C.yellow:"transparent",
                  color:role===r?C.dark:C.t3,transition:"all 0.2s"}}>
                {lbl}
              </button>
            ))}
          </div>

          {[["EMAIL","email",email,setEmail,"text",role==="admin"?"admin@shadowfax.in":"hi@shadowfax.in"],["PASSWORD","pass",pass,setPass,"password","••••••••"]].map(([lbl,id,val,set,type,ph])=>(<div key={id} style={{marginBottom:14}}><label style={{display:"block",fontSize:11,fontWeight:700,color:C.t2,marginBottom:5,letterSpacing:"0.05em"}}>{lbl}</label><input value={val} type={type} placeholder={ph} onChange={e=>set(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()} style={{width:"100%",padding:"12px 14px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:14,fontFamily:"'Poppins',sans-serif",outline:"none",color:C.dark,transition:"border .15s"}} onFocus={e=>e.target.style.borderColor=C.yellow} onBlur={e=>e.target.style.borderColor=C.border}/></div>))}
          {err&&<div style={{background:C.redBg,border:"1px solid #FECACA",borderRadius:8,padding:"9px 12px",fontSize:12,color:C.red,marginBottom:14,fontWeight:500}}>{err}</div>}
          <button onClick={go} disabled={busy||serverStatus==="waking"} style={{width:"100%",padding:"13px",background:C.yellow,border:"none",borderRadius:8,color:C.dark,fontSize:15,fontWeight:800,cursor:busy||serverStatus==="waking"?"not-allowed":"pointer",fontFamily:"'Poppins',sans-serif",opacity:busy||serverStatus==="waking"?.6:1}} onMouseEnter={e=>e.currentTarget.style.background=C.yellowDk} onMouseLeave={e=>e.currentTarget.style.background=C.yellow}>{busy?"Signing in…":serverStatus==="waking"?"Server waking up…":"Sign In →"}</button>
          <div style={{marginTop:16,padding:"12px 14px",background:"#F9FAFB",border:`1px solid ${C.border}`,borderRadius:8,fontSize:12,color:C.t3}}>
            <strong style={{color:C.t2}}>Demo admin:</strong> admin@hubportal.in / admin123<br/>
            <strong style={{color:C.t2}}>HI login:</strong> Use credentials created by admin
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══ TOP NAV ══ */
function TopNav({user,screen,onNav,onLogout}) {
  const tabs=user.role==="admin"?[{id:"dashboard",label:"Dashboard"},{id:"search",label:"Hub Explorer"},{id:"audit",label:"Audit Flags"},{id:"etl",label:"ETL Sync"}]:[{id:"myhub",label:"My Hub"}];
  const active=screen==="hub-detail"?"search":screen;
  return(<div style={{position:"sticky",top:0,zIndex:100,background:C.white,borderBottom:`1px solid ${C.border}`,boxShadow:"0 2px 10px rgba(0,0,0,0.06)"}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 28px",height:60}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}><SFLogo size={24}/><div><div style={{fontWeight:900,fontSize:14,color:C.dark,letterSpacing:"0.02em",lineHeight:1}}>SHADOWFAX</div><div style={{fontSize:8,color:C.yellow,fontWeight:700,letterSpacing:"0.07em"}}>Hub Portal</div></div></div>
      <nav style={{display:"flex",gap:2}}>{tabs.map(t=>{const on=active===t.id;return(<button key={t.id} onClick={()=>onNav(t.id)} style={{padding:"6px 16px",border:"none",background:"transparent",cursor:"pointer",fontSize:13,fontWeight:on?700:500,color:on?C.dark:C.t3,fontFamily:"'Poppins',sans-serif",position:"relative"}}>{t.label}{on&&<div style={{position:"absolute",bottom:-1,left:16,right:16,height:2.5,background:C.yellow,borderRadius:"2px 2px 0 0"}}/>}</button>);})}</nav>
      <div style={{display:"flex",alignItems:"center",gap:10}}><div style={{textAlign:"right"}}><div style={{fontSize:12,fontWeight:700,color:C.dark}}>{user.name}</div><div style={{fontSize:10,color:C.t3}}>{user.role==="admin"?"Admin":"Hub Incharge"}</div></div><div style={{width:34,height:34,borderRadius:"50%",background:C.yellow,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,color:C.dark,flexShrink:0}}>{(user.name||"U").charAt(0)}</div><button onClick={onLogout} style={{padding:"7px 16px",background:C.yellow,border:"none",borderRadius:6,color:C.dark,fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"'Poppins',sans-serif"}} onMouseEnter={e=>e.currentTarget.style.background=C.yellowDk} onMouseLeave={e=>e.currentTarget.style.background=C.yellow}>Sign Out</button></div>
    </div>
  </div>);
}

/* ══ DASHBOARD ══ */
function Dashboard({onSelect}) {
  const [kpis,setKpis]=useState(null); const [stateData,setStateData]=useState([]); const [catMix,setCatMix]=useState([]); const [topHubs,setTopHubs]=useState([]); const [loading,setLoading]=useState(true);
  useEffect(()=>{
    Promise.all([api.getDashboardKpis(), api.getStateSpend(), api.getCategoryMix(), api.getTopHubs(8)])
      .then(([k,s,c,t])=>{ setKpis(k); setStateData(s.slice(0,8)); setCatMix(c.map((x,i)=>({...x,color:Object.values({h:"#F5C518",t:"#1DB87E",p:"#2196F3",r:"#9C27B0",e:"#FF9800",i:"#00BCD4",re:"#E53935",f:"#F59E0B",tr:"#64748B",o:"#8B5CF6"})[Object.keys({h:0,t:1,p:2,r:3,e:4,i:5,re:6,f:7,tr:8,o:9})[i]]||"#888"})));  setTopHubs(t); })
      .catch(console.error)
      .finally(()=>setLoading(false));
  },[]);
  if(loading) return <div style={{padding:"28px 28px"}}><Spinner/></div>;
  return (
    <div style={{padding:"26px 28px",background:C.bg,fontFamily:"'Poppins',sans-serif"}}>
      <div style={{marginBottom:20}}><h1 style={{fontSize:22,fontWeight:800,color:C.dark,letterSpacing:"-0.02em"}}>Network Overview</h1><p style={{color:C.t3,fontSize:13,marginTop:2}}>Live data from Supabase · {kpis?.total_hubs||0} active hubs</p></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:13,marginBottom:20}}>
        {[[" Total Hubs",kpis?.total_hubs||0,"Across India","🏢",C.yellow,true],["YTD Spend",fmtK(kpis?.total_ytd),"All time","💰",C.yellow,false],["Flagged",kpis?.flagged_hubs||0,"Above ₹2L","⚠️",C.red,false],["Top Spend",fmtK(kpis?.top_hub?.ytd),kpis?.top_hub?.code||"—","📍","#9C27B0",false]].map(([lbl,val,sub,icon,acc,dk])=>(<div key={lbl} className="fu" style={{background:dk?C.dark:C.white,border:`1px solid ${dk?"#333":C.border}`,borderRadius:12,padding:"18px 20px",position:"relative",overflow:"hidden"}}><div style={{position:"absolute",top:0,left:0,right:0,height:3,background:acc,borderRadius:"12px 12px 0 0"}}/><div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:11,fontWeight:700,color:dk?"rgba(255,255,255,0.4)":C.t3,letterSpacing:"0.06em",textTransform:"uppercase"}}>{lbl}</span><span style={{fontSize:18}}>{icon}</span></div><div style={{fontSize:24,fontWeight:800,color:dk?C.yellow:C.dark,letterSpacing:"-0.02em"}}>{val}</div><div style={{fontSize:11,color:dk?"rgba(255,255,255,0.3)":C.t3,marginTop:4}}>{sub}</div></div>))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1.1fr 0.9fr",gap:14,marginBottom:14}}>
        <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,padding:"20px 22px"}}><div style={{fontWeight:800,color:C.dark,fontSize:14,marginBottom:2}}>Spend by state</div><div style={{fontSize:11,color:C.t3,marginBottom:16}}>YTD total</div>
          {stateData.length>0?<ResponsiveContainer width="100%" height={220}><BarChart data={stateData} layout="vertical" margin={{left:0,right:16}}><CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={C.border}/><XAxis type="number" tickFormatter={fmtK} tick={{fontSize:10,fill:C.t3}} axisLine={false} tickLine={false}/><YAxis type="category" dataKey="state" tick={{fontSize:11,fill:C.t2}} axisLine={false} tickLine={false} width={115}/><Tooltip content={<CTip/>}/><Bar dataKey="value" name="YTD Spend" fill={C.yellow} radius={[0,5,5,0]} barSize={13}/></BarChart></ResponsiveContainer>:<div style={{height:220,display:"flex",alignItems:"center",justifyContent:"center",color:C.t3,fontSize:13}}>No data yet — run ETL to load hub data</div>}
        </div>
        <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,padding:"20px 22px"}}><div style={{fontWeight:800,color:C.dark,fontSize:14,marginBottom:2}}>Category mix</div><div style={{fontSize:11,color:C.t3,marginBottom:16}}>National split</div>
          {catMix.length>0?<ResponsiveContainer width="100%" height={220}><PieChart><Pie data={catMix} cx="50%" cy="46%" innerRadius={52} outerRadius={84} dataKey="value" paddingAngle={2}>{catMix.map((e,i)=><Cell key={i} fill={e.color||"#888"} strokeWidth={0}/>)}</Pie><Tooltip formatter={v=>fmt(v)} contentStyle={{borderRadius:8,fontSize:11,border:`1px solid ${C.border}`}}/><Legend iconType="circle" iconSize={7} wrapperStyle={{fontSize:10}}/></PieChart></ResponsiveContainer>:<div style={{height:220,display:"flex",alignItems:"center",justifyContent:"center",color:C.t3,fontSize:13}}>No data yet — run ETL first</div>}
        </div>
      </div>
      {topHubs.length>0&&<div style={{background:C.dark,border:"1px solid #333",borderRadius:12,padding:"20px 22px"}}><div style={{fontWeight:800,color:C.yellow,fontSize:14,marginBottom:16}}>Top hubs by spend</div><div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>{topHubs.map((h,i)=>(<div key={h.hub_code} onClick={()=>onSelect(h.hub_code)} style={{padding:"12px 13px",border:`1px solid ${i<3?"rgba(245,197,24,0.4)":"rgba(255,255,255,0.1)"}`,borderRadius:9,cursor:"pointer",background:i<3?"rgba(245,197,24,0.08)":"rgba(255,255,255,0.03)",transition:"all .15s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(245,197,24,0.6)";e.currentTarget.style.transform="translateY(-2px)";}} onMouseLeave={e=>{e.currentTarget.style.borderColor=i<3?"rgba(245,197,24,0.4)":"rgba(255,255,255,0.1)";e.currentTarget.style.transform="none";}}><div style={{display:"flex",alignItems:"center",gap:5,marginBottom:5}}><span style={{width:19,height:19,borderRadius:4,background:i<3?C.yellow:"rgba(255,255,255,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:i<3?C.dark:"#888",flexShrink:0}}>{i+1}</span><span style={{fontSize:10,fontWeight:700,color:C.white,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{h.hub_code}</span></div><div style={{fontSize:15,fontWeight:800,color:C.yellow}}>{fmtK(h.ytd)}</div><div style={{fontSize:9,color:"rgba(255,255,255,0.3)",marginTop:2}}>{h.city}</div></div>))}</div></div>}
      {topHubs.length===0&&<div style={{background:C.dark,border:"1px solid #333",borderRadius:12,padding:"40px",textAlign:"center"}}><div style={{color:C.yellow,fontSize:14,fontWeight:700,marginBottom:8}}>No hub data loaded yet</div><div style={{color:"rgba(255,255,255,0.4)",fontSize:13}}>Go to ETL Sync tab → click "Trigger ETL" to load your data</div></div>}
    </div>
  );
}

/* ══ HUB SEARCH ══ */
function HubSearch({onSelect}) {
  const [q,setQ]=useState(""); const [st,setSt]=useState(""); const [ci,setCi]=useState(""); const [sort,setSort]=useState("spend");
  const [results,setResults]=useState([]); const [filters,setFilters]=useState({states:[],cities:[],tiers:[]}); const [loading,setLoading]=useState(false);
  useEffect(()=>{ api.getFilters().then(setFilters).catch(console.error); },[]);
  const search = useCallback(async()=>{
    setLoading(true);
    try { const r = await api.searchHubs({q,state:st,city:ci,sort,limit:100}); setResults(r.hubs||[]); }
    catch(e){ console.error(e); }
    finally { setLoading(false); }
  },[q,st,ci,sort]);
  useEffect(()=>{ search(); },[search]);
  const cities = st ? (filters.cities||[]) : [];
  return (
    <div style={{padding:"26px 28px",background:C.bg,fontFamily:"'Poppins',sans-serif"}}>
      <h1 style={{fontSize:22,fontWeight:800,color:C.dark,marginBottom:3,letterSpacing:"-0.02em"}}>Hub Explorer</h1>
      <p style={{color:C.t3,fontSize:13,marginBottom:20}}>Search and filter all hubs</p>
      <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,padding:"15px 18px",display:"flex",gap:12,flexWrap:"wrap",alignItems:"flex-end",marginBottom:16}}>
        <div style={{flex:"1 1 180px"}}><div style={{fontSize:11,fontWeight:700,color:C.t3,letterSpacing:"0.05em",marginBottom:5,textTransform:"uppercase"}}>Search</div><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Hub code, city or state…" style={{width:"100%",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13,fontFamily:"'Poppins',sans-serif",outline:"none",background:C.bg,color:C.dark,transition:"border .15s"}} onFocus={e=>e.target.style.borderColor=C.yellow} onBlur={e=>e.target.style.borderColor=C.border}/></div>
        {[["State",st,v=>{setSt(v);setCi("");},(filters.states||[])],["City",ci,setCi,cities]].map(([lbl,val,fn,opts])=>(<div key={lbl} style={{flex:"0 0 120px"}}><div style={{fontSize:11,fontWeight:700,color:C.t3,letterSpacing:"0.05em",marginBottom:5,textTransform:"uppercase"}}>{lbl}</div><select value={val} onChange={e=>fn(e.target.value)} style={{width:"100%",padding:"9px 10px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13,fontFamily:"'Poppins',sans-serif",background:C.white,color:C.dark,outline:"none"}}><option value="">All</option>{opts.map(o=><option key={o}>{o}</option>)}</select></div>))}
        <div style={{flex:"0 0 130px"}}><div style={{fontSize:11,fontWeight:700,color:C.t3,letterSpacing:"0.05em",marginBottom:5,textTransform:"uppercase"}}>Sort</div><select value={sort} onChange={e=>setSort(e.target.value)} style={{width:"100%",padding:"9px 10px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13,fontFamily:"'Poppins',sans-serif",background:C.white,color:C.dark,outline:"none"}}><option value="spend">Top spend</option><option value="name">Code A–Z</option></select></div>
      </div>
      <div style={{fontSize:12,color:C.t3,fontWeight:600,marginBottom:14}}>{loading?"Loading…":`${results.length} hubs`}</div>
      {results.length===0&&!loading&&<div style={{textAlign:"center",padding:40,color:C.t3,fontSize:13}}>No hubs found. Run ETL Sync to load your data first.</div>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(265px,1fr))",gap:12}}>
        {results.map(h=>{const over=(h.total_ytd||0)>200000;return(
          <div key={h.hub_code} onClick={()=>onSelect(h.hub_code)} style={{background:C.white,border:`1px solid ${over?"#FECACA":C.border}`,borderRadius:12,padding:16,cursor:"pointer",transition:"all .15s",borderLeft:`3.5px solid ${over?C.red:C.yellow}`}} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 6px 22px rgba(0,0,0,0.09)";}} onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><div><div style={{fontWeight:800,fontSize:13,color:C.dark}}>{h.hub_code}</div><div style={{fontSize:11,color:C.t3,marginTop:2}}>{h.city} · {h.state}</div></div><div style={{display:"flex",flexDirection:"column",gap:3,alignItems:"flex-end"}}>{over&&<Chip label="High Spend" color="red"/>}{h.tier&&<Chip label={h.tier} color="dark"/>}</div></div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}><div><div style={{fontSize:20,fontWeight:800,color:over?C.red:C.dark}}>{fmtK(h.total_ytd)}</div><div style={{fontSize:10,color:C.t3}}>{h.manager_name||"—"}</div></div></div>
          </div>
        );})}
      </div>
    </div>
  );
}

/* ══ AUDIT FLAGS ══ */
function AuditFlags({onSelect}) {
  const [flagged,setFlagged]=useState([]); const [loading,setLoading]=useState(true);
  useEffect(()=>{ api.getFlaggedHubs().then(setFlagged).catch(console.error).finally(()=>setLoading(false)); },[]);
  return (
    <div style={{padding:"26px 28px",background:C.bg,fontFamily:"'Poppins',sans-serif"}}>
      <h1 style={{fontSize:22,fontWeight:800,color:C.dark,marginBottom:3,letterSpacing:"-0.02em"}}>Audit & Anomaly Flags</h1>
      <p style={{color:C.t3,fontSize:13,marginBottom:20}}>{loading?"Loading…":`${flagged.length} hubs above ₹2L YTD threshold`}</p>
      {loading?<Spinner/>:<div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13,fontFamily:"'Poppins',sans-serif"}}>
          <thead><tr style={{background:C.dark}}>{["#","Hub Code","City","State","Tier","YTD Spend","Violations",""].map((h,i)=><th key={i} style={{padding:"11px 16px",textAlign:"left",fontSize:11,fontWeight:700,color:C.yellow,textTransform:"uppercase",letterSpacing:"0.05em",whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
          <tbody>{flagged.length===0?<tr><td colSpan={8} style={{padding:32,textAlign:"center",color:C.t3}}>No flagged hubs — data loads after ETL sync</td></tr>:flagged.map((h,i)=>(<tr key={h.hub_code} style={{borderBottom:`1px solid ${C.border}`,transition:"background .1s"}} onMouseEnter={e=>e.currentTarget.style.background=C.yellowBg} onMouseLeave={e=>e.currentTarget.style.background=C.white}><td style={{padding:"11px 16px",color:C.t3,fontWeight:700}}>{i+1}</td><td style={{padding:"11px 16px"}}><div style={{fontWeight:800,color:C.dark}}>{h.hub_code}</div><div style={{fontSize:11,color:C.t3}}>{h.manager}</div></td><td style={{padding:"11px 16px",color:C.t2}}>{h.city}</td><td style={{padding:"11px 16px",color:C.t2}}>{h.state}</td><td style={{padding:"11px 16px"}}>{h.tier&&<Chip label={h.tier} color="dark"/>}</td><td style={{padding:"11px 16px",fontWeight:800,color:C.red,fontSize:14}}>{fmt(h.ytd)}</td><td style={{padding:"11px 16px",color:C.amber,fontWeight:700}}>{h.violations||0}</td><td style={{padding:"11px 16px"}}><button onClick={()=>onSelect(h.hub_code)} style={{padding:"6px 14px",background:C.yellow,border:"none",borderRadius:7,color:C.dark,fontSize:11,cursor:"pointer",fontWeight:800,fontFamily:"'Poppins',sans-serif"}} onMouseEnter={e=>e.currentTarget.style.background=C.yellowDk} onMouseLeave={e=>e.currentTarget.style.background=C.yellow}>Review →</button></td></tr>))}</tbody>
        </table>
      </div>}
    </div>
  );
}

/* ══ HUB DETAIL ══ */
function HubDetail({hubCode,isHI,onBack}) {
  const [hub,setHub]=useState(null); const [expenses,setExpenses]=useState([]); const [loading,setLoading]=useState(true); const [err,setErr]=useState(null);
  useEffect(()=>{
    if(!hubCode) return;
    setLoading(true); setErr(null);
    Promise.all([api.getHub(hubCode), api.getHubExpenses(hubCode,{limit:20})])
      .then(([h,e])=>{ setHub(h); setExpenses(e.expenses||[]); })
      .catch(e=>setErr(e.message))
      .finally(()=>setLoading(false));
  },[hubCode]);
  if(loading) return <div style={{padding:28}}><Spinner/></div>;
  if(err) return <div style={{padding:28,color:C.red,fontSize:13}}>{err}</div>;
  if(!hub) return null;
  const monthly = hub.monthly_data||[];
  const areaData = monthly.map(m=>({month:`${m.year}-${String(m.month).padStart(2,"0")}`,total:m.total||0}));
  const totalYTD = hub.total_ytd||0;
  const pieData = CATS.map(c=>({name:c.key,value:monthly.reduce((s,m)=>s+(m.categories?.[c.key]||0),0),color:c.color})).filter(x=>x.value>0);
  return (
    <div style={{padding:"26px 28px",background:C.bg,fontFamily:"'Poppins',sans-serif"}}>
      {!isHI&&<div style={{marginBottom:16,display:"flex",alignItems:"center",gap:8}}><button onClick={onBack} style={{padding:"6px 14px",background:C.white,border:`1px solid ${C.border}`,borderRadius:8,fontSize:12,cursor:"pointer",color:C.t2,fontWeight:700,fontFamily:"'Poppins',sans-serif"}}>← Back</button><span style={{color:C.t3,fontSize:13}}>Hub Explorer / <strong style={{color:C.dark}}>{hub.hub_code}</strong></span></div>}
      <div style={{background:C.dark,borderRadius:14,padding:"22px 26px",marginBottom:20,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-40,right:-40,width:200,height:200,borderRadius:"50%",background:"rgba(245,197,24,0.06)",pointerEvents:"none"}}/>
        <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:14}}>
          <div><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}><h2 style={{color:C.yellow,fontSize:20,fontWeight:800,letterSpacing:"-0.02em"}}>{hub.hub_code}</h2><Chip label={hub.is_active?"Active":"Inactive"} color={hub.is_active?"green":"amber"}/>{totalYTD>200000&&<Chip label="High Spend" color="red"/>}</div><div style={{display:"flex",gap:20,flexWrap:"wrap"}}>{[["City",hub.city],["State",hub.state],["Tier",hub.tier],["Manager",hub.manager_name],["Sq.Ft.",hub.sqft?hub.sqft.toLocaleString():"—"]].map(([k,v])=>v?(<div key={k}><div style={{color:"rgba(255,255,255,0.3)",fontSize:10,letterSpacing:"0.06em",textTransform:"uppercase"}}>{k}</div><div style={{color:"rgba(255,255,255,0.9)",fontSize:12,fontWeight:700,marginTop:2}}>{v}</div></div>):null)}</div></div>
          <div style={{textAlign:"right",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"13px 17px"}}><div style={{color:"rgba(255,255,255,0.3)",fontSize:10,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4}}>Total Spend</div><div style={{color:C.yellow,fontSize:22,fontWeight:800}}>{fmtK(totalYTD)}</div></div>
        </div>
      </div>
      {areaData.length>0&&<div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,padding:"20px 22px",marginBottom:14}}><div style={{fontWeight:800,color:C.dark,fontSize:14,marginBottom:2}}>Monthly spend trend</div><div style={{fontSize:11,color:C.t3,marginBottom:14}}>All months</div><ResponsiveContainer width="100%" height={175}><AreaChart data={areaData} margin={{left:0,right:4}}><defs><linearGradient id="yg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.yellow} stopOpacity={0.15}/><stop offset="95%" stopColor={C.yellow} stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/><XAxis dataKey="month" tick={{fontSize:9,fill:C.t3}} axisLine={false} tickLine={false}/><YAxis tickFormatter={fmtK} tick={{fontSize:10,fill:C.t3}} axisLine={false} tickLine={false} width={42}/><Tooltip content={<CTip/>}/><Area type="monotone" dataKey="total" name="Total" stroke={C.yellow} strokeWidth={2.5} fill="url(#yg)" dot={{r:3,fill:C.yellow,strokeWidth:0}}/></AreaChart></ResponsiveContainer></div>}
      {pieData.length>0&&<div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,padding:"20px 22px",marginBottom:14}}><div style={{fontWeight:800,color:C.dark,fontSize:14,marginBottom:2}}>Expense mix</div><div style={{fontSize:11,color:C.t3,marginBottom:14}}>Category split</div><ResponsiveContainer width="100%" height={200}><PieChart><Pie data={pieData} cx="50%" cy="48%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>{pieData.map((e,i)=><Cell key={i} fill={e.color} strokeWidth={0}/>)}</Pie><Tooltip formatter={v=>fmt(v)} contentStyle={{borderRadius:8,fontSize:11,border:`1px solid ${C.border}`}}/><Legend iconType="circle" iconSize={7} wrapperStyle={{fontSize:10}}/></PieChart></ResponsiveContainer></div>}
      <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,padding:"20px 22px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><div><div style={{fontWeight:800,color:C.dark,fontSize:14}}>Recent transactions</div><div style={{fontSize:11,color:C.t3,marginTop:1}}>Live from database</div></div>{!isHI&&<a href={api.exportCsv(hub.hub_code)} target="_blank" rel="noreferrer" style={{padding:"7px 16px",background:C.yellow,border:"none",borderRadius:7,color:C.dark,fontSize:12,fontWeight:800,cursor:"pointer",textDecoration:"none",fontFamily:"'Poppins',sans-serif"}}>↓ Export CSV</a>}</div>
        {expenses.length===0?<div style={{textAlign:"center",padding:32,color:C.t3,fontSize:13}}>No expense records yet — run ETL to load data</div>:
        <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12,fontFamily:"'Poppins',sans-serif"}}><thead><tr style={{background:C.dark}}>{["Date","Category","Description","Amount","Status","Policy Violation"].map(h=><th key={h} style={{padding:"9px 14px",textAlign:"left",fontSize:11,fontWeight:700,color:C.yellow,textTransform:"uppercase",letterSpacing:"0.05em",whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead><tbody>{expenses.map((e,i)=>{const stC={Paid:C.green,Verified:C.blue,Submitted:C.amber,Declined:C.red}[e.status]||C.t3;return(<tr key={i} style={{borderBottom:`1px solid ${C.border}`,transition:"background .1s"}} onMouseEnter={x=>x.currentTarget.style.background=C.yellowBg} onMouseLeave={x=>x.currentTarget.style.background=C.white}><td style={{padding:"10px 14px",color:C.t3,whiteSpace:"nowrap"}}>{e.date}</td><td style={{padding:"10px 14px"}}><span style={{background:`${C.yellow}18`,color:C.yellowDk,padding:"3px 9px",borderRadius:12,fontSize:11,fontWeight:700}}>{e.category}</span></td><td style={{padding:"10px 14px",color:C.t2,maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.description||"—"}</td><td style={{padding:"10px 14px",fontWeight:800,color:C.dark}}>{fmt(e.amount)}</td><td style={{padding:"10px 14px"}}><span style={{background:`${stC}18`,color:stC,padding:"3px 9px",borderRadius:12,fontSize:11,fontWeight:700}}>{e.status}</span></td><td style={{padding:"10px 14px"}}><Chip label={e.policy_violation?"Yes":"No"} color={e.policy_violation?"red":"green"}/></td></tr>);})}</tbody></table></div>}
      </div>
    </div>
  );
}

/* ══ ETL SYNC TAB ══ */
function EtlSync() {
  const [logs,setLogs]=useState([]); const [triggering,setTriggering]=useState(false); const [msg,setMsg]=useState("");
  const loadLogs = () => api.getEtlLogs().then(setLogs).catch(console.error);
  useEffect(()=>{ loadLogs(); },[]);
  const trigger = async() => {
    setTriggering(true); setMsg("");
    try { await api.triggerEtl(); setMsg("✅ ETL sync started! Check logs below. It may take a few minutes."); setTimeout(loadLogs, 3000); }
    catch(e){ setMsg("❌ "+e.message); }
    finally { setTriggering(false); }
  };
  return (
    <div style={{padding:"26px 28px",background:C.bg,fontFamily:"'Poppins',sans-serif"}}>
      <h1 style={{fontSize:22,fontWeight:800,color:C.dark,marginBottom:3,letterSpacing:"-0.02em"}}>ETL Data Sync</h1>
      <p style={{color:C.t3,fontSize:13,marginBottom:20}}>Sync your Google Drive Excel data into the database</p>
      <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,padding:"20px 22px",marginBottom:16}}>
        <div style={{fontWeight:800,color:C.dark,fontSize:14,marginBottom:8}}>Manual Sync</div>
        <p style={{color:C.t3,fontSize:13,marginBottom:14}}>Trigger a full data sync from your Google Drive Excel file. Automatic sync runs nightly at 2AM IST.</p>
        <button onClick={trigger} disabled={triggering} style={{padding:"10px 24px",background:C.yellow,border:"none",borderRadius:8,color:C.dark,fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"'Poppins',sans-serif",opacity:triggering?.7:1}}>{triggering?"Syncing…":"▶ Trigger ETL Sync"}</button>
        {msg&&<div style={{marginTop:12,padding:"10px 14px",background:msg.startsWith("✅")?C.greenBg:C.redBg,borderRadius:8,fontSize:13,color:msg.startsWith("✅")?C.green:C.red,fontWeight:500}}>{msg}</div>}
        <div style={{marginTop:14,padding:"12px 14px",background:"#FFF8E1",border:"1px solid #FFE082",borderRadius:8,fontSize:12,color:"#5D4037"}}>
          <strong>⚠️ Before triggering ETL:</strong> Make sure you've set <code>GOOGLE_SERVICE_ACCOUNT_JSON</code> and <code>GOOGLE_DRIVE_FILE_ID</code> in your Render environment variables. Without these, the ETL will fail.
        </div>
      </div>
      <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,padding:"20px 22px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><div style={{fontWeight:800,color:C.dark,fontSize:14}}>ETL Run History</div><button onClick={loadLogs} style={{padding:"5px 12px",background:C.bg,border:`1px solid ${C.border}`,borderRadius:7,fontSize:12,cursor:"pointer",fontWeight:600}}>↻ Refresh</button></div>
        {logs.length===0?<div style={{textAlign:"center",padding:24,color:C.t3,fontSize:13}}>No ETL runs yet</div>:<table style={{width:"100%",borderCollapse:"collapse",fontSize:12,fontFamily:"'Poppins',sans-serif"}}><thead><tr style={{background:C.bg,borderBottom:`2px solid ${C.border}`}}>{["Started","Status","Rows Processed","Inserted","Triggered By","Error"].map(h=><th key={h} style={{padding:"8px 12px",textAlign:"left",fontSize:11,fontWeight:700,color:C.t3,textTransform:"uppercase",letterSpacing:"0.04em",whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead><tbody>{logs.map((l,i)=>{const stC={success:C.green,failed:C.red,running:C.amber}[l.status]||C.t3;return(<tr key={i} style={{borderBottom:`1px solid ${C.border}`}}><td style={{padding:"9px 12px",color:C.t3,whiteSpace:"nowrap"}}>{l.started_at?.slice(0,19)||"—"}</td><td style={{padding:"9px 12px"}}><Chip label={l.status} color={l.status==="success"?"green":l.status==="failed"?"red":"amber"}/></td><td style={{padding:"9px 12px",color:C.t2}}>{l.rows_processed?.toLocaleString()||0}</td><td style={{padding:"9px 12px",color:C.t2}}>{l.rows_inserted?.toLocaleString()||0}</td><td style={{padding:"9px 12px",color:C.t2}}>{l.triggered_by}</td><td style={{padding:"9px 12px",color:C.red,fontSize:11,maxWidth:200,overflow:"hidden",textOverflow:"ellipsis"}}>{l.error||"—"}</td></tr>);})}</tbody></table>}
      </div>
    </div>
  );
}

/* ══ ROOT APP ══ */
export default function App() {
  const [user,setUser]=useState(()=>getStoredUser());
  const [screen,setScreen]=useState("dashboard");
  const [selHubCode,setSelHubCode]=useState(null);

  const handleLogin = u => { setUser(u); setScreen(u.role==="hi"?"myhub":"dashboard"); };
  const handleLogout = () => { clearToken(); setUser(null); setScreen("dashboard"); setSelHubCode(null); };
  const handleSelect = code => { setSelHubCode(code); setScreen("hub-detail"); };
  const handleNav = s => { setScreen(s); if(s!=="hub-detail") setSelHubCode(null); };

  if(!user) return <Login onLogin={handleLogin}/>;

  if(user.role==="hi") return (
    <div style={{fontFamily:"'Poppins',sans-serif"}}>
      <style>{FONT}</style>
      <TopNav user={user} screen="myhub" onNav={()=>{}} onLogout={handleLogout}/>
      <HubDetail hubCode={user.hub_id} isHI={true} onBack={null}/>
    </div>
  );

  const active=screen==="hub-detail"?"search":screen;
  return(
    <div style={{fontFamily:"'Poppins',sans-serif"}}>
      <style>{FONT}</style>
      <TopNav user={user} screen={active} onNav={handleNav} onLogout={handleLogout}/>
      {screen==="dashboard"&&<Dashboard onSelect={handleSelect}/>}
      {screen==="search"&&<HubSearch onSelect={handleSelect}/>}
      {screen==="audit"&&<AuditFlags onSelect={handleSelect}/>}
      {screen==="etl"&&<EtlSync/>}
      {screen==="hub-detail"&&selHubCode&&<HubDetail hubCode={selHubCode} isHI={false} onBack={()=>handleNav("search")}/>}
    </div>
  );
}
