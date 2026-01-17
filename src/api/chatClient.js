import { ChatClient } from "@/api/protos/ChatServiceClientPb";
import { tokenStore } from "@/api/tokenStore";
import { OpenOrGetConversationRequest, SendMessageRequest, ListMessagesRequest, SubscribeMessagesRequest } from "@local/chat-protos";
import { EncryptMsg, DecryptMsg, CheckSignature } from "@/helpers/crypto";

const BASE_URL = import.meta.env.VITE_API_ORIGIN;

export default class ChatApi {
  constructor(baseUrl = BASE_URL) {
    this.client = new ChatClient(baseUrl, null, null);
  }

  meta() {
    const token = tokenStore.get();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async openOrGetConversation({ taskId, ownerUserId, companyUserId, initialMessage, recipientPublicKey }) {
    const req = new OpenOrGetConversationRequest();
    req.setTaskId(taskId);
    req.setOwnerUserId(ownerUserId);
    req.setCompanyUserId(companyUserId);

    if (initialMessage && recipientPublicKey) {
      const myPublicKey = localStorage.getItem('E2E_key_pub');
      const myPrivateSignKey = localStorage.getItem('SIGN_key');
      
      const encrypted = await EncryptMsg(initialMessage, recipientPublicKey, myPublicKey, myPrivateSignKey);
      
      req.setInitialEncryptedPayload(encrypted.encryptedPayload);
      req.setInitialKeyForRecipient(encrypted.keyForRecipient);
      req.setInitialKeyForSender(encrypted.keyForSender);
      req.setInitialIv(encrypted.iv);
    }

    return new Promise((resolve, reject) => {
      this.client.openOrGetConversation(req, this.meta(), (err, resp) => (err ? reject(err) : resolve(resp)));
    });
  }

  listMessages({ conversationId, page = 1, pageSize = 50 }) {
    return new Promise((resolve, reject) => {
      const req = new ListMessagesRequest();
      req.setConversationId(conversationId);
      req.setPage(page);
      req.setPageSize(pageSize);
      this.client.listMessages(req, this.meta(), (err, resp) => (err ? reject(err) : resolve(resp)));
    });
  }

  async sendMessage({ conversationId, senderId, text, recipientPublicKey }) {
    const myPublicKey = localStorage.getItem('E2E_key_pub');
    const myPrivateSignKey = localStorage.getItem('SIGN_key');

    const encrypted = await EncryptMsg(text, recipientPublicKey, myPublicKey, myPrivateSignKey);

    const req = new SendMessageRequest();
    req.setConversationId(conversationId);
    req.setSenderId(senderId);
    req.setEncryptedPayload(encrypted.encryptedPayload);
    req.setKeyForRecipient(encrypted.keyForRecipient);
    req.setKeyForSender(encrypted.keyForSender);
    req.setIv(encrypted.iv);

    return new Promise((resolve, reject) => {
      this.client.sendMessage(req, this.meta(), (err, resp) => (err ? reject(err) : resolve(resp)));
    });
  }

  subscribeMessages({ conversationId, sinceIso, onData, onError, onEnd }) {
    const req = new SubscribeMessagesRequest();
    req.setConversationId(conversationId);
    if (sinceIso) req.setSince(sinceIso);

    const stream = this.client.subscribeMessages(req, this.meta());
    stream.on("data", (msg) => onData?.(msg));
    stream.on("error", (e) => onError?.(e));
    stream.on("end", () => onEnd?.());

    return () => stream.cancel();
  }
}

export async function decryptMessage(protoMsg, myUserId, senderPublicSignKey) {
  const m = protoMsg.toObject();

  const myPrivateKey = localStorage.getItem('E2E_key');
  
  const encryptedAesKey = m.senderId === myUserId 
    ? m.keyForSender 
    : m.keyForRecipient;

  try {
    const { msg, signature } = await DecryptMsg(
      m.encryptedPayload,
      encryptedAesKey,
      m.iv,
      myPrivateKey
    );

    let verified = false;
    if (senderPublicSignKey) {
      verified = await CheckSignature(msg, signature, senderPublicSignKey);
    }

    return {
      id: m.messageId,
      from: m.senderId,
      text: msg,
      ts: m.createdAt,
      verified,
    };
  } catch (e) {
    console.error("Decrypt failed:", e);
    return {
      id: m.messageId,
      from: m.senderId,
      text: "[nie można odszyfrować]",
      ts: m.createdAt,
      verified: false,
      error: true,
    };
  }
}