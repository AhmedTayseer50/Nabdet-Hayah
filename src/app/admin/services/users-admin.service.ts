import { Injectable, inject } from '@angular/core';
import {
  Database,
  ref,
  get,
  update,
  remove,
  query,
  orderByChild,
} from '@angular/fire/database';

export interface AdminUserRow {
  uid: string;
  email?: string;
  displayName?: string | null;
  createdAt?: number;
  isAdmin?: boolean;
  isDisabled?: boolean;
  isStaff?: boolean; // ✅ أضفناها علشان نقدر نستبعد حسابات الستوراف
}

@Injectable({ providedIn: 'root' })
export class UsersAdminService {
  private db = inject(Database);

  // قائمة كل المستخدمين (لوحة الإدارة)
  async listUsers(): Promise<AdminUserRow[]> {
    const r = query(ref(this.db, 'users'), orderByChild('email'));
    const snap = await get(r);
    if (!snap.exists()) return [];
    const obj = snap.val() as Record<string, AdminUserRow>;
    return Object.entries(obj).map(([uid, u]) => ({ ...(u || {}), uid }));
  }

  // ✅ قائمة العملاء: إيميلات فقط + استبعاد الأدمن/الستاف/المعطّلين وحظر صريح لأيميلات معيّنة
  async listCustomers(): Promise<{ uid: string; email?: string }[]> {
    const r = query(ref(this.db, 'users'), orderByChild('email'));
    const snap = await get(r);
    if (!snap.exists()) return [];

    const obj = snap.val() as Record<string, AdminUserRow>;

    return Object.entries(obj)
      .filter(([, v]) =>
        !!v?.email &&
        v.isDisabled !== true &&
        v.isAdmin !== true &&
        v.isStaff !== true &&
        v.email !== 'admin@gmail.com' &&
        v.email !== 'account@gmail.com'
      )
      .map(([uid, v]) => ({ uid, email: v!.email }));
  }

  async setAdmin(uid: string, value: boolean) {
    await update(ref(this.db, `users/${uid}`), { isAdmin: value });
  }

  async setDisabled(uid: string, value: boolean) {
    await update(ref(this.db, `users/${uid}`), { isDisabled: value });
  }

  // حذف سجل المستخدم من قاعدة البيانات فقط (ليس من Firebase Auth)
  async deleteUserData(uid: string) {
    await remove(ref(this.db, `users/${uid}`));
    // ملاحظة: حذف الحساب من Auth يكون لاحقًا عبر Cloud Function.
  }
}
