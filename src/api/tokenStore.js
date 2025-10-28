let accessToken = null;
let refreshToken = null;
let accessExp = 0;
let refreshTimer = null;

const listeners = new Set();
function notify() { for (const fn of [...listeners]) { try { fn(); } catch {} } }

const KEY_RT = "auth.rt";
const KEY_AT_EXP = "auth.atExp";

function persist(rt, exp) {
  if (rt) localStorage.setItem(KEY_RT, rt);
  else localStorage.removeItem(KEY_RT);

  if (exp && Number.isFinite(exp)) localStorage.setItem(KEY_AT_EXP, String(exp));
  else localStorage.removeItem(KEY_AT_EXP);
}

export function hydrateTokenStore() {
  try {
    const rt = localStorage.getItem(KEY_RT);
    const expStr = localStorage.getItem(KEY_AT_EXP);
    if (rt) refreshToken = rt;
    if (expStr) {
      const parsed = parseInt(expStr, 10);
      if (!Number.isNaN(parsed)) accessExp = parsed;
    }
  } catch {}
  notify();
}

export const tokenStore = {
  get() { return accessToken; },
  getExp() { return accessExp; },
  getRefresh() { return refreshToken; },
  subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },

  set({ token, refToken, exp, scheduleRefresh }) {
    accessToken = token || null;
    refreshToken = refToken ?? null;
    accessExp = exp || 0;

    persist(refreshToken, accessExp); //we all know i should use cookie req, however...

    if (refreshTimer) clearTimeout(refreshTimer);
    if (token && exp && typeof scheduleRefresh === "function") {
      const leewayMs = 60_000;
      const msUntil = Math.max(exp * 1000 - Date.now() - leewayMs, 2_000);
      refreshTimer = setTimeout(() => {
        scheduleRefresh().catch(() => tokenStore.clear());
      }, msUntil);
    } else {
      refreshTimer = null;
    }

    notify();
  },

  clear() {
    accessToken = null;
    refreshToken = null;
    accessExp = 0;
    if (refreshTimer) clearTimeout(refreshTimer);
    refreshTimer = null;

    persist(null, null);
    notify();
  },
};