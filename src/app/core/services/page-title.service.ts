import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PageTitleService {
  constructor(private router: Router, private title: Title) {}

  init(): void {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        const routeTitle = this.getDeepestTitle(this.router.routerState.root);
        // fallback ثابت لو مفيش title للـ route
        const appName = $localize`:@@app_name:نبضة حياة`;
        this.title.setTitle(routeTitle ? `${routeTitle} | ${appName}` : appName);
      });
  }

  private getDeepestTitle(route: any): string | null {
    let current = route;
    while (current.firstChild) current = current.firstChild;
    return current.snapshot?.data?.['title'] ?? null;
  }
}
