import { Routes } from '@angular/router';
import { App } from './app';
import { authGuard } from './auth.guard';
import { ForbiddenPage } from './forbidden-page';
import { LoginPage } from './login-page';
import { UsersPage } from './users-page';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginPage },
  {
    path: 'admin',
    component: App,
    canActivate: [authGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'users',
    component: UsersPage,
    canActivate: [authGuard],
  },
  { path: 'forbidden', component: ForbiddenPage },
  { path: '**', redirectTo: 'login' },
];
