import {AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {MessageService} from './message.service';
import {CONSTANTS} from 'src/app/QBconfig';
import {DialogService} from '../dialogs/dialog.service';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['../dialogs/dialogs.component.css']
})
export class MessageComponent implements AfterViewInit {

  @Input() message: any = [];
  @ViewChild('element') el: ElementRef;
  public CONSTANTS = CONSTANTS;

  constructor(
    private messageService: MessageService,
    private dialogService: DialogService
  ) {
  }

  ngAfterViewInit() {
    if (this.message.visibilityEvent) {
      this.el.nativeElement['dataset'].messageId = this.message._id;
      this.el.nativeElement['dataset'].userId = this.message.sender_id;
      this.el.nativeElement['dataset'].dialogId = this.message.chat_dialog_id;
      this.messageService.intersectionObserver.observe(this.el.nativeElement);
    }
  }

  visibility(e) {
    this.dialogService.dialogs[e.detail.dialogId].unread_messages_count--;
    this.dialogService.dialogsEvent.emit(this.dialogService.dialogs);
    this.messageService.intersectionObserver.unobserve(this.el.nativeElement);
    this.messageService.messages = this.messageService.messages.map(message => {
      if (message._id === e.detail.messageId) {
        message.visibilityEvent = false;
      }
      return message;
    });
  }

  loadImagesEvent(e) {
    let img: any, container: Element, imgPos: number, scrollHeight: number;
    img = e.target;
    container = document.querySelector('.j-messages');
    // @ts-ignore
    imgPos = container.offsetHeight + container.scrollTop - img.offsetTop;
    scrollHeight = container.scrollTop + img.offsetHeight;

    img.classList.add('loaded');

    if (imgPos >= 0) {
      container.scrollTop = scrollHeight + 5;
    }
  }


}
