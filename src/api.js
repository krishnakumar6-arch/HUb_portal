const BASE = "https://hub-portal-backend.onrender.com";
let token = localStorage.getItem("hp_token") || null;
export const setToken = t => { token = t; localStorage.setItem("hp_token", t); };
export const clearToken = () => { token = null; localStorage.removeItem("hp_token"); localStorage.removeItem("hp_user"); };
export const getStoredUser = () => { try { return JSON.parse(localStorage.getItem("hp_user")); } catch { return null; } };
export const storeUser = u => localStorage.setItem("hp_user", JSON.stringify(u));
export const wakeBackend = async (cb) => {
  cb("checking");
  try { const r = await fetch(`${BASE}/health`); if(r.ok){cb("online");return;} } catch(_){}
  cb("online"); // let user try anyway
};
const headers = () => ({ "Content-Type": "application/json", ...(token ? {Authorization:`Bearer ${token}`} : {}) });
const call = async (path, opts={}) => {
  const r = await fetch(`${BASE}${path}`, {...opts, headers:{...headers(),...(opts.headers||{})}});
  if(!r.ok){ const e=await r.json().catch(()=>({})); throw new Error(typeof e.detail==="string"?e.detail:Array.isArray(e.detail)?e.detail.map(x=>x.msg).join(", "):"Request failed"); }
  return r.json();
};
export const api = {
  login:(email,pass)=>call("/auth/login",{method:"POST",body:JSON.stringify({email,password:pass})}),
  me:()=>call("/auth/me"),
  searchHubs:(p={})=>{const q=new URLSearchParams(Object.entries(p).filter(([,v])=>v)).toString();return call(`/hubs${q?"?"+q:""}`);},
  getFilters:()=>call("/hubs/filters"),
  getHub:c=>call(`/hubs/${c}`),
  getHubExpenses:(c,p={})=>{const q=new URLSearchParams(Object.entries(p).filter(([,v])=>v)).toString();return call(`/hubs/${c}/expenses${q?"?"+q:""}`);},
  getDashboardKpis:()=>call("/dashboard/kpis"),
  getStateSpend:()=>call("/dashboard/state-spend"),
  getCategoryMix:()=>call("/dashboard/category-mix"),
  getTopHubs:(l=10)=>call(`/dashboard/top-hubs?limit=${l}`),
  getFlaggedHubs:()=>call("/dashboard/flagged-hubs"),
  exportCsv:c=>`${BASE}/export/hub/${c}/csv`,
  triggerEtl:()=>call("/etl/trigger",{method:"POST"}),
  getEtlLogs:()=>call("/etl/logs"),
};
