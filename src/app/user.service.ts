import { Injectable } from '@angular/core';
import {
  INITIAL_USERS,
  User,
  UserDraft,
  UserFilters,
} from './user.model';

interface DeletedUser {
  user: User;
  index: number;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly storageKey = 'user-management-users-v1';
  private users = this.readUsers();
  private deletedUser: DeletedUser | null = null;

  getAll(): User[] {
    return this.users.map((user) => ({ ...user }));
  }

  getActiveCount(): number {
    return this.users.filter((user) => user.active).length;
  }

  getInactiveCount(): number {
    return this.users.filter((user) => !user.active).length;
  }

  emailExists(email: string, exceptId?: number): boolean {
    const normalizedEmail = email.trim().toLocaleLowerCase('en');
    return this.users.some(
      (user) =>
        user.id !== exceptId &&
        user.email.trim().toLocaleLowerCase('en') === normalizedEmail,
    );
  }

  filter(filters: UserFilters): User[] {
    const query = filters.query.trim().toLocaleLowerCase('fa');

    return this.users
      .filter((user) => {
        const searchableText = `${user.name} ${user.email} ${user.department}`
          .toLocaleLowerCase('fa');
        const matchesQuery = searchableText.includes(query);
        const matchesRole = filters.role === 'all' || user.role === filters.role;
        const matchesStatus =
          filters.status === 'all' ||
          (filters.status === 'active' && user.active) ||
          (filters.status === 'inactive' && !user.active);

        return matchesQuery && matchesRole && matchesStatus;
      })
      .sort((first, second) => {
        const order = first.name.localeCompare(second.name, 'fa');
        return filters.sortAscending ? order : -order;
      });
  }

  add(draft: UserDraft): User {
    const nextId = Math.max(0, ...this.users.map((user) => user.id)) + 1;
    const created: User = { ...this.normalizeDraft(draft), id: nextId };
    this.users = [...this.users, created];
    this.persist();
    return { ...created };
  }

  update(id: number, draft: UserDraft): User | null {
    const exists = this.users.some((user) => user.id === id);
    if (!exists) return null;

    const updated: User = { ...this.normalizeDraft(draft), id };
    this.users = this.users.map((user) => (user.id === id ? updated : user));
    this.persist();
    return { ...updated };
  }

  delete(id: number): User | null {
    const index = this.users.findIndex((user) => user.id === id);
    if (index < 0) return null;

    const [removed] = this.users.splice(index, 1);
    this.deletedUser = { user: removed, index };
    this.persist();
    return { ...removed };
  }

  undoDelete(): User | null {
    if (!this.deletedUser) return null;

    const { user, index } = this.deletedUser;
    this.users.splice(index, 0, user);
    this.deletedUser = null;
    this.persist();
    return { ...user };
  }

  private readUsers(): User[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return INITIAL_USERS.map((user) => ({ ...user }));

      const parsed = JSON.parse(stored) as Partial<User>[];
      if (!Array.isArray(parsed)) return INITIAL_USERS.map((user) => ({ ...user }));

      return parsed.map((user) => ({
        ...user,
        department: user.department ?? 'فناوری اطلاعات',
      })) as User[];
    } catch {
      return INITIAL_USERS.map((user) => ({ ...user }));
    }
  }

  private persist(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.users));
    } catch {
      // The in-memory list remains usable if browser storage is unavailable.
    }
  }

  private normalizeDraft(draft: UserDraft): UserDraft {
    return {
      ...draft,
      name: draft.name.trim(),
      email: draft.email.trim().toLocaleLowerCase('en'),
    };
  }
}
