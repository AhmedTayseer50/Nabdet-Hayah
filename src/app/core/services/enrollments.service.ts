import { Injectable, inject } from '@angular/core';
import { Database, ref, get, set, remove, update } from '@angular/fire/database';

 
export interface EnrollmentInfo {
  grantedAt: number;
  grantedBy?: string | null;
}


export type UserEnrollments = Record<string, true | EnrollmentInfo>;

@Injectable({ providedIn: 'root' })
export class EnrollmentsService {
  private db = inject(Database);

  // قائمة صلاحيات مستخدم
  async listUserEnrollments(uid: string): Promise<string[]> {
    const snap = await get(ref(this.db, `enrollments/${uid}`));
    if (!snap.exists()) return [];
    const obj = snap.val() as UserEnrollments;
    return Object.keys(obj || {});
  }

  // منح صلاحية لكورس
  async grant(uid: string, courseId: string, adminUid?: string) {
    const value: true | EnrollmentInfo = {
      grantedAt: Date.now(),
      grantedBy: adminUid ?? null,
    };
    await set(ref(this.db, `enrollments/${uid}/${courseId}`), value);
  }

  // إلغاء صلاحية
  async revoke(uid: string, courseId: string) {
    await remove(ref(this.db, `enrollments/${uid}/${courseId}`));
  }

  // ✅ إنشاء/تحديث سجل العميل في /customers
  async touchCustomer(uid: string, email?: string | null) {
    await update(ref(this.db, `customers/${uid}`), {
      email: email ?? null,
      lastOrderAt: Date.now(),
    });
  }
}
