import React, { ReactElement, RefObject, useReducer } from 'react';
import {
    AIMessageWidget,
    AIAssist,
    Avatar,
    MessageContextMenu, FunctionTypeMessageEntityToVoid,
    MessageDTOMapper,
    AITranslate, getTimeShort24hFormat,
    Loader, AttachmentBubble,
    MessageEntity, Message, TextBubble, MessageSeparator,
    UserSvg
} from 'quickblox-react-ui-kit';
import './MessageItem.scss';

export type MessageItemProps = {
    message: MessageEntity;
    avatar?: ReactElement;
    currentUserId?: number;
    AITranslateWidget?: AIMessageWidget;
    AIAssistWidget?: AIMessageWidget;
    maxTokens: number;
    defaultTranslationLanguage: string;
    languagesForAITranslate: string[];
    enableForwarding: boolean;
    enableReplying: boolean;
    onReply: FunctionTypeMessageEntityToVoid;
    onForward: FunctionTypeMessageEntityToVoid;
    // defaultGetSenderName: GetUserNameFct;
    listRef?: RefObject<HTMLDivElement>;
    messagesToView: MessageEntity[];
    onError: (messageError: string) => void;
    disableAction?: boolean;
};

interface MessageStates {
    loading: boolean;
    translatedText: string;
}

type Action =
    | { type: 'SET_LOADING'; id: string; payload: boolean }
    | { type: 'SET_TRANSLATED_TEXT'; id: string; payload: string };

function reducer(
    state: Record<string, MessageStates>,
    action: Action,
): Record<string, MessageStates> {
    switch (action.type) {
        case 'SET_LOADING':
            return {
                ...state,
                [action.id]: { ...state[action.id], loading: action.payload },
            };
        case 'SET_TRANSLATED_TEXT':
            return {
                ...state,
                [action.id]: { ...state[action.id], translatedText: action.payload },
            };
        default:
            return state;
    }
}

export default function MessageItem({
                                        message,
                                        avatar,
                                        currentUserId,
                                        enableForwarding,
                                        enableReplying,
                                        onReply,
                                        onForward,
                                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                        listRef,
                                        messagesToView,
                                        AITranslateWidget,
                                        AIAssistWidget,
                                        maxTokens,
                                        defaultTranslationLanguage,
                                        languagesForAITranslate,
                                        onError,
                                        disableAction = false,
                                    }: MessageItemProps) {
    const messageStates: Record<string, MessageStates> = {};

    const [state, dispatch] = useReducer(reducer, messageStates);

    const senderName =
        message.sender?.full_name ||
        message.sender?.login ||
        message.sender?.email ||
        '';

    const TypeSystemMessage = 'system';
    const TypeIncomingMessage = 'incoming';
    const TypeOutgoingMessage = 'outgoing';

    const subTypeMessage = message.qb_message_action?.includes('forward')
        ? 'forward'
        : 'reply';

    function checkMessageType(m: MessageEntity): string {
        if (m.notification_type && m.notification_type.length > 0) {
            return TypeSystemMessage;
        }
        if (
            (m.sender && m.sender.id.toString() !== currentUserId?.toString()) ||
            m.sender_id.toString() !== currentUserId?.toString()
        ) {
            return TypeIncomingMessage;
        }

        return TypeOutgoingMessage;
    }

    function translatedHandler(id: string, textTranslated: string) {
        dispatch({ type: 'SET_TRANSLATED_TEXT', id, payload: textTranslated });
    }

    function fetchingHandler(isFetching: boolean, id: string) {
        dispatch({ type: 'SET_LOADING', id, payload: isFetching });
    }

    function getStatusMessage(messageEntity: MessageEntity) {
        if (
            messageEntity.delivered_ids &&
            messageEntity.delivered_ids.length > 0 &&
            messageEntity.delivered_ids.some((id) => id !== currentUserId)
        ) {
            if (
                messageEntity.read_ids &&
                messageEntity.read_ids.length > 0 &&
                messageEntity.read_ids.some((id) => id !== currentUserId)
            ) {
                return 'viewed';
            }

            return 'delivered';
        }

        return 'sent';
    }

    function renderAdditionalPart(
        currentMessageType: 'incoming' | 'outgoing',
        item: MessageEntity,
    ) {
        return (
            <div className="message-item-additional-part__actions">
                <MessageContextMenu
                    message={message}
                    onReply={() => onReply(item)}
                    onForward={() => onForward(item)}
                    enableReplying={enableReplying}
                    enableForwarding={enableForwarding}
                    disableActions={disableAction}
                />
                {currentMessageType === 'incoming' && state[item.id]?.loading && (
                    <Loader size="sm" className="message-item-additional-part__loader" />
                )}
                {currentMessageType === 'incoming' &&
                    !(item.attachments && item.attachments.length > 0) &&
                    AIAssistWidget && (
                        <AIAssist
                            disableAction={disableAction}
                            AIAssistWidget={AIAssistWidget}
                            loading={
                                state[item.id] && state[item.id].loading
                                    ? state[item.id].loading
                                    : false
                            }
                            onLoading={(isFetching: boolean, id: string) =>
                                fetchingHandler(isFetching, id)
                            }
                            onError={onError}
                            messageToAssist={item}
                            messageHistory={messagesToView}
                            currentUserId={currentUserId}
                            maxTokens={maxTokens}
                        />
                    )}
            </div>
        );
    }

    function renderForwardedReplyMessageSegment(
        currentMessageType: 'incoming' | 'outgoing',
    ) {
        if (
            message.qb_original_messages &&
            message.qb_original_messages?.length > 0
        ) {
            return (
                <>
                    {message.qb_original_messages.map((nestedMessage) => {
                        return (
                            <Message
                                key={nestedMessage.id}
                                userName={senderName}
                                status={getStatusMessage(nestedMessage)}
                                time={getTimeShort24hFormat(message.date_sent)}
                                type={currentMessageType}
                                subtype={subTypeMessage}
                                bottomPart={
                                    !(
                                        nestedMessage.attachments &&
                                        nestedMessage.attachments.length > 0
                                    ) && AITranslateWidget ? (
                                        <AITranslate
                                            disableAction={disableAction}
                                            AITranslateWidget={AITranslateWidget}
                                            defaultLanguage={defaultTranslationLanguage}
                                            languages={languagesForAITranslate}
                                            originalTextMessage={
                                                state[nestedMessage.id] &&
                                                state[nestedMessage.id].translatedText
                                                    ? state[nestedMessage.id].translatedText.length === 0
                                                    : true
                                            }
                                            loading={
                                                state[nestedMessage.id] &&
                                                state[nestedMessage.id].loading
                                                    ? state[nestedMessage.id].loading
                                                    : false
                                            }
                                            onLoading={(isFetching: boolean, id: string) =>
                                                fetchingHandler(isFetching, id)
                                            }
                                            onError={onError}
                                            messageToTranslate={nestedMessage}
                                            messageHistory={messagesToView}
                                            currentUserId={currentUserId}
                                            maxTokens={maxTokens}
                                            onTranslated={(id, textTranslated) =>
                                                translatedHandler(id, textTranslated)
                                            }
                                        />
                                    ) : undefined
                                }
                                additionalPart={
                                    <div className="message-item-additional-part">
                                        {renderAdditionalPart(currentMessageType, nestedMessage)}
                                    </div>
                                }
                            >
                                {nestedMessage.attachments &&
                                nestedMessage.attachments.length > 0 ? (
                                    <div>
                                        {/* eslint-disable-next-line @typescript-eslint/no-shadow */}
                                        {nestedMessage.attachments.map((attachment) => {
                                            return (
                                                <AttachmentBubble
                                                    attachment={attachment}
                                                    typeMessage={currentMessageType}
                                                />
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <TextBubble
                                        // text={
                                        //   state[nestedMessage.id] &&
                                        //   state[nestedMessage.id].translatedText &&
                                        //   state[nestedMessage.id].translatedText.length === 0
                                        //     ? nestedMessage.message
                                        //     : state[nestedMessage.id]?.translatedText ||
                                        //       nestedMessage.message
                                        // }
                                        text={nestedMessage.message}
                                        translatedText={
                                            state[nestedMessage.id] &&
                                            state[nestedMessage.id].translatedText &&
                                            state[nestedMessage.id].translatedText.length === 0
                                                ?
                                                ''
                                                :
                                                state[nestedMessage.id]?.translatedText}
                                        type={currentMessageType}
                                    />
                                )}
                            </Message>
                        );
                    })}
                </>
            );
        }

        return null;
    }

    const messageTypes: string = checkMessageType(message);

    if (messageTypes === TypeSystemMessage) {
        return <MessageSeparator text={message.message} type="system" />;
    }

    if (
        messageTypes === TypeIncomingMessage ||
        messageTypes === TypeOutgoingMessage
    ) {
        return (
            <div>
                {renderForwardedReplyMessageSegment(messageTypes)}
                {!message.message.includes(MessageDTOMapper.FORWARD_MESSAGE_PREFIX) && (
                    <Message
                        key={message.id}
                        avatar={
                            avatar ||
                            <Avatar
                                src={message?.sender?.photo || ''}
                                icon={<UserSvg />}
                                size="md"
                            />
                        }
                        userName={senderName}
                        status={getStatusMessage(message)}
                        time={getTimeShort24hFormat(message.date_sent)}
                        type={messageTypes}
                        bottomPart={
                            !(message.attachments && message.attachments.length > 0) &&
                            AITranslateWidget ? (
                                <AITranslate
                                    disableAction={disableAction}
                                    AITranslateWidget={AITranslateWidget}
                                    defaultLanguage={defaultTranslationLanguage}
                                    languages={languagesForAITranslate}
                                    originalTextMessage={
                                        state[message.id] && state[message.id].translatedText
                                            ? state[message.id].translatedText.length === 0
                                            : true
                                    }
                                    loading={
                                        state[message.id] && state[message.id].loading
                                            ? state[message.id].loading
                                            : false
                                    }
                                    onLoading={(isFetching: boolean, id: string) =>
                                        fetchingHandler(isFetching, id)
                                    }
                                    onError={onError}
                                    messageToTranslate={message}
                                    messageHistory={messagesToView}
                                    currentUserId={currentUserId}
                                    maxTokens={maxTokens}
                                    onTranslated={(id, textTranslated) =>
                                        translatedHandler(id, textTranslated)
                                    }
                                />
                            ) : undefined
                        }
                        additionalPart={
                            <div className="message-item-additional-part">
                                {renderAdditionalPart(messageTypes, message)}
                            </div>
                        }
                    >
                        {message.attachments && message.attachments.length > 0 ? (
                            <>
                                {message.attachments.map((attachment) => {
                                    return (
                                        <AttachmentBubble
                                            attachment={attachment}
                                            typeMessage={messageTypes}
                                        />
                                    );
                                })}
                            </>
                        ) : (
                            <TextBubble
                                // text={
                                //   state[message.id] &&
                                //   state[message.id].translatedText &&
                                //   state[message.id].translatedText.length === 0
                                //     ? message.message
                                //     : state[message.id]?.translatedText || message.message
                                // }
                                text={message.message}
                                translatedText={
                                    state[message.id] &&
                                    state[message.id].translatedText &&
                                    state[message.id].translatedText.length === 0
                                        ?
                                        ''
                                        :
                                        state[message.id]?.translatedText}
                                type={messageTypes}
                            />
                        )}
                    </Message>
                )}
            </div>
        );
    }

    return null;
}
