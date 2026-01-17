import { apiJson, apiForm } from "@/api/api.js";
import { API } from "@/api/endpoints.js";
import { EncryptMsg } from "../../helpers/crypto";

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

    async getAppliedTasks(query, {ct, timeoutMs} = {}){
        const { method, url } = API.companyWorkTask.getApplied;

        const res = await apiJson(`${url}?${query.toString()}`,
        {
            method: method,
            credentials: "include",
        },
        { ct, timeoutMs });

        return res;
    },

    async getById(id, {ct, timeoutMs} = {}){
        const { method, url } = API.companyWorkTask.getById;

        let query = new URLSearchParams({ id: String(id) });
        const res = await apiJson(`${url}?${query.toString()}`,
        {
            method: method,
            credentials: "include",
        },
        { ct, timeoutMs });

        return res;
    },

    async apply({ workTaskId, msg, publicKey }, { ct, timeoutMs } = {}) {
        const { method, url } = API.companyWorkTask.apply;

        const myPrivateSignKey = localStorage.getItem('SIGN_key');
        const myPublicKey = localStorage.getItem('E2E_key_pub');

        const encrypted = await EncryptMsg(
            msg,
            publicKey,
            myPublicKey, 
            myPrivateSignKey
        );

        const model = {
            workTaskId,
            messageVM: {
            encryptedPayload: encrypted.encryptedPayload,
            keyForRecipient: encrypted.keyForRecipient,
            keyForSender: encrypted.keyForSender,
            iv: encrypted.iv,
            }
        };

        const res = await apiJson(url,
        {
            method: method,
            credentials: "include",
            body: JSON.stringify(model),
        },
        { ct, timeoutMs }
        );

        return res;
    }
};