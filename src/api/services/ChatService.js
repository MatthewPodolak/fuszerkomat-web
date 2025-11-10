import { apiJson } from "@/api/api.js";
import { API } from "@/api/endpoints.js";

export const ChatService = {
    async getChats({ ct, timeoutMs } = {}){
        const { method, url } = API.chat.getChats;

        const res = await apiJson(url,
        {
            method: method,
            credentials: "include",
        },
        { ct, timeoutMs }
        );

        return res;
    },
};