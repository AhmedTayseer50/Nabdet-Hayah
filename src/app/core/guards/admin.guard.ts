import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { UserService } from '../services/user.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  private router = inject(Router);
  private auth = inject(Auth);
  private userSvc = inject(UserService);

  async canActivate(): Promise<boolean | UrlTree> {
    const u = this.auth.currentUser;
    if (!u) return this.router.createUrlTree(['/login']);
    const ok = await this.userSvc.isAdmin(u.uid);
    return ok ? true : this.router.createUrlTree(['/']);
  }
}
