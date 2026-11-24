import { Injectable } from '@angular/core';
import { USER_DEPARTMENTS, USER_ROLES, User } from './user.model';

export interface BackupReadResult {
  users: User[];
  rejectedRows: number;
}

interface UserBackupFile {
  format: 'users-task-backup';
  version: 1;
  createdAt: string;
  users: User[];
}

@Injectable({ providedIn: 'root' })
export class UserBackupService {
  createFile(users: readonly User[]): string {
    const backup: UserBackupFile = {
      format: 'users-task-backup',
      version: 1,
      createdAt: new Date().toISOString(),
      users: users.map((user) => ({ ...user })),
    };
    return JSON.stringify(backup, null, 2);
  }

  download(users: readonly User[]): void {
    const blob = new Blob([this.createFile(users)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `users-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  readFile(input: string): BackupReadResult {
    const parsed: unknown = JSON.parse(input);
    if (!this.isBackup(parsed)) throw new Error('قالب فایل پشتیبان شناخته‌شده نیست.');

    const users: User[] = [];
    const usedIds = new Set<number>();
    const usedEmails = new Set<string>();
    let rejectedRows = 0;

    for (const value of parsed.users) {
      const user = this.toUser(value);
      if (!user || usedIds.has(user.id) || usedEmails.has(user.email)) {
        rejectedRows++;
        continue;
      }
      usedIds.add(user.id);
      usedEmails.add(user.email);
      users.push(user);
    }
    return { users, rejectedRows };
  }

  private isBackup(value: unknown): value is UserBackupFile {
    if (typeof value !== 'object' || value === null) return false;
    const file = value as Record<string, unknown>;
    return file['format'] === 'users-task-backup' &&
      file['version'] === 1 && Array.isArray(file['users']);
  }

  private toUser(value: unknown): User | null {
    if (typeof value !== 'object' || value === null) return null;
    const record = value as Record<string, unknown>;
    const id = record['id'];
    const name = record['name'];
    const email = record['email'];
    const role = record['role'];
    const department = record['department'];
    const active = record['active'];
    if (
      !Number.isInteger(id) || Number(id) < 1 ||
      typeof name !== 'string' || !name.trim() ||
      typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      !USER_ROLES.includes(role as User['role']) ||
      !USER_DEPARTMENTS.includes(department as User['department']) ||
      typeof active !== 'boolean'
    ) return null;

    return {
      id: Number(id),
      name: name.trim(),
      email: email.trim().toLocaleLowerCase('en'),
      role: role as User['role'],
      department: department as User['department'],
      active,
    };
  }
}
