import { apiJson, doRefresh } from "@/api/api.js";
import { API } from "@/api/endpoints.js";
import { tokenStore } from "@/api/tokenStore.js";
import getExp from "@/helpers/jwtHelper.js";
import { generateKeys, getPrivateKeyWithPswd } from "@/helpers/crypto";

export const AuthService = {
  async login(email, password, { ct, timeoutMs } = {}) {
    const { method, url } = API.auth.login;

    const res = await apiJson(url,
      {
        method: method,
        body: JSON.stringify({ email, password }),
        credentials: "include",
      },
      { ct, timeoutMs }
    );

    if(res.success){
      const accessToken = res.data.acessToken;
      const refreshToken = res.data.refreshToken ?? null;
      if (!accessToken) throw new Error("Missing access token SSS");

      const publicKey = res.data.publicKey;
      const encryptedKey = res.data.privateKey;
      const encryptedSignKey = res.data.privateSignKey;
      if(!encryptedKey || !encryptedSignKey || !publicKey){ throw new Error("Missing private key"); }

      const privateKey = await getPrivateKeyWithPswd(password, encryptedKey);
      const privateSignKey = await getPrivateKeyWithPswd(password, encryptedSignKey);
      if(!encryptedKey || !encryptedSignKey){ throw new Error("Missing private key"); }

      localStorage.setItem('E2E_key', privateKey);
      localStorage.setItem('E2E_key_pub', publicKey);
      localStorage.setItem('SIGN_key', privateSignKey);

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
    const { method, url } = API.auth.refresh;

    const rt = tokenStore.getRefresh();
    if (!rt) {
      tokenStore.clear();
      throw new Error("No refresh token");
    }

    const data = await apiJson(url,
      {
        method: method,
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
    const { method, url } = API.auth.register;
    const { publicKey, privateKey, encryptedPrivateKey, publicSignKey, privateSignKey, encryptedPrivateSignKey  } = await generateKeys(password);

    const model = {
      email,
      password,
      accountType,
      publicKey,
      privateKey: encryptedPrivateKey,
      publicSignKey,
      privateSignKey: encryptedPrivateSignKey,
      ...(accountType === "User" ? { name } : {}),
      ...(accountType === "Company" ? { companyName } : {}),
    };

    const res = await apiJson(url,
      {
        method: method,
        body: JSON.stringify(model),
      },
      { ct, timeoutMs }
    );

    if(res.success){
      const accessToken = res.data.acessToken;
      const refreshToken = res.data.refreshToken ?? null;
      if (!accessToken) throw new Error("Missing access token");

      localStorage.setItem('E2E_key', privateKey);
      localStorage.setItem('SIGN_key', privateSignKey);
      localStorage.setItem('E2E_key_pub', publicKey);

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
    const { method, url } = API.auth.logout;
    const res = await apiJson(url, { method: method, credentials: "include" });
    if(res.status === 200){
      localStorage.removeItem('E2E_key');
      localStorage.removeItem('SIGN_key');
      localStorage.removeItem('E2E_key_pub');
      tokenStore.clear();
    }

    return res;
  },

  isAuthed() {
    return !!tokenStore.get();
  },
};