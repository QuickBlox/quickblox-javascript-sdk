import {Component, Input, OnInit} from '@angular/core';
import {QBHelper} from 'src/app/helper/qbHelper';
import {Helpers} from 'src/app/helper/helpers';
import {UserService} from 'src/app/user/user.service';
import {DialogService} from 'src/app/dashboard/dialogs/dialog.service';
import {DashboardService} from 'src/app/dashboard/dashboard.service';
import {CONSTANTS} from 'src/app/QBconfig';
import {MessageService} from '../messages/message.service';

@Component({
  selector: 'app-edit-dialog',
  templateUrl: './edit-dialog.component.html',
  styleUrls: ['./edit-dialog.component.css']
})
export class EditDialogComponent implements OnInit {

  @Input() dialog: any;

  public loggedinUser: any;
  public userName: string;
  public users: any = [];
  public selectedUsers: number[] = [];
  public helpers: Helpers;
  public _usersCache: any;

  constructor(
    private dashboardService: DashboardService,
    private qbHelper: QBHelper,
    public dialogService: DialogService,
    private userService: UserService,
    private messageService: MessageService
  ) {
    this.helpers = Helpers;
    this._usersCache = this.userService._usersCache;
    this.userService.usersCacheEvent.subscribe((usersCache: Object) => {
      this._usersCache = usersCache;
    });
  }

  ngOnInit() {
    this.getUserList('');
    this.selectedUsers = this.selectedUsers.concat(this.dialog.occupants_ids);
  }

  toggleSelectItem(userId: number) {
    const index = this.selectedUsers.indexOf(userId);
    if (this.dialog.occupants_ids.indexOf(userId) !== -1) {
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

  showTitle(e) {

    const
      editTitleForm = document.forms['update_chat_name'],
      editTitleInput = editTitleForm.update_chat__title;

    editTitleForm.classList.toggle('active');

    if (editTitleForm.classList.contains('active')) {
      editTitleInput.removeAttribute('disabled');
      editTitleInput.focus();
    } else {
      editTitleInput.setAttribute('disabled', true);

      const params = {
        id: this.dialog._id,
        title: editTitleInput.value.trim()
      };

      if (this.dialog.name !== params.title) {

        if (this.dialog.type !== CONSTANTS.DIALOG_TYPES.GROUPCHAT) {
          return false;
        }
        const self = this,
          dialogId = this.dialog._id,
          toUpdateParams = {},
          updatedMsg = {
            type: 'groupchat',
            body: '',
            extension: {
              save_to_history: 1,
              dialog_id: dialogId,
              notification_type: 2,
              dialog_updated_at: Date.now() / 1000
            },
            markable: 1
          };

        toUpdateParams['name'] = params.title;
        updatedMsg.extension['dialog_name'] = params.title;
        updatedMsg.body = self.userService.user.full_name + ' changed the conversation name to "' + params.title + '".';

        const
          systemMessage = {
            extension: {
              notification_type: 2,
              dialog_id: dialogId
            }
          };

        self.updateDialog(toUpdateParams, updatedMsg, systemMessage, false );

        editTitleForm.classList.remove('active');
      }

    }

  }

  private updateDialog(toUpdateParams, updatedMsg, systemMessage, onChatClick = true) {
    if (this.dialog.type !== CONSTANTS.DIALOG_TYPES.GROUPCHAT) {
      return false;
    }

    const self = this,
      dialogId = this.dialog._id;

    this.dialogService.updateDialog(dialogId, toUpdateParams)
      .then(function (dialog) {
        self.dialogService.joinToDialog(dialog).then(() => {
          const
            message = self.messageService.sendMessage(dialog, updatedMsg),
            newMessage = self.messageService.fillNewMessageParams(self.userService.user.id, message);
          self.dialogService.dialogs[dialog._id] = dialog;
          self.dialogService.setDialogParams(newMessage);
          self.messageService.messages.push(newMessage);
          self.messageService.addMessageToDatesIds(newMessage);
          self.messageService.messagesEvent.emit(self.messageService.datesIds);
        });

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
        self.dialogService.currentDialog = dialog;
        self.dialogService.currentDialogEvent.emit(dialog);
        if (onChatClick) {
          self.dashboardService.showComponent({
            'createGroupClicked': false,
            'updateDialog': false,
            'welcomeChat': false,
            'onChatClick': true
          });
        }
      }).catch(function (error) {
      console.error(error);
    });
  }


  public onSubmit() {
    if (this.dialog.type !== CONSTANTS.DIALOG_TYPES.GROUPCHAT) {
      return false;
    }
    const self = this,
      dialogId = this.dialog._id,
      newUsers = this.selectedUsers.filter(function (occupantId) {
        return self.dialog.occupants_ids.indexOf(occupantId) === -1;
      }),
      usernames = newUsers.map(function (userId) {
        return self._usersCache[userId].name || userId;
      }),
      toUpdateParams = {},
      updatedMsg = {
        type: 'groupchat',
        body: '',
        extension: {
          save_to_history: 1,
          dialog_id: dialogId,
          notification_type: 2,
          dialog_updated_at: Date.now() / 1000,
          new_occupants_ids: newUsers.join(',')
        },
        markable: 1
      };

    if ('updates.userList' === 'updates.userList' && newUsers.length) {
      toUpdateParams['push_all'] = {
        occupants_ids: newUsers
      };
      updatedMsg.body = self.userService.user.full_name + ' added ' + usernames.join(', ') + '.';
      updatedMsg.extension['new_occupants_ids'] = newUsers.join(',');
    }

    const systemMessage = {
      extension: {
        notification_type: 2,
        dialog_id: dialogId,
        new_occupants_ids: newUsers.toString()
      }
    };
    self.updateDialog(toUpdateParams, updatedMsg, systemMessage, true);
  }

}
