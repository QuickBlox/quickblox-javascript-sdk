import { Component, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core';
import {CommunicationService} from '../../../../core/services/communication.service';
import {USERS} from '../../../../core/mocks/mock-Users';

declare var QB: any;
@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})
export class DialogComponent implements AfterViewInit {

  @ViewChild('viewer') private viewer: ElementRef;


  public clientMessage = '';
  public isBroadcast = false;
  public sender = localStorage.getItem('currentUser');
  public chatId = '';
  public recipientId = 1;
  public messages: any;

  constructor(private communication: CommunicationService
  ) {
    var params = {chat_dialog_id: this.chatId, sort_desc: 'date_sent', limit: 100, skip: 0};
    QB.chat.message.list(params, (err, messages) => {
      if (messages) {
        console.log(messages);
        this.recipientId = messages.items[0].read_ids[0];
      }else{
        console.log(err);
      }
    });

    this.chatId = this.communication.ChatID;
  }



  ngOnInit() {
    const CREDENTIALS = {
      appId: 74712,
      authKey: 'TWfJrn5hLJzLmKk',
      authSecret: '2LYz7-xugNA3rNB'
    };
    QB.init(CREDENTIALS.appId, CREDENTIALS.authKey, CREDENTIALS.authSecret);


    QB.createSession( (e, r) => {
      var params = {login: 'romanes', password: '12345678'};
      QB.login(params, (e, r) => {
        if (r) {
          const filters = null;
          QB.chat.dialog.list(filters, (err, resDialogs) => {
            if (err) {
              return err;
            } else {
              this.recipientId = resDialogs.items[0].occupants_ids[1];
              console.log(this.recipientId);
            }
          });
          QB.chat.connect({userId: r.id, password: '12345678'}, (e, roster) => {
            if (!e) {
              QB.chat.muc.join('34012_56a15ec7a0eb4791ae0003cc@muc.chat.quickblox.com', (r) => {
                console.log(r);
                var params = {chat_dialog_id: this.chatId, sort_desc: 'date_sent', limit: 100, skip: 0};
                QB.chat.message.list(params, (err, messages) => {
                  if (messages) {
                    console.log(messages.items);
                    this.messages = messages.items;
                  }else{
                    console.log(err);
                  }
                });
              });
            }
          });
        }
      });
    });
  }





  ngAfterViewInit(): void {

    this.scroll();
  }

  public toggleIsBroadcast(): void {
    this.isBroadcast = !this.isBroadcast;
  }

  public send(): void {


    const msg = {
      type: 'chat',
      body: this.clientMessage,
      extension: {
        save_to_history: 1,
      }
    };
    const opponentId = this.recipientId;
    console.log(this.recipientId);
    console.log(msg);
    QB.chat.send(opponentId, msg);
    const filters = null;
    QB.chat.dialog.list(filters, function(err, resDialogs) {
      if (err) {
        console.log(err);
      } else {
        console.log(resDialogs);
      }
    });
    this.clientMessage = '';
    this.scroll();
  }




  public getSenderInitials(sender: string): string {
    return sender && sender.substring(0, 2).toLocaleUpperCase();
  }

  public getSenderColor(sender: string): string {
    const alpha = '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZ';
    const initials = this.getSenderInitials(sender);
    const value = Math.ceil((alpha.indexOf(initials[0]) + alpha.indexOf(initials[1])) * 255 * 255 * 255 / 70);
    return '#' + value.toString(16).padEnd(6, '0');
  }

  private scroll(): void {
    setTimeout(() => {
      this.scrollToBottom();
    }, 100);
  }

  private getDiff(): number {
    if (!this.viewer) {
      return -1;
    }

    const nativeElement = this.viewer.nativeElement;
    return nativeElement.scrollHeight - (nativeElement.scrollTop + nativeElement.clientHeight);
  }

  private scrollToBottom(t = 1, b = 0): void {
    if (b < 1) {
      b = this.getDiff();
    }
    if (b > 0 && t <= 120) {
      setTimeout(() => {
        const diff = this.easeInOutSin(t / 120) * this.getDiff();
        this.viewer.nativeElement.scrollTop += diff;
        this.scrollToBottom(++t, b);
      }, 1 / 60);
    }
  }

  private easeInOutSin(t): number {
    return (1 + Math.sin(Math.PI * t - Math.PI / 2)) / 2;
  }
}
