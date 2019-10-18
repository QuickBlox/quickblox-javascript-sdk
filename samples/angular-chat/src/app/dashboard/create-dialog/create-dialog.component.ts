import {Component, Input, OnInit} from '@angular/core';
import {Helpers} from 'src/app/helper/helpers';
import {UserService} from 'src/app/user/user.service';
import {DialogService} from 'src/app/dashboard/dialogs/dialog.service';
import {DashboardService} from 'src/app/dashboard/dashboard.service';
import {MessageService} from 'src/app/dashboard/messages/message.service';
import {CONSTANTS} from 'src/app/QBconfig';

@Component({
  selector: 'app-create-dialog',
  templateUrl: './create-dialog.component.html',
  styleUrls: ['./create-dialog.component.css']
})
export class CreateDialogComponent implements OnInit {

  @Input() dialog: any;

  public loggedinUser: any;
  public userName: string;
  public users: any = [];
  public selectedUsers: number[] = [];
  public helpers: Helpers;
  public _usersCache: any;
  public messageField = '';

  constructor(
    private dashboardService: DashboardService,
    public dialogService: DialogService,
    private messageService: MessageService,
    private userService: UserService) {
    this.helpers = Helpers;
    this._usersCache = this.userService._usersCache;
    this.userService.usersCacheEvent.subscribe((usersCache: Object) => {
      this._usersCache = usersCache;
    });
  }

  ngOnInit() {
    console.log('ngOnInit');
    this.getUserList('');
    this.loggedinUser = this.userService.user;
    this.selectedUsers.push(this.loggedinUser.id);
  }

  toggleSelectItem(userId: number) {
    const index = this.selectedUsers.indexOf(userId);
    if (this.loggedinUser.id === userId) {
      return false;
    }
    if (index >= 0) {
      this.selectedUsers.splice(index, 1);
    } else {
      this.selectedUsers.push(userId);
    }
  }

  goBack() {
    this.dashboardService.showComponent({
      'createGroupClicked': false,
      'updateDialog': false,
      'onChatClick': !this.dashboardService.components.welcomeChat
    });
  }

  getUserList(args) {
    this.userService.getUserList(args).then((users) => {
      this.users = users;
    }).catch((err) => {
      console.log('Get User List Error: ', err);
    });
  }

  public onSubmit() {
    const self = this;
    const type = this.selectedUsers.length > 2 ? 2 : 3;
    const params = {
      type: type,
      occupants_ids: this.selectedUsers.join(',')
    };

    let name = '';

    if (type === 2) {
      const userNames = this.users.filter((array) => {
        return self.selectedUsers.indexOf(array.id) !== -1 && array.id !== this.loggedinUser.id;
      }).map((array) => {
        return array.full_name;
      });
      name = userNames.join(', ');
    }

    if (this.messageField) {
      name = this.messageField;
    }

    if (type !== 3 && name) {
      params['name'] = name;
    }

    this.dialogService.createDialog(params).then(dialog => {
      const
        occupantsNames = [];
      let messageBody = this.userService.user.full_name + ' created new dialog with: ';
      dialog['occupants_ids'].forEach(userId => {
        occupantsNames.push(this._usersCache[userId].name);
      });

      messageBody += occupantsNames.join(', ');

      const
        systemMessage = {
          extension: {
            notification_type: 1,
            dialog_id: dialog._id
          }
        },
        notificationMessage = {
          type: 'groupchat',
          body: messageBody,
          extension: {
            save_to_history: 1,
            dialog_id: dialog._id,
            notification_type: 1,
            date_sent: Date.now()
          }
        };

      (new Promise(function (resolve) {
        if (dialog.xmpp_room_jid) {
          self.dialogService.joinToDialog(dialog).then(() => {
            if (dialog.type === CONSTANTS.DIALOG_TYPES.GROUPCHAT) {
              const
                message = self.messageService.sendMessage(dialog, notificationMessage),
                newMessage = self.messageService.fillNewMessageParams(self.userService.user.id, message);
              self.dialogService.dialogs[dialog._id] = dialog;
              self.dialogService.setDialogParams(newMessage);
              self.messageService.messages.push(newMessage);
              self.messageService.addMessageToDatesIds(newMessage);
              self.messageService.messagesEvent.emit(self.messageService.datesIds);
            }
            resolve();
          });
        }
        resolve();
      })).then(() => {

        const userIds = dialog.occupants_ids.filter((userId) => {
          return userId !== self.userService.user.id;
        });
        self.messageService.sendSystemMessage(userIds, systemMessage);
        if (self.dialogService.dialogs[dialog._id] === undefined) {
          const tmpObj = {};
          tmpObj[dialog._id] = dialog;
          self.dialogService.dialogs = Object.assign(tmpObj, self.dialogService.dialogs);
          self.dialogService.dialogsEvent.emit(self.dialogService.dialogs);
        }

        this.dialogService.currentDialog = dialog;
        this.dialogService.currentDialogEvent.emit(dialog);
        this.dashboardService.showComponent({
          'createGroupClicked': false,
          'updateDialog': false,
          'welcomeChat': false,
          'onChatClick': true
        });
      });
    });
  }

}
