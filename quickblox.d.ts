type Dictionary<T> = Record<string, T>;

declare enum QBChatProtocol {
  BOSH = 1,
  WebSockets = 2,
}

interface ICEServer {
  urls: string;
  username: string;
  credential: string;
}

export declare interface QBConfig {
  debug?: boolean | { mode: 1 } | { mode: 2; file: string };
  endpoints?: {
    chat?: string;
    api?: string;
  };
  webrtc?: {
    iceServers?: ICEServer[];
  };
  chatProtocol?: {
    active: QBChatProtocol;
  };
  streamManagement?: {
    enable: boolean;
  };
}

export declare interface QBError {
  code?: number;
  status?: string;
  detail?: string | string[] | Dictionary<string | string[]>;
  message: string | string[] | Dictionary<string | string[]>;
}

interface QBCallback<T> {
  (error: null | undefined, result: T): void;
  (error: QBError, result: null | undefined): void;
}

export declare interface QBUser {
  id: number;
  full_name: string;
  email: string;
  login: string;
  phone: string;
  /** Date ISO string */
  created_at: string;
  /** Date ISO string */
  updated_at: string;
  /** Date ISO string */
  last_request_at: string;
  custom_data: string | null;
  user_tags: string | null;
  password?: string;
  old_password?: string;
}

export declare interface ListUserResponse {
  current_page: number;
  per_page: number;
  total_entries: number;
  items: Array<{ user: QBUser }>;
}

export declare interface QBSession {
  _id: string;
  application_id: number;
  /** Date ISO string */
  created_at: string;
  id: number;
  nonce: string;
  token: string;
  ts: number;
  /** Date ISO string */
  updated_at: string;
  user_id: QBUser["id"];
}

type ChatConnectParams =
  | {
      userId: number;
      /** user's password or session token */
      password: string;
    }
  | {
      jid: string;
      /** user's password or session token */
      password: string;
    }
  | {
      email: string;
      /** user's password or session token */
      password: string;
    };

export declare interface ChatMessageAttachment {
  /** ID of the file on QuickBlox server (UID of file from QB.content.createAndUpload) */
  id: string | number;
  uid?: string;
  /** Type of attachment. Example: audio, video, image or other */
  type: string;
  /** Link to a file in Internet */
  url?: string;
  name?: string;
  size?: number;
  [key: string]: unknown;
}

declare enum QBChatDialogType {
  PUBLIC = 1,
  GROUP = 2,
  PRIVATE = 3,
}

export declare interface QBChatDialog {
  _id: string;
  /** Date ISO string */
  created_at: string;
  data?: { [key: string]: string };
  last_message: string | null;
  /** Date ISO string */
  last_message_date_sent: string | null;
  last_message_id: string | null;
  last_message_user_id: QBUser["id"] | null;
  name: string;
  occupants_ids: number[];
  photo: null;
  type: QBChatDialogType;
  /** Date ISO string */
  updated_at: string;
  user_id: QBUser["id"];
  xmpp_room_jid: string | null;
  unread_messages_count: number | null;
  joined?: boolean;
}

export declare interface QBChatMessage {
  _id: string;
  attachments: ChatMessageAttachment[];
  chat_dialog_id: QBChatDialog["_id"];
  /** Date ISO string */
  created_at: string;
  /** Date timestamp */
  date_sent: number;
  delivered_ids?: Array<QBUser["id"]>;
  message: string | null;
  read_ids?: Array<QBUser["id"]>;
  read: 0 | 1;
  recipient_id: QBUser["id"] | null;
  sender_id: QBUser["id"];
  /** Date ISO string */
  updated_at: string;
}

export declare interface QBMessageStatusParams {
  messageId: QBChatMessage["_id"];
  dialogId: QBChatDialog["_id"];
  userId: QBUser["id"];
}

export declare interface QBChatNewMessage {
  type: "chat" | "groupchat";
  body: string;
  extension: {
    attachments?: ChatMessageAttachment[];
    save_to_history: 0 | 1;
    dialog_id: QBChatDialog["_id"];
  };
  markable: 0 | 1;
}

export declare interface QBChatXMPPMessage {
  id: string;
  dialog_id: QBChatDialog["_id"];
  recipient_id: null;
  type: "chat" | "groupchat";
  body: string;
  delay: null;
  markable: 0 | 1;
  extension: {
    attachments?: ChatMessageAttachment[];
    date_sent: string;
    type?: string;
    user_id?: string;
    profile_id?: string;
    organization_id?: string;
  };
}

export declare interface QBSystemMessage {
  id: string;
  userId: QBUser["id"];
  body?: null | string;
  extension?: Dictionary<string>;
}

export declare interface QBGetDialogResult {
  items: QBChatDialog[];
  limit: number;
  skip: number;
  total_entries: number;
}

export declare type GetMessagesResult = {
  items: QBChatMessage[];
  limit: number;
  skip: number;
};

interface QBChatModule {
  dialog: {
    create(
      params: Dictionary<unknown>,
      callback: QBCallback<QBChatDialog>
    ): void;
    list(
      params: Dictionary<unknown>,
      callback: QBCallback<QBGetDialogResult>
    ): void;
    update(
      id: string,
      data: Dictionary<unknown>,
      callback: QBCallback<QBChatDialog>
    ): void;
  };
  message: {
    list(
      params: Dictionary<unknown>,
      callback: QBCallback<GetMessagesResult>
    ): void;
  };
  isConnected: boolean;
  send<T extends QBChatNewMessage>(
    jidOrUserId: QBUser["id"] | string,
    message: T
  ): string;
  sendSystemMessage(
    jidOrUserId: QBUser["id"] | string,
    message: { extension: QBSystemMessage["extension"] }
  ): string;
  sendDeliveredStatus(params: QBMessageStatusParams): void;
  sendReadStatus(params: QBMessageStatusParams): void;
  sendIsTypingStatus(jidOrUserId: QBUser["id"] | string): void;
  sendIsStopTypingStatus(jidOrUserId: QBUser["id"] | string): void;
  connect: (params: ChatConnectParams, callback: QBCallback<unknown>) => void;
  disconnect: () => void;
  ping(jidOrUserId: string | number, callback: QBCallback<unknown>): void;
  ping(callback: QBCallback<unknown>): void;
  muc: {
    join(dialogJid: string, callback: QBCallback<unknown>): void;
    leave(dialogJid: string, callback: QBCallback<unknown>): void;
  };
  helpers: {
    getDialogJid(dialogId: QBChatDialog["_id"]): string;
    getDialogIdFromNode(jid: string): QBChatDialog["_id"];
    getUserCurrentJid(): string;
    getUserJid(userId: QBUser["id"], appId?: string | number): string;
    getRoomJidFromDialogId(dialogId: QBChatDialog["_id"]): string;
  };
  onMessageListener?: (
    senderId: QBUser["id"],
    message: QBChatXMPPMessage
  ) => void;
  onMessageErrorListener?: (messageId: string, error: unknown) => void;
  onMessageTypingListener?: (
    isTyping: boolean,
    userId: QBUser["id"],
    dialogId: QBChatDialog["_id"]
  ) => void;
  onDeliveredStatusListener?: (
    messageId: string,
    dialogId: QBChatDialog["_id"],
    userId: QBUser["id"]
  ) => void;
  onReadStatusListener?: (
    messageId: string,
    dialogId: QBChatDialog["_id"],
    userId: QBUser["id"]
  ) => void;
  onSystemMessageListener?: (message: QBSystemMessage) => void;
  onReconnectFailedListener?: (error: unknown) => void;
  onDisconnectedListener?: VoidFunction;
  onReconnectListener?: VoidFunction;
}

export declare interface QBContentObject {
  account_id: number;
  app_id: number;
  content_type: string;
  created_at: string;
  id: number;
  name: string;
  public: boolean;
  size: number;
  uid: string;
  updated_at: string;
}

interface QBAccess {
  access: "open" | "owner" | "open_for_users_ids" | "open_for_groups";
  users_ids: string[];
}

interface QBPermissions {
  create: QBAccess;
  read: QBAccess;
  update: QBAccess;
  delete: QBAccess;
}

export declare interface QBCustomObject {
  /**
   * ID of the record
   * Generated automatically by the server after record creation
   */
  _id: string;
  /** ID of the user who created the record */
  user_id: QBUser["id"];
  /** ID of parent object (Relations) */
  _parent_id: string | null;
  /** Date & time when a record was created, filled automatically */
  created_at: number;
  /** Date & time when record was updated, filled automatically */
  updated_at: number;
  permissions: QBPermissions;
}

export declare interface QBDataFile {
  content_type: string;
  file_id: string;
  name: string;
  size: number;
}

export declare interface BlobObject extends QBContentObject {
  blob_object_access: { params: string };
  blob_status: unknown;
  set_completed_at: unknown;
}

interface QBContentModule {
  privateUrl(fileUID: string): string;
  publicUrl(fileUID: string): string;
  getInfo(id: number, callback: QBCallback<{ blob: QBContentObject }>);
  create(
    params: { name: string; content_type: string; public?: boolean },
    callback: QBCallback<BlobObject>
  );
  markUploaded(
    params: { id: number; size: number },
    callback: QBCallback<unknown>
  );
  delete(id: number, callback: QBCallback<unknown>);
  createAndUpload(
    params: {
      name: string;
      file: Buffer;
      type: string;
      size: number;
      public?: boolean;
    },
    callback: QBCallback<QBContentObject>
  );
}

export declare interface QBDataDeletedResponse {
  deleted: Array<QBCustomObject["_id"]>;
  deletedCount: number;
}

interface QBDataModule {
  create<T extends QBCustomObject>(
    className: string,
    data: Dictionary<unknown>,
    callback: QBCallback<T>
  ): void;
  delete<T extends QBCustomObject["_id"] | Array<QBCustomObject["_id"]>>(
    className: string,
    ids: T,
    callback: QBCallback<QBDataDeletedResponse>
  ): void;
  list<T extends QBCustomObject>(
    className: string,
    filters: Dictionary<unknown>,
    callback: QBCallback<{
      class_name: string;
      items: T[];
      limit: number;
      skip: number;
    }>
  ): void;
  update<
    T extends QBCustomObject
  >(
    className: string,
    data: { _id: string } & Dictionary<unknown>,
    callback: QBCallback<T>
  ): void;
  fileUrl(
    className: string,
    params: { id: string; field_name: string }
  ): string;
  uploadFile(
    className: string,
    params: { id: string; field_name: string; file: File; name: string },
    callback: QBCallback<QBDataFile>
  ): void;
  deleteFile(
    className: string,
    params: { id: string; field_name: string },
    callback: QBCallback<unknown>
  );
}

export declare interface QBCreateUserWithLogin {
  login: string;
  password: string;
  blob_id?: number;
  custom_data?: string | null;
  email?: string;
  external_user_id?: string | number;
  facebook_id?: string;
  full_name?: string;
  phone?: string;
  tag_list?: string | string[];
  website?: string;
}

export declare interface QBCreateUserWithEmail {
  email: string;
  password: string;
  blob_id?: number;
  custom_data?: string | null;
  external_user_id?: string | number;
  facebook_id?: string;
  full_name?: string;
  login?: string;
  phone?: string;
  tag_list?: string | string[];
  website?: string;
}

export declare type GetUserParam =
  | { login: string }
  | { full_name: string }
  | { facebook_id: string }
  | { phone: string }
  | { email: string }
  | { tags: string }
  | { external: string };

export declare type GetUserParams =
  | GetUserParam
  | {
      page?: number;
      per_page?: number;
    };

export declare type ListUserParams = {
  page?: number;
  per_page?: number;
  filter?: Dictionary<unknown>;
  order?: string;
};

interface QBUsersModule {
  get(params: number, callback: QBCallback<QBUser>): void;
  get(params: GetUserParams, callback: QBCallback<ListUserResponse>): void;
  listUsers(
    params: ListUserParams,
    callback: QBCallback<ListUserResponse>
  ): void;
  create<T = QBCreateUserWithLogin | QBCreateUserWithEmail>(
    params: T,
    callback: QBCallback<QBUser>
  ): void;
  delete(userId: number, callback: QBCallback<unknown>): void;
  update(
    userId: number,
    user: Partial<Omit<QBUser, "id">>,
    callback: QBCallback<QBUser>
  ): void;
}

export declare interface QBGetUserMediaParams {
  audio: MediaStreamConstraints["audio"];
  video: MediaStreamConstraints["video"];
  /** Id attribute of HTMLVideoElement */
  elemId?: string;
  options?: {
    muted?: boolean;
    mirror?: boolean;
  };
}

export declare interface QBWebRTCSession {
  State: {
    NEW: 1;
    ACTIVE: 2;
    HUNGUP: 3;
    REJECTED: 4;
    CLOSED: 5;
  };
  ID: string;
  /**
   * One of {@link QBWebRTCSession#State}
   */
  state: number;
  initiatorID: number;
  opponentsIDs: number[];
  peerConnections: { [userId: number]: RTCPeerConnection };
  callType: 1 | 2;
  startCallTime?: Date;
  localStream?: MediaStream;
  mediaParams: QBGetUserMediaParams | null;
  getUserMedia(
    params: QBGetUserMediaParams,
    callback: QBCallback<MediaStream>
  ): void;
  /** Attach media stream to audio/video element */
  attachMediaStream(
    videoElemId: string,
    stream: MediaStream,
    options?: QBGetUserMediaParams["options"]
  ): void;
  /** Detach media stream from audio/video element */
  detachMediaStream(videoElemId: string): void;
  mute(type: "audio" | "video"): void;
  unmute(type: "audio" | "video"): void;
  /** Innitiate a call */
  call(params: Dictionary<unknown>): void;
  /** Accept call */
  accept(params: Dictionary<unknown>): void;
  /** Reject call */
  reject(params: Dictionary<unknown>): void;
  /** Stop call (Hang up) */
  stop(params: Dictionary<unknown>): void;
  switchMediaTracks(
    deviceIds: { audio?: { exact: string }; video?: { exact: string } },
    callback: QBCallback<MediaStream>
  ): void;
  /** Add tracks from provided stream to local stream (and replace in peers) */
  _replaceTracks(stream: MediaStream): void;
}

export declare interface QBWebRTCModule {
  CallType: {
    VIDEO: 1;
    AUDIO: 2;
  };
  getMediaDevices(kind?: MediaDeviceKind): Promise<MediaDeviceInfo[]>;
  createNewSession(opponentsIds: number[], callType: 1 | 2): QBWebRTCSession;
  onAcceptCallListener?: (
    session: QBWebRTCSession,
    userId: number,
    userInfo: Dictionary<unknown>
  ) => void;
  onCallListener?: (
    session: QBWebRTCSession,
    userInfo: Dictionary<unknown>
  ) => void;
  onCallStatsReport?: (
    session: QBWebRTCSession,
    userId: number,
    stats: string[]
  ) => void;
  onRejectCallListener?: (
    session: QBWebRTCSession,
    userId: number,
    userInfo: Dictionary<unknown>
  ) => void;
  onRemoteStreamListener?: (
    sesion: QBWebRTCSession,
    userId: number,
    stream: MediaStream
  ) => void;
  onSessionCloseListener?: (session: QBWebRTCSession) => void;
  onSessionConnectionStateChangedListener?: (
    sesion: QBWebRTCSession,
    userId: number,
    state: unknown
  ) => void;
  onStopCallListener?: (
    session: QBWebRTCSession,
    userId: number,
    userInfo: Dictionary<unknown>
  ) => void;
  onUpdateCallListener?: (
    session: QBWebRTCSession,
    userId: number,
    userInfo: Dictionary<unknown>
  ) => void;
  onUserNotAnswerListener?: (session: QBWebRTCSession, userId: number) => void;
  onReconnectListener?: (session: QBWebRTCSession, userId: number, state: unknown) => void;
}

export declare type QBLoginParams =
  | {
      login: string;
      password: string;
    }
  | {
      email: string;
      password: string;
    }
  | {
      provider: "firebase_phone";
      firebase_phone: { access_token: string; project_id: string };
    };

export class QuickBlox {
  buildNumber: string;

  chat: QBChatModule;

  content: QBContentModule;

  data: QBDataModule;

  createSession: {
    (callback: QBCallback<QBSession>): void;
    (params: QBLoginParams, callback: QBCallback<QBSession>): void;
  };

  startSessionWithToken(
    token: string,
    callback: QBCallback<{ session: QBSession }>
  );

  destroySession(callback: QBCallback<unknown>): void;

  getSession(callback: QBCallback<{ session: QBSession }>): void;

  init(
    appIdOrToken: string | number,
    authKeyOrAppId: string | number,
    authSecret: string | null | undefined,
    accountKey: string,
    config?: QBConfig
  ): void;

  initWithAppId(appId: number, accountKey: string, config?: QBConfig):void;

  login(params: QBLoginParams, callback: QBCallback<QBUser>): void;

  logout(callback: QBCallback<unknown>): void;

  service: {
    qbInst: {
      session: QBSession | null;
      config: {
        webrtc: {
          answerTimeInterval: number;
        };
        endpoints: {
          api: string;
        };
        urls: {
          blobs: string;
          type: string;
          data: string;
        };
      };
    };
  };

  users: QBUsersModule;

  webrtc: QBWebRTCModule;

  version: string;
}

interface QuickBloxConstructor {
  prototype: QuickBlox;
  new (): QuickBlox;
}

interface QB extends QuickBlox {
  QuickBlox: QuickBloxConstructor;
}

declare const SDK: QB;

export default SDK;
