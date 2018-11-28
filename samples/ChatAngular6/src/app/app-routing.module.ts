import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {DashboardComponent} from './modules/home/pages/dashboard/dashboard.component';
import {LoginComponent} from './modules/home/pages/login/login.component';
import {DialogComponent} from './modules/home/pages/dialog/dialog.component';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {path: '' , component:
    DashboardComponent,
    canActivate: [AuthGuard]
  },
  {path: 'login' , component:
    LoginComponent
  },
  {path: 'dialog' , component:
    DialogComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
