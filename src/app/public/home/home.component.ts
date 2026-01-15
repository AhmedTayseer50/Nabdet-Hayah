import { Component, OnDestroy, OnInit } from '@angular/core';
import { CoursesService } from '../../public/services/courses.service';
import { Course } from 'src/app/shared/models/course.model';

import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { EnrollmentsService } from 'src/app/core/services/enrollments.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  topCourses: Course[] = [];

  /** هل المستخدم مسجل دخول؟ */
  isLoggedIn = false;

  /** الكورسات اللي عنده صلاحية عليها */
  private myCourseIds = new Set<string>();

  private authUnsub?: () => void;

  constructor(
    private coursesSvc: CoursesService,
    private auth: Auth,
    private enrollments: EnrollmentsService
  ) {}

  ngOnInit(): void {
    // جلب أول 3 كورسات فقط
    this.coursesSvc.watchCourses().subscribe({
      next: (list) => {
        this.topCourses = list.slice(0, 3);
      },
      error: (err) => {
        console.error('خطأ في تحميل الكورسات:', err);
      }
    });

    // متابعة حالة تسجيل الدخول + تحميل الصلاحيات
    this.authUnsub = onAuthStateChanged(this.auth, async (user: User | null) => {
      this.isLoggedIn = !!user;
      this.myCourseIds.clear();

      if (!user) return;

      try {
        const ids = await this.enrollments.listUserEnrollments(user.uid);
        ids.forEach(id => this.myCourseIds.add(id));
      } catch {
        this.myCourseIds.clear();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.authUnsub) this.authUnsub();
  }

  /** ✅ نفس منطق courses-list: لو مسجل + عنده صلاحية */
  hasAccess(courseId: string): boolean {
    return this.isLoggedIn && this.myCourseIds.has(courseId);
  }

  // دالة الانتقال للكومبوننت المطلوب داخل الصفحة
  goToSection(sectionId: string) {
    const el = document.getElementById(sectionId);
    if (el) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  }
}
