import { apiJson, apiForm } from "@/api/api.js";
import { API } from "@/api/endpoints.js";

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
};