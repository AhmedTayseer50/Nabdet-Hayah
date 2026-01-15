// src/app/learning/lesson-view/lesson-view.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { Database } from '@angular/fire/database';
import { ref, get } from 'firebase/database';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

type ViewLesson = {
  id: string;
  title: string;
  lessonIndex: number;
  playbackUrl?: string;
};

@Component({
  selector: 'app-lesson-view',
  templateUrl: './lesson-view.component.html',
  styleUrls: ['./lesson-view.component.css']
})
export class LessonViewComponent implements OnInit, OnDestroy {
  courseId!: string;
  lessonId!: string;

  title = '';
  playbackUrl?: string;
  safeUrl?: SafeResourceUrl;

  loading = true;
  error?: string;

  lessons: ViewLesson[] = [];
  currentPos = -1; // index داخل lessons

  private paramSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private db: Database,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    // مفتاح الحل: الاشتراك في تغيّر الباراميترز
    this.paramSub = this.route.paramMap.subscribe(async (pm: ParamMap) => {
      const newCourseId = pm.get('courseId')!;
      const newLessonId = pm.get('lessonId')!;

      const courseChanged = newCourseId !== this.courseId;

      this.courseId = newCourseId;
      this.lessonId = newLessonId;

      this.loading = true;
      this.error = undefined;

      try {
        // لو الكورس اتغيّر أو مفيش دروس لسه متحمّلة، حمّل قائمة الدروس
        if (courseChanged || this.lessons.length === 0) {
          await this.loadAllLessons();
        }

        // حدّد موضع الدرس الحالي
        this.currentPos = this.lessons.findIndex(l => l.id === this.lessonId);

        // حمّل بيانات الدرس الحالي
        await this.loadCurrentLesson();
      } catch (e: any) {
        this.error = e?.message ?? 'حدث خطأ';
      } finally {
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.paramSub?.unsubscribe();
  }

  private async loadAllLessons() {
    const allSnap = await get(ref(this.db, `lessons/${this.courseId}`));
    if (allSnap.exists()) {
      const obj = allSnap.val() as Record<
        string,
        { title?: string; lessonIndex?: number; playbackUrl?: string }
      >;
      this.lessons = Object.entries(obj)
        .map(([id, v]) => ({
          id,
          title: (v?.title ?? '').toString(),
          lessonIndex: Number(v?.lessonIndex ?? 0),
          playbackUrl: (v?.playbackUrl ?? '').toString(),
        }))
        .sort((a, b) => (a.lessonIndex ?? 0) - (b.lessonIndex ?? 0));
    } else {
      this.lessons = [];
    }
  }

  private async loadCurrentLesson() {
    const snap = await get(ref(this.db, `lessons/${this.courseId}/${this.lessonId}`));
    if (!snap.exists()) throw new Error('الدرس غير موجود');

    const data = snap.val() as any;
    this.title = data.title ?? '';
    this.playbackUrl = data.playbackUrl;

    // تحديث الـ iframe
    this.safeUrl = this.playbackUrl
      ? this.sanitizer.bypassSecurityTrustResourceUrl(this.playbackUrl)
      : undefined;

    // (اختياري) لوج يساعدك تتأكد أن الفيديو اتغيّر فعلاً
    console.log('[lesson-view] now showing lesson:', {
      courseId: this.courseId,
      lessonId: this.lessonId,
      title: this.title,
      playbackUrl: this.playbackUrl
    });
  }

  get totalLessons(): number {
    return this.lessons.length;
  }

  get hasPrev(): boolean {
    return this.currentPos > 0;
  }

  get hasNext(): boolean {
    return this.currentPos >= 0 && this.currentPos < this.lessons.length - 1;
  }

  goTo(lessonId: string) {
    // تغيّر الراوت -> الاشتراك في paramMap هيتكفّل بتحديث العرض
    this.router.navigate(['/lesson', this.courseId, lessonId]);
  }

  goPrev() {
    if (!this.hasPrev) return;
    const nextPos = this.currentPos - 1;
    this.router.navigate(['/lesson', this.courseId, this.lessons[nextPos].id]);
  }

  goNext() {
    if (!this.hasNext) return;
    const nextPos = this.currentPos + 1;
    this.router.navigate(['/lesson', this.courseId, this.lessons[nextPos].id]);
  }
}
