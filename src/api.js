const BASE = "https://hub-portal-backend.onrender.com";

let token = localStorage.getItem("hp_token") || null;

export function setToken(t) { token = t; localStorage.setItem("hp_token", t); }
export function clearToken() { token = null; localStorage.removeItem("hp_token"); localStorage.removeItem("hp_user"); }
export function getStoredUser() { try { return JSON.parse(localStorage.getItem("hp_user")); } catch { return null; } }
export function storeUser(u) { localStorage.setItem("hp_user", JSON.stringify(u)); }

// Safe fetch with manual timeout — no AbortSignal.timeout (bad browser support)
function fetchWithTimeout(url, opts = {}, ms = 25000) {
  return new Promise((resolve, reject) => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
      reject(new Error("TIMEOUT"));
    }, ms);
    fetch(url, { ...opts, signal: controller.signal })
      .then(res => { clearTimeout(timer); resolve(res); })
      .catch(err => { clearTimeout(timer); reject(err); });
  });
}

function parseError(err) {
  if (!err) return "Request failed";
  if (typeof err.detail === "string") return err.detail;
  if (Array.isArray(err.detail)) return err.detail.map(e => e.msg || JSON.stringify(e)).join(", ");
  if (err.message) return err.message;
  return "Request failed";
}

async function req(path, opts = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
  let lastErr = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetchWithTimeout(
        `${BASE}${path}`,
        { ...opts, headers: { ...headers, ...opts.headers } },
        30000
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(parseError(body) || `Error ${res.status}`);
      }
      return res.json();
    } catch (e) {
      lastErr = e;
      const msg = e.message || "";
      // Real HTTP errors (auth, validation) — don't retry
      if (!["TIMEOUT","Failed to fetch","NetworkError","Load failed","AbortError"].some(k => msg.includes(k)) && e.name !== "AbortError") {
        throw e;
      }
      if (attempt < 2) await new Promise(r => setTimeout(r, 4000));
    }
  }
  throw new Error("Server is not responding. Please wait 30 seconds and try again.");
}

// Wake backend — tries up to 4 times
export async function wakeBackend(onStatus) {
  onStatus("checking");
  for (let i = 0; i < 4; i++) {
    try {
      const res = await fetchWithTimeout(`${BASE}/health`, {}, 8000);
      if (res.ok) { onStatus("online"); return; }
    } catch (_) {}
    if (i < 3) {
      onStatus("waking");
      await new Promise(r => setTimeout(r, 6000));
    }
  }
  onStatus("slow"); // Server is slow but let user try anyway
}

export const api = {
  login: (email, password) => req("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  }),
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
  exportCsv: (code) => `${BASE}/export/hub/${code}/csv`,
  triggerEtl: () => req("/etl/trigger", { method: "POST" }),
  getEtlLogs: () => req("/etl/logs"),
};
