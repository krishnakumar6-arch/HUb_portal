import { useState } from "react";
import { PieChart,Pie,Cell,Tooltip,Legend,ResponsiveContainer,BarChart,Bar,XAxis,YAxis,CartesianGrid,AreaChart,Area } from "recharts";

const FONT=`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Poppins',sans-serif}`;
const C={yellow:"#F5C518",yellowDk:"#D4A800",dark:"#1A1A1A",white:"#fff",bg:"#F4F5F7",border:"#E8EAED",t1:"#111",t2:"#555",t3:"#999",green:"#1DB87E",greenBg:"#E8FBF3",red:"#E53935",redBg:"#FEF2F2",amber:"#F59E0B"};
const fmt=n=>"₹"+Number(Math.round(n||0)).toLocaleString("en-IN");
const fmtK=n=>!n?"₹0":n>=100000?"₹"+(n/100000).toFixed(1)+"L":n>=1000?"₹"+(n/1000).toFixed(0)+"K":"₹"+Math.round(n);
const SFLogo=({s=24})=><svg width={s} height={s} viewBox="0 0 28 28" fill="none"><path d="M4 22L11 8L18 15L23 6" stroke={C.yellow} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="23" cy="6" r="2.5" fill={C.yellow}/></svg>;

// Mock data so dashboard works without backend
const mockKpis = { total_hubs: 4218, total_ytd: 18500000, flagged_hubs: 23, top_hub: { code: "BLR_KOR_012", ytd: 480000 } };
const mockStateData = [
  {state:"Karnataka",value:3200000},{state:"Maharashtra",value:2800000},{state:"Delhi",value:2400000},
  {state:"Tamil Nadu",value:1900000},{state:"Telangana",value:1600000},{state:"Gujarat",value:1400000},
  {state:"Rajasthan",value:1100000},{state:"West Bengal",value:900000}
];
const mockCatMix = [
  {name:"Rent",value:5200000,color:"#F5C518"},{name:"Electricity",value:3800000,color:"#1DB87E"},
  {name:"Housekeeping",value:2900000,color:"#2196F3"},{name:"Repair & Maintenance",value:2100000,color:"#9C27B0"},
  {name:"Internet & Mobile",value:1800000,color:"#FF9800"},{name:"Tea / Coffee / Water",value:1400000,color:"#00BCD4"},
  {name:"Printing & Stationery",value:1300000,color:"#E53935"}
];
const mockTopHubs = [
  {rank:1,hub_code:"BLR_KOR_012",city:"Bangalore",state:"Karnataka",ytd:480000},
  {rank:2,hub_code:"MUM_AND_034",city:"Mumbai",state:"Maharashtra",ytd:420000},
  {rank:3,hub_code:"DEL_DWK_007",city:"Delhi",state:"Delhi",ytd:390000},
  {rank:4,hub_code:"HYD_KPH_021",city:"Hyderabad",state:"Telangana",ytd:340000},
  {rank:5,hub_code:"CHN_VLV_018",city:"Chennai",state:"Tamil Nadu",ytd:310000},
  {rank:6,hub_code:"PUN_KHD_045",city:"Pune",state:"Maharashtra",ytd:290000},
  {rank:7,hub_code:"AHM_SAT_033",city:"Ahmedabad",state:"Gujarat",ytd:270000},
  {rank:8,hub_code:"KOL_HWH_056",city:"Kolkata",state:"West Bengal",ytd:250000},
];
const mockHubs = Array.from({length:20},(_,i)=>({
  hub_code:`HUB_${String(i+1).padStart(3,"0")}`,city:["Bangalore","Mumbai","Delhi","Hyderabad","Chennai"][i%5],
  state:["Karnataka","Maharashtra","Delhi","Telangana","Tamil Nadu"][i%5],tier:`T${(i%3)+1}`,
  total_ytd:Math.round(Math.random()*400000+50000)
}));
const mockFlagged = mockHubs.filter(h=>h.total_ytd>200000).map(h=>({...h,violations:Math.floor(Math.random()*5)}));

const CTip=({active,payload,label})=>active&&payload?.length?<div style={{background:C.dark,border:"1px solid #333",borderRadius:10,padding:"10px 14px"}}><p style={{fontSize:12,fontWeight:700,color:C.yellow,marginBottom:6}}>{label}</p>{payload.map((p,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",gap:16,fontSize:12,color:"#aaa"}}><span>{p.name}</span><span style={{fontWeight:700,color:"#fff"}}>{fmt(p.value)}</span></div>)}</div>:null;
const Chip=({label,color="gray"})=>{const m={green:[C.greenBg,C.green],red:[C.redBg,C.red],amber:["#FFFBEB","#B45309"],dark:["#2A2A2A",C.white],gray:["#F1F3F5",C.t2]};const[bg,tc]=m[color]||m.gray;return<span style={{padding:"2px 9px",borderRadius:20,background:bg,color:tc,fontSize:11,fontWeight:700,display:"inline-block"}}>{label}</span>;};

function Nav({screen,onNav}){
  const tabs=[{id:"dashboard",l:"Dashboard"},{id:"search",l:"Hub Explorer"},{id:"audit",l:"Audit Flags"}];
  return(
    <div style={{position:"sticky",top:0,zIndex:100,background:C.white,borderBottom:`1px solid ${C.border}`,boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 28px",height:58}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}><SFLogo s={22}/><div><div style={{fontWeight:900,fontSize:14,color:C.dark}}>SHADOWFAX</div><div style={{fontSize:8,color:C.yellow,fontWeight:700,letterSpacing:"0.07em"}}>Hub Portal</div></div></div>
        <nav style={{display:"flex",gap:2}}>{tabs.map(t=>{const on=screen===t.id;return(<button key={t.id} onClick={()=>onNav(t.id)} style={{padding:"6px 16px",border:"none",background:"transparent",cursor:"pointer",fontSize:13,fontWeight:on?700:500,color:on?C.dark:C.t3,fontFamily:"'Poppins',sans-serif",position:"relative"}}>{t.l}{on&&<div style={{position:"absolute",bottom:-1,left:16,right:16,height:2.5,background:C.yellow,borderRadius:"2px 2px 0 0"}}/>}</button>);})}</nav>
        <div style={{padding:"7px 14px",background:"#F1F3F5",borderRadius:8,fontSize:12,color:C.t2,fontWeight:600}}>Admin — Demo Mode</div>
      </div>
    </div>
  );
}

function Dashboard({onSelect}){
  return(
    <div style={{padding:"24px 28px",background:C.bg}}>
      <div style={{marginBottom:18,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div><h1 style={{fontSize:22,fontWeight:800,color:C.dark}}>Network Overview</h1><p style={{color:C.t3,fontSize:13}}>Demo data · {mockKpis.total_hubs} active hubs</p></div>
        <div style={{background:"#FFF8E1",border:"1px solid #FFE082",borderRadius:8,padding:"8px 14px",fontSize:12,color:"#B45309",fontWeight:500}}>⚠️ Demo mode — connect backend to see live data</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>
        {[["Total Hubs",mockKpis.total_hubs,"Across India","🏢",false],["YTD Spend",fmtK(mockKpis.total_ytd),"All categories","💰",true],["Flagged Hubs",mockKpis.flagged_hubs,"Above ₹2L","⚠️",false],["Top Hub",fmtK(mockKpis.top_hub.ytd),mockKpis.top_hub.code,"📍",false]].map(([l,v,s,ic,dk])=>(
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
          <ResponsiveContainer width="100%" height={200}><BarChart data={mockStateData} layout="vertical"><CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={C.border}/><XAxis type="number" tickFormatter={fmtK} tick={{fontSize:10,fill:C.t3}} axisLine={false} tickLine={false}/><YAxis type="category" dataKey="state" tick={{fontSize:11,fill:C.t2}} axisLine={false} tickLine={false} width={110}/><Tooltip content={<CTip/>}/><Bar dataKey="value" name="YTD" fill={C.yellow} radius={[0,5,5,0]} barSize={12}/></BarChart></ResponsiveContainer>
        </div>
        <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,padding:"18px 20px"}}>
          <div style={{fontWeight:800,color:C.dark,fontSize:14,marginBottom:14}}>Category mix</div>
          <ResponsiveContainer width="100%" height={200}><PieChart><Pie data={mockCatMix} cx="50%" cy="46%" innerRadius={50} outerRadius={82} dataKey="value" paddingAngle={2}>{mockCatMix.map((e,i)=><Cell key={i} fill={e.color} strokeWidth={0}/>)}</Pie><Tooltip formatter={v=>fmt(v)} contentStyle={{borderRadius:8,fontSize:11}}/><Legend iconType="circle" iconSize={7} wrapperStyle={{fontSize:10}}/></PieChart></ResponsiveContainer>
        </div>
      </div>
      <div style={{background:C.dark,borderRadius:12,padding:"18px 20px"}}>
        <div style={{fontWeight:800,color:C.yellow,fontSize:14,marginBottom:14}}>Top hubs by spend</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
          {mockTopHubs.map((h,i)=>(
            <div key={h.hub_code} onClick={()=>onSelect(h.hub_code)} style={{padding:"11px 13px",border:`1px solid ${i<3?"rgba(245,197,24,0.4)":"rgba(255,255,255,0.1)"}`,borderRadius:9,cursor:"pointer",background:i<3?"rgba(245,197,24,0.07)":"transparent"}} onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"} onMouseLeave={e=>e.currentTarget.style.transform="none"}>
              <div style={{fontSize:10,fontWeight:800,color:i<3?C.yellow:"#888",marginBottom:4}}>#{i+1}</div>
              <div style={{fontSize:11,fontWeight:700,color:C.white,marginBottom:3}}>{h.hub_code}</div>
              <div style={{fontSize:15,fontWeight:800,color:C.yellow}}>{fmtK(h.ytd)}</div>
              <div style={{fontSize:9,color:"rgba(255,255,255,0.3)",marginTop:2}}>{h.city}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HubSearch({onSelect}){
  const [q,setQ]=useState("");
  const filtered=mockHubs.filter(h=>!q||h.hub_code.toLowerCase().includes(q.toLowerCase())||h.city.toLowerCase().includes(q.toLowerCase())||h.state.toLowerCase().includes(q.toLowerCase()));
  return(
    <div style={{padding:"24px 28px",background:C.bg}}>
      <h1 style={{fontSize:22,fontWeight:800,color:C.dark,marginBottom:16}}>Hub Explorer</h1>
      <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,padding:"14px 16px",marginBottom:14}}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search hub code, city, state..." style={{width:"100%",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13,fontFamily:"'Poppins',sans-serif",outline:"none"}}/>
      </div>
      <div style={{fontSize:12,color:C.t3,fontWeight:600,marginBottom:12}}>{filtered.length} hubs (demo data)</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:11}}>
        {filtered.map(h=>{const over=h.total_ytd>200000;return(
          <div key={h.hub_code} onClick={()=>onSelect(h.hub_code)} style={{background:C.white,border:`1px solid ${over?"#FECACA":C.border}`,borderRadius:12,padding:14,cursor:"pointer",borderLeft:`3px solid ${over?C.red:C.yellow}`}} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 6px 20px rgba(0,0,0,0.08)";}} onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><div><div style={{fontWeight:800,fontSize:13,color:C.dark}}>{h.hub_code}</div><div style={{fontSize:11,color:C.t3}}>{h.city} · {h.state} · {h.tier}</div></div>{over&&<Chip label="High Spend" color="red"/>}</div>
            <div style={{fontSize:19,fontWeight:800,color:over?C.red:C.dark}}>{fmtK(h.total_ytd)}</div>
          </div>
        );})}
      </div>
    </div>
  );
}

function HubDetail({code,onBack}){
  const hub=mockHubs.find(h=>h.hub_code===code)||{hub_code:code,city:"—",state:"—",tier:"—",total_ytd:0};
  const monthly=[...Array(6)].map((_,i)=>({month:`2025-${String(i+7).padStart(2,"0")}`,total:Math.round(Math.random()*80000+20000)}));
  return(
    <div style={{padding:"24px 28px",background:C.bg}}>
      <button onClick={onBack} style={{marginBottom:14,padding:"6px 14px",background:C.white,border:`1px solid ${C.border}`,borderRadius:8,fontSize:12,cursor:"pointer",fontWeight:700,fontFamily:"'Poppins',sans-serif"}}>← Back</button>
      <div style={{background:C.dark,borderRadius:12,padding:"20px 24px",marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
          <div><h2 style={{color:C.yellow,fontSize:20,fontWeight:800,marginBottom:8}}>{hub.hub_code}</h2>
          <div style={{display:"flex",gap:18}}>{[["City",hub.city],["State",hub.state],["Tier",hub.tier]].map(([k,v])=><div key={k}><div style={{color:"rgba(255,255,255,0.3)",fontSize:10,textTransform:"uppercase"}}>{k}</div><div style={{color:"rgba(255,255,255,0.9)",fontSize:12,fontWeight:700,marginTop:1}}>{v}</div></div>)}</div></div>
          <div style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"12px 16px",textAlign:"right"}}><div style={{color:"rgba(255,255,255,0.3)",fontSize:10,textTransform:"uppercase",marginBottom:3}}>Total Spend</div><div style={{color:C.yellow,fontSize:20,fontWeight:800}}>{fmtK(hub.total_ytd)}</div></div>
        </div>
      </div>
      <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,padding:"18px 20px",marginBottom:12}}>
        <div style={{fontWeight:800,color:C.dark,fontSize:14,marginBottom:14}}>Monthly spend (demo)</div>
        <ResponsiveContainer width="100%" height={160}><AreaChart data={monthly}><defs><linearGradient id="yg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.yellow} stopOpacity={0.15}/><stop offset="95%" stopColor={C.yellow} stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/><XAxis dataKey="month" tick={{fontSize:9,fill:C.t3}} axisLine={false} tickLine={false}/><YAxis tickFormatter={fmtK} tick={{fontSize:10,fill:C.t3}} axisLine={false} tickLine={false} width={40}/><Tooltip/><Area type="monotone" dataKey="total" name="Total" stroke={C.yellow} strokeWidth={2.5} fill="url(#yg)"/></AreaChart></ResponsiveContainer>
      </div>
      <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,padding:"18px 20px"}}>
        <div style={{fontWeight:800,color:C.dark,fontSize:14,marginBottom:14}}>Sample transactions (demo)</div>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead><tr style={{background:C.dark}}>{["Date","Category","Amount","Status"].map(h=><th key={h} style={{padding:"9px 12px",textAlign:"left",fontSize:11,fontWeight:700,color:C.yellow,textTransform:"uppercase"}}>{h}</th>)}</tr></thead>
        <tbody>{[["2025-09-01","Rent","45000","Paid"],["2025-09-05","Electricity","12000","Paid"],["2025-09-10","Housekeeping","8000","Verified"],["2025-09-15","Internet & Mobile","3500","Paid"],["2025-09-20","Tea / Coffee / Water","2000","Submitted"]].map(([d,c,a,s],i)=><tr key={i} style={{borderBottom:`1px solid ${C.border}`}}><td style={{padding:"9px 12px",color:C.t3}}>{d}</td><td style={{padding:"9px 12px"}}><span style={{background:`${C.yellow}18`,color:"#D4A800",padding:"2px 8px",borderRadius:10,fontSize:11,fontWeight:700}}>{c}</span></td><td style={{padding:"9px 12px",fontWeight:800}}>{fmt(a)}</td><td style={{padding:"9px 12px",color:C.t2}}>{s}</td></tr>)}</tbody></table>
      </div>
    </div>
  );
}

function Audit({onSelect}){
  return(
    <div style={{padding:"24px 28px",background:C.bg}}>
      <h1 style={{fontSize:22,fontWeight:800,color:C.dark,marginBottom:16}}>Audit & Anomaly Flags</h1>
      <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr style={{background:C.dark}}>{["#","Hub Code","City","State","YTD Spend","Violations",""].map(h=><th key={h} style={{padding:"11px 14px",textAlign:"left",fontSize:11,fontWeight:700,color:C.yellow,textTransform:"uppercase"}}>{h}</th>)}</tr></thead>
          <tbody>{mockFlagged.map((h,i)=>(
            <tr key={h.hub_code} style={{borderBottom:`1px solid ${C.border}`}} onMouseEnter={e=>e.currentTarget.style.background="#FFFBEA"} onMouseLeave={e=>e.currentTarget.style.background=C.white}>
              <td style={{padding:"10px 14px",color:C.t3,fontWeight:700}}>{i+1}</td>
              <td style={{padding:"10px 14px",fontWeight:800,color:C.dark}}>{h.hub_code}</td>
              <td style={{padding:"10px 14px",color:C.t2}}>{h.city}</td>
              <td style={{padding:"10px 14px",color:C.t2}}>{h.state}</td>
              <td style={{padding:"10px 14px",fontWeight:800,color:C.red}}>{fmt(h.total_ytd)}</td>
              <td style={{padding:"10px 14px",color:C.amber,fontWeight:700}}>{h.violations}</td>
              <td style={{padding:"10px 14px"}}><button onClick={()=>onSelect(h.hub_code)} style={{padding:"5px 12px",background:C.yellow,border:"none",borderRadius:6,color:C.dark,fontSize:11,cursor:"pointer",fontWeight:800,fontFamily:"'Poppins',sans-serif"}}>Review →</button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

export default function App(){
  const [screen,setScreen]=useState("dashboard");
  const [hub,setHub]=useState(null);
  const select=code=>{setHub(code);setScreen("hub-detail");};
  const nav=s=>{setScreen(s);setHub(null);};
  return(
    <div style={{fontFamily:"'Poppins',sans-serif"}}>
      <style>{FONT}</style>
      <Nav screen={screen==="hub-detail"?"search":screen} onNav={nav}/>
      {screen==="dashboard"&&<Dashboard onSelect={select}/>}
      {screen==="search"&&<HubSearch onSelect={select}/>}
      {screen==="audit"&&<Audit onSelect={select}/>}
      {screen==="hub-detail"&&hub&&<HubDetail code={hub} onBack={()=>nav("search")}/>}
    </div>
  );
}
