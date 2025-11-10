import cjs from './index.cjs';

export default cjs;

export const {
  OpenOrGetConversationRequest,
  OpenOrGetConversationResponse,
  SendMessageRequest,
  SendMessageResponse,
  ListMessagesRequest,
  ListMessagesResponse,
  SubscribeMessagesRequest,
  Message,
} = cjs;
