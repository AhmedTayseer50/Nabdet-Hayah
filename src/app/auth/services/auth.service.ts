import { Injectable, inject } from '@angular/core';
import {
  Auth,
  authState,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  UserCredential,
  User
} from '@angular/fire/auth';
import { Observable, map } from 'rxjs';
import { UserService } from 'src/app/core/services/user.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private userSvc = inject(UserService);

  /** تدفق حالة المستخدم (null لو مفيش تسجيل) */
  user$: Observable<User | null> = authState(this.auth);

  /** هل المستخدم مسجّل دخول؟ */
  isLoggedIn$: Observable<boolean> = this.user$.pipe(map(u => !!u));

  /** إنشاء حساب جديد + مزامنة بياناته في Realtime DB (وتحديد إن كان أدمن) */
  async signup(email: string, password: string): Promise<UserCredential> {
    const cred = await createUserWithEmailAndPassword(this.auth, email, password);
    await this.userSvc.syncUser(cred.user);
    return cred;
  }

  /** تسجيل دخول + مزامنة بياناته في Realtime DB (وتحديث حالة الأدمن إن لزم) */
  async login(email: string, password: string): Promise<UserCredential> {
    const cred = await signInWithEmailAndPassword(this.auth, email, password);
    await this.userSvc.syncUser(cred.user);
    return cred;
  }

  /** تسجيل خروج */
  logout() {
    return signOut(this.auth);
  }

  /** نسيان كلمة المرور */
  resetPassword(email: string) {
    return sendPasswordResetEmail(this.auth, email);
  }
}
