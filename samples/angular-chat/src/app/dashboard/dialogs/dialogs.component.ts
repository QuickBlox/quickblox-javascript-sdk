import {Component, ElementRef, Input, OnChanges, ViewChild} from '@angular/core';
import {CONSTANTS} from 'src/app/QBconfig';
import {QBHelper} from 'src/app/helper/qbHelper';
import {DialogService} from 'src/app/dashboard/dialogs/dialog.service';
import {UserService} from 'src/app/user/user.service';
import {MessageService} from 'src/app/dashboard/messages/message.service';
import {DashboardService} from 'src/app/dashboard/dashboard.service';
import {Helpers} from '../../helper/helpers';

@Component({
  selector: 'app-dialogs',
  templateUrl: './dialogs.component.html',
  styleUrls: ['./dialogs.component.css']
})
export class DialogsComponent implements OnChanges {

  @Input() dialog: any;
  @ViewChild('field') field: ElementRef;

  chatName: string;
  CONSTANTS = CONSTANTS;
  messages: any = [];
  messageField = '';
  userId = this.userService.user.id;
  attachments: any = [];
  shiftDown = false;

  constructor(
    private dashboardService: DashboardService,
    private dialogService: DialogService,
    private qbHelper: QBHelper,
    private userService: UserService,
    private messageService: MessageService
  ) {
    this.dialogService.currentDialogEvent.subscribe((dilog: Object) => {
      this.dialog = dilog;
    });
    this.messageService.messagesEvent.subscribe((messages: Object) => {
      this.messages = Object.keys(messages).map(function (key) {
        return [key, messages[key]];
      });
    });
  }

  ngOnChanges() {
    this.messageField = '';
    this.field.nativeElement.focus();
    const
      self = this,
      params = {
        chat_dialog_id: this.dialog._id,
        sort_desc: 'date_sent',
        limit: 50,
        skip: 0,
        mark_as_read: 0
      };
    self.dialogService.currentDialog.full = false;
    this.messageService.getMessages(params)
      .then((res) => {
        if (res.items.length < 50) {
          self.dialogService.currentDialog.full = true;
        }
        this.messageService.setMessages(res.items.reverse(), 'bottom');
      })
      .catch((err) => {
        console.log('Messages Error: ', err);
      });
  }

  loadMoreMessages(e) {
    const
      self = this,
      elem = e.currentTarget;
    if (this.dialogService.currentDialog.full !== undefined && this.dialogService.currentDialog.full) {
      delete elem.dataset.loading;
      return false;
    }
    if (elem.scrollTop < 150 && !elem.dataset.loading) {
      elem.dataset.loading = true;
      const params = {
        chat_dialog_id: this.dialog._id,
        sort_desc: 'date_sent',
        limit: 50,
        skip: this.messageService.messages.length,
        mark_as_read: 0
      };
      this.messageService.getMessages(params)
        .then((res) => {
          if (res.items.length < 50) {
            self.dialogService.currentDialog.full = true;
          }
          self.messageService.setMessages(
            res.items.reverse().concat(self.messageService.messages), 'top');
          delete elem.dataset.loading;
        })
        .catch((err) => {
          console.log('Messages Error: ', err);
        });
    }
  }

  public showUpdateDialog() {
    this.dashboardService.showComponent({
      'createGroupClicked': false,
      'updateDialog': true,
      'welcomeChat': false,
      'onChatClick': false
    });
  }

  public quitFromTheDialog() {
    const self = this,
      dialog = this.dialog;

    switch (dialog.type) {
      case CONSTANTS.DIALOG_TYPES.PUBLICCHAT:
        alert('you can\'t remove this dialog');
        break;
      case CONSTANTS.DIALOG_TYPES.CHAT:
      case CONSTANTS.DIALOG_TYPES.GROUPCHAT:
        if (CONSTANTS.DIALOG_TYPES.GROUPCHAT === dialog.type) {
          // remove user from current  group dialog;
          const msg = {
            type: 'groupchat',
            body: self.userService.user.full_name + ' left the chat.',
            extension: {
              save_to_history: 1,
              dialog_id: dialog._id,
              notification_type: 3,
              dialog_updated_at: Date.now() / 1000
            },
            markable: 1
          };
          this.messageService.sendMessage(this.dialog, msg);
          const systemMessage = {
            extension: {
              notification_type: 3,
              dialog_id: dialog._id
            }
          };
          const userIds = dialog.occupants_ids.filter((userId) => {
            return userId !== self.userService.user.id;
          });
          this.messageService.sendSystemMessage(userIds, systemMessage);
        }
        this.dialogService.deleteDialogByIds([this.dialog._id]);
        this.dashboardService.showComponent({
          'createGroupClicked': false,
          'updateDialog': false,
          'welcomeChat': true,
          'onChatClick': false
        });
        break;
    }
  }

  prepareToUpload(e) {
    const self = this,
      files = e.currentTarget.files,
      dialogId = this.dialogService.currentDialog._id;
    for (let i = 0; i < files.length; i++) {
      self.uploadFilesAndGetIds(files[i], dialogId);
    }
    e.currentTarget.value = null;
  }

  uploadFilesAndGetIds(file, dialogId) {
    if (file.size >= CONSTANTS.ATTACHMENT.MAXSIZE) {
      return alert(CONSTANTS.ATTACHMENT.MAXSIZEMESSAGE);
    }
    this.attachments = [{
      id: 'isLoading',
      src: URL.createObjectURL(file)
    }];
    const self = this;
    this.qbHelper.abCreateAndUpload(file).
      then(response => {
        self.attachments = [];
        const attachments = [{id: response.uid, type: CONSTANTS.ATTACHMENT.TYPE}];
        self.sendMessage(CONSTANTS.ATTACHMENT.BODY, attachments);
      }).catch(err => {
        self.attachments = [];
        alert('ERROR: ' + err.detail);
      });
  }

  onSubmit() {
    if (this.messageField) {
      this.sendMessage(this.messageField);
      this.messageField = null;
    }
  }

  sendMessage(body, attachments: any = false) {
    const
      self = this,
      msg = {
        type: self.dialog.type === 3 ? 'chat' : 'groupchat',
        body: body,
        extension: {
          save_to_history: 1,
          dialog_id: self.dialog._id
        },
        markable: 1
      };
    if (attachments) {
      msg.extension['attachments'] = attachments;
    }
    const
      message = self.messageService.sendMessage(self.dialog, msg),
      newMessage = self.messageService.fillNewMessageParams(self.userService.user.id, message);
    self.dialogService.setDialogParams(newMessage);
    self.messageService.messages.push(newMessage);
    self.messageService.addMessageToDatesIds(newMessage);
    self.messageService.messagesEvent.emit(self.messageService.datesIds);
    setTimeout(() => {
      Helpers.scrollTo(document.querySelector('.j-messages'), 'bottom');
    }, 200);
  }

  onKeydown(e) {
    if (e.repeat && e.key === 'Shift') {
      this.shiftDown = true;
    }
    if (e.key === 'Enter' && !this.shiftDown) {
      this.onSubmit();
      return false;
    }
  }
}
