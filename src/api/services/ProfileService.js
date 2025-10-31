import { apiJson, apiForm } from "@/api/api.js";
import { API } from "@/api/endpoints.js";

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
};