import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forbidden-page',
  imports: [RouterLink],
  template: `
    <main class="access-page" dir="rtl">
      <section>
        <p class="eyebrow">دسترسی محدود</p>
        <h1>این بخش برای مدیر سیستم است.</h1>
        <p>با نقش فعلی فقط امکان مشاهدهٔ فهرست کاربران را دارید.</p>
        <a routerLink="/users">رفتن به فهرست کاربران</a>
      </section>
    </main>
  `,
  styles: `
    .access-page { display:grid; min-height:100vh; place-items:center; padding:24px; background:#f2f7f5; text-align:center; }
    section { max-width:460px; padding:36px; border:1px solid #e0e7e4; border-radius:14px; background:#fff; }
    .eyebrow { color:#a74444; font-size:13px; font-weight:700; }
    h1 { color:#203d39; font-size:24px; }
    p { color:#66817d; line-height:1.8; }
    a { display:inline-block; margin-top:12px; color:#147d73; font-weight:700; }
  `,
})
export class ForbiddenPage {}
