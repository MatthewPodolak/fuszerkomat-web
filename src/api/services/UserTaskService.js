import { apiJson, apiForm } from "@/api/api.js";
import { API } from "@/api/endpoints.js";

export const UserTaskService = {
    async publishTask(model, {ct, timeoutMs} = {}) {
        const { method, url } = API.userWorkTasks.publish;

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

    async getOwn(query, {ct, timeoutMs} = {}) {
        const { method, url } = API.userWorkTasks.getOwn;

        const res = await apiJson(`${url}?${query.toString()}`,
        {
            method: method,
            credentials: "include",
        },
        { ct, timeoutMs });

        return res;
    },

    async getById(id, {ct, timeoutMs} = {}){
        const { method, url } = API.userWorkTasks.getById;

        let query = new URLSearchParams({ id: String(id) });

        const res = await apiJson(`${url}?${query.toString()}`,
        {
            method: method,
            credentials: "include",
        },
        { ct, timeoutMs });

        return res;
    },

    async changeApplicationStatus(model, {ct, timeoutMs} = {}) {
        const { method, url } = API.userWorkTasks.changeApplicationStatus;

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

    async markAsCompleted(model, {ct, timeoutMs} = {}){
        const { method, url } = API.userWorkTasks.completeRealization;

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