import { Injectable } from '@angular/core';
import { USER_DEPARTMENTS, USER_ROLES, User, UserDraft } from './user.model';

export interface CsvImportResult {
  users: UserDraft[];
  skippedRows: number;
}

@Injectable({ providedIn: 'root' })
export class UserCsvService {
  private readonly headers = ['نام', 'ایمیل', 'نقش', 'واحد', 'وضعیت'];

  toCsv(users: readonly User[]): string {
    const records = users.map((user) => [
      user.name,
      user.email,
      user.role,
      user.department,
      user.active ? 'فعال' : 'غیرفعال',
    ]);
    return [this.headers, ...records]
      .map((row) => row.map((value) => this.escapeCell(value)).join(','))
      .join('\r\n');
  }

  download(users: readonly User[]): void {
    const csv = `\uFEFF${this.toCsv(users)}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `users-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  parse(csv: string): CsvImportResult {
    const rows = this.parseRows(csv.replace(/^\uFEFF/, ''));
    const dataRows = rows[0]?.[0]?.trim() === this.headers[0] ? rows.slice(1) : rows;
    const users: UserDraft[] = [];
    const seenEmails = new Set<string>();
    let skippedRows = 0;

    for (const row of dataRows) {
      const [name, email, role, department, status] = row.map((cell) => cell.trim());
      const normalizedEmail = email?.toLocaleLowerCase('en');
      const valid =
        row.length === this.headers.length &&
        Boolean(name) &&
        this.isEmail(normalizedEmail ?? '') &&
        USER_ROLES.includes(role as (typeof USER_ROLES)[number]) &&
        USER_DEPARTMENTS.includes(department as (typeof USER_DEPARTMENTS)[number]) &&
        (status === 'فعال' || status === 'غیرفعال') &&
        !seenEmails.has(normalizedEmail ?? '');

      if (!valid) {
        skippedRows++;
        continue;
      }

      seenEmails.add(normalizedEmail!);
      users.push({
        name,
        email: normalizedEmail!,
        role: role as UserDraft['role'],
        department: department as UserDraft['department'],
        active: status === 'فعال',
      });
    }

    return { users, skippedRows };
  }

  private escapeCell(value: string): string {
    const safeValue = /^[=+@-]/.test(value) ? `'${value}` : value;
    return `"${safeValue.replaceAll('"', '""')}"`;
  }

  private isEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  private parseRows(input: string): string[][] {
    const rows: string[][] = [];
    let row: string[] = [];
    let cell = '';
    let quoted = false;

    for (let index = 0; index < input.length; index++) {
      const character = input[index];
      if (character === '"' && quoted && input[index + 1] === '"') {
        cell += '"';
        index++;
      } else if (character === '"') {
        quoted = !quoted;
      } else if (character === ',' && !quoted) {
        row.push(cell);
        cell = '';
      } else if ((character === '\n' || character === '\r') && !quoted) {
        if (character === '\r' && input[index + 1] === '\n') index++;
        row.push(cell);
        if (row.some((value) => value.length > 0)) rows.push(row);
        row = [];
        cell = '';
      } else {
        cell += character;
      }
    }

    row.push(cell);
    if (row.some((value) => value.length > 0)) rows.push(row);
    return rows;
  }
}
