import { Component, OnInit } from '@angular/core';


declare var QB: any;

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})
export class DialogComponent implements OnInit {

  msg: any;

  constructor() { }

  ngOnInit() {
    const CONFIG = {
      chatProtocol: {
        active: 2 // set 1 to use bosh, set 2 to use websockets (default)
      },
      debug: {mode: 1} //  debug mode
    };
    const CREDENTIALS = {
      appId: 74712,
      authKey: 'TWfJrn5hLJzLmKk',
      authSecret: '2LYz7-xugNA3rNB'
    };

    QB.init(CREDENTIALS.appId, CREDENTIALS.authKey, CREDENTIALS.authSecret, CONFIG);


    QB.createSession(function (e, r) {
      var params = {login: 'romanes', password: '12345678'};
      QB.login(params, function (e, r) {
        if (r) {
          QB.chat.connect({userId: r.id, password: '12345678'}, function (e, roster) {
            if (!e) {
              QB.chat.muc.join("34012_56a15ec7a0eb4791ae0003cc@muc.chat.quickblox.com", function (r) {
                console.log(r);
              });
            }
          });
        }
      });
    });
  }

  onSubmit() {

    this.sendMessage(this.msg);
    return 2;
  }

  sendMessage(text) {
    const msg = {
      type: 'chat',
      body: text,
      extension: {
        save_to_history: 1,
      }
    };

    const opponentId = 68829717;
    QB.chat.send(opponentId, msg);


    const filters = null;
    QB.chat.dialog.list(filters, function(err, resDialogs) {
      if (err) {
        console.log(err);
      } else {
        console.log(resDialogs);
      }
    });
  }
  }




