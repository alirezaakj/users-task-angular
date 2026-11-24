import { Injectable, signal } from '@angular/core';

export type AccountRole = 'admin' | 'user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'user-management-demo-role';
  private readonly roleState = signal<AccountRole | null>(this.readRole());

  readonly role = this.roleState.asReadonly();

  isSignedIn(): boolean {
    return this.roleState() !== null;
  }

  canManageUsers(): boolean {
    return this.roleState() === 'admin';
  }

  loginAs(role: AccountRole): void {
    this.roleState.set(role);
    try {
      sessionStorage.setItem(this.storageKey, role);
    } catch {
      // The in-memory session still works if browser storage is unavailable.
    }
  }

  logout(): void {
    this.roleState.set(null);
    try {
      sessionStorage.removeItem(this.storageKey);
    } catch {
      // A fresh page load will start without a session if storage is unavailable.
    }
  }

  private readRole(): AccountRole | null {
    try {
      const role = sessionStorage.getItem(this.storageKey);
      return role === 'admin' || role === 'user' ? role : null;
    } catch {
      return null;
    }
  }
}
