// src/app/core/navbar/navbar.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

import { AuthService } from 'src/app/auth/services/auth.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  constructor(
    public auth: AuthService,
    private userSvc: UserService,
    private router: Router
  ) {}

  isAdmin = false;
  isDisabled = false;
  isStaff = false;

  isMenuOpen = false;

  // ✅ Theme state
  isDarkTheme = false;
  private readonly THEME_KEY = 'theme'; // 'dark' | 'light'

  // ✅ Language state
  currentLang: 'ar' | 'en' = 'ar';

  private sub?: Subscription;

  ngOnInit(): void {
    // ✅ Apply saved theme on load
    this.initTheme();

    // ✅ Detect current language from URL: /ar/... or /en/...
    const seg = (this.router.url.split('?')[0].split('#')[0].split('/')[1] || 'ar') as any;
    this.currentLang = seg === 'en' ? 'en' : 'ar';

    // راقب حالة المستخدم وحدث الأعلام (أدمن/موظف/معطّل)
    this.sub = this.auth.user$.subscribe(async (u) => {
      if (!u) {
        this.isAdmin = false;
        this.isDisabled = false;
        this.isStaff = false;
        return;
      }
      try {
        const [adminFlag, disabledFlag, staffFlag] = await Promise.all([
          this.userSvc.isAdmin(u.uid),
          this.userSvc.isDisabled(u.uid),
          this.userSvc.isStaff(u.uid)
        ]);
        this.isAdmin = adminFlag;
        this.isDisabled = disabledFlag;
        this.isStaff = staffFlag;
      } catch {
        this.isAdmin = false;
        this.isDisabled = false;
        this.isStaff = false;
      }
    });
  }

  // ✅ Read & apply theme from localStorage (fallback light)
  private initTheme(): void {
    const saved = (localStorage.getItem(this.THEME_KEY) || 'light').toLowerCase();
    this.isDarkTheme = saved === 'dark';
    this.applyThemeClass();
  }

  // ✅ Toggle theme on click
  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    localStorage.setItem(this.THEME_KEY, this.isDarkTheme ? 'dark' : 'light');
    this.applyThemeClass();
  }

  // ✅ Add/remove body.dark-theme
  private applyThemeClass(): void {
    document.body.classList.toggle('dark-theme', this.isDarkTheme);
  }

  // ✅ Switch between /ar and /en while keeping the same route
switchLanguage(): void {
  const url = this.router.url; // includes query params + fragment sometimes
  const [pathWithLeadingSlash, queryAndHash] = url.split('?');

  const parts = pathWithLeadingSlash.split('/'); // ["", "en", "courses", "1"]
  const first = parts[1];

  // ensure we have a locale segment
  if (first !== 'ar' && first !== 'en') {
    parts.splice(1, 0, this.currentLang);
  }

  const nextLang: 'ar' | 'en' = this.currentLang === 'ar' ? 'en' : 'ar';
  parts[1] = nextLang;

  const nextPath = parts.join('/') || '/';
  this.currentLang = nextLang;
  this.isMenuOpen = false;

  // ✅ IMPORTANT: force full reload so Angular loads the correct localized bundles
  const nextUrl = queryAndHash ? `${nextPath}?${queryAndHash}` : nextPath;
  window.location.assign(nextUrl);
}

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
