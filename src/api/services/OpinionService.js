import { apiJson, apiForm } from "@/api/api.js";
import { API } from "@/api/endpoints.js";

export const OpinionService = {
    async getAll(query, {ct, timeoutMs} = {}) {
        const { method, url } = API.opinion.getAllPoss;

        const res = await apiJson(`${url}?${query.toString()}`,
        {
            method: method,
            credentials: "include",
        },
        { ct, timeoutMs });

        return res;
    },

    async rateCompany(model, {ct, timeoutMs} = {}) {
        const { method, url } = API.opinion.rate;

        const res = await apiJson(url,
        {
            method: method,
            credentials: "include",
            body: JSON.stringify(model),
        },
        { ct, timeoutMs }
        );

        return res;
    },
};