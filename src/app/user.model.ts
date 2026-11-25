export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  active: boolean;
}

export type UserDraft = Omit<User, 'id'>;
export interface UserFilters {
  query: string;
  role: string;
  status: string;
  sortAscending: boolean;
}

export const USER_ROLES = ['مدیر سیستم', 'کارشناس', 'پشتیبان'];
export const USER_DEPARTMENTS = ['فناوری اطلاعات', 'منابع انسانی', 'مالی', 'پشتیبانی مشتریان'];

export const EMPTY_USER: UserDraft = {
  name: '',
  email: '',
  role: 'کارشناس',
  department: 'فناوری اطلاعات',
  active: true,
};

export const INITIAL_USERS: User[] = [
  { id: 1, name: 'علی رضایی', email: 'alirezai@comp.ir', role: 'مدیر سیستم', department: 'فناوری اطلاعات', active: true },
  { id: 2, name: 'سارا امینی', email: 'saraamini@comp.ir', role: 'کارشناس', department: 'منابع انسانی', active: true },
  { id: 3, name: 'پارسا نوری', email: 'parsanori@comp.ir', role: 'پشتیبان', department: 'فناوری اطلاعات', active: false },
];
