import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  active: boolean;
}

const starterUsers: User[] = [
  { id: 1, name: 'علی رضایی', email: 'alirezai@comp.ir', role: 'مدیر سیستم', department: 'فناوری اطلاعات', active: true },
  { id: 2, name: 'سارا امینی', email: 'saraamini@comp.ir', role: 'کارشناس', department: 'منابع انسانی', active: true },
  { id: 3, name: 'پارسا نوری', email: 'parsanori@comp.ir', role: 'پشتیبان', department: 'فناوری اطلاعات', active: false },
];

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('مدیریت کاربران');
  private readonly storageKey = 'user-management-users-v1';
  users: User[] = this.loadUsers();

  searchText = '';
  roleFilter = 'همه نقش‌ها';
  statusFilter: 'all' | 'active' | 'inactive' = 'all';
  sortAscending = true;

  showUserForm = false;
  editingId: number | null = null;
  selectedUser: User | null = null;
  lastDeletedUser: User | null = null;
  private lastDeletedIndex = 0;

  newUser: User = this.emptyUser();

  get filteredUsers(): User[] {
    const query = this.searchText.trim().toLowerCase();

    return this.users
      .filter((user) => {
        const matchesText =
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.department.toLowerCase().includes(query);

        const matchesRole =
          this.roleFilter === 'همه نقش‌ها' ||
          user.role === this.roleFilter;

        const matchesStatus =
          this.statusFilter === 'all' ||
          (this.statusFilter === 'active' && user.active) ||
          (this.statusFilter === 'inactive' && !user.active);

        return matchesText && matchesRole && matchesStatus;
      })
      .sort((a, b) => {
        const result = a.name.localeCompare(b.name, 'fa');
        return this.sortAscending ? result : -result;
      });
  }

  get activeCount(): number {
    return this.users.filter((user) => user.active).length;
  }

  get inactiveCount(): number {
    return this.users.filter((user) => !user.active).length;
  }

  openAddForm(): void {
    this.editingId = null;
    this.newUser = this.emptyUser();
    this.showUserForm = true;
  }

  editUser(user: User): void {
    this.editingId = user.id;
    this.newUser = { ...user };
    this.showUserForm = true;
  }

  saveUser(): void {
    if (this.editingId !== null) {
      this.users = this.users.map((user) =>
        user.id === this.editingId
          ? { ...this.newUser, id: this.editingId }
          : user,
      );
    } else {
      const nextId =
        Math.max(...this.users.map((user) => user.id), 0) + 1;

      this.users = [
        ...this.users,
        { ...this.newUser, id: nextId },
      ];
    }

    this.persistUsers();
    this.closeForm();
    this.searchText = '';
    this.roleFilter = 'همه نقش‌ها';
  }

  closeForm(): void {
    this.showUserForm = false;
    this.editingId = null;
    this.newUser = this.emptyUser();
  }

  deleteUser(id: number): void {
    const confirmed = window.confirm('از حذف این کاربر مطمئنی؟');

    if (confirmed) {
      this.lastDeletedIndex = this.users.findIndex((user) => user.id === id);
      this.lastDeletedUser = this.users.find((user) => user.id === id) ?? null;
      this.users = this.users.filter((user) => user.id !== id);
      this.persistUsers();
    }
  }

  undoDelete(): void {
    if (!this.lastDeletedUser) return;

    const restoredUsers = [...this.users];
    restoredUsers.splice(this.lastDeletedIndex, 0, this.lastDeletedUser);
    this.users = restoredUsers;
    this.lastDeletedUser = null;
    this.persistUsers();
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

  private emptyUser(): User {
    return {
      id: 0,
      name: '',
      email: '',
      role: 'کارشناس',
      department: 'فناوری اطلاعات',
      active: true,
    };
  }

  private loadUsers(): User[] {
    try {
      const savedUsers = localStorage.getItem(this.storageKey);
      return savedUsers
        ? (JSON.parse(savedUsers) as User[]).map((user) => ({
            ...user,
            department: user.department ?? 'فناوری اطلاعات',
          }))
        : [...starterUsers];
    } catch {
      return [...starterUsers];
    }
  }

  private persistUsers(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.users));
  }
}
