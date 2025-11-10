import { ChatClient } from "@/api/protos/ChatServiceClientPb";
import { tokenStore } from "@/api/tokenStore";
import { OpenOrGetConversationRequest, SendMessageRequest, ListMessagesRequest, SubscribeMessagesRequest } from "@local/chat-protos";

const BASE_URL = import.meta.env.VITE_API_ORIGIN;

export default class ChatApi {
  constructor(baseUrl = BASE_URL) {
    this.client = new ChatClient(baseUrl, null, null);
  }

  meta() {
    const token = tokenStore.get();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  openOrGetConversation({ taskId, ownerUserId, companyUserId, initialMessage }) {
    return new Promise((resolve, reject) => {
      const req = new OpenOrGetConversationRequest();
      req.setTaskId(taskId);
      req.setOwnerUserId(ownerUserId);
      req.setCompanyUserId(companyUserId);
      if (initialMessage) req.setInitialMessage(initialMessage);
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

  sendMessage({ conversationId, senderId, text }) {
    return new Promise((resolve, reject) => {
      const req = new SendMessageRequest();
      req.setConversationId(conversationId);
      req.setSenderId(senderId);
      req.setText(text);
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