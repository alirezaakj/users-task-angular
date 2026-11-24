import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { User } from './user.model';
import { UserService } from './user.service';

@Component({
  selector: 'app-users-page',
  imports: [FormsModule],
  templateUrl: './users-page.html',
  styleUrl: './users-page.css',
})
export class UsersPage {
  readonly users: User[];
  searchText = '';

  constructor(
    private readonly userService: UserService,
    private readonly auth: AuthService,
    private readonly router: Router,
  ) {
    this.users = this.userService.getAll();
  }

  get visibleUsers(): User[] {
    const query = this.searchText.trim().toLocaleLowerCase('fa');
    return this.users.filter((user) =>
      `${user.name} ${user.email} ${user.department}`
        .toLocaleLowerCase('fa')
        .includes(query),
    );
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}
