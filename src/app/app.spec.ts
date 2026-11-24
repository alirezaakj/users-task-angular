import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the user-management heading', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('مدیریت کاربران');
  });

  it('opens the shared add-user form from the page action', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const addButton = fixture.nativeElement.querySelector(
      '.page-header .primary-button',
    ) as HTMLButtonElement;
    addButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('form')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.form-card h2')?.textContent)
      .toContain('افزودن کاربر جدید');
  });
});
