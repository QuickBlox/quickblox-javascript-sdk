import React, { useEffect, useState } from 'react';
import {BaseViewModel, DesktopLayout, DialogEntity, DialogEventInfo, DialogInformation, DialogsComponent, DialogsViewModel,
  EventMessageType,
  MessagesView,
  NotificationTypes,
  Pagination,
  stringifyError,
  SubscribeToDialogEventsUseCase, useDialogsViewModel, useEventMessagesRepository, useQbDataContext } from 'quickblox-react-ui-kit';

function Desktop() {
  const [selectedDialog, setSelectedDialog] =
    React.useState<BaseViewModel<DialogEntity>>();

  const currentContext = useQbDataContext();
  const eventMessaging = useEventMessagesRepository();
  const  userName  =
    currentContext.storage.REMOTE_DATA_SOURCE.authInformation?.userName;
  const userId =
    currentContext.storage.REMOTE_DATA_SOURCE.authInformation?.userId;

  const dialogsViewModel: DialogsViewModel =
    useDialogsViewModel(currentContext);

  const subscribeToDialogEventsUseCase: SubscribeToDialogEventsUseCase =
    new SubscribeToDialogEventsUseCase(eventMessaging, 'TestStage');

  const isAuthProcessed = (): boolean => {
    const result =
      currentContext.storage.REMOTE_DATA_SOURCE.needInit === false &&
      currentContext.storage.REMOTE_DATA_SOURCE.authProcessed &&
      currentContext.storage.CONNECTION_REPOSITORY.needInit === false;

    return result;
  };

  useEffect(() => {
    if (isAuthProcessed()) {
      const pagination: Pagination = new Pagination();

      dialogsViewModel?.getDialogs(pagination);
    }

    return () => {
      dialogsViewModel.release();
    };
  }, []);

  const dialogsEventHandler = (dialogInfo: DialogEventInfo) => {
    if (dialogInfo.eventMessageType === EventMessageType.SystemMessage) {
      switch (dialogInfo.notificationTypes) {
        case NotificationTypes.DELETE_LEAVE_DIALOG: {
          if (
            dialogInfo.messageInfo &&
            dialogInfo.messageInfo.sender_id === userId
          ) {
            setSelectedDialog(undefined);
          }

          break;
        }
        default: {
          const pagination: Pagination = new Pagination();

          dialogsViewModel?.getDialogs(pagination);
          break;
        }
      }
    }
  };

  useEffect(() => {
    if (isAuthProcessed()) {
      const pagination: Pagination = new Pagination();

      dialogsViewModel?.getDialogs(pagination);

      subscribeToDialogEventsUseCase
        .execute(dialogsEventHandler)
        .catch((reason) => {
          console.log(stringifyError(reason));
        });
    }
  }, [currentContext.InitParams]);

  useEffect(() => {
    if (selectedDialog) {
      dialogsViewModel.entity = selectedDialog.entity!;
    }
  }, [selectedDialog]);

  const [needDialogInformation, setNeedDialogInformation] = useState(true);
  const informationCloseHandler = (): void => {
    setNeedDialogInformation(false);
  };
  const informationOpenHandler = (): void => {
    setNeedDialogInformation(true);
  };

  return (
    <DesktopLayout
      dialogsView={
        <DialogsComponent
          dialogsViewModel={dialogsViewModel}
          itemSelectHandler={setSelectedDialog}
          additionalSettings={{ withoutHeader: false }}
        />
      }
      dialogMessagesView={
        selectedDialog && selectedDialog.entity ? (
          <MessagesView
            dialog={selectedDialog?.entity}
            InformationHandler={informationOpenHandler}
            maxWidthToResize={
              selectedDialog && needDialogInformation ? undefined : '1040px'
            }
          />
        ) : (
          <div
            style={{
              minHeight: '799px',
              minWidth: '1040px',
              border: '1px solid var(--divider)',
              margin: '0 auto',
            }}
          >
            You login as {userName}({userId}). Select chat to start
            conversation.
          </div>
        )
      }
      dialogInfoView={
        <div>
          {selectedDialog && needDialogInformation && (
            <DialogInformation
              dialog={selectedDialog.entity}
              dialogViewModel={dialogsViewModel}
              closeInformationHandler={informationCloseHandler}
            />
          )}
        </div>
      }
    />
  );
}

export default Desktop;
