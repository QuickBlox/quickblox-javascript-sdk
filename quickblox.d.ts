type Dictionary<T> = Record<string, T>

type RequiredProps<T, K extends keyof T> = T & Required<Pick<T, K>>

export declare interface QBUser {
  /** ID of the user. Generated automatically by the server after user creation. */
  id: number
  /** User's full name. */
  full_name: string
  /** User's email. */
  email: string
  /** User's login. */
  login: string
  /** User's phone number. */
  phone: string
  /** User's website url. */
  website: string | null
  /** Date & time when record was created, filled automatically. */
  created_at: string
  /** Date & time when record was created, filled automatically. */
  updated_at: string
  /** Date & time when a user sent the last request, filled automatically. */
  last_request_at: string
  /** ID of the user in the external system. */
  external_user_id: number | null
  /** ID of the user's Facebook account. */
  facebook_id: string | null
  /** ID of the file/blob. Generated automatically by the server after file/blob creation. */
  blob_id: number | null
  /** User's additional info. */
  custom_data: string | null
  /** User's tags. Comma separated array of tags. */
  user_tags: string | null
  /** @deprecated Marketing info. */
  allow_sales_activities: boolean | null
  /** @deprecated Marketing info. */
  allow_statistics_analysis: boolean | null
  /** @deprecated GDPR info. */
  age_over16: boolean | null
  /** @deprecated GDPR info. */
  parents_contacts: string | null
}

export declare interface QBSession {
  /** ID of the session. Generated automatically by the server after session creation. */
  id: number
  /** ID of the user's application. */
  application_id: number
  /** ID of the session's owner. */
  user_id: QBUser['id']
  /** Date & time when a record was created, filled automatically. */
  created_at: string
  /** Date & time when a record was created, filled automatically. */
  updated_at: string
  /** Unique Random Value. Parameter from a session creating request is used. */
  nonce: string
  /** Session identifier. Each API request should contain this parameter in QB-Token header. */
  token: string
  /** Unix Timestamp. Parameter from session creating request is used. */
  ts: number
  /**
   * ID of the session. Generated automatically by the server after session creation.
   * Date & time when a record was updated, filled automatically.
   */
  _id: string
}

declare enum QBChatProtocol {
  BOSH = 1,
  WebSockets = 2,
}

interface ICEServer {
  urls: string
  username: string
  credential: string
}

export declare interface QBConfig {
  /** [Custom endpoints](https://docs.quickblox.com/docs/js-setup#section-custom-endpoints) configuration. */
  endpoints?: {
    /** API endpoint. */
    api?: string
    /** Chat endpoint. */
    chat?: string
  }
  /** [WebRTC](https://docs.quickblox.com/docs/js-video-calling-advanced#section-video-calling-settings) configuration. */
  webrtc?: {
    /**
     * Maximum answer time for the QB.webrtc.onUserNotAnswerListener callback to be fired.
     * The answer time interval shows how much time an opponent has to answer your call.
     */
    answerTimeInterval?: number
    /**
     * If there is at least one active (recurring) call session and the autoReject is true,
     * the call gets rejected.
     */
    autoReject?: boolean
    /**
     * If the number of active (recurring) call sessions
     * is more than it is defined by incomingLimit, the call gets rejected.
     */
    incomingLimit?: number
    /**
     * The interval between call requests produced by the session.call() method.
     * Dialing time interval indicates how often to notify your opponents about your call.
     */
    dialingTimeInterval?: number
    /**
     * If an opponent has lost the connection then, after this time,
     * the caller will know about it via the QB.webrtc.onSessionConnectionStateChangedListener callback.
     */
    disconnectTimeInterval?: number
    /**
     * Allows access to the statistical information about peer connection state (connected, failed, disconnected, etc).
     * Set the number of seconds for the statistical information to be received.
     */
    statsReportTimeInterval?: boolean
    /**
     * You can customize a list of ICE servers. By default,
     * WebRTC module will use internal ICE servers that are usually enough,
     * but you can always set your own.
     */
    iceServers?: ICEServer[]
  }
  /** Chat protocol configuration. */
  chatProtocol?: {
    /** Set 1 to use BOSH, set 2 to use WebSockets. Default: WebSocket. */
    active: QBChatProtocol
  }
  /** [Stream management](https://docs.quickblox.com/docs/js-setup#section-stream-management) configuration. */
  streamManagement?: {
    enable: boolean
  }
  /** [Debug mode](https://docs.quickblox.com/docs/js-setup#enable-logging) configuration. */
  debug?: boolean | { mode: 1 } | { mode: 2; file: string }
  on?: {
    sessionExpired?: (
      response: any,
      retry: (session: QBSession) => void,
    ) => void
  }
  pingTimeout?: number
  pingLocalhostTimeInterval?: number
  chatReconnectionTimeInterval?: number
}

export declare interface QBError {
  code?: number
  status?: string
  detail?: string | string[] | Dictionary<string | string[]>
  message: string | string[] | Dictionary<string | string[]>
}

interface QBCallback<T> {
  (error: null | undefined, result: T): void
  (error: QBError, result: null | undefined): void
}

export declare interface QBUserCreate
  extends Partial<
    Omit<
      QBUser,
      'id' | 'created_at' | 'updated_at' | 'last_request_at' | 'user_tags'
    >
  > {
  /** User's password. */
  password: string
  /** User's tags. */
  tag_list?: string | string[]
}

export declare type QBUserCreateByEmailParams = RequiredProps<
  QBUserCreate,
  'email'
>

export declare type QBUserCreateByPhoneParams = RequiredProps<
  QBUserCreate,
  'phone'
>

export declare type QBUserCreateByLoginParams = RequiredProps<
  QBUserCreate,
  'login'
>

export declare type QBUserCreateParams =
  | QBUserCreateByEmailParams
  | QBUserCreateByPhoneParams
  | QBUserCreateByLoginParams

export declare interface QBUserUpdate
  extends Partial<
    Omit<
      QBUser,
      'id' | 'created_at' | 'updated_at' | 'last_request_at' | 'user_tags'
    >
  > {
  /** User's new password. */
  password?: string
  /** User's old password. */
  old_password?: string
  /** User's tags. */
  tag_list?: string | string[]
}

export declare interface ListUserResponse {
  current_page: number
  per_page: number
  total_entries: number
  items: Array<{ user: QBUser }>
}

export declare type ChatConnectParams =
  | {
      /** Connect to the chat by user id */
      userId: QBUser['id']
      /** The user's password or session token */
      password: string
    }
  | {
      /** Connect to the chat by user jid */
      jid: string
      /** The user's password or session token */
      password: string
    }
  | {
      /** Connect to the chat by user's email */
      email: string
      /** The user's password or session token */
      password: string
    }

export declare type QBCustomField =
  | string
  | string[]
  | number
  | number[]
  | boolean
  | boolean[]
  | null
  | undefined

export declare interface ChatMessageAttachment {
  /** ID of the file on QuickBlox server. */
  id: string | number
  /** Type of attachment. Example: `audio`, `video`, `image` or other */
  type: string
  /** Link to a file in Internet. */
  url?: string
  /** UID of file from `QB.content.createAndUpload` */
  uid?: string
  /** Name of attachment. */
  name?: string
  /** Size of attachment. */
  size?: number
  [key: string]: QBCustomField
}

declare enum QBChatDialogType {
  PUBLIC_GROUP = 1,
  GROUP = 2,
  PRIVATE = 3,
}

export declare interface QBChatDialog {
  /** ID of the dialog. Generated automatically by the server after dialog creation. */
  _id: string
  /** ID of dialog's owner. */
  user_id: QBUser['id']
  /** Date & time when a record was created, filled automatically. */
  created_at: string
  /** Date & time when a record was created, filled automatically. */
  updated_at: string
  /**
   * Type of dialog. Possible values are:
   * - type=1 (`PUBLIC_GROUP`)
   * - type=2 (`GROUP`)
   * - type=3 (`PRIVATE`)
   */
  type: QBChatDialogType
  /**
   * Name of a group chat. Makes sense if type=1 (`PUBLIC_GROUP`) or type=2 (`GROUP`).
   * The maximum length for the dialog name is 200 symbols.
   */
  name: string
  /**
   * Photo of a group chat. Makes sense if type=1 (`PUBLIC_GROUP`) or type=2 (`GROUP`).
   * Can contain a link to a file in Content module, Custom Objects module or just a web link.
   */
  photo: null | string
  /**
   * JID of XMPP room for group chat to connect. Nil if type=3 (PRIVATE).
   * Generated automatically by the server after dialog creation.
   */
  xmpp_room_jid: string | null
  /** Array of users' IDs - dialog occupants. Does not make sense if type=1 (PUBLIC_GROUP). */
  occupants_ids: number[]
  /** Last sent message in this dialog. */
  last_message: string | null
  /** Timestamp of last sent message in this dialog. */
  last_message_date_sent: number | null
  /** ID of the user who sent last message in this dialog. */
  last_message_user_id: QBUser['id'] | null
  /** ID of last message in this dialog. */
  last_message_id: string | null
  /** Number of unread messages in this dialog for a current user. */
  unread_messages_count: number | null
  /**
   * - Information about class and fields in Custom Objects.
   * - Any dialog can be extended using Custom Objects to store additional parameters.
   */
  data?: {
    /** Class name in Custom Objects. */
    class_name: string
    /** Field name of class in Custom Objects. Can be many: 1..N. */
    [field_name_N: string]: QBCustomField
  }
}

export declare interface QBChatMessage {
  /** ID of the message. Generated automatically by the server after message creation. */
  _id: string
  /** Date & time when a record was created, filled automatically. */
  created_at: string
  /** Date & time when a record was created, filled automatically. */
  updated_at: string
  /** ID of dialog to which current message is connected. Generated automatically by the server after message creation. */
  chat_dialog_id: QBChatDialog['_id']
  /** Message body. */
  message: string | null
  /** Message date sent. */
  date_sent: number
  /** Message sender ID. */
  sender_id: QBUser['id']
  /** Message recipient ID. */
  recipient_id: QBUser['id'] | null
  /**
   * @deprecated
   * Read message status. Diplayed as read=1 after retiriving by the opponent.
   * Works only for type=3 (`PRIVATE`) dialog.
   * Remains as read=0 after retiriving for type=2 (`GROUP`) and type=1 (`PUBLIC_GROUP`) dialogs.
   * */
  read: 0 | 1
  /** Array of users' IDs who read messages. Works only for type=2 (GROUP) dialog. */
  read_ids: Array<QBUser['id']>
  /** Array of users' IDs who received the messages. */
  delivered_ids: Array<QBUser['id']>
  /**
   * Each attachment object contains 3 required keys:
   * - `id` - link to file ID in QuickBlox,
   * - `type` - audio/video/image,
   * - `url` - link to file in Internet.
   */
  attachments: ChatMessageAttachment[]
  /**
   * Name of the custom field.
   * Chat message can be extended with additional fields and contain any other user key-value custom parameters.
   * Can be many 1..N.
   */
  [custom_field_N: string]: any
}

export declare interface QBMessageStatusParams {
  /** ID of the message. */
  messageId: QBChatMessage['_id']
  /** ID of the dialog. */
  dialogId: QBChatDialog['_id']
  /** ID of the user. */
  userId: QBUser['id']
}

export declare interface QBChatNewMessage {
    type: 'chat' | 'groupchat'
    body?: string
    extension: {
        attachments?: ChatMessageAttachment[]
        save_to_history: 0 | 1
        dialog_id: QBChatDialog['_id']
        [custom_field_N: string]: any
    }
    markable: 0 | 1
}

export declare interface QBChatXMPPMessage {
    id: string
    dialog_id: QBChatDialog['_id']
    recipient_id: QBUser['id'] | null
    type: 'chat' | 'groupchat'
    body: string | null
    delay: null
    markable: 0 | 1
    extension: {
        dialog_id: QBChatDialog['_id']
        message_id: QBChatMessage['_id']
        date_sent: string
        save_to_history: string
        attachments?: ChatMessageAttachment[]
        [custom_field_N: string]: string | ChatMessageAttachment[]
    }
}

export declare interface QBSystemMessage {
  id: string
  userId: QBUser['id']
  body?: null | string
  extension?: Dictionary<any>
}

export declare interface QBGetDialogResult {
  items: QBChatDialog[]
  limit: number
  skip: number
  total_entries: number
}

export declare type GetMessagesResult = {
  items: QBChatMessage[]
  limit: number
  skip: number
}
export class AIRole {
    public static readonly user = "user";
    public static readonly assistant = "assistant"
}

export interface AIChatMessage {
    role: AIRole;
    message: string;
}

export interface AIAnswerResponse {
    answer: string;
}

export declare type AIChatHistory = AIChatMessage[] | null | undefined;

interface QBAIModule{
    //QB.ai.answerAssist
    answerAssist(smartChatAssistantId: string,
                 message: string,
                 history :AIChatHistory,
                 callback: QBCallback<AIAnswerResponse>): void
    //QB.ai.translate
    translate(smartChatAssistantId: string,
                 message: string,
                 languageCode: string,
                 callback: QBCallback<AIAnswerResponse>): void

}

interface QBChatModule {
  isConnected: boolean
  /**
   * Connect to the Chat
   * ([read more](https://docs.quickblox.com/docs/js-chat-connection#connect-to-chat-server-with-quickblox-session-token))
   */
  connect(params: ChatConnectParams, callback: QBCallback<any>): void
  reconnect(): void
  /** Disconnect from the Chat ([read more](https://docs.quickblox.com/docs/js-chat-connection#disconnect-from-chat-server)). */
  disconnect(): void
  /**
   * Send query to get last user activity by `QB.chat.onLastUserActivityListener(userId, seconds)`
   * ([read more](https://xmpp.org/extensions/xep-0012.html)).
   */
  getLastUserActivity(jidOrUserId: QBUser['id'] | string): void
  /** Receive confirm request ([read more](https://docs.quickblox.com/docs/js-chat-contact-list#confirm-the-contact-request)). */
  onConfirmSubscribeListener?: (userId: QBUser['id']) => void
  /** Receive user status (online/offline)([read more](https://docs.quickblox.com/docs/js-chat-contact-list#contact-list-updates)). */
  onContactListListener?: (userId: QBUser['id'], type: string) => void
  /** Receive delivery confirmations ([read more](https://docs.quickblox.com/docs/js-chat-messaging#mark-message-as-delivered)). */
  onDeliveredStatusListener?: (
    messageId: string,
    dialogId: QBChatDialog['_id'],
    userId: QBUser['id'],
  ) => void
  /** Run after disconnect from chat. */
  onDisconnectedListener?: () => void
  /** You will receive this callback when some user joined group chat dialog you are in. */
  onJoinOccupant?: (dialogId: QBChatDialog['_id'], userId: QBUser['id']) => void
  /**
   * You will receive this callback when you are in group chat dialog(joined)
   * and other user (chat dialog's creator) removed you from occupants.
   */
  onKickOccupant?: (
    dialogId: QBChatDialog['_id'],
    initiatorUserId: QBUser['id'],
  ) => void
  /** Receive user's last activity (time ago). */
  onLastUserActivityListener?: (userId: QBUser['id'], seconds: number) => void
  /** You will receive this callback when some user left group chat dialog you are in. */
  onLeaveOccupant?: (
    dialogId: QBChatDialog['_id'],
    userId: QBUser['id'],
  ) => void
  /** Blocked entities receive an error when try to chat with a user in a 1-1 chat and receivie nothing in a group chat. */
  onMessageErrorListener?: (messageId: QBChatMessage['_id'], error: any) => void
  /**
   * You need to set onMessageListener function, to get messages
   * ([read more](https://docs.quickblox.com/docs/js-chat-messaging#subscribe-message-events)).
   */
  onMessageListener?: (userId: QBUser['id'], message: QBChatXMPPMessage) => void
  /**
   * Show typing status in chat or groupchat
   * ([read more](https://docs.quickblox.com/docs/js-chat-messaging#send-typing-indicators)).
   */
  onMessageTypingListener?: (
    isTyping: boolean,
    userId: QBUser['id'],
    dialogId: QBChatDialog['_id'],
  ) => void
  /**
   * You can manage 'read' notifications in chat
   * ([read more](https://docs.quickblox.com/docs/js-chat-messaging#mark-message-as-read)).
   */
  onReadStatusListener?: (
    messageId: QBChatMessage['_id'],
    dialogId: QBChatDialog['_id'],
    userId: QBUser['id'],
  ) => void
  /**
   * By default Javascript SDK reconnects automatically when connection to server is lost
   * ([read more](https://docs.quickblox.com/docs/js-chat-connection#reconnection)).
   */
  onReconnectListener?: () => void
  onReconnectFailedListener?: (error: any) => void
  onSessionExpiredListener?: (error?: QBError) => void
  onLogListener?: (logLine: string) => void
  /**
   * Receive reject request
   * ([read more](https://docs.quickblox.com/docs/js-chat-contact-list#reject-the-contact-request)).
   */
  onRejectSubscribeListener?: (userId: QBUser['id']) => void
  /**
   * This feature defines an approach for ensuring is the message delivered to the server.
   * This feature is unabled by default
   * ([read more](https://docs.quickblox.com/docs/js-chat-messaging#check-if-a-message-is-sent)).
   */
  onSentMessageCallback?: (
    messageLost: QBChatMessage,
    messageSent: QBChatMessage,
  ) => void
  /**
   * Receive subscription request
   * ([read more](https://docs.quickblox.com/docs/js-chat-contact-list#add-user-to-your-contact-list)).
   */
  onSubscribeListener?: (userId: QBUser['id']) => void
  /**
   * These messages work over separated channel and won't be mixed with the regular chat messages
   * ([read more](https://docs.quickblox.com/docs/js-chat-messaging#send-system-messages)).
   */
  onSystemMessageListener?: (message: QBSystemMessage) => void
  /**
   * Send message to 1 to 1 or group dialog
   * ([read more](https://docs.quickblox.com/docs/js-chat-messaging#send-text-message)).
   */
  send<T extends QBChatNewMessage>(
    jidOrUserId: QBUser['id'] | string,
    message: T,
  ): string
  /**
   * Send is stop typing status
   * ([read more](https://docs.quickblox.com/docs/js-chat-messaging#send-typing-indicators)).
   */
  sendIsStopTypingStatus(jidOrUserId: QBUser['id'] | string): void
  /**
   * Send is typing status
   * ([read more](https://docs.quickblox.com/docs/js-chat-messaging#send-typing-indicators)).
   */
  sendIsTypingStatus(jidOrUserId: QBUser['id'] | string): void
  /**
   * Send is read status
   * ([read more](https://docs.quickblox.com/docs/js-chat-messaging#mark-message-as-read)).
   */
  sendReadStatus(params: QBMessageStatusParams): void
  /**
   * Send system message (system notification) to 1 to 1 or group dialog
   * ([read more](https://docs.quickblox.com/docs/js-chat-messaging#send-system-messages)).
   */
  sendSystemMessage(
    jidOrUserId: QBUser['id'] | string,
    // TODO: change type
    message: { extension: QBSystemMessage['extension'] },
  ): string
  /** Send is delivered status. */
  sendDeliveredStatus(params: QBMessageStatusParams): void
  ping(jidOrUserId: string | number, callback: QBCallback<any>): string
  ping(callback: QBCallback<any>): string
  pingchat(callback: QBCallback<any>): string

  dialog: {
    /**
     * Create new dialog
     * ([read more](https://docs.quickblox.com/docs/js-chat-dialogs#create-dialog)).
     */
    create(params: Dictionary<any>, callback: QBCallback<QBChatDialog>): void
    /**
     * Delete a dialog or dialogs
     * ([read more](https://docs.quickblox.com/docs/js-chat-dialogs#delete-dialog)).
     */
    delete(
      id: QBChatDialog['_id'] | Array<QBChatDialog['_id']>,
      params: { force: 1 },
      callback: QBCallback<any>,
    )
    /**
     * Delete a dialog or dialogs
     * ([read more](https://docs.quickblox.com/docs/js-chat-dialogs#delete-dialog)).
     */
    delete(
      id: QBChatDialog['_id'] | Array<QBChatDialog['_id']>,
      callback: QBCallback<any>,
    )
    /**
     * Retrieve list of dialogs
     * ([read more](https://docs.quickblox.com/docs/js-chat-dialogs#retrieve-list-of-dialogs)).
     */
    list(
      params: {
        limit?: number
        skip?: number
        sort_asc?: string
        sort_desc?: string
        [field: string]: any
      },
      callback: QBCallback<QBGetDialogResult>,
    ): void
    /**
     * Update group dialog
     * ([read more](https://docs.quickblox.com/docs/js-chat-dialogs#update-dialog)).
     */
    update(
      id: QBChatDialog['_id'],
      data: Dictionary<any>,
      callback: QBCallback<QBChatDialog>,
    ): void
  }

  message: {
    /** Create message. */
    create(params: Dictionary<any>, callback: QBCallback<QBChatMessage>): void
    /**
     * Delete message
     * ([read more](https://docs.quickblox.com/docs/js-chat-messaging#delete-message)).
     */
    delete(
      id: QBChatMessage['_id'],
      params: { force: 1 },
      callback: QBCallback<{
        SuccessfullyDeleted: {
          ids: string[]
        }
        NotFound: {
          ids: string[]
        }
      }>,
    ): void
    /**
     * Delete message
     * ([read more](https://docs.quickblox.com/docs/js-chat-messaging#delete-message)).
     */
    delete(
      id: QBChatMessage['_id'],
      callback: QBCallback<{
        SuccessfullyDeleted: {
          ids: string[]
        }
        NotFound: {
          ids: string[]
        }
      }>,
    ): void
    /**
     * Get a chat history
     * ([read more](https://docs.quickblox.com/docs/js-chat-messaging#retrieve-chat-history)).
     */
    list(
      params: {
        limit?: number
        skip?: number
        sort_asc?: string
        sort_desc?: string
        mark_as_read?: number
        [field: string]: any
      },
      callback: QBCallback<GetMessagesResult>,
    ): void
    /**
     * Get unread messages counter for one or group of dialogs
     * ([read more](https://docs.quickblox.com/docs/js-chat-dialogs#get-number-of-unread-messages)).
     */
    unreadCount(
      params: { chat_dialog_ids: string | string[] },
      callback: QBCallback<{ total: number }>,
    ): void
    /**
     * Update message
     * ([read more](https://docs.quickblox.com/docs/js-chat-messaging#update-message)).
     */
    update(
      id: QBChatMessage['_id'],
      params: Dictionary<any>,
      callback: QBCallback<QBChatMessage>,
    ): void
  }

  muc: {
    /**
     * Join to the group dialog
     * ([read more](https://docs.quickblox.com/docs/js-chat-dialogs#join-dialog)).
     */
    join(dialogJid: string, callback: QBCallback<any>): void
    /**
     * Leave group chat dialog
     * ([read more](https://docs.quickblox.com/docs/js-chat-dialogs#leave-dialog)).
     */
    leave(dialogJid: string, callback: QBCallback<any>): void
    /**
     * Leave group chat dialog
     * ([read more](https://docs.quickblox.com/docs/js-chat-dialogs#retrieve-online-users)).
     */
    listOnlineUsers(dialogJid: string, callback: (userIds: Array<QBUser['id']>) => void): void
  }

  roster: {
    /**
     * Add users to contact list
     * ([read more](https://docs.quickblox.com/docs/js-chat-contact-list#add-user-to-your-contact-list)).
     */
    add(jidOrUserId: string | QBUser['id'], callback: QBCallback<any>): void
    /**
     * Confirm subscription with some user
     * ([read more](https://docs.quickblox.com/docs/js-chat-contact-list#confirm-the-contact-request)).
     */
    confirm(jidOrUserId: string | QBUser['id'], callback: QBCallback<any>): void
    /**
     * Receive contact list
     * ([read more](https://docs.quickblox.com/docs/js-chat-contact-list#access-contact-list)).
     */
    get(callback: QBCallback<any>): void
    /**
     * Reject subscription with some user
     * ([read more](https://docs.quickblox.com/docs/js-chat-contact-list#reject-the-contact-request)).
     */
    reject(jidOrUserId: string | QBUser['id'], callback: QBCallback<any>): void
    /**
     * Remove subscription with some user from your contact list
     * ([read more](https://docs.quickblox.com/docs/js-chat-contact-list#remove-user-from-the-contact-list)).
     */
    remove(jidOrUserId: string | QBUser['id'], callback: QBCallback<any>): void
  }

  helpers: {
    /** Get unique id. */
    getUniqueId(suffix: string | number): string
    /** Generate BSON ObjectId. */
    getBsonObjectId(): string
    /** Get the dialog id from jid. */
    getDialogIdFromNode(jid: string): QBChatDialog['_id']
    /** Get the User id from jid. */
    getIdFromNode(jid: string): QBUser['id']
    /** Get user id from dialog's full jid. */
    getIdFromResource(jid: string): QBUser['id']
    /** Get the recipient id. */
    getRecipientId(
      occupantsIds: Array<QBUser['id']>,
      userId: QBUser['id'],
    ): QBUser['id']
    /** Get the full room jid from room bare jid & user jid. */
    getRoomJid(jid: string, userJid: string): string
    /** Get the room jid from dialog id. */
    getRoomJidFromDialogId(dialogId: QBChatDialog['_id']): string
    /** Get bare dialog's jid from dialog's full jid. */
    getRoomJidFromRoomFullJid(jid: string): string
    /** Get the user id from the room jid. */
    getUserIdFromRoomJid(jid: string): string
    /** Get the User jid id. */
    getUserJid(userId: QBUser['id'], appId?: string | number): string
    /** Get the User nick with the muc domain. */
    getUserNickWithMucDomain(userId: QBUser['id']): string
    /** Get unique id. */
    jidOrUserId(jidOrUserId: QBUser['id'] | string): string
    /** Get the chat type. */
    typeChat(jidOrUserId: QBUser['id'] | string): 'chat' | 'groupchat'
    /** Get the dialog jid from dialog id. */
    getDialogJid(dialogId: QBChatDialog['_id']): string
    /** Get user jid from current user. */
    getUserCurrentJid(): string
  }

}

export declare interface QBDataFile {
  content_type: string
  file_id: string
  name: string
  size: number
}

export declare interface QBBlob {
  id: number
  uid: string
  content_type: string
  name: string
  size: number
  created_at: string
  updated_at: string
  blob_status: string
  set_completed_at: number
  public: boolean
}
export declare interface QBBlobCreate extends QBBlob {
  account_id: number
  app_id: number
  blob_object_access: {
    id: number
    blob_id: number
    expires: string
    object_access_type: string
    params: string
  }
}
export declare interface QBBlobCreateUploadParams {
  name: string
  file: File
  type: string
  size: number
  public?: boolean // optional, "false" by default
}
interface QBContentModule {
  /** Create new file object. */
  create(
    params: { name: string; content_type: string; public?: boolean },
    callback: QBCallback<QBBlobCreate>,
  ): void
  /**
   * Create file > upload file > mark file as uploaded > return result
   * ([read more](https://docs.quickblox.com/docs/js-content#upload-file)).
   */
  createAndUpload(
    params: QBBlobCreateUploadParams,
    callback: QBCallback<QBBlob>,
  ): void
  /**
   * Delete file by id
   * ([read more](https://docs.quickblox.com/docs/js-content#delete-file)).
   */
  delete(id: number, callback: QBCallback<any>): void
  /**
   * Download file by UID.
   * If the file is public then it's possible to download it without a session token
   * ([read more](https://docs.quickblox.com/docs/js-content#download-file-by-uid)).
   */
  getFile(uid: string, callback: QBCallback<{ blob: QBBlob }>): void
  /**
   * Retrieve file object info by id
   * ([read more](https://docs.quickblox.com/docs/js-content#get-file-info)).
   */
  getInfo(id: number, callback: QBCallback<{ blob: QBBlob }>): void
  /**
   * Get a list of files for current user
   * ([read more](https://docs.quickblox.com/docs/js-content#retrieve-files)).
   */
  list(
    params: { page?: number; per_page?: number },
    callback: QBCallback<{
      current_page: number
      per_page: number
      total_entries: number
      items: Array<{
        blob: QBBlob
      }>
    }>,
  ): void
  /** Declare file uploaded. The file's 'status' field will be set to 'complete'. */
  markUploaded(
    params: { id: number; size: number },
    callback: QBCallback<{ blob: { size: number } }>,
  ): void
  /**
   * Edit a file by ID
   * ([read more](https://docs.quickblox.com/docs/js-content#update-file)).
   */
  update(
    params: {
      id: QBBlob['id']
      name?: QBBlob['name']
    },
    callback: QBCallback<{ blob: QBBlob }>,
  ): void
  /** Upload a file to cloud storage. */
  upload(
    params: {
      url: string
      data: Dictionary<any>
    },
    callback: QBCallback<any>,
  ): void
  /**
   * Get private URL for file download by file_uid (blob_uid)
   * ([read more](https://docs.quickblox.com/docs/js-content#get-private-url)).
   */
  privateUrl(fileUID: string): string
  /**
   * Get public URL for file download by file_uid (blob_uid)
   * ([read more](https://docs.quickblox.com/docs/js-content#get-public-url)).
   */
  publicUrl(fileUID: string): string
}

export declare interface QBCustomObjectAccess {
  access: 'open' | 'owner' | 'open_for_users_ids' | 'open_for_groups'
  ids?: string[]
  groups?: string[]
}

export declare interface QBCustomObjectPermissions {
  create?: QBCustomObjectAccess
  read?: QBCustomObjectAccess
  update?: QBCustomObjectAccess
  delete?: QBCustomObjectAccess
}

export declare interface QBCustomObject {
  /**
   * ID of the record
   * Generated automatically by the server after record creation
   */
  _id: string
  /** ID of the user who created the record */
  user_id: QBUser['id']
  /** ID of parent object (Relations) */
  _parent_id: string | null
  /** Date & time when a record was created, filled automatically */
  created_at: number
  /** Date & time when record was updated, filled automatically */
  updated_at: number
  // permissions?: Required<QBCustomObjectPermissions>;
}

export declare interface QBDataDeletedResponse {
  deleted: Array<QBCustomObject['_id']>
  deletedCount: number
}

interface QBDataModule {
  /**
   * Create new custom object
   * ([read more](https://docs.quickblox.com/docs/js-custom-objects#create-records)).
   */
  create<T extends QBCustomObject>(
    className: string,
    data: { permissions?: QBCustomObjectPermissions } & Dictionary<any>,
    callback: QBCallback<T>,
  ): void
  /**
   * Delete record/records by ID, IDs or criteria (filters) of particular class
   * ([read more](https://docs.quickblox.com/docs/js-custom-objects#delete-records)).
   */
  delete(
    className: string,
    ids: QBCustomObject['_id'] | Array<QBCustomObject['_id']>,
    callback: QBCallback<QBDataDeletedResponse>,
  ): void
  /**
   * Delete record/records by ID, IDs or criteria (filters) of particular class
   * ([read more](https://docs.quickblox.com/docs/js-custom-objects#delete-records)).
   */
  delete(
    className: string,
    criteria: Dictionary<any>,
    callback: QBCallback<{ total_deleted: number }>,
  ): void
  /**
   * Delete file from file field by ID
   * ([read more](https://docs.quickblox.com/docs/js-custom-objects#delete-file)).
   */
  deleteFile(
    className: string,
    params: { id: string; field_name: string },
    callback: QBCallback<any>,
  ): void
  /**
   * Download file from file field by ID
   * ([read more](https://docs.quickblox.com/docs/js-custom-objects#download-file)).
   */
  downloadFile(
    className: string,
    params: { id: string; field_name: string },
    callback: QBCallback<any>,
  ): void
  /** Return file's URL from file field by ID. */
  fileUrl(className: string, params: { id: string; field_name: string }): string
  /**
   * Search for records of particular class
   * ([read more](https://docs.quickblox.com/docs/js-custom-objects#retrieve-records)).
   */
  list<T extends QBCustomObject>(
    className: string,
    filters: {
      limit?: number
      skip?: number
      sort_asc?: string
      sort_desc?: string
      group_by?: string
      [field: string]: any
    },
    callback: QBCallback<{
      class_name: string
      items: T[]
      limit: number
      skip: number
    }>,
  ): void
  /**
   * Update record by ID of particular class
   * ([read more](https://docs.quickblox.com/docs/js-custom-objects#update-records)).
   */
  update<T extends QBCustomObject>(
    className: string,
    data: {
      _id: string
      permissions?: QBCustomObjectPermissions
    } & Dictionary<any>,
    callback: QBCallback<T>,
  ): void
  /**
   * Upload file to file field
   * ([read more](https://docs.quickblox.com/docs/js-custom-objects#files)).
   */
  uploadFile(
    className: string,
    params: { id: string; field_name: string; file: File; name: string },
    callback: QBCallback<QBDataFile>,
  ): void
}

export declare type ListUserParams = {
  page?: number
  per_page?: number
  filter?: Dictionary<any>
  order?: string
}

export declare type GetUserParams =
  | { login: string }
  | { full_name: string; page?: number; per_page?: number }
  | { facebook_id: string }
  | { phone: string }
  | { email: string }
  | { tags: string | string[]; page?: number; per_page?: number }
  | Omit<ListUserParams, 'filter'>
  | { external: string }

interface QBUsersModule {
  /**
   * Registers a new app user.
   * Call this API to register a user for the app.
   * You must provide either a user login or email address along with their password,
   * passing both email address and login is permitted but not required
   * ([read more](https://docs.quickblox.com/docs/js-users#create-user)).
   */
  create(params: QBUserCreateParams, callback: QBCallback<QBUser>): void
  /**
   * Remove a user from the app, by user's id that represents the user in an external user registry.
   * ([read more](https://docs.quickblox.com/docs/js-users#delete-user)).
   */
  delete(userId: QBUser['id'], callback: QBCallback<any>): void
  /**
   * Remove a user from the app, by user's external id that represents the user in an external user registry.
   * ([read more](https://docs.quickblox.com/docs/js-users#delete-user)).
   */
  delete(params: { external: number }, callback: QBCallback<any>): void
  /**
   * Retrieve the user by id.
   */
  get(userId: QBUser['id'], callback: QBCallback<QBUser>): void
  /**
   * Retrieve a specific users.
   */
  get(params: GetUserParams, callback: QBCallback<ListUserResponse>): void
  /**
   * Call this API to get a list of current users of you app.
   * By default it returns upto 10 users, but you can change this by adding pagination parameters.
   * You can filter the list of users by supplying a filter string. You can sort results by ask/desc
   * ([read more](https://docs.quickblox.com/docs/js-users#retrieve-users)).
   */
  listUsers(
    params: ListUserParams,
    callback: QBCallback<ListUserResponse>,
  ): void
  /**
   * You can initiate password resets for users who have emails associated with their account.
   * Password reset instruction will be sent to this email address
   * ([read more](https://docs.quickblox.com/docs/js-users#reset-user-password)).
   */
  resetPassword(email: string, callback: QBCallback<any>): void
  /**
   * Update current user. In normal usage,
   * nobody except the user is allowed to modify their own data.
   * Any fields you don’t specify will remain unchanged,
   * so you can update just a subset of the user’s data.
   * login/email and password may be changed,
   * but the new login/email must not already be in use
   * ([read more](https://docs.quickblox.com/docs/js-users#update-user)).
   */
  update(userId: number, user: QBUserUpdate, callback: QBCallback<QBUser>): void
}

export declare interface QBMediaParams {
  audio: MediaStreamConstraints['audio']
  video: MediaStreamConstraints['video']
  /** Id attribute of HTMLVideoElement */
  elemId?: string
  options?: {
    muted?: boolean
    mirror?: boolean
  }
}

declare enum QBWebRTCSessionState {
  NEW = 1,
  ACTIVE = 2,
  HUNGUP = 3,
  REJECTED = 4,
  CLOSED = 5,
}

declare enum QBWebRTCSessionConnectionState {
  UNDEFINED = 0,
  CONNECTING = 1,
  CONNECTED = 2,
  FAILED = 3,
  DISCONNECTED = 4,
  CLOSED = 5,
  COMPLETED = 6,
}

declare enum QBWebRTCCallType {
  VIDEO = 1,
  AUDIO = 2,
}

export declare interface QBWebRTCSession {
  State: {
    NEW: 1
    ACTIVE: 2
    HUNGUP: 3
    REJECTED: 4
    CLOSED: 5
  }
  ID: string
  /**
   * One of
   * - state=1 (`NEW`)
   * - state=2 (`ACTIVE`)
   * - state=3 (`HUNGUP`)
   * - state=4 (`REJECTED`)
   * - state=5 (`CLOSED`)
   */
  state: QBWebRTCSessionState
  initiatorID: QBUser['id']
  currentUserID: QBUser['id']
  opponentsIDs: Array<QBUser['id']>
  peerConnections: { [userId: QBUser['id']]: RTCPeerConnection }
  acceptCallTime: string
  bandwidth: number
  /**
   * One of
   * - callType=1 (`VIDEO`)
   * - callType=2 (`AUDIO`)
   */
  callType: QBWebRTCCallType
  startCallTime?: Date
  localStream?: MediaStream
  mediaParams: QBMediaParams | null
  /**
   * Get the user media stream
   * ([read more](https://docs.quickblox.com/docs/js-video-calling#access-local-media-stream)).
   */
  getUserMedia(params: QBMediaParams, callback: QBCallback<MediaStream>): void
  /**
   * Attach media stream to audio/video element
   * ([read more](https://docs.quickblox.com/docs/js-video-calling#attach-local-media-stream)).
   */
  attachMediaStream(
    videoElemId: string,
    stream: MediaStream,
    options?: QBMediaParams['options'],
  ): void
  /** Detach media stream from audio/video element */
  detachMediaStream(videoElemId: string): void
  /**
   * Mutes the stream
   * ([read more](https://docs.quickblox.com/docs/js-video-calling-advanced#mute-audio)).
   */
  mute(type: 'audio' | 'video'): void
  /**
   * Unmutes the stream
   * ([read more](https://docs.quickblox.com/docs/js-video-calling-advanced#mute-audio)).
   */
  unmute(type: 'audio' | 'video'): void
  /**
   * Initiate a call
   * ([read more](https://docs.quickblox.com/docs/js-video-calling#make-a-call)).
   */
  call(extension: Dictionary<any>, callback?: (error: null) => void): void
  /**
   * Accept a call
   * ([read more](https://docs.quickblox.com/docs/js-video-calling#accept-a-call)).
   */
  accept(extension: Dictionary<any>): void
  /**
   * Reject a call
   * ([read more](https://docs.quickblox.com/docs/js-video-calling#reject-a-call)).
   */
  reject(extension: Dictionary<any>): void
  /**
   * Stop a call
   * ([read more](https://docs.quickblox.com/docs/js-video-calling#end-a-call)).
   */
  stop(extension: Dictionary<any>): void
  /** Update a call. */
  update(extension: Dictionary<any>, userID?: QBUser['id']): void
  /**
   * Switch media tracks in audio/video HTML's element and replace its in peers
   * ([read more](https://docs.quickblox.com/docs/js-video-calling-advanced#switch-camera)).
   */
  switchMediaTracks(
    deviceIds: { audio?: { exact: string }; video?: { exact: string } },
    callback: QBCallback<MediaStream>,
  ): void
  /** Add tracks from provided stream to local stream (and replace in peers) */
  _replaceTracks(stream: MediaStream): void
}

export declare interface QBWebRTCModule {
  CallType: {
    VIDEO: 1
    AUDIO: 2
  }
  PeerConnectionState: {
    NEW: 1
    CONNECTING: 2
    CHECKING: 3
    CONNECTED: 4
    DISCONNECTED: 5
    FAILED: 6
    CLOSED: 7
    COMPLETED: 8
  }
  SessionConnectionState: {
    UNDEFINED: 0
    CONNECTING: 1
    CONNECTED: 2
    FAILED: 3
    DISCONNECTED: 4
    CLOSED: 5
    COMPLETED: 6
  }
  sessions: {
    [sessionId: string]: QBWebRTCSession
  }
  /** Return data or all active devices. */
  getMediaDevices(kind?: MediaDeviceKind): Promise<MediaDeviceInfo[]>
  /**
   * Creates the new session
   * ([read more](https://docs.quickblox.com/docs/js-video-calling#create-session)).
   */
  createNewSession(
    opponentsIds: number[],
    callType?: QBWebRTCCallType,
    initiatorID?: QBUser['id'],
    opts?: { bandwidth: number },
  ): QBWebRTCSession
  /** Deletes a session. */
  clearSession(sessionId: QBWebRTCSession['ID']): void
  /** Check all session and find session with status 'NEW' or 'ACTIVE' which ID != provided. */
  isExistLiveSessionExceptSessionID(sessionId: QBWebRTCSession['ID']): boolean
  /** Get new sessions count */
  getNewSessionsCount(exceptSessionId?: QBWebRTCSession['ID']): number

  onAcceptCallListener?: (
    session: QBWebRTCSession,
    userId: QBUser['id'],
    extension: Dictionary<any>,
  ) => void
  onCallListener?: (
    session: QBWebRTCSession,
    extension: Dictionary<any>,
  ) => void
  onCallStatsReport?: (
    session: QBWebRTCSession,
    userId: QBUser['id'],
    stats: any,
  ) => void
  onRejectCallListener?: (
    session: QBWebRTCSession,
    userId: QBUser['id'],
    extension: Dictionary<any>,
  ) => void
  onRemoteStreamListener?: (
    sesion: QBWebRTCSession,
    userId: QBUser['id'],
    stream: MediaStream,
  ) => void
  onSessionCloseListener?: (session: QBWebRTCSession) => void
  onSessionConnectionStateChangedListener?: (
    sesion: QBWebRTCSession,
    userId: QBUser['id'],
    /**
     * One of
     * - state=0 (`UNDEFINED`)
     * - state=1 (`CONNECTING`)
     * - state=2 (`CONNECTED`)
     * - state=3 (`FAILED`)
     * - state=4 (`DISCONNECTED`)
     * - state=5 (`CLOSED`)
     * - state=6 (`COMPLETED`)
     */
    state: QBWebRTCSessionConnectionState,
  ) => void
  onStopCallListener?: (
    session: QBWebRTCSession,
    userId: QBUser['id'],
    extension: Dictionary<any>,
  ) => void
  onUpdateCallListener?: (
    session: QBWebRTCSession,
    userId: QBUser['id'],
    extension: Dictionary<any>,
  ) => void
  onUserNotAnswerListener?: (session: QBWebRTCSession, userId: number) => void
  onReconnectListener?: (
    session: QBWebRTCSession,
    userId: QBUser['id'],
    state: 'reconnecting' | 'reconnected' | 'failed',
  ) => void
  onInvalidEventsListener?: (
    eventName: string,
    session: QBWebRTCSession,
    userId: QBUser['id'],
    extension: Dictionary<any>,
  ) => void
}

declare interface QBPushNotificationsEventsCreate {
  /**
   * Type of notification.
   * Allowed values: push or email.
   */
  notification_type: 'push' | 'email'
  /**
   * An environment of the notification.
   * Allowed values: development or production.
   */
  environment: 'development' | 'production'
  /**
   * A payload of event. For push notifications:
   * if event[push_type] not present - should be Base64 encoded text.
   */
  message: string
  /**
   * Push Notification type.
   * Used only if event[notification_type] = push, ignored in other cases.
   * If not present - Notification will be delivered to all possible devices for specified users.
   * Each platform has their own standard format.
   * If specified - Notification will be delivered to the specified platform only.
   * Allowed values: apns, apns_voip, gcm, mpns or bbps.
   */
  push_type?: 'apns' | 'apns_voip' | 'gcm' | 'mpns' | 'bbps'
  /**
   * Allowed values: one_shot, fixed_date or period_date. one_shot - a one-time event,
   * which causes by an external object (the value is only valid if the 'date' is not specified).
   * fixed_date - a one-time event, which occurs at a specified 'date' (the value is valid only if the 'date' is given).
   * period_date - reusable event that occurs within a given 'period' from the initial 'date'
   * (the value is only valid if the 'period' specified).
   * By default: fixed_date, if 'date' is specified. period_date, if 'period' is specified.
   * one_shot, if 'date' is not specified.
   */
  event_type?: 'one_shot' | 'fixed_date' | 'period_date'
  /**
   * The name of the event. Service information.
   * Only for your own usage.
   */
  name?: string
  /**
   * The period of the event in seconds.
   * Required if the event[event_type] = period_date.
   * Possible values: 86400 (1 day). 604800 (1 week). 2592000 (1 month). 31557600 (1 year).
   */
  period?: number
  /**
   * The date of the event to send on.
   * Required if event[event_type] = fixed_date or period_date.
   * If event[event_type] = fixed_date, the date can not be in the pas.
   */
  date?: number
  user?: {
    /** Notification's recipients - should contain a string of users' ids divided by commas. */
    ids?: Array<QBUser['id']>
    tags?: {
      /**
       * Notification's recipients - should contain a string of tags divided by commas.
       * Recipients (users) must have at least one tag that specified in the list.
       */
      any?: string[]
      /**
       * Notification's recipients - should contain a string of tags divided by commas.
       * Recipients (users) must exactly have only all tags that specified in list.
       */
      all?: string[]
      /**
       * Notification's recipients - should contain a string of tags divided by commas.
       * Recipients (users) mustn't have tags that specified in list.
       */
      exclude?: string[]
    }
  }
}

declare interface QBPushNotificationsSubscriptionsCreate {
  /**
   * Declare which notification channels could be used to notify user about events.
   * Allowed values: apns, apns_voip, gcm, mpns, bbps and email.
   */
  notification_channel: 'apns' | 'apns_voip' | 'gcm' | 'mpns' | 'bbps' | 'email'
  push_token: {
    /**
     * Determine application mode.
     * It allows conveniently separate development and production modes.
     * Allowed values: development or production.
     */
    environment: 'development' | 'production'
    /**
     * A unique identifier for client's application.
     * In iOS, this is the Bundle Identifier.
     * In Android - package id.
     */
    bundle_identifier?: string
    /**
     * Identifies client device in 3-rd party service like APNS, GCM/FCM, BBPS or MPNS.
     * Initially retrieved from 3-rd service and should be send to QuickBlox to let it send push notifications to the client.
     */
    client_identification_sequence: string
  }
  device: {
    /**
     * Platform of device, which is the source of application running.
     * Allowed values: ios, android, windows_phone, blackberry.
     */
    platform: 'ios' | 'android' | 'windows_phone' | 'blackberry'
    /**
     * UDID (Unique Device identifier) of device, which is the source of application running.
     * This must be anything sequence which uniquely identify particular device.
     * This is needed to support schema: 1 User - Multiple devices.
     */
    udid: string
  }
}

export declare interface QBPushNotificationsModule {
  events: {
    /**
     * Create notification event.
     * This request will immediately produce notification delivery
     * (push notification or email)
     * ([read more](https://docs.quickblox.com/docs/js-push-notifications#send-push-notifications)).
     */
    create(
      params: QBPushNotificationsEventsCreate,
      callback: QBCallback<any>,
    ): void
    /** Delete an event by ID. */
    delete(id, callback: QBCallback<any>): void
    /** Retrieve an event by ID. */
    get(id, callback: QBCallback<any>): void
    /** Get list of events which were created by current user. */
    list(params, callback: QBCallback<any>): void
    /** Retrieve an event's status by ID. */
    status(id, callback: QBCallback<any>): void
  }
  subscriptions: {
    /** Create device based subscription. */
    create(
      params: QBPushNotificationsSubscriptionsCreate,
      callback: QBCallback<any>,
    ): void
    /** Remove a subscription by its identifier. */
    delete(id: number, callback: QBCallback<any>): void
    /** Retrieve subscriptions for the user which is specified in the session token. */
    list(callback: QBCallback<any>): void
  }
  base64Encode(payload: any): string
}

export declare interface QBAddressBookModule {
  /**
   * Upload address book
   * ([read more](https://docs.quickblox.com/docs/js-address-book#upload-address-book)).
   */
  uploadAddressBook(
    contacts: any[],
    options: { udid?: string; force?: 1 },
    callback: QBCallback<any>,
  ): void
  /**
   * Upload address book
   * ([read more](https://docs.quickblox.com/docs/js-address-book#upload-address-book)).
   */
  uploadAddressBook(contacts: any[], callback: QBCallback<any>): void
  /**
   * Retrieve address book
   * ([read more](https://docs.quickblox.com/docs/js-address-book#retrieve-address-book)).
   */
  get(UDID: string, callback: QBCallback<any>): void
  /**
   * Retrieve address book
   * ([read more](https://docs.quickblox.com/docs/js-address-book#retrieve-address-book)).
   */
  get(callback: QBCallback<any>): void
  /**
   * Retrieve registered users
   * ([read more](https://docs.quickblox.com/docs/js-address-book#retrieve-registered-users)).
   */
  getRegisteredUsers(isCompact: boolean, callback: QBCallback<any>): void
  /**
   * Retrieve registered users
   * ([read more](https://docs.quickblox.com/docs/js-address-book#retrieve-registered-users)).
   */
  getRegisteredUsers(callback: QBCallback<any>): void
}

export declare type QBLoginParams =
  | {
      login: string
      password: string
    }
  | {
      email: string
      password: string
    }
  | {
      provider: 'firebase_phone'
      firebase_phone: { access_token: string; project_id: string }
    }
  | {
      provider: 'facebook'
      keys: { token: string; secret: string | null }
    }

export class QuickBlox {
  version: string

  buildNumber: string

  chat: QBChatModule

  ai: QBAIModule

  content: QBContentModule

  data: QBDataModule

  users: QBUsersModule

  webrtc: QBWebRTCModule

  pushnotifications: QBPushNotificationsModule

  addressbook: QBAddressBookModule

  /**
   * Create new session
   * ([read more](https://docs.quickblox.com/docs/js-authentication#create-session)).
   */
  createSession: {
    (callback: QBCallback<QBSession>): void
    (params: QBLoginParams, callback: QBCallback<QBSession>): void
  }

  startSessionWithToken(
    token: string,
    callback: QBCallback<{ session: QBSession }>,
  )

  /**
   * Destroy current session
   * ([read more](https://docs.quickblox.com/docs/js-authentication#destroy-session-token)).
   */
  destroySession(callback: QBCallback<any>): void

  /**
   * Return current session
   * ([read more](https://docs.quickblox.com/docs/js-authentication#get-session)).
   */
  getSession(callback: QBCallback<{ session: QBSession }>): void

  /**
   * Init QuickBlox SDK
   *  ([read more](https://docs.quickblox.com/docs/js-setup#initialize-quickblox-sdk))
   */
  init(
    appIdOrToken: string | number,
    authKeyOrAppId: string | number,
    authSecret: string | null | undefined,
    accountKey: string,
    config?: QBConfig,
  ): void

  /**
   * Init QuickBlox SDK with User Account data to start session with token
   * ([read more](https://docs.quickblox.com/docs/js-setup#initialize-quickblox-sdk-without-authorization-key-and-secret)).
   */
  initWithAppId(appId: number, accountKey: string, config?: QBConfig): void

  /**
   * Login to QuickBlox application
   * ([read more](https://docs.quickblox.com/docs/js-authentication#log-in-user)).
   */
  login(params: QBLoginParams, callback: QBCallback<QBUser>): void

  /**
   * Remove user from current session, but doesn't destroy it
   * ([read more](https://docs.quickblox.com/docs/js-authentication#log-out-user)).
   */
  logout(callback: QBCallback<any>): void

  service: {
    qbInst: {
      session: QBSession | null
      config: {
        endpoints: Required<Required<QBConfig>['endpoints']>
        webrtc: Required<Required<QBConfig>['webrtc']>
        chatProtocol: Required<Required<QBConfig>['chatProtocol']>
        on: Required<Required<QBConfig>['on']>
        streamManagement: Required<Required<QBConfig>['streamManagement']>
        debug: QBConfig['debug']
        version: string
        buildNumber: string
        creds: {
          appId: number
          authKey: string
          authSecret: string
          accountKey: string
        }
        urls: {
          account: 'account_settings'
          session: 'session'
          login: 'login'
          users: 'users'
          chat: 'chat'
          blobs: 'blobs'
          subscriptions: 'subscriptions'
          events: 'events'
          data: 'data'
          addressbook: 'address_book'
          addressbookRegistered: 'address_book/registered_users'
          type: '.json'
        }
        qbTokenExpirationDate: Date | null
      }
    }
  }
}

interface QuickBloxConstructor {
  prototype: QuickBlox
  new (): QuickBlox
}

interface QB extends QuickBlox {
  QuickBlox: QuickBloxConstructor
}

declare const SDK: QB

export default SDK
