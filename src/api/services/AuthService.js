import { apiJson, doRefresh } from "@/api/api.js";
import { API } from "@/api/endpoints.js";
import { tokenStore } from "@/api/tokenStore.js";
import getExp from "@/helpers/jwtHelper.js";

export const AuthService = {
  async login(email, password, { ct, timeoutMs } = {}) {
    const res = await apiJson(API.auth.login(),
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
        credentials: "include",
      },
      { ct, timeoutMs }
    );

    if(res.success){
      const accessToken = res.data.acessToken;
      const refreshToken = res.data.refreshToken ?? null;
      if (!accessToken) throw new Error("Missing access token SSS");

      tokenStore.set({
        token: accessToken,
        refToken: refreshToken,
        exp: getExp(accessToken),
        scheduleRefresh: () => doRefresh({ timeoutMs: 15000 }),
      });
    }

    return res;
  },

  async refresh() {
    const rt = tokenStore.getRefresh();
    if (!rt) {
      tokenStore.clear();
      throw new Error("No refresh token");
    }

    const data = await apiJson(
      API.auth.refresh(),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rt),
        credentials: "omit",
      }
    );

    if(data.success){
      const accessToken = data.data.acessToken;
      const refreshToken = data.data.refreshToken ?? rt;
      if (!accessToken) throw new Error("Missing access token");

      tokenStore.set({
        token: accessToken,
        refToken: refreshToken,
        exp: getExp(accessToken),
        scheduleRefresh: () => doRefresh({ timeoutMs: 15000 }),
      });
    }
  },

  async register(email, password, accountType, name = null, companyName = null, {ct, timeoutMs} = {}) {
    const model = {
      email,
      password,
      accountType,
      ...(accountType === "User" ? { name } : {}),
      ...(accountType === "Company" ? { companyName } : {}),
    };

    const res = await apiJson(API.auth.register(),
      {
        method: "POST",
        body: JSON.stringify(model),
      },
      { ct, timeoutMs }
    );

    if(res.success){
      const accessToken = res.data.acessToken;
      const refreshToken = res.data.refreshToken ?? null;
      if (!accessToken) throw new Error("Missing access token");

      tokenStore.set({
        token: accessToken,
        refToken: refreshToken,
        exp: getExp(accessToken),
        scheduleRefresh: () => doRefresh({ timeoutMs: 15000 }),
      });
    }

    return res;
  },

  async logout() {
    try {
      await apiJson(API.auth.logout(), { method: "POST", credentials: "include" });
    } finally {
      tokenStore.clear();
    }
  },

  isAuthed() {
    return !!tokenStore.get();
  },
};