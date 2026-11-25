import { Injectable } from '@angular/core';
import { INITIAL_USERS, User, UserDraft, UserFilters } from './user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly storageKey = 'user-management-users-v1';
  private users = this.loadUsers();
  private deletedUser: { user: User; index: number } | null = null;

  getAll(): User[] {
    return [...this.users];
  }

  getActiveCount(): number {
    return this.users.filter((user) => user.active).length;
  }

  getInactiveCount(): number {
    return this.users.length - this.getActiveCount();
  }

  filter(filters: UserFilters): User[] {
    const query = filters.query.trim().toLowerCase();

    return this.users
      .filter((user) => {
        const text = `${user.name} ${user.email} ${user.department}`.toLowerCase();
        const matchesText = text.includes(query);
        const matchesRole = filters.role === 'all' || user.role === filters.role;
        const matchesStatus = filters.status === 'all' ||
          (filters.status === 'active' ? user.active : !user.active);

        return matchesText && matchesRole && matchesStatus;
      })
      .sort((first, second) => {
        const order = first.name.localeCompare(second.name, 'fa');
        return filters.sortAscending ? order : -order;
      });
  }

  emailExists(email: string, exceptId?: number): boolean {
    const value = email.trim().toLowerCase();
    return this.users.some((user) => user.id !== exceptId && user.email.toLowerCase() === value);
  }

  add(draft: UserDraft): User {
    const id = Math.max(0, ...this.users.map((user) => user.id)) + 1;
    const created = { ...draft, id, name: draft.name.trim(), email: draft.email.trim().toLowerCase() };
    this.users = [...this.users, created];
    this.saveUsers();
    return created;
  }

  update(id: number, draft: UserDraft): User | null {
    if (!this.users.some((user) => user.id === id)) return null;
    const updated = { ...draft, id, name: draft.name.trim(), email: draft.email.trim().toLowerCase() };
    this.users = this.users.map((user) => user.id === id
      ? updated
      : user);
    this.saveUsers();
    return updated;
  }

  delete(id: number): User | null {
    const index = this.users.findIndex((user) => user.id === id);
    if (index < 0) return null;
    const [removed] = this.users.splice(index, 1);
    this.deletedUser = { user: removed, index };
    this.saveUsers();
    return removed;
  }

  undoDelete(): User | null {
    if (!this.deletedUser) return null;
    const { user, index } = this.deletedUser;
    this.users.splice(index, 0, user);
    this.deletedUser = null;
    this.saveUsers();
    return user;
  }

  private loadUsers(): User[] {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? JSON.parse(saved) as User[] : [...INITIAL_USERS];
    } catch {
      return [...INITIAL_USERS];
    }
  }

  private saveUsers(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.users));
  }
}
