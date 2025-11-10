import * as jspb from 'google-protobuf'



export class OpenOrGetConversationRequest extends jspb.Message {
  getTaskId(): number;
  setTaskId(value: number): OpenOrGetConversationRequest;

  getOwnerUserId(): string;
  setOwnerUserId(value: string): OpenOrGetConversationRequest;

  getCompanyUserId(): string;
  setCompanyUserId(value: string): OpenOrGetConversationRequest;

  getInitialMessage(): string;
  setInitialMessage(value: string): OpenOrGetConversationRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): OpenOrGetConversationRequest.AsObject;
  static toObject(includeInstance: boolean, msg: OpenOrGetConversationRequest): OpenOrGetConversationRequest.AsObject;
  static serializeBinaryToWriter(message: OpenOrGetConversationRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): OpenOrGetConversationRequest;
  static deserializeBinaryFromReader(message: OpenOrGetConversationRequest, reader: jspb.BinaryReader): OpenOrGetConversationRequest;
}

export namespace OpenOrGetConversationRequest {
  export type AsObject = {
    taskId: number;
    ownerUserId: string;
    companyUserId: string;
    initialMessage: string;
  };
}

export class OpenOrGetConversationResponse extends jspb.Message {
  getConversationId(): string;
  setConversationId(value: string): OpenOrGetConversationResponse;

  getCreated(): boolean;
  setCreated(value: boolean): OpenOrGetConversationResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): OpenOrGetConversationResponse.AsObject;
  static toObject(includeInstance: boolean, msg: OpenOrGetConversationResponse): OpenOrGetConversationResponse.AsObject;
  static serializeBinaryToWriter(message: OpenOrGetConversationResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): OpenOrGetConversationResponse;
  static deserializeBinaryFromReader(message: OpenOrGetConversationResponse, reader: jspb.BinaryReader): OpenOrGetConversationResponse;
}

export namespace OpenOrGetConversationResponse {
  export type AsObject = {
    conversationId: string;
    created: boolean;
  };
}

export class SendMessageRequest extends jspb.Message {
  getConversationId(): string;
  setConversationId(value: string): SendMessageRequest;

  getSenderId(): string;
  setSenderId(value: string): SendMessageRequest;

  getText(): string;
  setText(value: string): SendMessageRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SendMessageRequest.AsObject;
  static toObject(includeInstance: boolean, msg: SendMessageRequest): SendMessageRequest.AsObject;
  static serializeBinaryToWriter(message: SendMessageRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SendMessageRequest;
  static deserializeBinaryFromReader(message: SendMessageRequest, reader: jspb.BinaryReader): SendMessageRequest;
}

export namespace SendMessageRequest {
  export type AsObject = {
    conversationId: string;
    senderId: string;
    text: string;
  };
}

export class SendMessageResponse extends jspb.Message {
  getMessageId(): string;
  setMessageId(value: string): SendMessageResponse;

  getCreatedAt(): string;
  setCreatedAt(value: string): SendMessageResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SendMessageResponse.AsObject;
  static toObject(includeInstance: boolean, msg: SendMessageResponse): SendMessageResponse.AsObject;
  static serializeBinaryToWriter(message: SendMessageResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SendMessageResponse;
  static deserializeBinaryFromReader(message: SendMessageResponse, reader: jspb.BinaryReader): SendMessageResponse;
}

export namespace SendMessageResponse {
  export type AsObject = {
    messageId: string;
    createdAt: string;
  };
}

export class ListMessagesRequest extends jspb.Message {
  getConversationId(): string;
  setConversationId(value: string): ListMessagesRequest;

  getPage(): number;
  setPage(value: number): ListMessagesRequest;

  getPageSize(): number;
  setPageSize(value: number): ListMessagesRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListMessagesRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListMessagesRequest): ListMessagesRequest.AsObject;
  static serializeBinaryToWriter(message: ListMessagesRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListMessagesRequest;
  static deserializeBinaryFromReader(message: ListMessagesRequest, reader: jspb.BinaryReader): ListMessagesRequest;
}

export namespace ListMessagesRequest {
  export type AsObject = {
    conversationId: string;
    page: number;
    pageSize: number;
  };
}

export class Message extends jspb.Message {
  getMessageId(): string;
  setMessageId(value: string): Message;

  getSenderId(): string;
  setSenderId(value: string): Message;

  getText(): string;
  setText(value: string): Message;

  getCreatedAt(): string;
  setCreatedAt(value: string): Message;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Message.AsObject;
  static toObject(includeInstance: boolean, msg: Message): Message.AsObject;
  static serializeBinaryToWriter(message: Message, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Message;
  static deserializeBinaryFromReader(message: Message, reader: jspb.BinaryReader): Message;
}

export namespace Message {
  export type AsObject = {
    messageId: string;
    senderId: string;
    text: string;
    createdAt: string;
  };
}

export class ListMessagesResponse extends jspb.Message {
  getItemsList(): Array<Message>;
  setItemsList(value: Array<Message>): ListMessagesResponse;
  clearItemsList(): ListMessagesResponse;
  addItems(value?: Message, index?: number): Message;

  getPage(): number;
  setPage(value: number): ListMessagesResponse;

  getPageSize(): number;
  setPageSize(value: number): ListMessagesResponse;

  getTotal(): number;
  setTotal(value: number): ListMessagesResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListMessagesResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListMessagesResponse): ListMessagesResponse.AsObject;
  static serializeBinaryToWriter(message: ListMessagesResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListMessagesResponse;
  static deserializeBinaryFromReader(message: ListMessagesResponse, reader: jspb.BinaryReader): ListMessagesResponse;
}

export namespace ListMessagesResponse {
  export type AsObject = {
    itemsList: Array<Message.AsObject>;
    page: number;
    pageSize: number;
    total: number;
  };
}

export class SubscribeMessagesRequest extends jspb.Message {
  getConversationId(): string;
  setConversationId(value: string): SubscribeMessagesRequest;

  getSince(): string;
  setSince(value: string): SubscribeMessagesRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SubscribeMessagesRequest.AsObject;
  static toObject(includeInstance: boolean, msg: SubscribeMessagesRequest): SubscribeMessagesRequest.AsObject;
  static serializeBinaryToWriter(message: SubscribeMessagesRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SubscribeMessagesRequest;
  static deserializeBinaryFromReader(message: SubscribeMessagesRequest, reader: jspb.BinaryReader): SubscribeMessagesRequest;
}

export namespace SubscribeMessagesRequest {
  export type AsObject = {
    conversationId: string;
    since: string;
  };
}

