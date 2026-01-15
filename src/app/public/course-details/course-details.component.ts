// src/app/public/course-details/course-details.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CoursesService } from '../services/courses.service';
import { Auth, onAuthStateChanged, User, Unsubscribe } from '@angular/fire/auth';
import { EnrollmentsService } from 'src/app/core/services/enrollments.service';

// RTDB
import { Database } from '@angular/fire/database';
import { ref, get, query, orderByChild, limitToFirst } from 'firebase/database';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-course-details',
  templateUrl: './course-details.component.html',
  styleUrls: ['./course-details.component.css']
})
export class CourseDetailsComponent implements OnInit, OnDestroy {
  public courseId!: string;
  public course: any | null = null;

  defaultThumbnail =
    'https://images.pexels.com/photos/4100423/pexels-photo-4100423.jpeg?auto=compress&cs=tinysrgb&w=800';

  showOfferPopup = false;
  private offerShown = false;

  public lectureNames: string[] = [];

  public canViewLessons = false;
  public loading = true;
  public error?: string;

  public firstLessonId: string | null = null;

  public introVideoSafeUrl: SafeResourceUrl | null = null;

  private authUnsub?: Unsubscribe;
  private destroyed$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courses: CoursesService,
    private auth: Auth,
    private enrollments: EnrollmentsService,
    private db: Database,
    private sanitizer: DomSanitizer
  ) {}

  // ✅ Popup الخصم يظهر فقط لو مفيش صلاحية
  private onWindowScroll = () => {
    // لو عنده صلاحية، ممنوع popup
    if (this.canViewLessons) return;

    const scrollPosition = window.innerHeight + window.scrollY;
    const threshold = document.body.offsetHeight - 80;

    if (!this.offerShown && scrollPosition >= threshold) {
      this.offerShown = true;
      this.showOfferPopup = true;
    }
  };

  ngOnInit() {
    // ✅ متابعة تغيّر :id
    this.route.paramMap.pipe(takeUntil(this.destroyed$)).subscribe(async pm => {
      const id = pm.get('id');
      if (!id) return;

      this.courseId = id;
      this.loading = true;
      this.error = undefined;
      this.course = null;
      this.lectureNames = [];
      this.firstLessonId = null;
      this.introVideoSafeUrl = null;

      // reset popup state لكل كورس
      this.showOfferPopup = false;
      this.offerShown = false;

      try {
        this.course = await this.courses.getCourseById(this.courseId);
        this.lectureNames = (this.course?.lectureNames ?? []) as string[];

        const introUrl = this.course?.introVideoUrl as string | undefined;
        this.introVideoSafeUrl = introUrl
          ? this.sanitizer.bypassSecurityTrustResourceUrl(introUrl)
          : null;

        this.firstLessonId = await this.resolveFirstLessonIdFromRTDB(this.courseId);
      } catch (e: any) {
        this.error = e?.message ?? 'حدث خطأ أثناء تحميل الكورس';
      } finally {
        this.loading = false;
      }

      window.addEventListener('scroll', this.onWindowScroll);
    });

    // ✅ متابعة الصلاحية
    this.authUnsub = onAuthStateChanged(this.auth, async (user: User | null) => {
      if (!user) {
        this.canViewLessons = false;
        this.showOfferPopup = false;
        this.offerShown = false;
        return;
      }

      try {
        const myCourses = await this.enrollments.listUserEnrollments(user.uid);
        this.canViewLessons = myCourses.includes(this.courseId);

        // ✅ لو اتضافت الصلاحية: اقفل/امنع popup نهائيًا
        if (this.canViewLessons) {
          this.showOfferPopup = false;
          this.offerShown = true;
        } else {
          // لو مفيش صلاحية: نسمح للـ popup يظهر تاني أثناء التصفح
          this.offerShown = false;
        }
      } catch {
        this.canViewLessons = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.authUnsub) this.authUnsub();
    this.destroyed$.next();
    this.destroyed$.complete();

    window.removeEventListener('scroll', this.onWindowScroll);
  }

  /** الذهاب لأول درس فعلي */
  public async goToLessons(): Promise<void> {
    if (!this.firstLessonId) {
      this.firstLessonId = await this.resolveFirstLessonIdFromRTDB(this.courseId);
    }
    if (!this.firstLessonId) {
      console.warn('[goToLessons] لا يوجد دروس متاحة لهذا الكورس:', this.courseId);
      return;
    }

    const commands = ['/lesson', this.courseId, this.firstLessonId];
    this.router.navigate(commands);
  }

  public goToPurchase(): void {
    console.log('[goToPurchase] شراء الكورس:', this.courseId);
  }

  private async resolveFirstLessonIdFromRTDB(courseId: string): Promise<string | null> {
    try {
      let firstId = await this.pickFirstKeyByChild(courseId, 'lessonIndex');
      if (firstId) return firstId;

      firstId = await this.pickFirstKeyByChild(courseId, 'createdAt');
      if (firstId) return firstId;

      const allSnap = await get(ref(this.db, `lessons/${courseId}`));
      if (allSnap.exists()) {
        const obj = allSnap.val() as Record<string, any>;
        const keys = Object.keys(obj);
        if (keys.length) return keys[0];
      }
      return null;
    } catch (e) {
      console.error('[resolveFirstLessonIdFromRTDB] error:', e);
      return null;
    }
  }

  private async pickFirstKeyByChild(courseId: string, child: string): Promise<string | null> {
    const qy = query(
      ref(this.db, `lessons/${courseId}`),
      orderByChild(child),
      limitToFirst(1)
    );
    const snap = await get(qy);
    if (snap.exists()) {
      const val = snap.val() as Record<string, any>;
      const keys = Object.keys(val);
      if (keys.length) return keys[0];
    }
    return null;
  }

  // ✅ CTA Popup controls (هنخليهم يشتغلوا فقط لو مفيش صلاحية)
  openOfferFromBottomCta(): void {
    if (this.canViewLessons) return;
    this.showOfferPopup = true;
    this.offerShown = true;
  }

  closeOffer(): void {
    this.showOfferPopup = false;
  }

  onOfferBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeOffer();
    }
  }

  onOfferSubscribe(): void {
    if (this.canViewLessons) return;
    this.closeOffer();
    this.goToPurchase();
  }
}
