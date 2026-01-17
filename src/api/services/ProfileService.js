import { apiJson, apiForm } from "@/api/api.js";
import { API } from "@/api/endpoints.js";
import { tokenStore } from "@/api/tokenStore.js";

const KEY_PFP = "profile.pfp";

export const ProfileService = {
  async getOwn( { ct, timeoutMs } = {}) {
    const { method, url } = API.account.getOwnProfile;

    const res = await apiJson(url,
      {
        method: method,
        credentials: "include",
      },
      { ct, timeoutMs }
    );

    if(res.status === 200)
    { 
      const { userProfileDataVMO, companyProfileDataVMO } = res.data;

      if (!userProfileDataVMO && !companyProfileDataVMO) return res;

      const profileData = userProfileDataVMO ?? companyProfileDataVMO;
      const pfp = profileData?.img;

      if (pfp) {
        const fullUrl = import.meta.env.VITE_API_ORIGIN + pfp;
        localStorage.setItem(KEY_PFP, fullUrl);
      }
    }

    return res;
  },

  async patchProfileInfo(model, {ct, timeoutMs} = {}) {
    const { method, url } = API.account.updateProfileInformation;

    const res = await apiForm(url,
      {
        method: method,
        credentials: "include",
        body: model,
      },
      { ct, timeoutMs }
    );

    return res;
  },

  async getProfilePicture() {
    let storedPfp = localStorage.getItem(KEY_PFP);
    if (!storedPfp || storedPfp === "null" || storedPfp === "undefined"){
      await this.getOwn();
      storedPfp = localStorage.getItem(KEY_PFP);
    }

    return storedPfp;
  },

  async getCompanyProfile(companyId, {ct, timeoutMs}) {
    const { method, url } = API.account.getCompanyProfile;

    let query = new URLSearchParams({ id: String(companyId) });
    const res = await apiJson(`${url}?${query.toString()}`,
    {
        method: method,
        credentials: "include",
    },
    { ct, timeoutMs });

    return res;
  },

  async deleteAccount({ct, timeoutMs} = {}){
    const { method, url } = API.account.deleteAccount;

    const res = await apiJson(url,
      {
        method: method,
        credentials: "include",
      },
      { ct, timeoutMs }
    );

    if(res.status === 200){
      localStorage.removeItem('E2E_key');
      localStorage.removeItem('SIGN_key');
      localStorage.removeItem('E2E_key_pub');
      tokenStore.clear();
    }

    return res;
  }
};