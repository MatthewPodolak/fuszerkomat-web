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
};