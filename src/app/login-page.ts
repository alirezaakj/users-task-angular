import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountRole, AuthService } from './auth.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {
  constructor(
    private readonly auth: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  chooseRole(role: AccountRole): void {
    this.auth.loginAs(role);
    const requestedPath = this.route.snapshot.queryParamMap.get('returnUrl');
    const destination = requestedPath?.startsWith('/')
      ? requestedPath
      : role === 'admin'
        ? '/admin'
        : '/users';

    void this.router.navigateByUrl(destination);
  }
}
