const BASE = "https://hub-portal-backend.onrender.com";

let token = localStorage.getItem("hp_token") || null;

export function setToken(t) { token = t; localStorage.setItem("hp_token", t); }
export function clearToken() { token = null; localStorage.removeItem("hp_token"); localStorage.removeItem("hp_user"); }
export function getStoredUser() { try { return JSON.parse(localStorage.getItem("hp_user")); } catch { return null; } }
export function storeUser(u) { localStorage.setItem("hp_user", JSON.stringify(u)); }

function parseError(err) {
  if (!err) return "Request failed";
  if (typeof err === "string") return err;
  if (typeof err.detail === "string") return err.detail;
  if (Array.isArray(err.detail)) return err.detail.map(e => e.msg || e.message || JSON.stringify(e)).join(", ");
  if (err.message) return err.message;
  return "Request failed";
}

async function req(path, opts = {}, retries = 2) {
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      const res = await fetch(`${BASE}${path}`, {
        ...opts,
        headers: { ...headers, ...opts.headers },
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: `Server error (${res.status})` }));
        throw new Error(parseError(err));
      }
      return res.json();
    } catch (e) {
      const isNetworkError = e.name === "AbortError" || e.name === "TypeError" || e.message?.toLowerCase().includes("failed to fetch") || e.message?.toLowerCase().includes("network");
      // If it's a real server error (4xx/5xx), don't retry
      if (!isNetworkError) throw e;
      // If we've exhausted retries, give a clear message
      if (attempt >= retries) {
        throw new Error("Cannot reach server. Please refresh the page and wait for the server status to show 'online' before signing in.");
      }
      // Wait before retry
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

export async function wakeBackend(onStatus) {
  onStatus("checking");
  try {
    const r = await fetch(`${BASE}/health`, { signal: AbortSignal.timeout(6000) });
    if (r.ok) { onStatus("online"); return; }
  } catch (_) {}
  // Second attempt after delay
  onStatus("waking");
  await new Promise(r => setTimeout(r, 5000));
  try {
    const r = await fetch(`${BASE}/health`, { signal: AbortSignal.timeout(10000) });
    if (r.ok) { onStatus("online"); return; }
  } catch (_) {}
  onStatus("slow");
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
