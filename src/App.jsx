import { useState, useEffect, useCallback } from "react";
import { PieChart,Pie,Cell,Tooltip,Legend,ResponsiveContainer,BarChart,Bar,XAxis,YAxis,CartesianGrid,AreaChart,Area } from "recharts";
import { api, setToken, clearToken, getStoredUser, storeUser, wakeBackend } from "./api";

const FONT=`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Poppins',sans-serif}`;
const C={yellow:"#F5C518",yellowDk:"#D4A800",dark:"#1A1A1A",white:"#fff",bg:"#F4F5F7",card:"#fff",border:"#E8EAED",t1:"#111",t2:"#555",t3:"#999",green:"#1DB87E",greenBg:"#E8FBF3",red:"#E53935",redBg:"#FEF2F2",amber:"#F59E0B",blue:"#1565C0",blueBg:"#E3F2FD"};
const fmt=n=>"₹"+Number(Math.round(n||0)).toLocaleString("en-IN");
const fmtK=n=>!n?"₹0":n>=100000?"₹"+(n/100000).toFixed(1)+"L":n>=1000?"₹"+(n/1000).toFixed(0)+"K":"₹"+Math.round(n);
const SFLogo=({s=24})=><svg width={s} height={s} viewBox="0 0 28 28" fill="none"><path d="M4 22L11 8L18 15L23 6" stroke={C.yellow} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="23" cy="6" r="2.5" fill={C.yellow}/></svg>;
const Chip=({label,color="gray"})=>{const m={yellow:["#FFFBEA","#D4A800"],green:[C.greenBg,C.green],red:[C.redBg,C.red],amber:["#FFFBEB","#B45309"],dark:["#2A2A2A",C.white],gray:["#F1F3F5",C.t2]};const[bg,tc]=m[color]||m.gray;return <span style={{padding:"2px 9px",borderRadius:20,background:bg,color:tc,fontSize:11,fontWeight:700,display:"inline-block"}}>{label}</span>;};
const CTip=({active,payload,label})=>active&&payload?.length?<div style={{background:C.dark,border:"1px solid #333",borderRadius:10,padding:"10px 14px"}}><p style={{fontSize:12,fontWeight:700,color:C.yellow,marginBottom:6}}>{label}</p>{payload.map((p,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",gap:16,fontSize:12,color:"#aaa"}}><span>{p.name}</span><span style={{fontWeight:700,color:"#fff"}}>{fmt(p.value)}</span></div>)}</div>:null;
const Spin=()=><div style={{textAlign:"center",padding:40,color:C.t3,fontSize:13}}>Loading...</div>;

/* ── LOGIN ─────────────────────────────────────────────────────────────── */
function Login({onLogin}){
  const [tab,setTab]=useState("admin");
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [err,setErr]=useState("");
  const [busy,setBusy]=useState(false);
  const [status,setStatus]=useState("checking");

  useEffect(()=>{ wakeBackend(setStatus); },[]);

  const go=async()=>{
    if(!email||!pass){setErr("Please enter email and password");return;}
    setErr("");setBusy(true);
    try{
      const res=await api.login(email.trim().toLowerCase(),pass);
      setToken(res.access_token);
      storeUser(res.user);
      onLogin(res.user);
    }catch(e){
      setErr(e.message||"Login failed. Check credentials.");
    }finally{setBusy(false);}
  };

  return(
    <div style={{display:"flex",minHeight:"100vh",fontFamily:"'Poppins',sans-serif"}}>
      <style>{FONT}</style>
      <div style={{width:"40%",background:C.dark,padding:"40px 48px",display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}><SFLogo/><div><div style={{color:C.white,fontWeight:900,fontSize:16}}>SHADOWFAX</div><div style={{color:C.yellow,fontSize:9,fontWeight:700,letterSpacing:"0.1em"}}>Think ahead!</div></div></div>
        <div>
          <div style={{fontSize:32,fontWeight:800,color:C.yellow,lineHeight:1.2,marginBottom:14}}>Hub Intelligence<br/>Portal</div>
          <p style={{color:"rgba(255,255,255,0.45)",fontSize:13,lineHeight:1.8,marginBottom:24}}>Track every facility expense across 4,000+ Shadowfax hubs — powered by your Happy reimbursement data.</p>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            {[["4,000+","Active Hubs"],["7","Expense Categories"],["Real-time","Data Sync"]].map(([v,l])=>(
              <div key={l} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:9,padding:"10px 14px"}}>
                <div style={{color:C.yellow,fontSize:16,fontWeight:800}}>{v}</div>
                <div style={{color:"rgba(255,255,255,0.3)",fontSize:9,marginTop:1}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{fontSize:10,color:"rgba(255,255,255,0.15)"}}>© 2025 Shadowfax Technologies Pvt. Ltd.</div>
      </div>

      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",background:C.white,padding:48}}>
        <div style={{width:"100%",maxWidth:400}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:24}}><SFLogo s={20}/><span style={{fontWeight:800,fontSize:14,color:C.dark}}>Hub Portal</span></div>
          <h2 style={{fontSize:26,fontWeight:800,color:C.dark,marginBottom:4}}>Sign in to continue</h2>
          <p style={{color:C.t3,fontSize:13,marginBottom:22}}>Enter your Shadowfax credentials below</p>

          {/* Server status */}
          {status==="checking"&&<div style={{background:"#FFF8E1",border:"1px solid #FFE082",borderRadius:8,padding:"9px 12px",fontSize:12,color:"#B45309",marginBottom:14}}>⏳ Checking server...</div>}
          {status==="waking"&&<div style={{background:"#FFF8E1",border:"1px solid #FFE082",borderRadius:8,padding:"9px 12px",fontSize:12,color:"#B45309",marginBottom:14}}>⏳ Server starting up (~20 sec)...</div>}
          {status==="online"&&<div style={{background:C.greenBg,border:"1px solid #86EFAC",borderRadius:8,padding:"9px 12px",fontSize:12,color:C.green,marginBottom:14}}>✅ Server is online — ready to login</div>}

          {/* Role tabs */}
          <div style={{display:"flex",gap:6,marginBottom:18,background:"#F1F3F5",padding:4,borderRadius:10}}>
            {[["admin","Admin / Finance / Ops"],["hi","Hub Incharge (HI)"]].map(([r,l])=>(
              <button key={r} onClick={()=>{setTab(r);setEmail("");setPass("");setErr("");}}
                style={{flex:1,padding:"8px 0",borderRadius:8,border:"none",cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"'Poppins',sans-serif",background:tab===r?C.yellow:"transparent",color:tab===r?C.dark:C.t3,transition:"all .15s"}}>
                {l}
              </button>
            ))}
          </div>

          {/* Email */}
          <div style={{marginBottom:14}}>
            <label style={{display:"block",fontSize:11,fontWeight:700,color:C.t2,marginBottom:5,letterSpacing:"0.05em"}}>EMAIL</label>
            <input value={email} type="email" placeholder={tab==="admin"?"admin@shadowfax.in":"hi@shadowfax.in"}
              onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()}
              style={{width:"100%",padding:"12px 14px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:14,fontFamily:"'Poppins',sans-serif",outline:"none",color:C.dark}}/>
          </div>

          {/* Password */}
          <div style={{marginBottom:16}}>
            <label style={{display:"block",fontSize:11,fontWeight:700,color:C.t2,marginBottom:5,letterSpacing:"0.05em"}}>PASSWORD</label>
            <input value={pass} type="password" placeholder="••••••••"
              onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()}
              style={{width:"100%",padding:"12px 14px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:14,fontFamily:"'Poppins',sans-serif",outline:"none",color:C.dark}}/>
          </div>

          {/* Error */}
          {err&&<div style={{background:C.redBg,border:"1px solid #FECACA",borderRadius:8,padding:"10px 12px",fontSize:12,color:C.red,marginBottom:14,fontWeight:500}}>{err}</div>}

          {/* Sign in */}
          <button onClick={go} disabled={busy}
            style={{width:"100%",padding:"14px",background:C.yellow,border:"none",borderRadius:8,color:C.dark,fontSize:15,fontWeight:800,cursor:busy?"not-allowed":"pointer",fontFamily:"'Poppins',sans-serif",opacity:busy?.7:1}}>
            {busy?"Signing in...":"Sign In →"}
          </button>

          <div style={{marginTop:14,padding:"11px 13px",background:"#F9FAFB",border:`1px solid ${C.border}`,borderRadius:8,fontSize:12,color:C.t3}}>
            <strong style={{color:C.t2}}>Demo admin:</strong> admin@hubportal.in / admin123
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── TOP NAV ────────────────────────────────────────────────────────────── */
function Nav({user,screen,onNav,onLogout}){
  const tabs=user.role==="admin"
    ?[{id:"dashboard",l:"Dashboard"},{id:"search",l:"Hub Explorer"},{id:"audit",l:"Audit Flags"},{id:"etl",l:"ETL Sync"}]
    :[{id:"myhub",l:"My Hub"}];
  const active=screen==="hub-detail"?"search":screen;
  return(
    <div style={{position:"sticky",top:0,zIndex:100,background:C.white,borderBottom:`1px solid ${C.border}`,boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 28px",height:58}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}><SFLogo s={22}/><div><div style={{fontWeight:900,fontSize:14,color:C.dark}}>SHADOWFAX</div><div style={{fontSize:8,color:C.yellow,fontWeight:700,letterSpacing:"0.07em"}}>Hub Portal</div></div></div>
        <nav style={{display:"flex",gap:2}}>
          {tabs.map(t=>{const on=active===t.id;return(
            <button key={t.id} onClick={()=>onNav(t.id)} style={{padding:"6px 16px",border:"none",background:"transparent",cursor:"pointer",fontSize:13,fontWeight:on?700:500,color:on?C.dark:C.t3,fontFamily:"'Poppins',sans-serif",position:"relative"}}>
              {t.l}{on&&<div style={{position:"absolute",bottom:-1,left:16,right:16,height:2.5,background:C.yellow,borderRadius:"2px 2px 0 0"}}/>}
            </button>
          );})}
        </nav>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{textAlign:"right"}}><div style={{fontSize:12,fontWeight:700,color:C.dark}}>{user.name}</div><div style={{fontSize:10,color:C.t3}}>{user.role==="admin"?"Admin":"Hub Incharge"}</div></div>
          <div style={{width:32,height:32,borderRadius:"50%",background:C.yellow,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,color:C.dark}}>{(user.name||"U").charAt(0)}</div>
          <button onClick={onLogout} style={{padding:"6px 14px",background:C.yellow,border:"none",borderRadius:6,fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"'Poppins',sans-serif",color:C.dark}}>Sign Out</button>
        </div>
      </div>
    </div>
  );
}

/* ── DASHBOARD ──────────────────────────────────────────────────────────── */
function Dashboard({onSelect}){
  const [kpis,setKpis]=useState(null);const [st,setSt]=useState([]);const [cm,setCm]=useState([]);const [top,setTop]=useState([]);const [loading,setLoading]=useState(true);
  const COLORS=["#F5C518","#1DB87E","#2196F3","#9C27B0","#FF9800","#00BCD4","#E53935","#F59E0B"];
  useEffect(()=>{
    Promise.all([api.getDashboardKpis(),api.getStateSpend(),api.getCategoryMix(),api.getTopHubs(8)])
      .then(([k,s,c,t])=>{setKpis(k);setSt(s.slice(0,8));setCm(c.map((x,i)=>({...x,color:COLORS[i%COLORS.length]})));setTop(t);})
      .catch(console.error).finally(()=>setLoading(false));
  },[]);
  if(loading)return <div style={{padding:28}}><Spin/></div>;
  return(
    <div style={{padding:"24px 28px",background:C.bg}}>
      <div style={{marginBottom:18}}><h1 style={{fontSize:22,fontWeight:800,color:C.dark}}>Network Overview</h1><p style={{color:C.t3,fontSize:13}}>Live data · {kpis?.total_hubs||0} active hubs</p></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>
        {[["Total Hubs",kpis?.total_hubs||0,"Across India","🏢",false],["YTD Spend",fmtK(kpis?.total_ytd),"All time","💰",true],["Flagged",kpis?.flagged_hubs||0,"Above ₹2L","⚠️",false],["Top Hub",fmtK(kpis?.top_hub?.ytd),kpis?.top_hub?.code||"—","📍",false]].map(([l,v,s,ic,dk])=>(
          <div key={l} style={{background:dk?C.dark:C.white,border:`1px solid ${dk?"#333":C.border}`,borderRadius:12,padding:"16px 18px"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:11,fontWeight:700,color:dk?"rgba(255,255,255,0.35)":C.t3,textTransform:"uppercase",letterSpacing:"0.05em"}}>{l}</span><span style={{fontSize:16}}>{ic}</span></div>
            <div style={{fontSize:22,fontWeight:800,color:dk?C.yellow:C.dark}}>{v}</div>
            <div style={{fontSize:11,color:dk?"rgba(255,255,255,0.25)":C.t3,marginTop:3}}>{s}</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1.1fr 0.9fr",gap:12,marginBottom:12}}>
        <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,padding:"18px 20px"}}>
          <div style={{fontWeight:800,color:C.dark,fontSize:14,marginBottom:14}}>Spend by state</div>
          {st.length?<ResponsiveContainer width="100%" height={200}><BarChart data={st} layout="vertical"><CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={C.border}/><XAxis type="number" tickFormatter={fmtK} tick={{fontSize:10,fill:C.t3}} axisLine={false} tickLine={false}/><YAxis type="category" dataKey="state" tick={{fontSize:11,fill:C.t2}} axisLine={false} tickLine={false} width={110}/><Tooltip content={<CTip/>}/><Bar dataKey="value" name="YTD" fill={C.yellow} radius={[0,5,5,0]} barSize={12}/></BarChart></ResponsiveContainer>:<div style={{height:200,display:"flex",alignItems:"center",justifyContent:"center",color:C.t3,fontSize:13}}>No data yet — run ETL sync first</div>}
        </div>
        <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,padding:"18px 20px"}}>
          <div style={{fontWeight:800,color:C.dark,fontSize:14,marginBottom:14}}>Category mix</div>
          {cm.length?<ResponsiveContainer width="100%" height={200}><PieChart><Pie data={cm} cx="50%" cy="46%" innerRadius={50} outerRadius={82} dataKey="value" paddingAngle={2}>{cm.map((e,i)=><Cell key={i} fill={e.color} strokeWidth={0}/>)}</Pie><Tooltip formatter={v=>fmt(v)} contentStyle={{borderRadius:8,fontSize:11}}/><Legend iconType="circle" iconSize={7} wrapperStyle={{fontSize:10}}/></PieChart></ResponsiveContainer>:<div style={{height:200,display:"flex",alignItems:"center",justifyContent:"center",color:C.t3,fontSize:13}}>No data yet</div>}
        </div>
      </div>
      {top.length>0&&<div style={{background:C.dark,borderRadius:12,padding:"18px 20px"}}>
        <div style={{fontWeight:800,color:C.yellow,fontSize:14,marginBottom:14}}>Top hubs by spend</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
          {top.map((h,i)=>(
            <div key={h.hub_code} onClick={()=>onSelect(h.hub_code)} style={{padding:"11px 13px",border:`1px solid ${i<3?"rgba(245,197,24,0.4)":"rgba(255,255,255,0.1)"}`,borderRadius:9,cursor:"pointer",background:i<3?"rgba(245,197,24,0.07)":"transparent"}} onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"} onMouseLeave={e=>e.currentTarget.style.transform="none"}>
              <div style={{fontSize:10,fontWeight:800,color:i<3?C.yellow:"#888",marginBottom:4}}>#{i+1}</div>
              <div style={{fontSize:11,fontWeight:700,color:C.white,marginBottom:3}}>{h.hub_code}</div>
              <div style={{fontSize:15,fontWeight:800,color:C.yellow}}>{fmtK(h.ytd)}</div>
              <div style={{fontSize:9,color:"rgba(255,255,255,0.3)",marginTop:2}}>{h.city}</div>
            </div>
          ))}
        </div>
      </div>}
      {top.length===0&&<div style={{background:C.dark,borderRadius:12,padding:32,textAlign:"center"}}><div style={{color:C.yellow,fontSize:14,fontWeight:700,marginBottom:6}}>No hub data yet</div><div style={{color:"rgba(255,255,255,0.4)",fontSize:13}}>Go to ETL Sync → Trigger ETL to load your data</div></div>}
    </div>
  );
}

/* ── HUB SEARCH ─────────────────────────────────────────────────────────── */
function HubSearch({onSelect}){
  const [q,setQ]=useState("");const [st,setSt]=useState("");const [sort,setSort]=useState("spend");
  const [res,setRes]=useState([]);const [filters,setFilters]=useState({states:[],cities:[]});const [loading,setLoading]=useState(false);
  useEffect(()=>{api.getFilters().then(setFilters).catch(console.error);},[]);
  const search=useCallback(async()=>{setLoading(true);try{const r=await api.searchHubs({q,state:st,sort,limit:100});setRes(r.hubs||[]);}catch(e){console.error(e);}finally{setLoading(false);};},[q,st,sort]);
  useEffect(()=>{search();},[search]);
  return(
    <div style={{padding:"24px 28px",background:C.bg}}>
      <h1 style={{fontSize:22,fontWeight:800,color:C.dark,marginBottom:16}}>Hub Explorer</h1>
      <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,padding:"14px 16px",display:"flex",gap:10,flexWrap:"wrap",marginBottom:14}}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search hub code, city, state..." style={{flex:"1 1 180px",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13,fontFamily:"'Poppins',sans-serif",outline:"none"}}/>
        <select value={st} onChange={e=>setSt(e.target.value)} style={{flex:"0 0 130px",padding:"9px 10px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13,fontFamily:"'Poppins',sans-serif"}}><option value="">All States</option>{(filters.states||[]).map(s=><option key={s}>{s}</option>)}</select>
        <select value={sort} onChange={e=>setSort(e.target.value)} style={{flex:"0 0 130px",padding:"9px 10px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13,fontFamily:"'Poppins',sans-serif"}}><option value="spend">Top Spend</option><option value="name">Code A–Z</option></select>
      </div>
      <div style={{fontSize:12,color:C.t3,fontWeight:600,marginBottom:12}}>{loading?"Loading...":`${res.length} hubs`}</div>
      {res.length===0&&!loading&&<div style={{textAlign:"center",padding:40,color:C.t3,fontSize:13}}>No hubs found. Run ETL Sync to load data first.</div>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:11}}>
        {res.map(h=>{const over=(h.total_ytd||0)>200000;return(
          <div key={h.hub_code} onClick={()=>onSelect(h.hub_code)} style={{background:C.white,border:`1px solid ${over?"#FECACA":C.border}`,borderRadius:12,padding:14,cursor:"pointer",borderLeft:`3px solid ${over?C.red:C.yellow}`}} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 6px 20px rgba(0,0,0,0.08)";}} onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><div><div style={{fontWeight:800,fontSize:13,color:C.dark}}>{h.hub_code}</div><div style={{fontSize:11,color:C.t3}}>{h.city} · {h.state}</div></div>{over&&<Chip label="High Spend" color="red"/>}</div>
            <div style={{fontSize:19,fontWeight:800,color:over?C.red:C.dark}}>{fmtK(h.total_ytd)}</div>
          </div>
        );})}
      </div>
    </div>
  );
}

/* ── AUDIT ──────────────────────────────────────────────────────────────── */
function Audit({onSelect}){
  const [data,setData]=useState([]);const [loading,setLoading]=useState(true);
  useEffect(()=>{api.getFlaggedHubs().then(setData).catch(console.error).finally(()=>setLoading(false));},[]);
  return(
    <div style={{padding:"24px 28px",background:C.bg}}>
      <h1 style={{fontSize:22,fontWeight:800,color:C.dark,marginBottom:16}}>Audit & Anomaly Flags</h1>
      {loading?<Spin/>:<div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr style={{background:C.dark}}>{["#","Hub","City","State","YTD","Violations",""].map(h=><th key={h} style={{padding:"11px 14px",textAlign:"left",fontSize:11,fontWeight:700,color:C.yellow,textTransform:"uppercase",letterSpacing:"0.04em"}}>{h}</th>)}</tr></thead>
          <tbody>{data.length===0?<tr><td colSpan={7} style={{padding:32,textAlign:"center",color:C.t3}}>No flagged hubs — run ETL sync to load data</td></tr>:data.map((h,i)=>(
            <tr key={h.hub_code} style={{borderBottom:`1px solid ${C.border}`}} onMouseEnter={e=>e.currentTarget.style.background="#FFFBEA"} onMouseLeave={e=>e.currentTarget.style.background=C.white}>
              <td style={{padding:"10px 14px",color:C.t3,fontWeight:700}}>{i+1}</td>
              <td style={{padding:"10px 14px",fontWeight:800,color:C.dark}}>{h.hub_code}</td>
              <td style={{padding:"10px 14px",color:C.t2}}>{h.city}</td>
              <td style={{padding:"10px 14px",color:C.t2}}>{h.state}</td>
              <td style={{padding:"10px 14px",fontWeight:800,color:C.red}}>{fmt(h.ytd)}</td>
              <td style={{padding:"10px 14px",color:C.amber,fontWeight:700}}>{h.violations||0}</td>
              <td style={{padding:"10px 14px"}}><button onClick={()=>onSelect(h.hub_code)} style={{padding:"5px 12px",background:C.yellow,border:"none",borderRadius:6,color:C.dark,fontSize:11,cursor:"pointer",fontWeight:800,fontFamily:"'Poppins',sans-serif"}}>Review →</button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>}
    </div>
  );
}

/* ── HUB DETAIL ─────────────────────────────────────────────────────────── */
function HubDetail({code,isHI,onBack}){
  const [hub,setHub]=useState(null);const [exp,setExp]=useState([]);const [loading,setLoading]=useState(true);const [err,setErr]=useState(null);
  useEffect(()=>{
    if(!code)return;
    setLoading(true);setErr(null);
    Promise.all([api.getHub(code),api.getHubExpenses(code,{limit:20})])
      .then(([h,e])=>{setHub(h);setExp(e.expenses||[]);})
      .catch(e=>setErr(e.message)).finally(()=>setLoading(false));
  },[code]);
  if(loading)return <div style={{padding:28}}><Spin/></div>;
  if(err)return <div style={{padding:28,color:C.red,fontSize:13}}>{err}</div>;
  if(!hub)return null;
  const areaData=(hub.monthly_data||[]).map(m=>({month:`${m.year}-${String(m.month).padStart(2,"0")}`,total:m.total||0}));
  return(
    <div style={{padding:"24px 28px",background:C.bg}}>
      {!isHI&&<button onClick={onBack} style={{marginBottom:14,padding:"6px 14px",background:C.white,border:`1px solid ${C.border}`,borderRadius:8,fontSize:12,cursor:"pointer",fontWeight:700,fontFamily:"'Poppins',sans-serif"}}>← Back</button>}
      <div style={{background:C.dark,borderRadius:12,padding:"20px 24px",marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
          <div><h2 style={{color:C.yellow,fontSize:20,fontWeight:800,marginBottom:8}}>{hub.hub_code}</h2><div style={{display:"flex",gap:18,flexWrap:"wrap"}}>{[["City",hub.city],["State",hub.state],["Tier",hub.tier],["Manager",hub.manager_name]].map(([k,v])=>v?<div key={k}><div style={{color:"rgba(255,255,255,0.3)",fontSize:10,textTransform:"uppercase"}}>{k}</div><div style={{color:"rgba(255,255,255,0.9)",fontSize:12,fontWeight:700,marginTop:1}}>{v}</div></div>:null)}</div></div>
          <div style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"12px 16px",textAlign:"right"}}><div style={{color:"rgba(255,255,255,0.3)",fontSize:10,textTransform:"uppercase",marginBottom:3}}>Total Spend</div><div style={{color:C.yellow,fontSize:20,fontWeight:800}}>{fmtK(hub.total_ytd)}</div></div>
        </div>
      </div>
      {areaData.length>0&&<div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,padding:"18px 20px",marginBottom:12}}>
        <div style={{fontWeight:800,color:C.dark,fontSize:14,marginBottom:14}}>Monthly spend</div>
        <ResponsiveContainer width="100%" height={160}><AreaChart data={areaData}><defs><linearGradient id="yg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.yellow} stopOpacity={0.15}/><stop offset="95%" stopColor={C.yellow} stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/><XAxis dataKey="month" tick={{fontSize:9,fill:C.t3}} axisLine={false} tickLine={false}/><YAxis tickFormatter={fmtK} tick={{fontSize:10,fill:C.t3}} axisLine={false} tickLine={false} width={40}/><Tooltip content={<CTip/>}/><Area type="monotone" dataKey="total" name="Total" stroke={C.yellow} strokeWidth={2.5} fill="url(#yg)" dot={{r:3,fill:C.yellow,strokeWidth:0}}/></AreaChart></ResponsiveContainer>
      </div>}
      <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,padding:"18px 20px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><div style={{fontWeight:800,color:C.dark,fontSize:14}}>Recent transactions</div>{!isHI&&<a href={api.exportCsv(hub.hub_code)} target="_blank" rel="noreferrer" style={{padding:"6px 14px",background:C.yellow,borderRadius:7,color:C.dark,fontSize:12,fontWeight:800,textDecoration:"none"}}>↓ Export CSV</a>}</div>
        {exp.length===0?<div style={{textAlign:"center",padding:24,color:C.t3,fontSize:13}}>No transactions yet — run ETL sync</div>:
        <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead><tr style={{background:C.dark}}>{["Date","Category","Amount","Status"].map(h=><th key={h} style={{padding:"9px 12px",textAlign:"left",fontSize:11,fontWeight:700,color:C.yellow,textTransform:"uppercase"}}>{h}</th>)}</tr></thead><tbody>{exp.map((e,i)=><tr key={i} style={{borderBottom:`1px solid ${C.border}`}}><td style={{padding:"9px 12px",color:C.t3}}>{e.date}</td><td style={{padding:"9px 12px"}}><span style={{background:`${C.yellow}18`,color:"#D4A800",padding:"2px 8px",borderRadius:10,fontSize:11,fontWeight:700}}>{e.category}</span></td><td style={{padding:"9px 12px",fontWeight:800,color:C.dark}}>{fmt(e.amount)}</td><td style={{padding:"9px 12px",color:C.t2}}>{e.status}</td></tr>)}</tbody></table></div>}
      </div>
    </div>
  );
}

/* ── ETL ────────────────────────────────────────────────────────────────── */
function Etl(){
  const [logs,setLogs]=useState([]);const [busy,setBusy]=useState(false);const [msg,setMsg]=useState("");
  useEffect(()=>{api.getEtlLogs().then(setLogs).catch(console.error);},[]);
  const run=async()=>{setBusy(true);setMsg("");try{await api.triggerEtl();setMsg("✅ ETL started! Check logs below.");setTimeout(()=>api.getEtlLogs().then(setLogs),4000);}catch(e){setMsg("❌ "+e.message);}finally{setBusy(false);};};
  return(
    <div style={{padding:"24px 28px",background:C.bg}}>
      <h1 style={{fontSize:22,fontWeight:800,color:C.dark,marginBottom:16}}>ETL Data Sync</h1>
      <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,padding:"18px 20px",marginBottom:14}}>
        <div style={{fontWeight:800,color:C.dark,fontSize:14,marginBottom:8}}>Manual Sync</div>
        <p style={{color:C.t3,fontSize:13,marginBottom:14}}>Syncs your Google Drive Excel into the database. Auto-runs at 2AM IST.</p>
        <button onClick={run} disabled={busy} style={{padding:"10px 22px",background:C.yellow,border:"none",borderRadius:8,color:C.dark,fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"'Poppins',sans-serif",opacity:busy?.7:1}}>{busy?"Running...":"▶ Trigger ETL"}</button>
        {msg&&<div style={{marginTop:12,padding:"10px 12px",background:msg.startsWith("✅")?C.greenBg:C.redBg,borderRadius:8,fontSize:13,color:msg.startsWith("✅")?C.green:C.red,fontWeight:500}}>{msg}</div>}
        <div style={{marginTop:12,padding:"10px 12px",background:"#FFF8E1",border:"1px solid #FFE082",borderRadius:8,fontSize:12,color:"#92400E"}}>⚠️ Requires <code>GOOGLE_SERVICE_ACCOUNT_JSON</code> and <code>GOOGLE_DRIVE_FILE_ID</code> set in Render env vars.</div>
      </div>
      <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,padding:"18px 20px"}}>
        <div style={{fontWeight:800,color:C.dark,fontSize:14,marginBottom:14}}>Run History</div>
        {logs.length===0?<div style={{textAlign:"center",padding:24,color:C.t3,fontSize:13}}>No ETL runs yet</div>:
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead><tr style={{background:C.bg}}>{["Started","Status","Rows","Triggered By"].map(h=><th key={h} style={{padding:"8px 12px",textAlign:"left",fontSize:11,fontWeight:700,color:C.t3,textTransform:"uppercase"}}>{h}</th>)}</tr></thead><tbody>{logs.map((l,i)=><tr key={i} style={{borderBottom:`1px solid ${C.border}`}}><td style={{padding:"9px 12px",color:C.t3}}>{l.started_at?.slice(0,19)}</td><td style={{padding:"9px 12px"}}><Chip label={l.status} color={l.status==="success"?"green":l.status==="failed"?"red":"amber"}/></td><td style={{padding:"9px 12px",color:C.t2}}>{l.rows_processed?.toLocaleString()||0}</td><td style={{padding:"9px 12px",color:C.t2}}>{l.triggered_by}</td></tr>)}</tbody></table>}
      </div>
    </div>
  );
}

/* ── ROOT ───────────────────────────────────────────────────────────────── */
export default function App(){
  const [user,setUser]=useState(()=>getStoredUser());
  const [screen,setScreen]=useState("dashboard");
  const [hub,setHub]=useState(null);
  const login=u=>{setUser(u);setScreen(u.role==="hi"?"myhub":"dashboard");};
  const logout=()=>{clearToken();setUser(null);setScreen("dashboard");setHub(null);};
  const select=code=>{setHub(code);setScreen("hub-detail");};
  const nav=s=>{setScreen(s);if(s!=="hub-detail")setHub(null);};
  if(!user)return <Login onLogin={login}/>;
  if(user.role==="hi")return <div style={{fontFamily:"'Poppins',sans-serif"}}><style>{FONT}</style><Nav user={user} screen="myhub" onNav={()=>{}} onLogout={logout}/><HubDetail code={user.hub_id} isHI={true} onBack={null}/></div>;
  return(
    <div style={{fontFamily:"'Poppins',sans-serif"}}>
      <style>{FONT}</style>
      <Nav user={user} screen={screen==="hub-detail"?"search":screen} onNav={nav} onLogout={logout}/>
      {screen==="dashboard"&&<Dashboard onSelect={select}/>}
      {screen==="search"&&<HubSearch onSelect={select}/>}
      {screen==="audit"&&<Audit onSelect={select}/>}
      {screen==="etl"&&<Etl/>}
      {screen==="hub-detail"&&hub&&<HubDetail code={hub} isHI={false} onBack={()=>nav("search")}/>}
    </div>
  );
}
