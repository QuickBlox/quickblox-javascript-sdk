import {EventEmitter, Injectable} from '@angular/core';
import {UserService} from 'src/app/user/user.service';

declare var QB: any;

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  public currentDialog: any = {};
  public dialogs: any = {};
  dialogsEvent: EventEmitter<any> = new EventEmitter();
  currentDialogEvent: EventEmitter<any> = new EventEmitter();

  constructor(
    private userService: UserService
  ) {
  }

  // create Dialog
  public createDialog(params): Promise<any> {
    return new Promise((resolve, reject) => {
      QB.chat.dialog.create(params, function (createErr, createRes) {
        if (createErr) {
          console.log('Dialog creation Error : ', createErr);
          reject(createErr);
        } else {
          console.log('Dialog Creation successfull ');
          resolve(createRes);
        }
      });
    });
  }

  // get dialogs
  public getDialogs(args): Promise<any> {
    return new Promise((resolve, reject) => {
      QB.chat.dialog.list(args, (err, resDialogs) => {
        if (err) {
          console.log('Dialog error: ', err);
          reject(err);
        } else {
          console.log('Dialog List: ', resDialogs);
          resolve(resDialogs);
        }
      });
    });
  }

  getDialogById(id): Promise<any> {
    return new Promise(function(resolve, reject) {
      QB.chat.dialog.list({'_id': id}, function (err, res) {
        if (err) {
          console.error(err);
          reject(err);
        }
        const dialog = res.items[0];
        if (dialog) {
          resolve(dialog);
        } else {
          reject(new Error('can\'t find dialog with this id: ' + id));
        }
      });
    });
  }

  public updateDialog(dialogId, params): Promise<any> {
    return new Promise(function (resolve, reject) {
      QB.chat.dialog.update(dialogId, params, function (err, dialog) {
        if (err) {
          reject(err);
        } else {
          resolve(dialog);
        }
      });
    });
  }

  public deleteDialogByIds(dialogIds): Promise<any> {
    const self = this;
    return new Promise((resolve, reject) => {
      QB.chat.dialog.delete(dialogIds, function (err) {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          dialogIds.forEach(dialogId => {
            delete self.dialogs[dialogId];
          });
          self.setDialogs(Object.values(self.dialogs));
          resolve();
        }
      });
    });
  }

  public setDialogs(chats): any {
    this.dialogs = chats.reduce((obj, item) => {
      obj[item._id] = item;
      return obj;
    }, {});
    this.dialogsEvent.emit(this.dialogs);
  }

  public joinToDialog(dialog): Promise<any> {
    return new Promise((resolve, reject) => {
      const
        jidOrUserId = dialog.xmpp_room_jid || dialog.jidOrUserId || this.userService.getRecipientUserId(dialog.occupants_ids);
      QB.chat.muc.join(jidOrUserId, function (resultStanza) {
        for (let i = 0; i < resultStanza.childNodes.length; i++) {
          const elItem = resultStanza.childNodes.item(i);
          if (elItem.tagName === 'error') {
            console.log(resultStanza);
            return reject();
          }
        }
        resolve();
      });
    });
  }

  public setDialogParams(message) {
    const
      self = this,
      tmpObj = {};
    tmpObj[message.chat_dialog_id] = self.dialogs[message.chat_dialog_id];
    tmpObj[message.chat_dialog_id].last_message = message.message;
    tmpObj[message.chat_dialog_id].last_message_date_sent = message.date_sent;
    tmpObj[message.chat_dialog_id].last_message_id = message._id;
    tmpObj[message.chat_dialog_id].last_message_user_id = message.sender_id;
    if (!message.selfReaded) {
      tmpObj[message.chat_dialog_id].unread_messages_count++;
    }
    delete self.dialogs[message.chat_dialog_id];
    self.dialogs = Object.assign(tmpObj, self.dialogs);
    self.dialogsEvent.emit(self.dialogs);
  }

}
