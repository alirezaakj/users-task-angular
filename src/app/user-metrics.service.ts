import { Injectable } from '@angular/core';
import { User } from './user.model';

export interface DepartmentMetric {
  name: string;
  total: number;
  active: number;
  share: number;
}

export interface UserOverview {
  total: number;
  active: number;
  inactive: number;
  activePercent: number;
  departments: DepartmentMetric[];
}

@Injectable({ providedIn: 'root' })
export class UserMetricsService {
  summarize(users: readonly User[]): UserOverview {
    const active = users.reduce((count, user) => count + Number(user.active), 0);
    const byDepartment = new Map<string, { total: number; active: number }>();

    for (const user of users) {
      const current = byDepartment.get(user.department) ?? { total: 0, active: 0 };
      current.total++;
      if (user.active) current.active++;
      byDepartment.set(user.department, current);
    }

    const total = users.length;
    const departments = [...byDepartment.entries()]
      .map(([name, counts]) => ({
        name,
        ...counts,
        share: total ? Math.round((counts.total / total) * 100) : 0,
      }))
      .sort((first, second) => second.total - first.total || first.name.localeCompare(second.name, 'fa'));

    return {
      total,
      active,
      inactive: total - active,
      activePercent: total ? Math.round((active / total) * 100) : 0,
      departments,
    };
  }
}
