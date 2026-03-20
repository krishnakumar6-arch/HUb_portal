const BASE = "https://hub-portal-backend.onrender.com";

let token = localStorage.getItem("hp_token") || null;

export function setToken(t) { token = t; localStorage.setItem("hp_token", t); }
export function clearToken() { token = null; localStorage.removeItem("hp_token"); localStorage.removeItem("hp_user"); }
export function getStoredUser() { try { return JSON.parse(localStorage.getItem("hp_user")); } catch { return null; } }
export function storeUser(u) { localStorage.setItem("hp_user", JSON.stringify(u)); }

async function req(path, opts = {}) {
  const headers = { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  const res = await fetch(`${BASE}${path}`, { ...opts, headers: { ...headers, ...opts.headers } });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

export const api = {
  login: (email, password) => req("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  me: () => req("/auth/me"),

  searchHubs: (params = {}) => {
    const q = new URLSearchParams(Object.entries(params).filter(([,v]) => v)).toString();
    return req(`/hubs${q ? "?" + q : ""}`);
  },
  getFilters: () => req("/hubs/filters"),
  getHub: (code) => req(`/hubs/${code}`),
  getHubExpenses: (code, params = {}) => {
    const q = new URLSearchParams(Object.entries(params).filter(([,v]) => v)).toString();
    return req(`/hubs/${code}/expenses${q ? "?" + q : ""}`);
  },

  getDashboardKpis: () => req("/dashboard/kpis"),
  getStateSpend: () => req("/dashboard/state-spend"),
  getCategoryMix: () => req("/dashboard/category-mix"),
  getTopHubs: (limit = 10) => req(`/dashboard/top-hubs?limit=${limit}`),
  getFlaggedHubs: () => req("/dashboard/flagged-hubs"),

  exportCsv: (code, params = {}) => {
    const q = new URLSearchParams(Object.entries(params).filter(([,v]) => v)).toString();
    return `${BASE}/export/hub/${code}/csv${q ? "?" + q : ""}?token=${token}`;
  },

  triggerEtl: () => req("/etl/trigger", { method: "POST" }),
  getEtlLogs: () => req("/etl/logs"),
};
