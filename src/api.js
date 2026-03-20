const BASE = "https://hub-portal-backend.onrender.com";

let token = localStorage.getItem("hp_token") || null;

export function setToken(t) { token = t; localStorage.setItem("hp_token", t); }
export function clearToken() { token = null; localStorage.removeItem("hp_token"); localStorage.removeItem("hp_user"); }
export function getStoredUser() { try { return JSON.parse(localStorage.getItem("hp_user")); } catch { return null; } }
export function storeUser(u) { localStorage.setItem("hp_user", JSON.stringify(u)); }

function parseError(err) {
  if (!err || !err.detail) return "Request failed";
  if (typeof err.detail === "string") return err.detail;
  if (Array.isArray(err.detail)) return err.detail.map(e => e.msg || JSON.stringify(e)).join(", ");
  return JSON.stringify(err.detail);
}

// Retry fetch up to 3 times with delay — handles Render cold start
async function fetchWithRetry(url, opts = {}, retries = 3, delay = 4000) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { ...opts, signal: AbortSignal.timeout(15000) });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Request failed" }));
        throw new Error(parseError(err));
      }
      return res.json();
    } catch (e) {
      // If it's a real HTTP error (not network), don't retry
      if (e.message && !e.message.includes("fetch") && !e.message.includes("network") && !e.message.includes("timeout") && !e.message.includes("abort")) {
        throw e;
      }
      if (i < retries - 1) {
        await new Promise(r => setTimeout(r, delay));
      } else {
        throw new Error("Server is waking up — please wait 30 seconds and try again. (Render free tier sleeps after inactivity)");
      }
    }
  }
}

async function req(path, opts = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
  return fetchWithRetry(`${BASE}${path}`, { ...opts, headers: { ...headers, ...opts.headers } });
}

// Wake up the backend (call on app load)
export async function wakeBackend() {
  try {
    await fetch(`${BASE}/health`, { signal: AbortSignal.timeout(5000) });
  } catch (_) { /* silent — just pinging */ }
}

export const api = {
  login: (email, password) => req("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  me: () => req("/auth/me"),
  searchHubs: (params = {}) => { const q = new URLSearchParams(Object.entries(params).filter(([,v]) => v)).toString(); return req(`/hubs${q ? "?" + q : ""}`); },
  getFilters: () => req("/hubs/filters"),
  getHub: (code) => req(`/hubs/${code}`),
  getHubExpenses: (code, params = {}) => { const q = new URLSearchParams(Object.entries(params).filter(([,v]) => v)).toString(); return req(`/hubs/${code}/expenses${q ? "?" + q : ""}`); },
  getDashboardKpis: () => req("/dashboard/kpis"),
  getStateSpend: () => req("/dashboard/state-spend"),
  getCategoryMix: () => req("/dashboard/category-mix"),
  getTopHubs: (limit = 10) => req(`/dashboard/top-hubs?limit=${limit}`),
  getFlaggedHubs: () => req("/dashboard/flagged-hubs"),
  exportCsv: (code) => `${BASE}/export/hub/${code}/csv`,
  triggerEtl: () => req("/etl/trigger", { method: "POST" }),
  getEtlLogs: () => req("/etl/logs"),
};
