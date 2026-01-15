import { Injectable, inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { Database, ref, get } from '@angular/fire/database';

@Injectable({ providedIn: 'root' })
export class EnrollmentGuard implements CanActivate {
  private auth = inject(Auth);
  private db = inject(Database);
  private router = inject(Router);

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean | UrlTree> {
    const me = this.auth.currentUser;
    const courseId = route.paramMap.get('courseId');

    if (!courseId) return this.router.parseUrl('/courses');

    // لو مش مسجّل دخول -> إلى /login ثم يرجع بعد تسجيل الدخول
    if (!me) return this.router.createUrlTree(['/login'], { queryParams: { r: `/lesson/${courseId}/${route.paramMap.get('lessonId')}` } });

    // أدمن؟ اسمح له مباشرة
    const adminSnap = await get(ref(this.db, `users/${me.uid}/isAdmin`));
    if (adminSnap.exists() && adminSnap.val() === true) return true;

    // هل له صلاحية enrollment؟
    const enrSnap = await get(ref(this.db, `enrollments/${me.uid}/${courseId}`));
    if (enrSnap.exists()) return true;

    // لا يملك صلاحية -> أعده إلى صفحة تفاصيل الكورس
    return this.router.parseUrl(`/courses/${courseId}`);
  }
}
