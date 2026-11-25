import { Injectable } from '@angular/core';

export type UserAction = 'افزودن' | 'ویرایش' | 'حذف' | 'بازگردانی';

export interface UserActivity {
  id: string;
  action: UserAction;
  userName: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ActivityLogService {
  private readonly storageKey = 'user-management-activity-v1';
  private entries = this.readEntries();

  get recent(): UserActivity[] {
    return this.entries.map((entry) => ({ ...entry }));
  }

  record(action: UserAction, userName: string): UserActivity {
    const entry: UserActivity = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      action,
      userName: userName.trim(),
      createdAt: new Date().toISOString(),
    };
    this.entries = [entry, ...this.entries].slice(0, 12);
    this.persist();
    return { ...entry };
  }

  clear(): void {
    this.entries = [];
    this.persist();
  }

  private readEntries(): UserActivity[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return [];
      const parsed: unknown = JSON.parse(stored);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter((entry): entry is UserActivity => this.isActivity(entry))
        .slice(0, 12);
    } catch {
      return [];
    }
  }

  private isActivity(value: unknown): value is UserActivity {
    if (typeof value !== 'object' || value === null) return false;
    const entry = value as Record<string, unknown>;
    return (
      typeof entry['id'] === 'string' &&
      ['افزودن', 'ویرایش', 'حذف', 'بازگردانی'].includes(String(entry['action'])) &&
      typeof entry['userName'] === 'string' &&
      typeof entry['createdAt'] === 'string'
    );
  }

  private persist(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.entries));
    } catch {
      // The current activity list remains available until the page is closed.
    }
  }
}
