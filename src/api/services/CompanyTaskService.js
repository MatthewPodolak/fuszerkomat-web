import { apiJson, apiForm } from "@/api/api.js";
import { API } from "@/api/endpoints.js";

export const CompanyTaskService = {
    async getTasks(query, {ct, timeoutMs} = {}) {
        const { method, url } = API.companyWorkTask.getAll;

        const res = await apiJson(`${url}?${query.toString()}`,
        {
            method: method,
            credentials: "include",
        },
        { ct, timeoutMs });

        return res;
    },
};