import { Injectable, inject } from '@angular/core';
import { Database } from '@angular/fire/database';
import { ref, get, onValue, off } from 'firebase/database';
import { Observable } from 'rxjs';
import { Course } from 'src/app/shared/models/course.model';

@Injectable({ providedIn: 'root' })
export class CoursesService {
  private db = inject(Database);

  /** قراءة جميع الكورسات مرة واحدة */
  async getCoursesOnce(): Promise<Course[]> {
    const snapshot = await get(ref(this.db, 'courses'));
    if (!snapshot.exists()) return [];
    const obj = snapshot.val() as Record<string, Omit<Course, 'id'>>;
    return Object.entries(obj).map(([id, data]) => ({ id, ...data }));
  }

  /** جلب كورس واحد بالمعرّف */
  async getCourseById(id: string): Promise<Course | null> {

    const snap = await get(ref(this.db, `courses/${id}`));
   console.log('[exists?]', snap.exists());

   console.log('[val]', snap.val());
   console.log('[key]', snap.key);

   console.log('[pretty]', JSON.stringify(snap.val(), null, 2));

    return snap.exists() ? ({ id, ...(snap.val() as Omit<Course, 'id'>) }) : null;
    
  }

  /** متابعة حيّة (Realtime) لجميع الكورسات */
  watchCourses(): Observable<Course[]> {
    return new Observable<Course[]>((subscriber) => {
      const r = ref(this.db, 'courses');
      const unsubscribe = onValue(
        r,
        (snap) => {
          if (!snap.exists()) {
            subscriber.next([]);
            return;
          }
          const obj = snap.val() as Record<string, Omit<Course, 'id'>>;
          const list = Object.entries(obj).map(([id, data]) => ({ id, ...data }));
          subscriber.next(list);
        },
        (error) => subscriber.error(error)
      );
      // تنظيف الاشتراك عند تدمير الـ Observable
      return () => {
        off(r);
      };
    });
  }
}
