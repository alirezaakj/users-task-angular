export const USER_ROLES = ['مدیر سیستم', 'کارشناس', 'پشتیبان'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_DEPARTMENTS = [
  'فناوری اطلاعات',
  'منابع انسانی',
  'مالی',
  'پشتیبانی مشتریان',
] as const;
export type UserDepartment = (typeof USER_DEPARTMENTS)[number];

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  department: UserDepartment;
  active: boolean;
}

export type UserDraft = Omit<User, 'id'>;

export interface UserFilters {
  query: string;
  role: UserRole | 'all';
  status: 'all' | 'active' | 'inactive';
  sortAscending: boolean;
}

export const EMPTY_USER_DRAFT: UserDraft = {
  name: '',
  email: '',
  role: 'کارشناس',
  department: 'فناوری اطلاعات',
  active: true,
};

export const INITIAL_USERS: User[] = [
  {
    id: 1,
    name: 'علی رضایی',
    email: 'alirezai@comp.ir',
    role: 'مدیر سیستم',
    department: 'فناوری اطلاعات',
    active: true,
  },
  {
    id: 2,
    name: 'سارا امینی',
    email: 'saraamini@comp.ir',
    role: 'کارشناس',
    department: 'منابع انسانی',
    active: true,
  },
  {
    id: 3,
    name: 'پارسا نوری',
    email: 'parsanori@comp.ir',
    role: 'پشتیبان',
    department: 'فناوری اطلاعات',
    active: false,
  },
];
