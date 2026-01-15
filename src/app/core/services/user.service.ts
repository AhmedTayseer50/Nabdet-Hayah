import { Injectable, inject } from '@angular/core';
import { Database, ref, set, update, get, child } from '@angular/fire/database';
import { Auth, User } from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class UserService {
  private db = inject(Database);
  private auth = inject(Auth);

  /** إنشاء/تحديث سجلّ المستخدم في /users/{uid} */
  async syncUser(user: User) {
    const uid = user.uid;
    const email = (user.email ?? '').toLowerCase();
    const userRef = ref(this.db, `users/${uid}`);

    const snap = await get(userRef);

    // تحديد الأدوار تلقائيًا حسب الإيميل
    const shouldBeAdmin = email === 'admin@gmail.com';
    const shouldBeStaff = email === 'account@gmail.com';

    if (!snap.exists()) {
      // أول مرة: خزّن بيانات أساسية (بدون وضع uid داخل الجسم)
      await set(userRef, {
        email: user.email ?? '',
        displayName: user.displayName ?? null,
        createdAt: Date.now(),
        isAdmin: shouldBeAdmin,
        isStaff: shouldBeStaff,
        isDisabled: false
      });
      return;
    }

    // موجود: حدّث الحقول القابلة للتغيير مع الحفاظ على الحقول الحساسة
    const data = snap.val() || {};
    await update(userRef, {
      email: user.email ?? data.email ?? '',
      displayName: user.displayName ?? data.displayName ?? null,
      // ثبّت الأدوار: لو اتعيّنت قبل كده تبقى كما هي، ولو الإيميل يطابق نفعّلها
      isAdmin: shouldBeAdmin || !!data.isAdmin,
      isStaff: shouldBeStaff || !!data.isStaff
      // لا نلمس isDisabled هنا — تُدار من شاشة الأدمن فقط
    });
  }

  /** قراءة علم الأدمن */
  async isAdmin(uid: string): Promise<boolean> {
    const snap = await get(child(ref(this.db), `users/${uid}/isAdmin`));
    return !!(snap.exists() && snap.val() === true);
  }

  /** قراءة علم الموظّف */
  async isStaff(uid: string): Promise<boolean> {
    const snap = await get(child(ref(this.db), `users/${uid}/isStaff`));
    return !!(snap.exists() && snap.val() === true);
  }

  /** قراءة حالة التعطيل */
  async isDisabled(uid: string): Promise<boolean> {
    const snap = await get(child(ref(this.db), `users/${uid}/isDisabled`));
    return !!(snap.exists() && snap.val() === true);
  }
}
