import { Component, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ActivityLogService, UserAction } from './activity-log.service';
import { UserCsvService } from './user-csv.service';
import { UserMetricsService } from './user-metrics.service';
import { UserBackupService } from './user-backup.service';
import { UserService } from './user.service';
import {
  EMPTY_USER_DRAFT,
  User,
  UserDepartment,
  UserDraft,
  UserRole,
} from './user.model';

@Component({
  selector: 'app-user-management-page',
  imports: [DatePipe, FormsModule],
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
  csvMessage = '';
  backupMessage = '';
  editingId: number | null = null;
  selectedUser: User | null = null;
  lastDeletedUser: User | null = null;
  newUser: UserDraft = this.emptyDraft();

  constructor(
    private readonly userService: UserService,
    readonly activityLog: ActivityLogService,
    private readonly csvService: UserCsvService,
    private readonly metricsService: UserMetricsService,
    private readonly backupService: UserBackupService,
    readonly authService: AuthService,
    private readonly router: Router,
  ) {
    this.users = this.userService.getAll();
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
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

  get overview() {
    return this.metricsService.summarize(this.users);
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

    const action: UserAction = this.editingId === null ? 'افزودن' : 'ویرایش';
    const userName = this.newUser.name;
    if (this.editingId === null) {
      this.userService.add(this.newUser);
    } else {
      this.userService.update(this.editingId, this.newUser);
    }

    this.activityLog.record(action, userName);
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
    if (this.lastDeletedUser) {
      this.activityLog.record('حذف', this.lastDeletedUser.name);
    }
    this.refreshUsers();
  }

  undoDelete(): void {
    const restoredUser = this.userService.undoDelete();
    if (restoredUser) this.activityLog.record('بازگردانی', restoredUser.name);
    this.lastDeletedUser = null;
    this.refreshUsers();
  }

  exportUsers(): void {
    this.csvService.download(this.filteredUsers);
  }

  async importUsers(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    try {
      const result = this.csvService.parse(await file.text());
      let added = 0;
      let duplicates = 0;
      for (const draft of result.users) {
        if (this.userService.emailExists(draft.email)) {
          duplicates++;
          continue;
        }
        this.userService.add(draft);
        this.activityLog.record('افزودن', draft.name);
        added++;
      }

      const skipped = result.skippedRows + duplicates;
      this.csvMessage = `${added} کاربر وارد شد${skipped ? `؛ ${skipped} ردیف رد شد` : ''}.`;
      this.refreshUsers();
      this.resetFilters();
    } catch {
      this.csvMessage = 'خواندن فایل انجام نشد؛ قالب CSV را بررسی کن.';
    } finally {
      input.value = '';
    }
  }

  exportBackup(): void {
    this.backupService.download(this.userService.getAll());
  }

  async restoreBackup(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    try {
      const result = this.backupService.readFile(await file.text());
      this.userService.replaceAll(result.users);
      this.activityLog.record('بازگردانی', `${result.users.length} کاربر از فایل پشتیبان`);
      this.backupMessage = `${result.users.length} کاربر بازیابی شد${result.rejectedRows ? `؛ ${result.rejectedRows} مورد نامعتبر نادیده گرفته شد` : ''}.`;
      this.refreshUsers();
      this.resetFilters();
    } catch {
      this.backupMessage = 'فایل پشتیبان معتبر نیست یا خوانده نشد.';
    } finally {
      input.value = '';
    }
  }

  clearActivityLog(): void {
    this.activityLog.clear();
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
