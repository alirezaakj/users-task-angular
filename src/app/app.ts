import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { EMPTY_USER, USER_DEPARTMENTS, USER_ROLES, User, UserDraft } from './user.model';
import { UserService } from './user.service';

@Component({
  selector: 'app-user-management-page',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly title = 'مدیریت کاربران';
  readonly roles = USER_ROLES;
  readonly departments = USER_DEPARTMENTS;
  readonly isAdmin: boolean;
  users: User[];
  searchText = '';
  roleFilter = 'all';
  statusFilter = 'all';
  sortAscending = true;
  showUserForm = false;
  editingId: number | null = null;
  selectedUser: User | null = null;
  formError = '';
  newUser: UserDraft = { ...EMPTY_USER };

  constructor(
    private readonly userService: UserService,
    private readonly auth: AuthService,
    private readonly router: Router,
  ) {
    this.users = this.userService.getAll();
    this.isAdmin = this.auth.canManageUsers();
  }

  get filteredUsers(): User[] {
    return this.userService.filter({
      query: this.searchText,
      role: this.roleFilter,
      status: this.statusFilter,
      sortAscending: this.sortAscending,
    });
  }

  get activeCount(): number {
    return this.users.filter((user) => user.active).length;
  }

  get inactiveCount(): number {
    return this.users.length - this.activeCount;
  }

  openAddForm(): void {
    this.editingId = null;
    this.newUser = { ...EMPTY_USER };
    this.formError = '';
    this.showUserForm = true;
  }

  editUser(user: User): void {
    this.editingId = user.id;
    this.newUser = { ...user };
    this.formError = '';
    this.showUserForm = true;
  }

  saveUser(): void {
    if (this.userService.emailExists(this.newUser.email, this.editingId ?? undefined)) {
      this.formError = 'این ایمیل قبلاً برای کاربر دیگری ثبت شده است.';
      return;
    }

    if (this.editingId === null) this.userService.add(this.newUser);
    else this.userService.update(this.editingId, this.newUser);

    this.users = this.userService.getAll();
    this.closeForm();
  }

  deleteUser(id: number): void {
    if (!window.confirm('از حذف این کاربر مطمئنی؟')) return;
    this.userService.delete(id);
    this.users = this.userService.getAll();
  }

  closeForm(): void {
    this.showUserForm = false;
    this.editingId = null;
    this.formError = '';
    this.newUser = { ...EMPTY_USER };
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }

  toggleSort(): void {
    this.sortAscending = !this.sortAscending;
  }
}
