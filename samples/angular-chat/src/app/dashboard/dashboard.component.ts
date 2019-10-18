import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {DashboardService} from './dashboard.service';
import {DialogService} from 'src/app/dashboard/dialogs/dialog.service';
import {UserService} from '../user/user.service';
import {QBHelper} from '../helper/qbHelper';
import {MessageService} from './messages/message.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  loggedinUser: any;

  public chats: any = [];

  chatsClicked = false; // For displaying OneToOne and Group Chats
  publicChatClicked = false; // For displaying Public Chats
  createGroupClicked = false; // For creating OneToOne and Group Chats
  onChatClick = false; // For displaying messages ( Dialog Component )
  welcomeChat = true; // Display default Welcome Chat screen
  updateDialog = false; // For displaying update dialog

  dialog: any;
  selectedChat: string;
  private successUnSubscribe$;

  constructor(
    private dashboardService: DashboardService,
    public dialogService: DialogService,
    private userService: UserService,
    private qbHelper: QBHelper,
    private messageService: MessageService,
    private router: Router) {
    this.dialogService.dialogsEvent.subscribe((chatData: any[]) => {
      this.chats = Object.values(chatData);
    });
    this.dialogService.currentDialogEvent.subscribe((dialog) => {
      this.selectedChat = dialog._id;
      this.dialog = dialog;
    });
    this.dashboardService.componentsEvent.subscribe((components: Object) => {
      Object.entries(components).forEach(([key, value]) => {
        this[key] = value;
      });
    });
  }

  ngOnInit() {
    this.welcomeChat = true;
    this.loggedinUser = this.userService.user;
    console.log('Logged In === ', this.loggedinUser);
    this.getChatList('chat');
  }

  // Logout
  logout(userId) {
    console.log('Logout: ', userId);
    this.qbHelper.qbLogout();
    window.location.href = '/login';
  }

  // Chats List
  getChatList(type) {
    const filter = {
      limit: 100,
      sort_desc: 'updated_at'
    };

    this.dashboardService.showComponent({
      'chatsClicked': type === 'chat',
      'publicChatClicked': type !== 'chat'
    });

    if (type === 'chat') {
      filter['type[in]'] = [3, 2].join(',');
    } else {
      filter['type'] = 1;
    }

    this.dialogService.getDialogs(filter)
      .then((res) => {
        if (res) {
          res['items'].forEach((chat, index, self ) => {
            if ( chat.xmpp_room_jid ) {
              this.dialogService.joinToDialog(chat);
            }
            self[index].last_message_date_sent = +chat.last_message_date_sent * 1000;
          });
          this.dialogService.setDialogs(res['items']);
        }
      })
      .catch((err) => {
        console.log('Get chats error: ' + err);
      });
  }

  // Create New Group
  createNewGroup() {
    this.dashboardService.showComponent({
      'createGroupClicked': true,
      'updateDialog': false,
      'welcomeChat': false,
      'onChatClick': false
    });
  }

  // Open Chat
  openChat(chat) {
    this.selectedChat = chat._id;
    this.dialogService.currentDialog = chat;
    this.dialogService.currentDialogEvent.emit(chat);
    this.dashboardService.showComponent({
      'createGroupClicked': false,
      'updateDialog': false,
      'welcomeChat': false,
      'onChatClick': true
    });
  }

}
