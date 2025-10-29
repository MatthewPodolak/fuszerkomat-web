import { tokenStore } from "@/api/tokenStore.js";
import { API } from "@/api/endpoints.js";
import getExp from "@/helpers/jwtHelper.js";

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN;
const DEFAULT_TIMEOUT_MS = 8000;
let refreshing = null;

function makeSignal({ ct, timeoutMs } = {}) {
  if (!ct && !timeoutMs) return undefined;
  const controller = new AbortController();
  let timer;
  if (ct) ct.addEventListener("abort", () => controller.abort(), { once: true });
  if (timeoutMs) timer = setTimeout(() => controller.abort("Timeout"), timeoutMs);
  return { signal: controller.signal, cleanup: () => clearTimeout(timer) };
}

export async function doRefresh({ ct, timeoutMs } = {}) {
  const rt = tokenStore.getRefresh();
  if (!rt) {
    tokenStore.clear();
    return Promise.reject(new Error("No refresh token"));
  }

  refreshing ??= (async () => {
    const headers = new Headers({ "Content-Type": "application/json" });
    const composed = makeSignal({ ct, timeoutMs });

    try {
      const res = await fetch(API_ORIGIN + API.auth.refresh(), {
        method: "POST",
        headers,
        body: JSON.stringify(rt),
        credentials: "omit",
        signal: composed?.signal,
      });

      const result = await res.json();
      if (!result.success) throw result;

      const data = result.data ?? {};
      const accessToken = data.acessToken;
      const newRt = data.refreshToken ?? rt;
      if (!accessToken) throw new Error("Missing access token");

      const exp = getExp(accessToken);
      tokenStore.set({
        token: accessToken,
        refToken: newRt,
        exp,
        scheduleRefresh: () => doRefresh({ timeoutMs: 15000 }),
      });

      return accessToken;
    } catch (e) {
      tokenStore.clear();
      throw e;
    } finally {
      composed?.cleanup?.();
      refreshing = null;
    }
  })();

  return refreshing;
}

async function ensureFreshToken() {
  const at = tokenStore.get();
  const rt = tokenStore.getRefresh();

  if (!at && !rt) return;

  if (!at && rt) {
    try { await doRefresh({ timeoutMs: 15000 }); } catch {}
    return;
  }

  const expMs = tokenStore.getExp() * 1000;
  const soon = expMs - Date.now() < 60_000;
  if (soon && rt) {
    try { await doRefresh({ timeoutMs: 15000 }); } catch {}
  }
}


export async function apiFetch(path, init = {}, opts = {}) {
  const isRefreshCall = path === API.auth.refresh();
  if (!isRefreshCall) {
    await ensureFreshToken();
  }

  const headers = new Headers(init.headers || {});
  const at = tokenStore.get();
  if (at) headers.set("Authorization", `Bearer ${at}`);

  const composed = makeSignal({ timeoutMs: opts.timeoutMs ?? DEFAULT_TIMEOUT_MS });

  try {
    let res = await fetch(API_ORIGIN + path, {
      ...init,
      headers,
      credentials: init.credentials ?? "include",
      signal: composed?.signal,
    });

    if (res.status === 401 && !init._retry) {
      try {
        await doRefresh({ timeoutMs: 15000 });
      } catch {
        return res;
      }

      const newAT = tokenStore.get();
      const retryHeaders = new Headers(init.headers || {});
      if (newAT) retryHeaders.set("Authorization", `Bearer ${newAT}`);

      res = await fetch(API_ORIGIN + path, {
        ...init,
        headers: retryHeaders,
        credentials: init.credentials ?? "include",
        signal: composed?.signal,
        _retry: true,
      });
    }

    return res;
  } finally {
    composed?.cleanup?.();
  }
}

export async function apiJson(path, init = {}, opts = {}) {
  const headers = new Headers(init.headers || {});
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const res = await apiFetch(path, { ...init, headers }, opts);
  const result = await res.json();
  return result;
}