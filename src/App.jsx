import { useState, useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area } from "recharts";

/* ─── SHADOWFAX EXACT BRAND TOKENS ─────────────────────────────────────
   Copied directly from shadowfax.in:
   - Yellow  : #F5C518  (headline + CTA)
   - Dark bg : #1A1A1A  (hero/sidebar)
   - White   : #FFFFFF
   - Nav bg  : #FFFFFF with shadow
   - Body txt: #333333
   - Green   : #1DB87E  (logo accent / success)
   - Font    : Poppins (matches site closely)
──────────────────────────────────────────────────────────────────────── */
const FONT = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Poppins',sans-serif;background:#F4F5F7;}
::-webkit-scrollbar{width:5px;}
::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:10px;}
@keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
@keyframes countUp{from{opacity:0;}to{opacity:1;}}
.fu{animation:fadeUp .35s ease both;}
.fu2{animation:fadeUp .35s .08s ease both;}
.fu3{animation:fadeUp .35s .16s ease both;}
`;

const C = {
  yellow   : "#F5C518",
  yellowDk : "#D4A800",
  yellowBg : "#FFFBEA",
  dark     : "#1A1A1A",
  darkMid  : "#2A2A2A",
  darkCard : "#222222",
  white    : "#FFFFFF",
  bg       : "#F4F5F7",
  card     : "#FFFFFF",
  border   : "#E8EAED",
  t1       : "#111111",
  t2       : "#555555",
  t3       : "#999999",
  green    : "#1DB87E",
  greenBg  : "#E8FBF3",
  red      : "#E53935",
  redBg    : "#FEF2F2",
  amber    : "#F59E0B",
  amberBg  : "#FFFBEB",
  blue     : "#1565C0",
  blueBg   : "#E3F2FD",
};

const CATS = [
  { key:"Housekeeping",          color:"#F5C518", icon:"🧹" },
  { key:"Tea / Coffee / Water",  color:"#1DB87E", icon:"☕" },
  { key:"Printing & Stationery", color:"#2196F3", icon:"🖨️" },
  { key:"Repair & Maintenance",  color:"#9C27B0", icon:"🔧" },
  { key:"Electricity",           color:"#FF9800", icon:"⚡" },
  { key:"Internet & Mobile",     color:"#00BCD4", icon:"📶" },
  { key:"Rent",                  color:"#E53935", icon:"🏠" },
];

const STATES = ["Delhi","Haryana","Maharashtra","Karnataka","West Bengal","Gujarat","Telangana","Tamil Nadu","Uttar Pradesh","Kerala"];
const CITIES = {
  "Delhi":["New Delhi North","New Delhi South","Dwarka","Rohini","Shahdara"],
  "Haryana":["Gurugram","Faridabad","Ambala","Panipat"],
  "Maharashtra":["Mumbai Andheri","Mumbai Thane","Pune Kothrud","Nagpur"],
  "Karnataka":["Bangalore Whitefield","Bangalore HSR","Mysore","Hubli"],
  "West Bengal":["Kolkata Dankuni","Kolkata Saltlake","Howrah","Siliguri"],
  "Gujarat":["Ahmedabad CTM","Ahmedabad Bopal","Surat Adajan","Gandhidham"],
  "Telangana":["Hyderabad Miyapur","Hyderabad Kukatpally","Secunderabad"],
  "Tamil Nadu":["Chennai Velachery","Chennai Ambattur","Coimbatore","Madurai"],
  "Uttar Pradesh":["Lucknow Aliganj","Kanpur Kakadeo","Agra Dayalbagh","Noida Sec62","Firozabad"],
  "Kerala":["Kozhikode Puthiyara","Kochi Kalamassery","Thiruvananthapuram"],
};
const HUB_IDS = ["DL_RHN_001","DL_DWK_002","DL_SHA_003","DL_LPT_004","GGN_S56_005","GGN_MNS_006","FBD_S17_007","PNP_MDL_008","MUM_ANW_009","MUM_THN_010","MUM_NAV_011","PNE_KTH_012","PNE_HDP_013","BLR_WFD_014","BLR_HSR_015","BLR_KOR_016","MYS_VJY_017","HYD_MYP_018","HYD_KKP_019","HYD_LBN_020","SEC_BWN_021","CCU_DNK_022","CCU_SLT_023","HWH_SHB_024","SLG_NJP_025","AMD_CTM_026","AMD_BPL_027","SRT_ADJ_028","GMB_GDH_029","GND_CNR_030","CHN_VLY_031","CHN_AMB_032","CBE_GNP_033","MDU_ANN_034","LKO_ALG_035","KNP_KKD_036","AGR_DYL_037","NOI_S62_038","FZB_SAT_039","CLT_PTH_040","KCH_KLM_041","TVM_VZH_042"];
const MANAGERS = ["Rajesh Kumar","Priya Singh","Amit Sharma","Deepa Nair","Sanjay Patel","Meena Iyer","Vikram Rao","Sunita Devi","Ravi Teja","Kavitha Reddy"];
const TIERS = ["Metro-1","Tier-1","Tier-3","Special Zone"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const BASE = { "Housekeeping":3500,"Tea / Coffee / Water":1800,"Printing & Stationery":900,"Repair & Maintenance":4500,"Electricity":6500,"Internet & Mobile":1400,"Rent":16000 };

function srand(seed) { let s=seed; return ()=>{ s=(s*16807)%2147483647; return (s-1)/2147483646; }; }
const fmt  = n => "₹"+Number(Math.round(n)).toLocaleString("en-IN");
const fmtK = n => n>=100000?"₹"+(n/100000).toFixed(1)+"L":n>=1000?"₹"+(n/1000).toFixed(0)+"K":"₹"+Math.round(n);
const pct  = (a,b) => b===0?0:Math.round(((a-b)/b)*100);

function makeHubs() {
  const out=[]; let idx=0;
  for(const [state,cities] of Object.entries(CITIES)){
    for(const city of cities){
      if(idx>=HUB_IDS.length) break;
      const r=srand(idx*179+13);
      const monthly=MONTHS.map(mo=>{ const row={month:mo}; let tot=0; CATS.forEach(c=>{ const v=Math.round(BASE[c.key]*(0.6+r()*1.0)); row[c.key]=v; tot+=v; }); row.total=tot; return row; });
      const ytd={}; CATS.forEach(c=>{ ytd[c.key]=monthly.slice(0,7).reduce((s,m)=>s+m[c.key],0); });
      out.push({ id:HUB_IDS[idx], city, state, tier:TIERS[Math.floor(r()*TIERS.length)], manager:MANAGERS[Math.floor(r()*MANAGERS.length)], sqft:Math.round(900+r()*3600), status:r()>0.1?"Active":"Under Review", monthly, ytd, totalYTD:Object.values(ytd).reduce((a,b)=>a+b,0) });
      idx++;
    }
  }
  return out;
}
const ALL_HUBS = makeHubs();

const ACCOUNTS = [
  { id:1, email:"admin@shadowfax.in",   pass:"admin123", role:"admin", name:"Priya Sharma",  dept:"Business Analytics" },
  { id:2, email:"finance@shadowfax.in", pass:"fin123",   role:"admin", name:"Ritu Agarwal",  dept:"Finance Controller" },
  { id:3, email:"ops@shadowfax.in",     pass:"ops123",   role:"admin", name:"Arjun Menon",   dept:"Regional Operations" },
  { id:4, email:"hi@shadowfax.in",      pass:"hi123",    role:"hi",    name:"Deepa Nair",    dept:"Hub Incharge", hubId:"CLT_PTH_040" },
  { id:5, email:"hi2@shadowfax.in",     pass:"hi234",    role:"hi",    name:"Sanjay Patel",  dept:"Hub Incharge", hubId:"BLR_HSR_015" },
];

/* ── Logo SVG (Shadowfax style arrow mark) ── */
const SFLogo = ({ size=28 }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
    <path d="M4 22L11 8L18 15L23 6" stroke={C.yellow} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="23" cy="6" r="2.5" fill={C.yellow}/>
  </svg>
);

/* ── Tooltip ── */
const CTip = ({active,payload,label}) => {
  if(!active||!payload?.length) return null;
  return (
    <div style={{background:C.dark,border:`1px solid #333`,borderRadius:10,padding:"10px 14px",boxShadow:"0 8px 28px rgba(0,0,0,0.35)",minWidth:160}}>
      <p style={{fontSize:12,fontWeight:700,color:C.yellow,marginBottom:6}}>{label}</p>
      {payload.map((p,i)=>(
        <div key={i} style={{display:"flex",justifyContent:"space-between",gap:16,fontSize:12,color:"#aaa",marginTop:3}}>
          <span style={{display:"flex",alignItems:"center",gap:5}}><span style={{width:7,height:7,borderRadius:"50%",background:p.color,flexShrink:0}}/>{p.name}</span>
          <span style={{fontWeight:700,color:C.white}}>{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

/* ── Status chip ── */
const Chip = ({label, color="yellow"}) => {
  const m={
    yellow:[C.yellowBg, C.yellowDk],
    green :[C.greenBg,  C.green],
    red   :[C.redBg,    C.red],
    amber :[C.amberBg,  C.amber],
    dark  :["#2A2A2A",  C.white],
    gray  :["#F1F3F5",  C.t2],
    blue  :[C.blueBg,   C.blue],
  };
  const [bg,tc]=m[color]||m.gray;
  return <span style={{display:"inline-flex",alignItems:"center",padding:"3px 10px",borderRadius:20,background:bg,color:tc,fontSize:11,fontWeight:700,whiteSpace:"nowrap",letterSpacing:"0.02em"}}>{label}</span>;
};

/* ══════════════════════════════════════════════════════
   LOGIN  — dark left panel + white right, yellow CTA
══════════════════════════════════════════════════════ */
function Login({onLogin}) {
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [err,setErr]=useState("");
  const [busy,setBusy]=useState(false);

  const go=()=>{
    setErr("");
    const a=ACCOUNTS.find(x=>x.email===email.trim()&&x.pass===pass);
    if(!a){setErr("Invalid credentials. Click a demo account to fill.");return;}
    setBusy(true);
    setTimeout(()=>onLogin(a),600);
  };

  return (
    <div style={{minHeight:"100vh",display:"flex",fontFamily:"'Poppins',sans-serif"}}>
      <style>{FONT}</style>

      {/* ── LEFT dark panel (mirrors Shadowfax hero) ── */}
      <div style={{width:"44%",background:C.dark,display:"flex",flexDirection:"column",justifyContent:"space-between",padding:"40px 48px",position:"relative",overflow:"hidden"}}>
        {/* subtle yellow glow bottom-left */}
        <div style={{position:"absolute",bottom:-80,left:-60,width:320,height:320,borderRadius:"50%",background:"rgba(245,197,24,0.08)",pointerEvents:"none"}}/>

        {/* Logo */}
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <SFLogo size={30}/>
          <div>
            <div style={{color:C.white,fontWeight:800,fontSize:17,letterSpacing:"-0.01em",lineHeight:1}}>SHADOWFAX</div>
            <div style={{color:C.yellow,fontSize:9,fontWeight:600,letterSpacing:"0.12em"}}>Think ahead!</div>
          </div>
        </div>

        {/* Hero copy — exact Shadowfax headline style: bold, yellow */}
        <div>
          <div style={{fontSize:34,fontWeight:800,color:C.yellow,lineHeight:1.18,letterSpacing:"-0.02em",marginBottom:18}}>
            Hub Intelligence<br/>Portal
          </div>
          <p style={{color:"rgba(255,255,255,0.55)",fontSize:13,lineHeight:1.75,maxWidth:300,marginBottom:28}}>
            Track every facility expense across 4,000+ Shadowfax hubs — powered by your Happy reimbursement data.
          </p>
          {/* Stat pills */}
          <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
            {[["4,000+","Active Hubs"],["7","Expense Categories"],["Real-time","Data Sync"]].map(([v,l])=>(
              <div key={l} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"10px 14px"}}>
                <div style={{color:C.yellow,fontSize:16,fontWeight:800}}>{v}</div>
                <div style={{color:"rgba(255,255,255,0.4)",fontSize:10,marginTop:1}}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{fontSize:11,color:"rgba(255,255,255,0.2)"}}>© 2025 Shadowfax Technologies Pvt. Ltd.</div>
      </div>

      {/* ── RIGHT white panel ── */}
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",background:C.white,padding:48}}>
        <div style={{width:"100%",maxWidth:390}}>
          {/* Mini logo repeat on white */}
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:28}}>
            <SFLogo size={22}/>
            <span style={{fontWeight:800,fontSize:14,color:C.dark,letterSpacing:"-0.01em"}}>Hub Portal</span>
          </div>

          <h2 style={{fontSize:26,fontWeight:800,color:C.dark,marginBottom:5,letterSpacing:"-0.02em"}}>Sign in to continue</h2>
          <p style={{color:C.t3,fontSize:13,marginBottom:28}}>Enter your Shadowfax credentials below</p>

          {/* Fields */}
          {[["Email","email",email,setEmail,"text","you@shadowfax.in"],["Password","pass",pass,setPass,"password","••••••••"]].map(([lbl,id,val,set,type,ph])=>(
            <div key={id} style={{marginBottom:15}}>
              <label style={{display:"block",fontSize:11,fontWeight:700,color:C.t2,marginBottom:6,letterSpacing:"0.05em"}}>{lbl.toUpperCase()}</label>
              <input value={val} type={type} placeholder={ph} onChange={e=>set(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()}
                style={{width:"100%",padding:"12px 14px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:14,fontFamily:"'Poppins',sans-serif",outline:"none",color:C.dark,background:C.white,transition:"border .15s"}}
                onFocus={e=>e.target.style.borderColor=C.yellow} onBlur={e=>e.target.style.borderColor=C.border}/>
            </div>
          ))}

          {err&&<div style={{background:C.redBg,border:"1px solid #FECACA",borderRadius:8,padding:"9px 12px",fontSize:12,color:C.red,marginBottom:14,fontWeight:500}}>{err}</div>}

          {/* CTA — exact Shadowfax yellow button */}
          <button onClick={go} disabled={busy} style={{width:"100%",padding:"13px",background:C.yellow,border:"none",borderRadius:8,color:C.dark,fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:"'Poppins',sans-serif",letterSpacing:"0.01em",transition:"all .15s",opacity:busy?.75:1}}
            onMouseEnter={e=>e.currentTarget.style.background=C.yellowDk}
            onMouseLeave={e=>e.currentTarget.style.background=C.yellow}>
            {busy?"Signing in…":"Sign In →"}
          </button>

          {/* Demo table */}
          <div style={{marginTop:24,border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden"}}>
            <div style={{background:"#F9FAFB",padding:"9px 14px",borderBottom:`1px solid ${C.border}`}}>
              <span style={{fontSize:11,fontWeight:700,color:C.t3,letterSpacing:"0.05em",textTransform:"uppercase"}}>Demo accounts — click to fill</span>
            </div>
            {ACCOUNTS.map((a,i)=>(
              <div key={a.id} onClick={()=>{setEmail(a.email);setPass(a.pass);}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 14px",borderBottom:i<ACCOUNTS.length-1?`1px solid ${C.border}`:"none",cursor:"pointer",transition:"background .1s"}}
                onMouseEnter={e=>e.currentTarget.style.background=C.yellowBg} onMouseLeave={e=>e.currentTarget.style.background=C.white}>
                <div>
                  <div style={{fontSize:12,fontWeight:700,color:C.dark}}>{a.email}</div>
                  <div style={{fontSize:10,color:C.t3}}>{a.dept}</div>
                </div>
                <Chip label={a.role==="admin"?"Admin":"HI"} color={a.role==="admin"?"dark":"yellow"}/>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   TOP NAV BAR  — white bar with shadow, yellow CTA
   (mirrors shadowfax.in navbar exactly)
══════════════════════════════════════════════════════ */
function TopNav({user, screen, onNav, onLogout}) {
  const adminTabs=[{id:"dashboard",label:"Dashboard"},{id:"search",label:"Hub Explorer"},{id:"audit",label:"Audit Flags"}];
  const hiTabs=[{id:"myhub",label:"My Hub"}];
  const tabs = user.role==="admin" ? adminTabs : hiTabs;
  const active = screen==="hub-detail"?"search":screen;

  return (
    <div style={{position:"sticky",top:0,zIndex:100,background:C.white,borderBottom:`1px solid ${C.border}`,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 28px",height:60}}>
        {/* Logo — exact Shadowfax nav style */}
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <SFLogo size={24}/>
          <div>
            <div style={{fontWeight:900,fontSize:14,color:C.dark,letterSpacing:"0.02em",lineHeight:1}}>SHADOWFAX</div>
            <div style={{fontSize:8,color:C.yellow,fontWeight:700,letterSpacing:"0.08em"}}>Hub Portal</div>
          </div>
        </div>

        {/* Nav tabs */}
        <nav style={{display:"flex",gap:4}}>
          {tabs.map(t=>{
            const on=active===t.id;
            return (
              <button key={t.id} onClick={()=>onNav(t.id)} style={{padding:"6px 16px",border:"none",background:"transparent",cursor:"pointer",fontSize:13,fontWeight:on?700:500,color:on?C.dark:C.t3,fontFamily:"'Poppins',sans-serif",position:"relative",transition:"color .15s"}}>
                {t.label}
                {on&&<div style={{position:"absolute",bottom:-1,left:16,right:16,height:2.5,background:C.yellow,borderRadius:"2px 2px 0 0"}}/>}
              </button>
            );
          })}
        </nav>

        {/* Right: user + logout — yellow CTA style */}
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:12,fontWeight:700,color:C.dark}}>{user.name}</div>
            <div style={{fontSize:10,color:C.t3}}>{user.dept}</div>
          </div>
          <div style={{width:34,height:34,borderRadius:"50%",background:C.yellow,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,color:C.dark,flexShrink:0}}>
            {user.name.charAt(0)}
          </div>
          <button onClick={onLogout} style={{padding:"7px 16px",background:C.yellow,border:"none",borderRadius:6,color:C.dark,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Poppins',sans-serif",transition:"all .15s"}}
            onMouseEnter={e=>e.currentTarget.style.background=C.yellowDk} onMouseLeave={e=>e.currentTarget.style.background=C.yellow}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   KPI CARD  — dark card with yellow value (Shadowfax dark)
══════════════════════════════════════════════════════ */
const KCard = ({label,value,sub,accent,icon,dark:isDark}) => (
  <div className="fu" style={{background:isDark?C.dark:C.white,border:`1px solid ${isDark?"#333":C.border}`,borderRadius:12,padding:"18px 20px",position:"relative",overflow:"hidden"}}>
    <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:accent||C.yellow,borderRadius:"12px 12px 0 0"}}/>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
      <span style={{fontSize:11,fontWeight:700,color:isDark?"rgba(255,255,255,0.4)":C.t3,letterSpacing:"0.06em",textTransform:"uppercase"}}>{label}</span>
      {icon&&<span style={{fontSize:18}}>{icon}</span>}
    </div>
    <div style={{fontSize:24,fontWeight:800,color:isDark?C.yellow:C.dark,letterSpacing:"-0.02em"}}>{value}</div>
    {sub&&<div style={{fontSize:11,color:isDark?"rgba(255,255,255,0.35)":C.t3,marginTop:4}}>{sub}</div>}
  </div>
);

/* ══════════════════════════════════════════════════════
   DASHBOARD
══════════════════════════════════════════════════════ */
function Dashboard({onSelect}) {
  const hubs=ALL_HUBS, totalYTD=hubs.reduce((s,h)=>s+h.totalYTD,0);
  const flagged=hubs.filter(h=>h.totalYTD>200000).length;
  const top=[...hubs].sort((a,b)=>b.totalYTD-a.totalYTD)[0];
  const top10=[...hubs].sort((a,b)=>b.totalYTD-a.totalYTD).slice(0,10);
  const pie=CATS.map(c=>({name:c.key,value:hubs.reduce((s,h)=>s+(h.ytd[c.key]||0),0),color:c.color}));
  const byState={}; hubs.forEach(h=>{byState[h.state]=(byState[h.state]||0)+h.totalYTD;});
  const stBar=Object.entries(byState).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([s,v])=>({state:s.length>14?s.slice(0,13)+"…":s,value:v}));

  return (
    <div style={{padding:"26px 28px",fontFamily:"'Poppins',sans-serif",background:C.bg,minHeight:"100%"}}>
      {/* Page header */}
      <div style={{marginBottom:22}}>
        <h1 style={{fontSize:22,fontWeight:800,color:C.dark,letterSpacing:"-0.02em"}}>Network Overview</h1>
        <p style={{color:C.t3,fontSize:13,marginTop:3}}>All hubs · Jan–Jul 2025 · {hubs.length} active</p>
      </div>

      {/* KPI row — first card dark/yellow, rest white */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:13,marginBottom:22}}>
        <KCard label="Total Hubs" value={hubs.length} sub="Across India" icon="🏢" accent={C.yellow} dark/>
        <KCard label="YTD Spend" value={fmtK(totalYTD)} sub="Jan–Jul 2025" icon="💰" accent={C.yellow}/>
        <KCard label="Flagged Hubs" value={flagged} sub="Above ₹2L threshold" icon="⚠️" accent={C.red}/>
        <KCard label="Highest Spend" value={fmtK(top.totalYTD)} sub={top.id} icon="📍" accent="#9C27B0"/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1.1fr 0.9fr",gap:14,marginBottom:14}}>
        {/* State bar */}
        <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,padding:"20px 22px"}}>
          <div style={{fontWeight:800,color:C.dark,fontSize:14,marginBottom:2}}>Spend by state</div>
          <div style={{fontSize:11,color:C.t3,marginBottom:16}}>YTD total per state</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stBar} layout="vertical" margin={{left:0,right:16}}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={C.border}/>
              <XAxis type="number" tickFormatter={fmtK} tick={{fontSize:10,fill:C.t3,fontFamily:"Poppins"}} axisLine={false} tickLine={false}/>
              <YAxis type="category" dataKey="state" tick={{fontSize:11,fill:C.t2,fontFamily:"Poppins"}} axisLine={false} tickLine={false} width={115}/>
              <Tooltip content={<CTip/>}/>
              <Bar dataKey="value" name="YTD Spend" fill={C.yellow} radius={[0,5,5,0]} barSize={13}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Pie */}
        <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,padding:"20px 22px"}}>
          <div style={{fontWeight:800,color:C.dark,fontSize:14,marginBottom:2}}>Expense category mix</div>
          <div style={{fontSize:11,color:C.t3,marginBottom:16}}>National split — all hubs</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pie} cx="50%" cy="46%" innerRadius={52} outerRadius={84} dataKey="value" paddingAngle={2}>
                {pie.map((e,i)=><Cell key={i} fill={e.color} strokeWidth={0}/>)}
              </Pie>
              <Tooltip formatter={v=>fmt(v)} contentStyle={{borderRadius:8,fontSize:11,border:`1px solid ${C.border}`,fontFamily:"Poppins"}}/>
              <Legend iconType="circle" iconSize={7} wrapperStyle={{fontSize:10,fontFamily:"Poppins"}}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top 10 — dark cards with yellow rank */}
      <div style={{background:C.dark,border:`1px solid #333`,borderRadius:12,padding:"20px 22px"}}>
        <div style={{fontWeight:800,color:C.yellow,fontSize:14,marginBottom:16}}>Top 10 hubs by spend</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10}}>
          {top10.map((h,i)=>(
            <div key={h.id} onClick={()=>onSelect(h)} style={{padding:"12px 13px",border:`1px solid ${i<3?"rgba(245,197,24,0.4)":"rgba(255,255,255,0.1)"}`,borderRadius:10,cursor:"pointer",background:i<3?"rgba(245,197,24,0.08)":"rgba(255,255,255,0.03)",transition:"all .15s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(245,197,24,0.6)";e.currentTarget.style.transform="translateY(-2px)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=i<3?"rgba(245,197,24,0.4)":"rgba(255,255,255,0.1)";e.currentTarget.style.transform="none";}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                <span style={{width:20,height:20,borderRadius:5,background:i<3?C.yellow:"rgba(255,255,255,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:i<3?C.dark:"#888",flexShrink:0}}>{i+1}</span>
                <span style={{fontSize:10,fontWeight:700,color:C.white,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{h.id}</span>
              </div>
              <div style={{fontSize:16,fontWeight:800,color:C.yellow}}>{fmtK(h.totalYTD)}</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",marginTop:2}}>{h.city}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   HUB SEARCH
══════════════════════════════════════════════════════ */
function HubSearch({onSelect}) {
  const [q,setQ]=useState(""); const [st,setSt]=useState(""); const [ci,setCi]=useState(""); const [ti,setTi]=useState(""); const [sort,setSort]=useState("spend");
  const cities=useMemo(()=>st?CITIES[st]||[]:[], [st]);
  const results=useMemo(()=>{
    let r=ALL_HUBS;
    if(q) r=r.filter(h=>h.id.toLowerCase().includes(q.toLowerCase())||h.city.toLowerCase().includes(q.toLowerCase())||h.state.toLowerCase().includes(q.toLowerCase()));
    if(st) r=r.filter(h=>h.state===st); if(ci) r=r.filter(h=>h.city===ci); if(ti) r=r.filter(h=>h.tier===ti);
    return [...r].sort((a,b)=>sort==="spend"?b.totalYTD-a.totalYTD:a.id.localeCompare(b.id));
  },[q,st,ci,ti,sort]);

  return (
    <div style={{padding:"26px 28px",background:C.bg,minHeight:"100%"}}>
      <h1 style={{fontSize:22,fontWeight:800,color:C.dark,letterSpacing:"-0.02em",marginBottom:3}}>Hub Explorer</h1>
      <p style={{color:C.t3,fontSize:13,marginBottom:20}}>Search and filter all {ALL_HUBS.length} hubs</p>

      {/* Filter bar */}
      <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,padding:"16px 18px",display:"flex",gap:12,flexWrap:"wrap",alignItems:"flex-end",marginBottom:16}}>
        <div style={{flex:"1 1 180px"}}>
          <div style={{fontSize:11,fontWeight:700,color:C.t3,letterSpacing:"0.05em",marginBottom:5,textTransform:"uppercase"}}>Search</div>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Hub code, city or state…"
            style={{width:"100%",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13,fontFamily:"'Poppins',sans-serif",outline:"none",background:C.bg,color:C.dark,transition:"border .15s"}}
            onFocus={e=>e.target.style.borderColor=C.yellow} onBlur={e=>e.target.style.borderColor=C.border}/>
        </div>
        {[["State",st,v=>{setSt(v);setCi("");},STATES],["City",ci,setCi,cities],["Tier",ti,setTi,TIERS]].map(([lbl,val,fn,opts])=>(
          <div key={lbl} style={{flex:"0 0 120px"}}>
            <div style={{fontSize:11,fontWeight:700,color:C.t3,letterSpacing:"0.05em",marginBottom:5,textTransform:"uppercase"}}>{lbl}</div>
            <select value={val} onChange={e=>fn(e.target.value)} style={{width:"100%",padding:"9px 10px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13,fontFamily:"'Poppins',sans-serif",background:C.white,color:C.dark,outline:"none"}}>
              <option value="">All</option>{opts.map(o=><option key={o}>{o}</option>)}
            </select>
          </div>
        ))}
        <div style={{flex:"0 0 130px"}}>
          <div style={{fontSize:11,fontWeight:700,color:C.t3,letterSpacing:"0.05em",marginBottom:5,textTransform:"uppercase"}}>Sort</div>
          <select value={sort} onChange={e=>setSort(e.target.value)} style={{width:"100%",padding:"9px 10px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13,fontFamily:"'Poppins',sans-serif",background:C.white,color:C.dark,outline:"none"}}>
            <option value="spend">Top spend</option><option value="name">Code A–Z</option>
          </select>
        </div>
        {(q||st||ci||ti)&&<button onClick={()=>{setQ("");setSt("");setCi("");setTi("");}} style={{padding:"9px 14px",background:C.redBg,border:"1px solid #FECACA",borderRadius:8,color:C.red,fontSize:12,cursor:"pointer",fontWeight:700,fontFamily:"'Poppins',sans-serif"}}>✕ Clear</button>}
      </div>

      <div style={{fontSize:12,color:C.t3,fontWeight:600,marginBottom:14}}>{results.length} of {ALL_HUBS.length} hubs</div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(265px,1fr))",gap:12}}>
        {results.map(h=>{
          const over=h.totalYTD>200000;
          const spark=h.monthly.slice(0,7), maxT=Math.max(...spark.map(m=>m.total));
          return (
            <div key={h.id} onClick={()=>onSelect(h)}
              style={{background:C.white,border:`1px solid ${over?"#FECACA":C.border}`,borderRadius:12,padding:16,cursor:"pointer",transition:"all .15s",borderLeft:`3.5px solid ${over?C.red:C.yellow}`}}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 6px 22px rgba(0,0,0,0.09)";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <div><div style={{fontWeight:800,fontSize:13,color:C.dark}}>{h.id}</div><div style={{fontSize:11,color:C.t3,marginTop:2}}>{h.city} · {h.state}</div></div>
                <div style={{display:"flex",flexDirection:"column",gap:3,alignItems:"flex-end"}}>{over&&<Chip label="High Spend" color="red"/>}<Chip label={h.tier} color="dark"/></div>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
                <div><div style={{fontSize:20,fontWeight:800,color:over?C.red:C.dark}}>{fmtK(h.totalYTD)}</div><div style={{fontSize:10,color:C.t3}}>{h.manager}</div></div>
                <div style={{display:"flex",alignItems:"flex-end",gap:2}}>{spark.map((m,i)=><div key={i} style={{width:6,borderRadius:"3px 3px 0 0",height:Math.round((m.total/maxT)*26)+3,background:i===6?C.yellow:C.border}}/>)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   AUDIT FLAGS
══════════════════════════════════════════════════════ */
function AuditFlags({onSelect}) {
  const flagged=[...ALL_HUBS].filter(h=>h.totalYTD>200000).sort((a,b)=>b.totalYTD-a.totalYTD);
  return (
    <div style={{padding:"26px 28px",background:C.bg,minHeight:"100%"}}>
      <h1 style={{fontSize:22,fontWeight:800,color:C.dark,letterSpacing:"-0.02em",marginBottom:3}}>Audit & Anomaly Flags</h1>
      <p style={{color:C.t3,fontSize:13,marginBottom:20}}>{flagged.length} hubs above ₹2L YTD spend threshold</p>
      <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13,fontFamily:"'Poppins',sans-serif"}}>
          <thead>
            <tr style={{background:C.dark,borderBottom:`2px solid #333`}}>
              {["#","Hub Code","City","State","Tier","YTD Spend","Status",""].map((h,i)=>(
                <th key={i} style={{padding:"12px 16px",textAlign:"left",fontSize:11,fontWeight:700,color:C.yellow,textTransform:"uppercase",letterSpacing:"0.05em",whiteSpace:"nowrap"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {flagged.map((h,i)=>(
              <tr key={h.id} style={{borderBottom:`1px solid ${C.border}`,transition:"background .1s"}}
                onMouseEnter={e=>e.currentTarget.style.background=C.yellowBg} onMouseLeave={e=>e.currentTarget.style.background=C.white}>
                <td style={{padding:"12px 16px",color:C.t3,fontWeight:700}}>{i+1}</td>
                <td style={{padding:"12px 16px"}}><div style={{fontWeight:800,color:C.dark}}>{h.id}</div><div style={{fontSize:11,color:C.t3}}>{h.manager}</div></td>
                <td style={{padding:"12px 16px",color:C.t2}}>{h.city}</td>
                <td style={{padding:"12px 16px",color:C.t2}}>{h.state}</td>
                <td style={{padding:"12px 16px"}}><Chip label={h.tier} color="dark"/></td>
                <td style={{padding:"12px 16px",fontWeight:800,color:C.red,fontSize:14}}>{fmt(h.totalYTD)}</td>
                <td style={{padding:"12px 16px"}}><Chip label="Flagged" color="red"/></td>
                <td style={{padding:"12px 16px"}}>
                  <button onClick={()=>onSelect(h)} style={{padding:"6px 15px",background:C.yellow,border:"none",borderRadius:7,color:C.dark,fontSize:11,cursor:"pointer",fontWeight:800,fontFamily:"'Poppins',sans-serif",transition:"all .15s"}}
                    onMouseEnter={e=>e.currentTarget.style.background=C.yellowDk} onMouseLeave={e=>e.currentTarget.style.background=C.yellow}>
                    Review →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   HUB DETAIL
══════════════════════════════════════════════════════ */
function HubDetail({hub,isHI,onBack}) {
  const cur=hub.monthly[6], prev=hub.monthly[5];
  const pieData=CATS.map(c=>({name:c.key,value:hub.ytd[c.key],color:c.color}));
  const areaData=hub.monthly.map(m=>({month:m.month,total:m.total}));

  return (
    <div style={{padding:"26px 28px",background:C.bg,minHeight:"100%",fontFamily:"'Poppins',sans-serif"}}>
      {!isHI&&(
        <div style={{marginBottom:16,display:"flex",alignItems:"center",gap:8}}>
          <button onClick={onBack} style={{padding:"6px 14px",background:C.white,border:`1px solid ${C.border}`,borderRadius:8,fontSize:12,cursor:"pointer",color:C.t2,fontWeight:700,fontFamily:"'Poppins',sans-serif"}}>← Back</button>
          <span style={{color:C.t3,fontSize:13}}>Hub Explorer / <strong style={{color:C.dark}}>{hub.id}</strong></span>
        </div>
      )}

      {/* Identity banner — dark with yellow */}
      <div style={{background:C.dark,borderRadius:14,padding:"22px 26px",marginBottom:20,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-40,right:-40,width:200,height:200,borderRadius:"50%",background:"rgba(245,197,24,0.06)",pointerEvents:"none"}}/>
        <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:14}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
              <h2 style={{color:C.yellow,fontSize:20,fontWeight:800,letterSpacing:"-0.02em"}}>{hub.id}</h2>
              <Chip label={hub.status} color={hub.status==="Active"?"green":"amber"}/>
              {hub.totalYTD>200000&&<Chip label="High Spend" color="red"/>}
            </div>
            <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
              {[["City",hub.city],["State",hub.state],["Tier",hub.tier],["Manager",hub.manager],["Sq.Ft.",hub.sqft.toLocaleString()]].map(([k,v])=>(
                <div key={k}><div style={{color:"rgba(255,255,255,0.3)",fontSize:10,letterSpacing:"0.06em",textTransform:"uppercase"}}>{k}</div><div style={{color:"rgba(255,255,255,0.9)",fontSize:12,fontWeight:700,marginTop:2}}>{v}</div></div>
              ))}
            </div>
          </div>
          <div style={{display:"flex",gap:12}}>
            {[["Jul 2025",fmtK(cur.total),pct(cur.total,prev.total)],["YTD Total",fmtK(hub.totalYTD),null]].map(([lbl,val,chg])=>(
              <div key={lbl} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"13px 18px",textAlign:"right"}}>
                <div style={{color:"rgba(255,255,255,0.3)",fontSize:10,letterSpacing:"0.05em",textTransform:"uppercase",marginBottom:4}}>{lbl}</div>
                <div style={{color:C.yellow,fontSize:22,fontWeight:800}}>{val}</div>
                {chg!==null&&chg!==undefined&&<div style={{fontSize:11,fontWeight:700,marginTop:3,color:chg>0?"#FCA5A5":chg<0?"#6EE7B7":"rgba(255,255,255,0.35)"}}>{chg>0?`▲${chg}%`:chg<0?`▼${Math.abs(chg)}%`:"—"} vs Jun</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category KPI cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:11,marginBottom:18}}>
        {CATS.map(c=>{const cv=cur[c.key],pv=prev[c.key],ch=pct(cv,pv); return (
          <div key={c.key} style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,padding:"13px 15px",borderTop:`3px solid ${c.color}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
              <span style={{fontSize:18}}>{c.icon}</span>
              <span style={{fontSize:10,fontWeight:800,color:ch>15?C.red:ch<-5?C.green:C.t3,background:ch>15?C.redBg:ch<-5?C.greenBg:"#F4F5F7",padding:"2px 7px",borderRadius:12}}>{ch>0?`+${ch}`:ch}%</span>
            </div>
            <div style={{fontSize:10,color:C.t3,fontWeight:600,marginBottom:3,letterSpacing:"0.02em"}}>{c.key}</div>
            <div style={{fontSize:18,fontWeight:800,color:C.dark}}>{fmtK(cv)}</div>
            <div style={{fontSize:10,color:C.t3,marginTop:2}}>YTD {fmtK(hub.ytd[c.key])}</div>
            <div style={{marginTop:7,height:3,background:C.border,borderRadius:3}}><div style={{height:3,borderRadius:3,background:c.color,width:`${Math.min(100,Math.round(hub.ytd[c.key]/hub.totalYTD*100*CATS.length))}%`}}/></div>
          </div>
        );})}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1.4fr 1fr",gap:14,marginBottom:14}}>
        <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,padding:"20px 22px"}}>
          <div style={{fontWeight:800,color:C.dark,fontSize:14,marginBottom:2}}>Monthly spend trend</div>
          <div style={{fontSize:11,color:C.t3,marginBottom:14}}>Full year view</div>
          <ResponsiveContainer width="100%" height={175}>
            <AreaChart data={areaData} margin={{left:0,right:4}}>
              <defs><linearGradient id="yg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.yellow} stopOpacity={0.15}/><stop offset="95%" stopColor={C.yellow} stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
              <XAxis dataKey="month" tick={{fontSize:10,fill:C.t3,fontFamily:"Poppins"}} axisLine={false} tickLine={false}/>
              <YAxis tickFormatter={fmtK} tick={{fontSize:10,fill:C.t3,fontFamily:"Poppins"}} axisLine={false} tickLine={false} width={42}/>
              <Tooltip content={<CTip/>}/>
              <Area type="monotone" dataKey="total" name="Total" stroke={C.yellow} strokeWidth={2.5} fill="url(#yg)" dot={{r:3,fill:C.yellow,strokeWidth:0}}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,padding:"20px 22px"}}>
          <div style={{fontWeight:800,color:C.dark,fontSize:14,marginBottom:2}}>Expense mix</div>
          <div style={{fontSize:11,color:C.t3,marginBottom:14}}>YTD category split</div>
          <ResponsiveContainer width="100%" height={175}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="48%" innerRadius={44} outerRadius={70} dataKey="value" paddingAngle={2}>
                {pieData.map((e,i)=><Cell key={i} fill={e.color} strokeWidth={0}/>)}
              </Pie>
              <Tooltip formatter={v=>fmt(v)} contentStyle={{borderRadius:8,fontSize:11,border:`1px solid ${C.border}`,fontFamily:"Poppins"}}/>
              <Legend iconType="circle" iconSize={7} wrapperStyle={{fontSize:10,fontFamily:"Poppins"}}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,padding:"20px 22px",marginBottom:14}}>
        <div style={{fontWeight:800,color:C.dark,fontSize:14,marginBottom:2}}>Category breakdown by month</div>
        <div style={{fontSize:11,color:C.t3,marginBottom:14}}>Stacked view</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={hub.monthly} margin={{left:0,right:4}}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
            <XAxis dataKey="month" tick={{fontSize:10,fill:C.t3,fontFamily:"Poppins"}} axisLine={false} tickLine={false}/>
            <YAxis tickFormatter={fmtK} tick={{fontSize:10,fill:C.t3,fontFamily:"Poppins"}} axisLine={false} tickLine={false} width={42}/>
            <Tooltip content={<CTip/>}/>
            <Legend iconType="circle" iconSize={7} wrapperStyle={{fontSize:11,fontFamily:"Poppins"}}/>
            {CATS.map(c=><Bar key={c.key} dataKey={c.key} stackId="s" fill={c.color} barSize={22}/>)}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Transaction table */}
      <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,padding:"20px 22px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div><div style={{fontWeight:800,color:C.dark,fontSize:14}}>Expense transactions</div><div style={{fontSize:11,color:C.t3,marginTop:1}}>Jul 2025 · sample view</div></div>
          {!isHI&&<button style={{padding:"7px 16px",background:C.yellow,border:"none",borderRadius:7,color:C.dark,fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"'Poppins',sans-serif"}}>↓ Export CSV</button>}
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,fontFamily:"'Poppins',sans-serif"}}>
            <thead><tr style={{background:C.dark}}>{["Date","Category","Description","Amount","Status","Policy Violation"].map(h=><th key={h} style={{padding:"9px 14px",textAlign:"left",fontSize:11,fontWeight:700,color:C.yellow,textTransform:"uppercase",letterSpacing:"0.05em",whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
            <tbody>
              {CATS.flatMap((c,ci)=>[0,1,2].map(ri=>{
                const r=srand(ci*77+ri+hub.id.length*3);
                const amt=Math.round(hub.ytd[c.key]/7*(0.75+r()*0.6));
                const sts=["Paid","Verified","Submitted","Declined"]; const st=sts[Math.floor(r()*4)];
                const stC={Paid:C.green,Verified:C.blue,Submitted:C.amber,Declined:C.red}[st];
                const pv=r()<0.12;
                return <tr key={`${ci}-${ri}`} style={{borderBottom:`1px solid ${C.border}`,transition:"background .1s"}} onMouseEnter={e=>e.currentTarget.style.background=C.yellowBg} onMouseLeave={e=>e.currentTarget.style.background=C.white}>
                  <td style={{padding:"10px 14px",color:C.t3,whiteSpace:"nowrap"}}>0{ri+5} Jul 2025</td>
                  <td style={{padding:"10px 14px"}}><span style={{background:`${c.color}18`,color:c.color,padding:"3px 9px",borderRadius:12,fontSize:11,fontWeight:700}}>{c.key}</span></td>
                  <td style={{padding:"10px 14px",color:C.t2,maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{["Monthly charges","Vendor invoice","Utility bill","Maintenance work","Staff expenses","Service fee"][ri%6]}</td>
                  <td style={{padding:"10px 14px",fontWeight:800,color:C.dark}}>{fmt(amt)}</td>
                  <td style={{padding:"10px 14px"}}><span style={{background:`${stC}18`,color:stC,padding:"3px 9px",borderRadius:12,fontSize:11,fontWeight:700}}>{st}</span></td>
                  <td style={{padding:"10px 14px"}}><Chip label={pv?"Yes":"No"} color={pv?"red":"green"}/></td>
                </tr>;
              })).slice(0,14)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   ROOT APP
══════════════════════════════════════════════════════ */
export default function App() {
  const [user,setUser]=useState(null);
  const [screen,setScreen]=useState("dashboard");
  const [selHub,setSelHub]=useState(null);

  if(!user) return <Login onLogin={u=>{setUser(u);setScreen(u.role==="hi"?"myhub":"dashboard");}}/>;

  const hiHub = user.role==="hi" ? ALL_HUBS.find(h=>h.id===user.hubId)||ALL_HUBS[0] : null;
  const handleSelect=h=>{setSelHub(h);setScreen("hub-detail");};
  const handleNav=s=>{setScreen(s);if(s!=="hub-detail")setSelHub(null);};
  const activeTab=screen==="hub-detail"?"search":screen;

  /* HI — locked to own hub, full screen no sidebar */
  if(user.role==="hi") {
    return (
      <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Poppins',sans-serif"}}>
        <style>{FONT}</style>
        <TopNav user={user} screen="myhub" onNav={()=>{}} onLogout={()=>setUser(null)}/>
        <HubDetail hub={hiHub} isHI={true} onBack={null}/>
      </div>
    );
  }

  /* Admin — full portal */
  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Poppins',sans-serif"}}>
      <style>{FONT}</style>
      <TopNav user={user} screen={activeTab} onNav={handleNav} onLogout={()=>{setUser(null);setScreen("dashboard");setSelHub(null);}}/>
      <div>
        {screen==="dashboard"&&<Dashboard onSelect={handleSelect}/>}
        {screen==="search"&&<HubSearch onSelect={handleSelect}/>}
        {screen==="audit"&&<AuditFlags onSelect={handleSelect}/>}
        {screen==="hub-detail"&&selHub&&<HubDetail hub={selHub} isHI={false} onBack={()=>handleNav("search")}/>}
      </div>
    </div>
  );
}
