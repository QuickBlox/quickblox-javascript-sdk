import React, { useEffect, useState } from 'react';
import cn from 'classnames';

import { toast } from 'react-toastify';
import {
    Avatar,
    BaseViewModel, Button, ChatSvg, CreateNewDialogFlow,
    DesktopLayout, Dialog,
    DialogEntity, DialogInfo,
    DialogList,
    DialogType, DialogWindow, ForwardMessageFlow,
    getDateForDialog,
    GroupChatSvg,
    GroupDialogEntity,
    Header, InformationSvg,
    Loader, MembersList,
    MessageEntity, MessageInput, MessageSeparator,
    NewChatSvg, Placeholder,
    PreviewDialog,
    PreviewDialogViewModel,
    PublicChannelSvg,
    PublicDialogEntity,
    QuickBloxUIKitDesktopLayoutProps, ReplyMessagePreview,
    SearchSvg,
    SectionItem,
    SectionList,
    TextField,
    ToastProvider, useQuickBloxUIKit,
    UserSvg
} from 'quickblox-react-ui-kit';
import MyMessageItem from './MyMessageItem';


const MyUIKitDesktopLayout = ({
                                  theme,
                                  AITranslate,
                                  AIRephrase,
                                  AIAssist,
                                  uikitHeightOffset = '0px',
                              }: QuickBloxUIKitDesktopLayoutProps) => {
    const {
        constants: {
            maxWidthToResizing,
            workHeight,
            messagesContainerMobileHeight,
            messagesContainerHeight,
            clientContainerHeight,
            dialogListScrollableHeight,
        },
        data: {
            isOnline,
            isMobile,
            selectedDialog,
            dialogAvatarUrl,
            showDialogList,
            showDialogMessages,
            showDialogInformation,
            needDialogInformation,
            isRecording,
            messageText,
            isLeaving,
            waitAIWidget,
            reactionMode,
            reactionPickerData,
            reactionPickerOptions,
            messagesForView,
            enableForwarding,
            enableReplying,
            enableCopying,
            enableEditing,
            enableDeleting,
            userName,
            currentUserId,
            forwardMessage,
            warningErrorText,
            isAllMembersShow,
            scrollUpToDown,
            needRefresh,
            forwardMessageModal,
            showReplyMessage,
            messagesToReply,
            showEditMessage,
            isEditSubmitting,
            canSendMessage,
            messageToEdit,
            showDeleteTypeModal,
            showDeleteConfirmModal,
            deleteForEveryone,
            isOpen,
            newModal,
        },
        models: {
            dialogsViewModel,
            messagesViewModel,
            userViewModel,
        },
        handlers: {
            setSelectedDialog,
            handleLeaveDialog,
            setForwardMessage,
            informationCloseHandler,
            informationOpenHandler,
            setIsRecording,
            setIsAllMembersShow,
            fetchMoreData,
            sendTextMessageActions,
            ChangeFileHandler,
            handleOnReply,
            handleOnCopy,
            handleOnEdit,
            handleOnDelete,
            handleOnToggleReaction,
            handleOnOpenReactionsModal,
            handleSendData,
            handleHeightChange,
            leaveDialogHandler,
            createDialogHandler,
            closeReplyMessageFlowHandler,
            closeEditMessageFlowHandler,
            closeDeleteMessageFlowHandler,
            deleteMessageByTypeHandler,
            confirmDeleteMessageHandler,
            setMessageText,
            handleDialogOnClick,
        },
    } = useQuickBloxUIKit({
        AIRephrase,
        AITranslate,
        AIAssist,
        uikitHeightOffset,
    });

    const canCurrentUserDeleteAnyMessageInDialog = !!selectedDialog && !!currentUserId;

    // eslint-disable-next-line consistent-return
    const renderIconForTypeDialog = (dialogEntity: DialogEntity) => {
        if (dialogEntity.type === DialogType.group) {
            const groupDialogEntity = dialogEntity as GroupDialogEntity;

            return (
                <Avatar
                    src={groupDialogEntity.photo || ''}
                    icon={<GroupChatSvg />}
                    size="md"
                />
            );
        }
        if (dialogEntity.type === DialogType.private) {
            return <Avatar src={dialogAvatarUrl} icon={<UserSvg />} size="md" />;
        }
        if (dialogEntity.type === DialogType.public) {
            const publicDialogEntity = dialogEntity as PublicDialogEntity;

            return (
                <Avatar
                    src={publicDialogEntity.photo}
                    icon={<PublicChannelSvg />}
                    size="md"
                />
            );
        }
    };

    function getSectionData(messages2View: MessageEntity[]) {
        const groupMessages: { [date: string]: MessageEntity[] } = {};
        const reversedMessages = [...messages2View].reverse();

        reversedMessages.forEach((message) => {
            const date = new Date(message.created_at);

            date.setUTCHours(0, 0, 0, 0);

            const dateString = date.toISOString();

            groupMessages[dateString] = [
                ...(groupMessages[dateString] || []),
                message,
            ];
        });
        Object.keys(groupMessages).forEach((date) => {
            groupMessages[date].sort((a, b) => a.date_sent - b.date_sent);
        });
        const sections: SectionItem<MessageEntity>[] = Object.keys(groupMessages)
            .sort((a, b) => a.localeCompare(b))
            .map((date) => ({
                title: date,
                data: { [date]: groupMessages[date] },
            }));
        // const sections: SectionItem<MessageEntity>[] = Object.keys(
        //   groupMessages,
        // ).map((date) => ({
        //   title: date,
        //   data: { [date]: groupMessages[date] },
        // }));

        return sections;
    }

    const [showSearchDialogs, setShowSearchDialogs] = React.useState(false);
    const [nameDialogForSearch, setNameDialogForSearch] = React.useState('');
    const dialogs: PreviewDialogViewModel[] = [];
    const [dialogsToView, setDialogsToView] = React.useState<
        PreviewDialogViewModel[]
    >([]);
    //
    const [selectedItem, setSelectedItem] = React.useState<
        BaseViewModel<DialogEntity> | undefined
    >(undefined);

    const selectDialogActions = (item: BaseViewModel<DialogEntity>): void => {
        if (isOnline) {
            if (!dialogsViewModel.loading) {
                setSelectedDialog(item.entity);
                // dialogsViewModel.entity = item.entity;
            }
        }
    };

    const handleSelectedDialog = (
        dialog: BaseViewModel<DialogEntity>,
        index: number,
    ) => {
        //
        setDialogsToView((prevState) => {
            const newState = prevState.map((el) => {
                // eslint-disable-next-line no-param-reassign
                el.isSelected = false;

                return el;
            });

            newState[index].isSelected = true;

            return newState;
        });
        //
    };

    useEffect(() => {
        dialogs.slice(0);

        dialogsViewModel?.dialogs.forEach((entity) => {
            const pw: PreviewDialogViewModel = new PreviewDialogViewModel(
                (it) => {
                    if (selectDialogActions) {
                        setSelectedItem(it);
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                        selectDialogActions(it);
                    }
                },
                (it) => {
                    if (selectDialogActions) {
                        setSelectedItem(it);
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                        selectDialogActions(it);
                    }
                },
                entity,
            );

            if (
                (selectedItem && selectedItem.entity.id === entity.id) ||
                (dialogsViewModel.entity && dialogsViewModel.entity.id === entity.id)
            ) {
                pw.isSelected = true;
            }
            dialogs.push(pw);
        });

        setDialogsToView(dialogs);
    }, [dialogsViewModel?.dialogs, dialogsViewModel.entity]);
    //
    const searchedDialogs = nameDialogForSearch
        ? dialogsToView.filter(({ entity }) =>
            entity.name.toUpperCase().includes(nameDialogForSearch.toUpperCase()),
        )
        : dialogsToView;

    const [pointerEventsValue, setPointerEventsValue] = useState<string>('auto');

    let timeout: NodeJS.Timeout | number | undefined;

    useEffect(() => {
        return () => {
            if (timeout) {
                clearTimeout(timeout);
            }
        };
    }, []);

    useEffect(() => {
        if (dialogsViewModel.loading) {
            setPointerEventsValue('none');
            timeout = setTimeout(() => {
                setPointerEventsValue('auto');
            }, 12000);
        } else {
            setPointerEventsValue('auto');
        }
    }, [dialogsViewModel.loading]);

    function getMessageDateTimeSent(item: PreviewDialogViewModel): string {
        let dateInt = 0;
        let formattedValue = '';

        if (item.entity.lastMessage.dateSent) {
            dateInt = item.entity.lastMessage.dateSent;
            if (Number.isNaN(dateInt)) {
                return formattedValue;
            }
            formattedValue = getDateForDialog(dateInt * 1000);
        }

        return formattedValue;
    }

    const getDialogAvatar = (
        currentDialog: PreviewDialogViewModel,
    ): React.JSX.Element | undefined => {
        let AvatarComponent: React.JSX.Element | undefined;

        if (
            currentDialog.entity.type === DialogType.group ||
            currentDialog.entity.type === DialogType.public
        ) {
            const imagePhoto = (currentDialog.entity as GroupDialogEntity).photo;

            AvatarComponent = imagePhoto ? (
                <Avatar size="lg" src={imagePhoto} />
            ) : undefined;
        }

        return AvatarComponent;
    };

    //
    const renderDialogItem = (
        dlg: PreviewDialogViewModel,
        index: number,
        handleSelectDialog: (
            dialog: BaseViewModel<DialogEntity>,
            index: number,
        ) => void,
    ) => {
        return (
            <div
                key={dlg.entity.id}
                onClick={() => handleSelectDialog(dlg, index)}
                style={{
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    pointerEvents: pointerEventsValue || 'auto',
                }}
            >
                <PreviewDialog
                    typeDialog={dlg.entity.type || DialogType.group}
                    dialogViewModel={dlg}
                    theme={{
                        themeName: 'light',
                        selected: selectedDialog?.id === dlg.entity.id,
                        colorTheme: theme,
                        muted: false,
                    }}
                    title={`${dlg.entity.name || ''}`}
                    unreadMessageCount={dlg.entity.unreadMessageCount || undefined}
                    message_date_time_sent={getMessageDateTimeSent(dlg)}
                    previewMessage={dlg.entity.lastMessage.text}
                    dialogAvatar={getDialogAvatar(dlg)}
                    onLeaveDialog={leaveDialogHandler}
                />
            </div>
        );
    };

    return (
        <ToastProvider>
            <div className="qb-uikit-layout">
                <div
                    style={{
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.05)',
                        zIndex: '100',
                        display:
                            isLeaving || (messagesViewModel && messagesViewModel.loading)
                                ? 'block'
                                : 'none',
                    }}
                />
                <DesktopLayout
                    mainContainerStyles={{
                        minHeight: workHeight,
                        maxHeight: workHeight,
                    }}
                    onHeightChange={handleHeightChange}
                    theme={theme}
                    dialogsView={
                        showDialogList ? (
                            <DialogList
                                onDialogSelected={handleSelectedDialog}
                                scrollableHeight={dialogListScrollableHeight}
                                canScrolling={!dialogsViewModel?.loading}
                                renderHeader={
                                    <Header title="Dialogs">
                                        <SearchSvg
                                            className="dialog-list-header__icons"
                                            onClick={() => {
                                                setShowSearchDialogs(!showSearchDialogs);
                                                setNameDialogForSearch('');
                                            }}
                                        />
                                        <NewChatSvg
                                            className={cn('dialog-list-header__icons', {
                                                'dialog-list-header__icons--disable': !isOnline,
                                            })}
                                            onClick={createDialogHandler}
                                        />
                                    </Header>
                                }
                                renderFilter={
                                    showSearchDialogs ? (
                                        <TextField
                                            className="search-dialog-text-field"
                                            disabled={dialogsViewModel.loading}
                                            placeholder="Search"
                                            icon={
                                                <SearchSvg className="search-dialog-text-field__icon" />
                                            }
                                            value={nameDialogForSearch}
                                            onChange={setNameDialogForSearch}
                                        />
                                    ) : null
                                }
                                renderDialogList={(handleSelectDialog) =>
                                    // eslint-disable-next-line no-nested-ternary
                                    dialogsViewModel?.loading ? (
                                        <div
                                            className="dialog-list__loader-container"
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Loader size="md" className="dialog-list__loader" />
                                        </div>
                                    ) : searchedDialogs.length > 0 ? (
                                        searchedDialogs.map((dlg, index) =>
                                            renderDialogItem(dlg, index, handleSelectDialog),
                                        )
                                    ) : (
                                        <Placeholder
                                            icon={<ChatSvg />}
                                            text="There are no dialogs."
                                            className="dialog-empty-chat-placeholder"
                                        />
                                    )
                                }
                            />
                        ) : null
                    }
                    dialogMessagesView={
                        showDialogMessages &&
                        selectedDialog &&
                        selectedDialog &&
                        dialogsViewModel.entity ? (
                            <Dialog
                                rootStyles={{
                                    minHeight: clientContainerHeight,
                                    maxHeight: clientContainerHeight,
                                }}
                                messagesContainerStyles={
                                    isMobile
                                        ? {
                                            minHeight: messagesContainerMobileHeight,
                                            maxHeight: messagesContainerMobileHeight,
                                        }
                                        : {
                                            minHeight: messagesContainerHeight,
                                            maxHeight: messagesContainerHeight,
                                        }
                                }
                                messagesViewModel={messagesViewModel}
                                warningErrorText={warningErrorText}
                                // subHeaderContent={<CompanyLogo />}
                                // upHeaderContent={<CompanyLogo />}
                                renderHeader={
                                    <Header
                                        title={dialogsViewModel.entity.name}
                                        avatar={renderIconForTypeDialog(dialogsViewModel.entity)}
                                        onGoBack={() => setSelectedDialog(undefined)}
                                        className="dialog-header__line"
                                    >
                                        <div className="dialog-header-right">
                                            <InformationSvg
                                                className="dialog-header-right__icon"
                                                onClick={informationOpenHandler}
                                            />
                                        </div>
                                    </Header>
                                }
                                renderMessageList={
                                    messagesForView.length > 0 && (
                                        <SectionList
                                            resetScroll={scrollUpToDown}
                                            className="messages-container"
                                            onEndReached={fetchMoreData}
                                            onEndReachedThreshold={0.95}
                                            refreshing={needRefresh || messagesViewModel?.loading}
                                            renderSectionHeader={(section) => (
                                                <div className="message-view-container--system-message-wrapper">
                                                    <div
                                                        style={
                                                            theme
                                                                ? { backgroundColor: theme.disabledElements() }
                                                                : {}
                                                        }
                                                        className="message-view-container--system-message-wrapper__date_container"
                                                    >
                                                        <MessageSeparator
                                                            text={section.title}
                                                            type="date"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            renderItem={([, groupMessages], listRef) =>
                                                groupMessages.map((message) => (
                                                    <MyMessageItem
                                                        disableAction={!isOnline}
                                                        avatar={
                                                            <Avatar
                                                                src={message?.sender?.photo || ''}
                                                                icon={<UserSvg />}
                                                                size="md"
                                                            />
                                                        }
                                                        message={message}
                                                        currentUserId={currentUserId || -1}
                                                        enableForwarding={enableForwarding}
                                                        enableReplying={enableReplying}
                                                        enableCopying={enableCopying !== false}
                                                        enableEditing={enableEditing !== false}
                                                        enableDeleting={enableDeleting !== false}
                                                        onReply={(m: MessageEntity) => {
                                                            handleOnReply(m);
                                                        }}
                                                        onForward={(m: MessageEntity) => {
                                                            if (isOnline) {
                                                                setForwardMessage(m);
                                                                forwardMessageModal.toggleModal();
                                                            }
                                                        }}
                                                        onCopy={(m: MessageEntity) => {
                                                            handleOnCopy(m);
                                                        }}
                                                        onEdit={(m: MessageEntity) => {
                                                            handleOnEdit(m);
                                                        }}
                                                        onDelete={(m: MessageEntity) => {
                                                            handleOnDelete(m);
                                                        }}
                                                        onToggleReaction={handleOnToggleReaction}
                                                        onOpenReactionsList={handleOnOpenReactionsModal}
                                                        reactionMode={reactionMode}
                                                        reactionPickerData={reactionPickerData}
                                                        reactionPickerOptions={reactionPickerOptions}
                                                        canDeleteAnyMessage={
                                                            canCurrentUserDeleteAnyMessageInDialog
                                                        }
                                                        listRef={listRef}
                                                        onError={(messageError: string) => {
                                                            toast(messageError);
                                                        }}
                                                        messagesToView={messagesViewModel.messages}
                                                    />
                                                ))
                                            }
                                            sections={getSectionData(messagesForView)}
                                        />
                                    )
                                }
                                renderMessageInput={
                                    <MessageInput
                                        disableActions={!isOnline}
                                        disableAttachment={showEditMessage || isEditSubmitting}
                                        previewMessage={
                                            showEditMessage && messageToEdit ? (
                                                <div className="edit-message-preview-row">
                                                    <div className="edit-message-preview-row__content">
                                                        <div className="edit-message-preview-row__text">
                                                            {(messageToEdit.message || '').length <= 64
                                                                ? messageToEdit.message
                                                                : `${(messageToEdit.message || '').substring(0, 64)} ...`}
                                                        </div>
                                                    </div>
                                                    <div
                                                        className="edit-message-preview-row__close"
                                                        onClick={() => {
                                                            if (!isEditSubmitting) {
                                                                closeEditMessageFlowHandler();
                                                            }
                                                        }}
                                                    >
                                                        Close
                                                    </div>
                                                </div>
                                            ) : showReplyMessage ? (
                                                <ReplyMessagePreview
                                                    messages={[...messagesToReply]}
                                                    userNameSentMessage={
                                                        messagesToReply[0]?.sender?.full_name ||
                                                        messagesToReply[0]?.sender?.login ||
                                                        messagesToReply[0]?.sender?.email ||
                                                        messagesToReply[0]?.sender?.id.toString() ||
                                                        ''
                                                    }
                                                    onClose={closeReplyMessageFlowHandler}
                                                />
                                            ) : undefined
                                        }
                                        value={messageText}
                                        placeholder="Type message"
                                        loading={
                                            waitAIWidget ||
                                            messagesViewModel?.loading ||
                                            isEditSubmitting
                                        }
                                        canSend={canSendMessage}
                                        clearOnSend={!showEditMessage}
                                        onChange={(text: string) => {
                                            setMessageText(text);
                                        }}
                                        onChanging={() => {
                                            messagesViewModel.sendTypingTextMessage();
                                        }}
                                        onSend={(textToSend: string) => {
                                            sendTextMessageActions(textToSend);
                                        }}
                                        onAttachment={ChangeFileHandler}
                                        enableVoice={isRecording}
                                        onVoice={() => {
                                            if (
                                                messagesViewModel?.loading ||
                                                isEditSubmitting ||
                                                !isOnline
                                            ) {
                                                return;
                                            }
                                            setIsRecording(!isRecording);
                                        }}
                                    />
                                }
                                maxWidthToResize={maxWidthToResizing}
                                theme={theme}
                            />
                        ) : (
                            !isMobile && (
                                <div
                                    className="empty-chat-placeholder"
                                    style={{
                                        minHeight: clientContainerHeight,
                                        maxHeight: clientContainerHeight,
                                    }}
                                >
                                    <Placeholder
                                        text={['Select a chat to start messaging.']}
                                        className="empty-chat-history-placeholder"
                                    />
                                </div>
                            )
                        )
                    }
                    dialogInfoView={
                        showDialogInformation &&
                        selectedDialog &&
                        needDialogInformation &&
                        (isAllMembersShow ? (
                            <MembersList
                                closeInformationHandler={() => {
                                    setIsAllMembersShow(false);
                                }}
                                members={userViewModel.users}
                                maxHeight={dialogListScrollableHeight}
                            />
                        ) : (
                            <DialogInfo
                                disableAction={!isOnline}
                                onShowAllMemberClick={(value: boolean) => {
                                    setIsAllMembersShow(value);
                                }}
                                users={userViewModel.users}
                                rootStyles={{
                                    minHeight: clientContainerHeight,
                                    maxHeight: clientContainerHeight,
                                }}
                                dialog={selectedDialog}
                                dialogViewModel={dialogsViewModel}
                                onCloseDialogInformationHandler={informationCloseHandler}
                            />
                        ))
                    }
                />
                <DialogWindow
                    open={isOpen}
                    title="Leave dialog?"
                    onClose={handleDialogOnClick}
                >
                    <div className="dialog-leave-container">
                        <Button variant="outlined" onClick={handleDialogOnClick}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleLeaveDialog}>
                            Leave
                        </Button>
                    </div>
                </DialogWindow>
                <DialogWindow
                    title="New dialog"
                    onClose={newModal.toggleModal}
                    open={newModal.isOpen}
                    className={
                        isMobile
                            ? 'dialog-list-new-dialog-mobile-container'
                            : 'dialog-list-new-dialog-desktop-container'
                    }
                >
                    <CreateNewDialogFlow
                        dialogsViewModel={dialogsViewModel}
                        onCancel={newModal.toggleModal}
                        onFinished={(newDialog) => {
                            newModal.toggleModal();
                            setSelectedDialog(newDialog);
                        }}
                        isOnline={isOnline}
                    />
                </DialogWindow>
                {selectedDialog && (
                    <DialogWindow
                        title="Forward"
                        open={forwardMessageModal.isOpen}
                        onClose={forwardMessageModal.toggleModal}
                    >
                        <ForwardMessageFlow
                            messages={[forwardMessage!]}
                            currentDialog={selectedDialog}
                            currentUserName={userName || ''}
                            dialogs={dialogsViewModel.dialogs}
                            onSendData={handleSendData}
                            disableActions={!isOnline}
                        />
                    </DialogWindow>
                )}
                <DialogWindow
                    open={showDeleteTypeModal}
                    title={isMobile ? 'Delete message' : 'Delete message?'}
                    onClose={closeDeleteMessageFlowHandler}
                    className="delete-message-type-modal"
                >
                    <div className="delete-message-type-modal__actions">
                        <Button
                            variant="danger"
                            className="delete-message-type-modal__button delete-message-type-modal__button--everyone"
                            onClick={() => {
                                deleteMessageByTypeHandler(true);
                            }}
                        >
                            Delete for everyone
                        </Button>
                        <Button
                            variant="danger"
                            className="delete-message-type-modal__button delete-message-type-modal__button--me"
                            onClick={() => {
                                deleteMessageByTypeHandler(false);
                            }}
                        >
                            Delete for me
                        </Button>
                    </div>
                </DialogWindow>
                <DialogWindow
                    open={showDeleteConfirmModal}
                    title="Are you sure you want to delete this message?"
                    onClose={closeDeleteMessageFlowHandler}
                    className="delete-message-confirm-modal"
                >
                    <div className="delete-message-confirm-modal__content">
                        <div className="delete-message-confirm-modal__actions">
                            <Button
                                variant="danger"
                                onClick={confirmDeleteMessageHandler}
                            >
                                {deleteForEveryone ? 'Delete' : 'Delete'}
                            </Button>
                            <Button variant="outlined" onClick={closeDeleteMessageFlowHandler}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogWindow>
            </div>
        </ToastProvider>
    );
};

export default MyUIKitDesktopLayout;
