import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from './user.service';
import {
  EMPTY_USER_DRAFT,
  User,
  UserDepartment,
  UserDraft,
  UserRole,
} from './user.model';

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('مدیریت کاربران');
  readonly roles: readonly UserRole[] = [
    'مدیر سیستم',
    'کارشناس',
    'پشتیبان',
  ];
  readonly departments: readonly UserDepartment[] = [
    'فناوری اطلاعات',
    'منابع انسانی',
    'مالی',
    'پشتیبانی مشتریان',
  ];

  users: User[];
  searchText = '';
  roleFilter: UserRole | 'all' = 'all';
  statusFilter: 'all' | 'active' | 'inactive' = 'all';
  sortAscending = true;

  showUserForm = false;
  formError = '';
  editingId: number | null = null;
  selectedUser: User | null = null;
  lastDeletedUser: User | null = null;
  newUser: UserDraft = this.emptyDraft();

  constructor(private readonly userService: UserService) {
    this.users = this.userService.getAll();
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
    return this.userService.getActiveCount();
  }

  get inactiveCount(): number {
    return this.userService.getInactiveCount();
  }

  openAddForm(): void {
    this.editingId = null;
    this.newUser = this.emptyDraft();
    this.showUserForm = true;
  }

  editUser(user: User): void {
    this.editingId = user.id;
    this.newUser = this.toDraft(user);
    this.showUserForm = true;
  }

  saveUser(): void {
    if (this.userService.emailExists(this.newUser.email, this.editingId ?? undefined)) {
      this.formError = 'این ایمیل قبلاً برای کاربر دیگری ثبت شده است.';
      return;
    }

    if (this.editingId === null) {
      this.userService.add(this.newUser);
    } else {
      this.userService.update(this.editingId, this.newUser);
    }

    this.refreshUsers();
    this.closeForm();
    this.resetFilters();
  }

  closeForm(): void {
    this.showUserForm = false;
    this.formError = '';
    this.editingId = null;
    this.newUser = this.emptyDraft();
  }

  deleteUser(id: number): void {
    if (!window.confirm('از حذف این کاربر مطمئنی؟')) return;

    this.lastDeletedUser = this.userService.delete(id);
    this.refreshUsers();
  }

  undoDelete(): void {
    this.userService.undoDelete();
    this.lastDeletedUser = null;
    this.refreshUsers();
  }

  dismissUndo(): void {
    this.lastDeletedUser = null;
  }

  viewUser(user: User): void {
    this.selectedUser = user;
  }

  closeDetails(): void {
    this.selectedUser = null;
  }

  toggleSort(): void {
    this.sortAscending = !this.sortAscending;
  }

  private refreshUsers(): void {
    this.users = this.userService.getAll();
  }

  private resetFilters(): void {
    this.searchText = '';
    this.roleFilter = 'all';
    this.statusFilter = 'all';
  }

  private emptyDraft(): UserDraft {
    return { ...EMPTY_USER_DRAFT };
  }

  private toDraft(user: User): UserDraft {
    const { id: _id, ...draft } = user;
    return draft;
  }
}
