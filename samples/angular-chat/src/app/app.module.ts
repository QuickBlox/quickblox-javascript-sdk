import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {LoginComponent} from './user/login/login.component';
import {UserModule} from './user/user.module';
import {QBHelper} from './helper/qbHelper';
import {Helpers} from './helper/helpers';
import {DashboardComponent} from './dashboard/dashboard.component';
import {DialogsComponent} from './dashboard/dialogs/dialogs.component';
import {CreateDialogComponent} from './dashboard/create-dialog/create-dialog.component';
import {EditDialogComponent} from './dashboard/edit-dialog/edit-dialog.component';
import {MessageComponent} from './dashboard/messages/message.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    DialogsComponent,
    CreateDialogComponent,
    EditDialogComponent,
    MessageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    UserModule
  ],
  providers: [
    QBHelper,
    Helpers
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule {
}
