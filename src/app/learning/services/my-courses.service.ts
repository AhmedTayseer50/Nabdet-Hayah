import { Injectable, inject } from '@angular/core';
import { Auth, user as user$ } from '@angular/fire/auth';
import { Database } from '@angular/fire/database';
import { ref, onValue, off, get } from 'firebase/database';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Course } from 'src/app/shared/models/course.model';

@Injectable({ providedIn: 'root' })
export class MyCoursesService {
  private db = inject(Database);
  private auth = inject(Auth);

  /**
   * ترجع كورسات المستخدم الحالي (Realtime على enrollments)
   * - أي grant جديد يظهر تلقائيًا
   */
  myCourses$(): Observable<Course[]> {
    return user$(this.auth).pipe(
      switchMap((u) => {
        if (!u) return new Observable<Course[]>((sub) => { sub.next([]); sub.complete(); });

        return new Observable<Course[]>((subscriber) => {
          const enrRef = ref(this.db, `enrollments/${u.uid}`);

          const unsubscribe = onValue(
            enrRef,
            async (snap) => {
              try {
                if (!snap.exists()) {
                  subscriber.next([]);
                  return;
                }

                const enrollObj = snap.val() as Record<string, any>;
                const courseIds = Object.keys(enrollObj || {}).filter(Boolean);

                // جلب بيانات الكورسات مرة واحدة عند كل تغيير في enrollments
                const courses: Course[] = [];
                for (const id of courseIds) {
                  const cSnap = await get(ref(this.db, `courses/${id}`));
                  if (cSnap.exists()) {
                    courses.push({ id, ...(cSnap.val() as Omit<Course, 'id'>) });
                  }
                }

                // ترتيب اختياري: الأحدث أولًا لو عندك createdAt
                courses.sort((a: any, b: any) => Number(b.createdAt || 0) - Number(a.createdAt || 0));

                subscriber.next(courses);
              } catch (err) {
                subscriber.error(err);
              }
            },
            (error) => subscriber.error(error)
          );

          return () => {
            off(enrRef);
            // onValue بيرجع unsubscribe في الإصدارات الحديثة، بس وجود off كفاية مع أسلوبك الحالي
            try { (unsubscribe as any)?.(); } catch {}
          };
        });
      })
    );
  }
}
