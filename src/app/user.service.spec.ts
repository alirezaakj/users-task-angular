import { UserDraft } from './user.model';
import { UserService } from './user.service';

const makeDraft = (overrides: Partial<UserDraft> = {}): UserDraft => ({
  name: 'مهسا یوسفی',
  email: 'mahsa@example.com',
  role: 'کارشناس',
  department: 'مالی',
  active: true,
  ...overrides,
});

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    localStorage.clear();
    service = new UserService();
  });

  it('starts with the sample user list', () => {
    expect(service.getAll()).toHaveLength(3);
    expect(service.getActiveCount()).toBe(2);
    expect(service.getInactiveCount()).toBe(1);
  });

  it('searches by name, email, and department without case sensitivity', () => {
    expect(service.filter({
      query: 'ALIREZAI',
      role: 'all',
      status: 'all',
      sortAscending: true,
    }).map((user) => user.id)).toEqual([1]);

    expect(service.filter({
      query: 'منابع انسانی',
      role: 'all',
      status: 'all',
      sortAscending: true,
    }).map((user) => user.id)).toEqual([2]);
  });

  it('combines role and active-status filters', () => {
    const result = service.filter({
      query: '',
      role: 'پشتیبان',
      status: 'inactive',
      sortAscending: true,
    });

    expect(result.map((user) => user.id)).toEqual([3]);
  });

  it('sorts names in either direction', () => {
    const ascending = service.filter({
      query: '', role: 'all', status: 'all', sortAscending: true,
    }).map((user) => user.name);
    const descending = service.filter({
      query: '', role: 'all', status: 'all', sortAscending: false,
    }).map((user) => user.name);

    expect(descending).toEqual([...ascending].reverse());
  });

  it('adds users with a fresh id and saves them to local storage', () => {
    const created = service.add(makeDraft({ email: '  MAHSA@Example.com  ' }));
    const stored = JSON.parse(
      localStorage.getItem('user-management-users-v1') ?? '[]',
    ) as Array<{ id: number; email: string }>;

    expect(created.id).toBe(4);
    expect(service.getAll().at(-1)?.email).toBe('mahsa@example.com');
    expect(stored.at(-1)?.id).toBe(4);
  });

  it('checks email uniqueness while allowing the same user to keep their email', () => {
    expect(service.emailExists(' ALIREZAI@COMP.IR ')).toBe(true);
    expect(service.emailExists('alirezai@comp.ir', 1)).toBe(false);
    expect(service.emailExists('new@example.com')).toBe(false);
  });

  it('updates only the selected user', () => {
    const updated = service.update(2, makeDraft({ name: 'سارا امینی جدید' }));

    expect(updated?.id).toBe(2);
    expect(service.getAll().find((user) => user.id === 2)?.name)
      .toBe('سارا امینی جدید');
    expect(service.getAll().find((user) => user.id === 1)?.name)
      .toBe('علی رضایی');
  });

  it('returns null when asked to update a missing user', () => {
    expect(service.update(100, makeDraft())).toBeNull();
    expect(service.getAll()).toHaveLength(3);
  });

  it('deletes a user and can restore it to the original position', () => {
    const removed = service.delete(2);

    expect(removed?.name).toBe('سارا امینی');
    expect(service.getAll().map((user) => user.id)).toEqual([1, 3]);

    const restored = service.undoDelete();
    expect(restored?.id).toBe(2);
    expect(service.getAll().map((user) => user.id)).toEqual([1, 2, 3]);
  });

  it('does not change the list when deleting an unknown id', () => {
    expect(service.delete(100)).toBeNull();
    expect(service.getAll()).toHaveLength(3);
  });

  it('loads saved users on the next service instance', () => {
    service.add(makeDraft());
    const reloadedService = new UserService();

    expect(reloadedService.getAll()).toHaveLength(4);
    expect(reloadedService.getAll().at(-1)?.name).toBe('مهسا یوسفی');
  });
});
