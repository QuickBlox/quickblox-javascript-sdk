import React, { ReactElement, RefObject } from 'react';
import {
    Avatar,
    Dropdown,
    FunctionTypeMessageEntityToVoid,
    MessageDTOMapper,
    getTimeShort24hFormat,
    AttachmentBubble,
    MessageEntity, Message, MessageReactionPicker, TextBubble, MessageSeparator,
    ReactionMode, ReactionPickerData, ReactionsPickerOptions,
    UserSvg
} from 'quickblox-react-ui-kit';
import './MyMessageItem.css';

export type MyMessageItemProps = {
    message: MessageEntity;
    avatar?: ReactElement;
    currentUserId?: number;
    enableForwarding: boolean;
    enableReplying: boolean;
    enableCopying: boolean;
    enableEditing: boolean;
    enableDeleting: boolean;
    onReply: FunctionTypeMessageEntityToVoid;
    onForward: FunctionTypeMessageEntityToVoid;
    onCopy: FunctionTypeMessageEntityToVoid;
    onEdit: FunctionTypeMessageEntityToVoid;
    onDelete: FunctionTypeMessageEntityToVoid;
    onToggleReaction: (message: MessageEntity, reactionName: string) => void;
    onOpenReactionsList?: (message: MessageEntity) => void;
    reactionMode: ReactionMode;
    reactionPickerData: ReactionPickerData | null;
    reactionPickerOptions?: ReactionsPickerOptions;
    canDeleteAnyMessage?: boolean;
    listRef?: RefObject<HTMLDivElement>;
    messagesToView: MessageEntity[];
    onError: (messageError: string) => void;
    disableAction?: boolean;
};

function CustomEmojiSearchIcon() {
    return (
        <svg
            aria-hidden="true"
            focusable="false"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
        >
            <circle cx="11" cy="11" r="7" />
            <path d="m16 16 5 5" />
            <path d="M8.5 10.5h.01M13.5 10.5h.01M9 13.5c1.3 1 2.7 1 4 0" />
        </svg>
    );
}

function SampleMessageContextMenu({
    enableReplying,
    enableForwarding,
    enableCopying,
    enableEditing,
    isOwnMessage,
    canDeleteMessage,
    onReply,
    onForward,
    onCopy,
    onEdit,
    onDelete,
    disableActions = false,
    canCopy = true,
    canEdit = true,
}: {
    enableReplying: boolean;
    enableForwarding: boolean;
    enableCopying: boolean;
    enableEditing: boolean;
    isOwnMessage: boolean;
    canDeleteMessage: boolean;
    onReply: () => void;
    onForward: () => void;
    onCopy: () => void;
    onEdit: () => void;
    onDelete: () => void;
    disableActions?: boolean;
    canCopy?: boolean;
    canEdit?: boolean;
}) {
    const options: Array<{ value: string; label: string; disabled: boolean }> = [];

    if (enableReplying) {
        options.push({
            value: 'Reply',
            label: 'Reply',
            disabled: disableActions,
        });
    }

    if (enableForwarding) {
        options.push({
            value: 'Forward',
            label: 'Forward',
            disabled: disableActions,
        });
    }

    if (enableCopying && canCopy) {
        options.push({
            value: 'Copy',
            label: 'Copy',
            disabled: disableActions,
        });
    }

    if (enableEditing && isOwnMessage && canEdit) {
        options.push({
            value: 'Edit',
            label: 'Edit',
            disabled: disableActions,
        });
    }

    if (canDeleteMessage) {
        options.push({
            value: 'Delete',
            label: 'Delete',
            disabled: disableActions,
        });
    }

    const handleSelect = (value: string) => {
        if (disableActions) {
            return;
        }

        if (value === 'Reply' && enableReplying) {
            onReply();
        }

        if (value === 'Forward' && enableForwarding) {
            onForward();
        }

        if (value === 'Copy' && enableCopying && canCopy) {
            onCopy();
        }

        if (value === 'Edit' && enableEditing && isOwnMessage && canEdit) {
            onEdit();
        }

        if (value === 'Delete' && canDeleteMessage) {
            onDelete();
        }
    };

    return (
        <Dropdown
            options={options}
            disabled={disableActions}
            onSelect={handleSelect}
            className="message-context-menu-dropdown"
        >
            <div className="message-context-menu-actions">
                <svg
                    className="message-context-menu-actions__icon"
                    aria-hidden="true"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <circle cx="10" cy="4" r="1.5" />
                    <circle cx="10" cy="10" r="1.5" />
                    <circle cx="10" cy="16" r="1.5" />
                </svg>
            </div>
        </Dropdown>
    );
}

export default function MyMessageItem({
                                        message,
                                        avatar,
                                        currentUserId,
                                        enableForwarding,
                                        enableReplying,
                                        enableCopying,
                                        enableEditing,
                                        enableDeleting,
                                        onReply,
                                        onForward,
                                        onCopy,
                                        onEdit,
                                        onDelete,
                                        onToggleReaction,
                                        onOpenReactionsList,
                                        reactionMode,
                                        reactionPickerData,
                                        reactionPickerOptions,
                                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                        listRef,
                                        messagesToView,
                                        onError,
                                        disableAction = false,
                                        canDeleteAnyMessage = false,
                                    }: MyMessageItemProps) {
    void messagesToView;
    void onError;

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

        const senderId = m.sender?.id ?? m.sender_id;

        if (senderId != null && senderId.toString() !== currentUserId?.toString()) {
            return TypeIncomingMessage;
        }

        return TypeOutgoingMessage;
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
        const isOwnMessage = item.sender_id?.toString() === currentUserId?.toString();
        const canDeleteMessage = enableDeleting || canDeleteAnyMessage;
        const messageBody = item.message || '';
        const isPlainTextMessage =
            !(item.attachments && item.attachments.length > 0) &&
            !messageBody.includes(MessageDTOMapper.MEDIA_CONTENT_ENTITY_PREFIX) &&
            !messageBody.includes(MessageDTOMapper.ATTACHMENT_PREFIX) &&
            !messageBody.includes(MessageDTOMapper.FORWARD_MESSAGE_PREFIX) &&
            !messageBody.includes(MessageDTOMapper.REPLY_MESSAGE_PREFIX);

        const contextMenu = !item.isDeleted ? (
            <SampleMessageContextMenu
                isOwnMessage={isOwnMessage}
                canDeleteMessage={canDeleteMessage}
                onReply={() => onReply(item)}
                onForward={() => onForward(item)}
                onCopy={() => onCopy(item)}
                onEdit={() => onEdit(item)}
                onDelete={() => onDelete(item)}
                enableReplying={enableReplying}
                enableForwarding={enableForwarding}
                enableCopying={enableCopying}
                enableEditing={enableEditing}
                disableActions={disableAction}
                canCopy={enableCopying && isPlainTextMessage}
                canEdit={enableEditing && isPlainTextMessage}
            />
        ) : null;
        const reactionPicker = !item.isDeleted ? (
            <MessageReactionPicker
                message={item}
                currentUserId={currentUserId}
                reactionMode={reactionMode}
                reactionPickerData={reactionPickerData}
                disableAction={disableAction}
                onToggleReaction={onToggleReaction}
                onOpenReactionsList={onOpenReactionsList}
                className={`message-item-reaction-actions message-item-reaction-actions--${currentMessageType}`}
                showChips={false}
                // Serializable picker options come from QBConfig.appConfig.reactions.picker.
                emojiPickerPlacement={reactionPickerOptions?.placement}
                showEmojiSearch={reactionPickerOptions?.showSearch}
                showEmojiSelectorClose={reactionPickerOptions?.showClose}
                emojiSelectorTitle={reactionPickerOptions?.title}
                emojiSearchPlaceholder={reactionPickerOptions?.searchPlaceholder}
                // React-only: stock MessageItem cannot pass a custom search icon.
                emojiSearchIcon={<CustomEmojiSearchIcon />}
            />
        ) : null;
        const actionControls =
            currentMessageType === 'outgoing' ? (
                <>
                    {contextMenu}
                    {reactionPicker}
                </>
            ) : (
                <>
                    {reactionPicker}
                    {contextMenu}
                </>
            );

        return (
            <div className="message-item-additional-part__actions">
                {actionControls}
            </div>
        );
    }

    function messageHasReactions(item: MessageEntity): boolean {
        return (
            !item.isDeleted &&
            Array.isArray(item.reactions) &&
            item.reactions.some((reaction) => Number(reaction?.count || 0) > 0)
        );
    }

    function renderInlineReactions(
        item: MessageEntity,
        currentMessageType: 'incoming' | 'outgoing',
    ) {
        if (item.isDeleted) {
            return null;
        }

        return (
            <MessageReactionPicker
                message={item}
                currentUserId={currentUserId}
                reactionMode={reactionMode}
                reactionPickerData={reactionPickerData}
                disableAction={disableAction}
                onToggleReaction={onToggleReaction}
                onOpenReactionsList={onOpenReactionsList}
                className={`message-item-inline-reactions message-item-inline-reactions--${currentMessageType}`}
                showToggle={false}
            />
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
                                additionalPart={
                                    <div className="message-item-additional-part">
                                        {renderAdditionalPart(currentMessageType, nestedMessage)}
                                    </div>
                                }
                            >
                                <div className="message-item-bubble-with-reactions">
                                    {nestedMessage.attachments &&
                                    nestedMessage.attachments.length > 0 ? (
                                        <div>
                                            {/* eslint-disable-next-line @typescript-eslint/no-shadow */}
                                            {nestedMessage.attachments.map((attachment, index) => {
                                                return (
                                                    <AttachmentBubble
                                                        key={attachment.id || `${nestedMessage.id}-${index}`}
                                                        attachment={attachment}
                                                        typeMessage={currentMessageType}
                                                    />
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <TextBubble
                                            text={nestedMessage.message}
                                            type={currentMessageType}
                                        />
                                    )}
                                    <div className="message-item-bubble-reactions">
                                        {renderInlineReactions(nestedMessage, currentMessageType)}
                                    </div>
                                </div>
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
            <div
                className={
                    messageHasReactions(message)
                        ? 'my-message-item message-item-with-reactions'
                        : 'my-message-item'
                }
            >
                {renderForwardedReplyMessageSegment(messageTypes)}
                {!String(message.message || '').includes(MessageDTOMapper.FORWARD_MESSAGE_PREFIX) && (
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
                        additionalPart={
                            <div className="message-item-additional-part">
                                {renderAdditionalPart(messageTypes, message)}
                            </div>
                        }
                    >
                        <div className="message-item-bubble-with-reactions">
                            {message.attachments && message.attachments.length > 0 ? (
                                <>
                                    {message.attachments.map((attachment, index) => {
                                        return (
                                            <AttachmentBubble
                                                key={attachment.id || `${message.id}-${index}`}
                                                attachment={attachment}
                                                typeMessage={messageTypes}
                                            />
                                        );
                                    })}
                                </>
                            ) : (
                                <TextBubble
                                    text={message.message}
                                    type={messageTypes}
                                />
                            )}
                            <div className="message-item-bubble-reactions">
                                {renderInlineReactions(
                                    message,
                                    messageTypes as 'incoming' | 'outgoing',
                                )}
                            </div>
                        </div>
                    </Message>
                )}
            </div>
        );
    }

    return null;
}
