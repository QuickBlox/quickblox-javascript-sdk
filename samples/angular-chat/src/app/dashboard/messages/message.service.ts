import {EventEmitter, Injectable} from '@angular/core';
import {UserService} from 'src/app/user/user.service';
import {Helpers} from '../../helper/helpers';
import {DialogService} from 'src/app/dashboard/dialogs/dialog.service';
import {DashboardService} from 'src/app/dashboard/dashboard.service';
import {CONSTANTS} from 'src/app/QBconfig';

declare var QB: any;

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  public messages: any = {};
  public datesIds: any = [];
  messagesEvent: EventEmitter<any> = new EventEmitter();
  public intersectionObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entrie) => {
      if (document.visibilityState === 'visible' && entrie.isIntersecting) {
        const params = {
          messageId: entrie.target['dataset'].messageId,
          // tslint:disable-next-line:radix
          userId: parseInt(entrie.target['dataset'].userId),
          dialogId: entrie.target['dataset'].dialogId
        };
        const event = new CustomEvent('visibility', {
          detail: {
            dialogId: entrie.target['dataset'].dialogId,
            messageId: entrie.target['dataset'].messageId,
          }
        });
        entrie.target.dispatchEvent(event);
        QB.chat.sendReadStatus(params);
      }
    });
  }, {
    threshold: [1.0]
  });

  constructor(
    private userService: UserService,
    private dialogService: DialogService,
    private dashboardService: DashboardService
  ) {
    QB.chat.onMessageListener = this.onMessageListener.bind(this);
    QB.chat.onSystemMessageListener = this.onSystemMessageListener.bind(this);
    QB.chat.onDeliveredStatusListener = this.onDeliveredStatusListener.bind(this);
    QB.chat.onReadStatusListener = this.onReadStatusListener.bind(this);
  }


  // Get Messages
  public getMessages(params): Promise<any> {
    return new Promise((resolve, reject) => {
      QB.chat.message.list(params, function (err, messages) {
        if (messages) {
          resolve(messages);
        } else {
          console.log(err);
          reject(err);
        }
      });
    });
  }

  public sendMessage(dialog, msg) {
    const
      message = JSON.parse(JSON.stringify(msg)),
      jidOrUserId = dialog.xmpp_room_jid || dialog.jidOrUserId || this.userService.getRecipientUserId(dialog.occupants_ids);
    message.id = QB.chat.send(jidOrUserId, msg);
    message.extension.dialog_id = dialog._id;
    return message;
  }

  public sendSystemMessage(userIds, systemMessage) {
    userIds.forEach((userId) => {
      QB.chat.sendSystemMessage(userId, systemMessage);
    });
  }

  public setMessages(messages, scrollTo): any {
    const
      self = this,
      uuid = messages.map((item) => {
        return item.sender_id;
      }).filter((value, index, array) => {
        return self.userService._usersCache[value] === undefined && array.indexOf(value) === index;
      });
    self.datesIds = [];
    console.log('Unique User Ids: ', uuid);
    // Get User names in Messages List and add to cache
    (new Promise(function (resolve) {
      if (uuid.length > 0) {
        self.userService.getUserList({
          field: 'id',
          value: uuid,
          per_page: uuid.length
        }).then(resolve);
      } else {
        resolve();
      }
    })).then(() => {
      messages.forEach( message => {
        if (!(message.date_sent instanceof Date)) {
          message.date_sent = new Date(+message.date_sent * 1000);
        }
        self.addMessageToDatesIds(message);
      });
      this.messages = messages;
      this.messagesEvent.emit(self.datesIds);
      setTimeout(() => {
        Helpers.scrollTo(document.querySelector('.j-messages'), scrollTo);
      }, 200);
    });
  }

  public addMessageToDatesIds(message) {
    const
      self = this,
      date = new Date(message.created_at),
      month = date.toLocaleString('en-us', {month: 'long'}),
      key = month + '/' + date.getDate();
    if (self.datesIds[key] === undefined) {
      self.datesIds[key] = [];
    }
    message['status'] = self.getMessageStatus(message);
    if (message.attachments) {
      message.attachments = message.attachments.map(attachment => {
        attachment.src = QB.content.publicUrl(attachment.id) + '.json?token=' + QB.service.getSession().token;
        return attachment;
      });
    }
    if (message.read_ids && message.read_ids.indexOf(self.userService.user.id) === -1) {
      message.visibilityEvent = true;
    }

    if (self.userService._usersCache[message.sender_id]) {
      message['full_name'] = self.userService._usersCache[message.sender_id].name;
    } else {
      message['full_name'] = message.sender_id;
    }
    self.datesIds[key].push(message);
  }

  public fillNewMessageParams(userId, msg) {
    const self = this,
      message = {
        _id: msg.id,
        attachments: [],
        created_at: +msg.extension.date_sent || Date.now(),
        date_sent: +msg.extension.date_sent || Date.now(),
        delivered_ids: [userId],
        message: msg.body,
        read_ids: [userId],
        sender_id: userId,
        chat_dialog_id: msg.extension.dialog_id,
        selfReaded: userId === this.userService.user.id,
        read: 0
      };

    if (msg.extension.attachments) {
      message.attachments = msg.extension.attachments;
    }

    if (msg.extension.notification_type) {
      message['notification_type'] = msg.extension.notification_type;
    }

    if (msg.extension.new_occupants_ids) {
      message['new_occupants_ids'] = msg.extension.new_occupants_ids;
    }

    message['status'] = (userId !== this.userService.user.id) ? self.getMessageStatus(message) : undefined;

    return message;
  }

  getMessageStatus(message) {
    if (message.sender_id !== this.userService.user.id) {
      return undefined;
    }
    const
      self = this,
      deleveredToOcuupants = message.delivered_ids.some(function (id) {
        return id !== self.userService.user.id;
      }),
      readedByOccupants = message.read_ids.some(function (id) {
        return id !== self.userService.user.id;
      });
    return !deleveredToOcuupants ? 'sent' :
      readedByOccupants ? 'read' : 'delivered';
  }

  private onSystemMessageListener = function (message) {
    const self = this;
    if (message.extension === undefined || !message.extension.dialog_id === undefined
    ) {
      return false;
    }
    switch (message.extension.notification_type) {
      case CONSTANTS.NOTIFICATION_TYPES.NEW_DIALOG :
        self.dialogService.getDialogById(message.extension.dialog_id).then(function (dialog) {
          if (
            (self.dashboardService.components.chatsClicked &&
              dialog.type !== CONSTANTS.DIALOG_TYPES.PUBLICCHAT) ||
            (!self.dashboardService.components.chatsClicked &&
              dialog.type === CONSTANTS.DIALOG_TYPES.PUBLICCHAT)
          ) {
            if (dialog.xmpp_room_jid) {
              self.dialogService.joinToDialog(dialog);
            }
            const tmpObj = {};
            tmpObj[dialog._id] = dialog;
            self.dialogService.dialogs = Object.assign(tmpObj, self.dialogService.dialogs);
            self.dialogService.dialogsEvent.emit(self.dialogService.dialogs);
          }
        }).catch(error => {
          console.error(error);
        });
        break;
      case CONSTANTS.NOTIFICATION_TYPES.UPDATE_DIALOG:
      case CONSTANTS.NOTIFICATION_TYPES.LEAVE_DIALOG:
        self.dialogService.getDialogById(message.extension.dialog_id).then(dialog => {
          if (dialog.xmpp_room_jid) {
            self.dialogService.joinToDialog(dialog);
          }
          const tmpObj = {};
          delete self.dialogService.dialogs[message.extension.dialog_id];
          tmpObj[message.extension.dialog_id] = dialog;
          self.dialogService.dialogs = Object.assign(tmpObj, self.dialogService.dialogs);
          self.dialogService.dialogsEvent.emit(self.dialogService.dialogs);
        });
        break;
    }
  };

  private onMessageListener = function (userId, message) {
    const self = this;
    message.extension.date_sent = new Date(+message.extension.date_sent * 1000);
    message = self.fillNewMessageParams(userId, message);
    if (userId === self.userService.user.id) {
      return false;
    }
    if (message.markable) {
      QB.chat.sendDeliveredStatus({
        messageId: message._id,
        userId: userId,
        dialogId: message.chat_dialog_id
      });
    }
    self.dialogService.setDialogParams(message);
    if (message.chat_dialog_id === self.dialogService.currentDialog._id) {
      self.messages.push(message);
      self.addMessageToDatesIds(message);
      self.messagesEvent.emit(self.datesIds);
    }
  };

  private onReadStatusListener = function (messageId, dialogId) {
    const self = this;
    if (dialogId === self.dialogService.currentDialog._id) {
      for (const [key, messages] of Object.entries(self.datesIds)) {
        // @ts-ignore
        for (let i = 0; i < messages.length; i++) {
          if (messages[i]._id === messageId) {
            self.datesIds[key][i].status = 'read';
          }
        }
      }
      self.messagesEvent.emit(self.datesIds);
    }
  };

  private onDeliveredStatusListener = function (messageId, dialogId) {
    const self = this;
    if (dialogId === self.dialogService.currentDialog._id) {
      for (const [key, messages] of Object.entries(self.datesIds)) {
        // @ts-ignore
        for (let i = 0; i < messages.length; i++) {
          if (messages[i]._id === messageId && self.datesIds[key][i].status !== 'read') {
            self.datesIds[key][i].status = 'delivered';
          }
        }
      }
      self.messagesEvent.emit(self.datesIds);
    }
  };


}
