// src/app/admin/course-editor/course-editor.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import {
  FormBuilder,
  Validators,
  FormArray,
  FormControl,
  FormGroup,
} from '@angular/forms';
import { AdminService, AdminCourse, AdminLesson } from '../services/admin.service';

type CourseRow = {
  id: string;
  title?: string;
  price?: number;
  published?: boolean;
  categoryId?: string;
};

type LessonRow = {
  id: string;            // Firebase key
  title: string;
  lessonIndex: number;   // 1-based position
  playbackUrl?: string;
};

@Component({
  selector: 'app-course-editor',
  templateUrl: './course-editor.component.html',
  styleUrls: ['./course-editor.component.css'],
})
export class CourseEditorComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private admin: AdminService
  ) {}

  courseId?: string;
  loading = true;
  error?: string;

  // وضع القائمة
  courses: CourseRow[] = [];

  /** نموذج الكورس (Typed Forms) */
  courseForm!: FormGroup<{
    title: FormControl<string>;
    description: FormControl<string>;
    price: FormControl<number>;
    thumbnail: FormControl<string>;
    categoryId: FormControl<string>;
    published: FormControl<boolean>;
    lectureNames: FormArray<FormControl<string>>; // للعرض فقط

    // ✅ الحقول الجديدة
    programDuration: FormControl<string>;
    targetAudience: FormControl<string>;

    goalTitle: FormControl<string>;
    goalDescription: FormControl<string>;

    expectedStudyTimeTitle: FormControl<string>;
    expectedStudyTimeDescription: FormControl<string>;

    prerequisitesTitle: FormControl<string>;
    prerequisitesDescription: FormControl<string>;

    introVideoUrl: FormControl<string>;

    testimonialName: FormControl<string>;
    testimonialProblem: FormControl<string>;
    testimonialText: FormControl<string>;
    testimonialRating: FormControl<string>;

    pricingBasic: FormControl<string>;
    pricingGroup: FormControl<string>;
    pricingPremium: FormControl<string>;
  }>;

  /** قائمة الدروس (من RTDB) */
  lessons: LessonRow[] = [];

  /** نموذج الدرس */
  lessonForm!: FormGroup<{
    id: FormControl<string | null>;     // Firebase key عند التعديل
    title: FormControl<string>;
    lessonIndex: FormControl<number>;   // 1-based
    playbackUrl: FormControl<string>;
  }>;

  // getter مtyped للـ FormArray
  get lectureNames(): FormArray<FormControl<string>> {
    return this.courseForm.get('lectureNames') as FormArray<FormControl<string>>;
  }

  // إضافة خانة اسم درس داخل FormArray (عرض فقط)
  addLectureName(value = '') {
    this.lectureNames.push(this.fb.nonNullable.control<string>(value));
  }

  // حذف خانة اسم درس داخل FormArray (عرض فقط)
  removeLectureName(i: number) {
    this.lectureNames.removeAt(i);
  }

  async ngOnInit() {
    // 1) تهيئة النماذج
    this.courseForm = this.fb.group({
      title: this.fb.nonNullable.control<string>('', [
        Validators.required,
        Validators.minLength(3),
      ]),
      description: this.fb.nonNullable.control<string>(''),
      price: this.fb.nonNullable.control<number>(0, [Validators.min(0)]),
      thumbnail: this.fb.nonNullable.control<string>(''),
      categoryId: this.fb.nonNullable.control<string>(''),
      published: this.fb.nonNullable.control<boolean>(false),
      lectureNames: this.fb.array<FormControl<string>>([]),

      // ✅ الحقول الجديدة – كلها نصية اختيارية
      programDuration: this.fb.nonNullable.control<string>(''),
      targetAudience: this.fb.nonNullable.control<string>(''),

      goalTitle: this.fb.nonNullable.control<string>(''),
      goalDescription: this.fb.nonNullable.control<string>(''),

      expectedStudyTimeTitle: this.fb.nonNullable.control<string>(''),
      expectedStudyTimeDescription: this.fb.nonNullable.control<string>(''),

      prerequisitesTitle: this.fb.nonNullable.control<string>(''),
      prerequisitesDescription: this.fb.nonNullable.control<string>(''),

      introVideoUrl: this.fb.nonNullable.control<string>(''),

      testimonialName: this.fb.nonNullable.control<string>(''),
      testimonialProblem: this.fb.nonNullable.control<string>(''),
      testimonialText: this.fb.nonNullable.control<string>(''),
      testimonialRating: this.fb.nonNullable.control<string>(''),

      pricingBasic: this.fb.nonNullable.control<string>(''),
      pricingGroup: this.fb.nonNullable.control<string>(''),
      pricingPremium: this.fb.nonNullable.control<string>(''),
    });

    this.lessonForm = this.fb.group({
      id: this.fb.control<string | null>(null),
      title: this.fb.nonNullable.control<string>('', [
        Validators.required,
        Validators.minLength(2),
      ]),
      lessonIndex: this.fb.nonNullable.control<number>(1, [
        Validators.required,
        Validators.min(1),
      ]),
      playbackUrl: this.fb.nonNullable.control<string>(''),
    });

    // 2) تشغيل
    this.courseId = this.route.snapshot.paramMap.get('id') || undefined;

    try {
      if (this.courseId) {
        // وضع التعديل: حمّل الكورس
        const c = await this.admin.getCourse(this.courseId);
        if (!c) throw new Error('الكورس غير موجود');

        this.courseForm.patchValue({
          title: c.title || '',
          description: c.description || '',
          price: Number(c.price ?? 0),
          thumbnail: c.thumbnail || '',
          categoryId: c.categoryId || '',
          published: !!c.published,

          programDuration: c.programDuration || '',
          targetAudience: c.targetAudience || '',

          goalTitle: c.goalTitle || '',
          goalDescription: c.goalDescription || '',

          expectedStudyTimeTitle: c.expectedStudyTimeTitle || '',
          expectedStudyTimeDescription: c.expectedStudyTimeDescription || '',

          prerequisitesTitle: c.prerequisitesTitle || '',
          prerequisitesDescription: c.prerequisitesDescription || '',

          introVideoUrl: c.introVideoUrl || '',

          testimonialName: c.testimonialName || '',
          testimonialProblem: c.testimonialProblem || '',
          testimonialText: c.testimonialText || '',
          testimonialRating: c.testimonialRating || '',

          pricingBasic: c.pricingBasic || '',
          pricingGroup: c.pricingGroup || '',
          pricingPremium: c.pricingPremium || '',
        });

        // املأ أسماء الدروس للعرض فقط (من course.lectureNames)
        (c.lectureNames ?? []).forEach((name) =>
          this.addLectureName((name ?? '').trim())
        );
        if (this.lectureNames.length === 0) this.addLectureName('');

        // حمّل الدروس من RTDB
        await this.refreshLessons();
      } else {
        // وضع القائمة: اعرض كل الكورسات
        await this.loadCoursesList();
        if (this.lectureNames.length === 0) this.addLectureName('');
        // ما فيش دروس هنا لأن لسه مفيش courseId
        this.lessons = [];
      }
    } catch (e: any) {
      this.error = e?.message ?? 'حدث خطأ';
    } finally {
      this.loading = false;
    }
  }

  /** تحميل جميع الكورسات لعرضها في جدول */
  async loadCoursesList() {
    this.courses = (await this.admin.listCourses()).sort((a, b) =>
      (a.title || '').localeCompare(b.title || '')
    );
  }

  /** إعادة تحميل دروس الكورس من RTDB */
  private async refreshLessons() {
    if (!this.courseId) return;
    const list = await this.admin.listLessons(this.courseId);
    this.lessons = list.map(l => ({
      id: l.id,
      title: l.title,
      lessonIndex: l.lessonIndex,
      playbackUrl: l.playbackUrl || '',
    }));
    // عدّل القيمة الافتراضية لترتيب الدرس الجديد
    this.lessonForm.patchValue({ lessonIndex: (this.lessons?.length || 0) + 1 });
  }

  /** حذف كورس من جدول القائمة (يُستدعى من القالب) */
  async deleteCourseFromList(id: string) {
    if (!confirm('متأكد من حذف هذا الكورس؟')) return;
    this.loading = true;
    try {
      await this.admin.deleteCourse(id);
      await this.loadCoursesList();
    } catch (e: any) {
      this.error = e?.message ?? 'تعذّر الحذف';
    } finally {
      this.loading = false;
    }
  }

  /** ====== إدارة الكورس الجاري ====== */
  async saveCourse() {
    if (this.courseForm.invalid) return;
    this.loading = true;
    this.error = undefined;

    const f = this.courseForm;

    const data: AdminCourse = {
      title: f.get('title')!.value.trim(),
      description: f.get('description')!.value.trim(),
      price: Number(f.get('price')!.value) || 0,
      thumbnail: f.get('thumbnail')!.value.trim(),
      categoryId: f.get('categoryId')!.value.trim(),
      published: !!f.get('published')!.value,
      // للعرض فقط — بنسيبها زي ما هي
      lectureNames: (this.lectureNames.value as string[])
        .map((s) => (s ?? '').trim())
        .filter(Boolean),

      // ✅ الحقول الجديدة
      programDuration: f.get('programDuration')!.value.trim(),
      targetAudience: f.get('targetAudience')!.value.trim(),

      goalTitle: f.get('goalTitle')!.value.trim(),
      goalDescription: f.get('goalDescription')!.value.trim(),

      expectedStudyTimeTitle: f.get('expectedStudyTimeTitle')!.value.trim(),
      expectedStudyTimeDescription: f.get('expectedStudyTimeDescription')!.value.trim(),

      prerequisitesTitle: f.get('prerequisitesTitle')!.value.trim(),
      prerequisitesDescription: f.get('prerequisitesDescription')!.value.trim(),

      introVideoUrl: f.get('introVideoUrl')!.value.trim(),

      testimonialName: f.get('testimonialName')!.value.trim(),
      testimonialProblem: f.get('testimonialProblem')!.value.trim(),
      testimonialText: f.get('testimonialText')!.value.trim(),
      testimonialRating: f.get('testimonialRating')!.value.trim(),

      pricingBasic: f.get('pricingBasic')!.value.trim(),
      pricingGroup: f.get('pricingGroup')!.value.trim(),
      pricingPremium: f.get('pricingPremium')!.value.trim(),
    };

    try {
      if (!this.courseId) {
        const id = await this.admin.createCourse(data);
        this.courseId = id;
        await this.router.navigate(['/admin/course-editor', id]);
        await this.refreshLessons();
      } else {
        await this.admin.updateCourse(this.courseId, data);
      }
    } catch (e: any) {
      this.error = e?.message ?? 'تعذّر الحفظ';
    } finally {
      this.loading = false;
    }
  }

  async deleteCourse() {
    if (!this.courseId) return;
    if (!confirm('متأكد من حذف الكورس؟')) return;
    this.loading = true;
    try {
      await this.admin.deleteCourse(this.courseId);
      await this.router.navigate(['/admin/course-editor']);
    } catch (e: any) {
      this.error = e?.message ?? 'تعذّر الحذف';
    } finally {
      this.loading = false;
    }
  }

  /** ====== إدارة الدروس (كتابة فعلية في RTDB) ====== */

  async saveLesson() {
    if (!this.courseId) return;
    if (this.lessonForm.invalid) {
      this.lessonForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = undefined;

    const id = this.lessonForm.get('id')!.value;
    const title = (this.lessonForm.get('title')!.value ?? '').trim();
    let lessonIndex = Number(this.lessonForm.get('lessonIndex')!.value) || 1;
    lessonIndex = Math.max(1, lessonIndex);
    const playbackUrl = (this.lessonForm.get('playbackUrl')!.value ?? '').trim();

    const payload: AdminLesson = { title, lessonIndex, playbackUrl };

    try {
      if (id) {
        await this.admin.updateLesson(this.courseId, id, payload);
      } else {
        await this.admin.addLesson(this.courseId, payload);
      }
      await this.refreshLessons();
      this.resetLessonForm();
    } catch (e: any) {
      this.error = e?.message ?? 'تعذّر حفظ الدرس';
    } finally {
      this.loading = false;
    }
  }

  editLesson(l: LessonRow) {
    this.lessonForm.patchValue({
      id: l.id,
      title: l.title || '',
      lessonIndex: l.lessonIndex || 1,
      playbackUrl: l.playbackUrl || '',
    });
  }

  resetLessonForm() {
    this.lessonForm.reset({
      id: null,
      title: '',
      lessonIndex: (this.lessons?.length || 0) + 1,
      playbackUrl: '',
    });
  }

  async deleteLesson(lessonId: string) {
    if (!this.courseId) return;
    if (!confirm('متأكد من حذف هذا الدرس؟')) return;

    this.loading = true;
    try {
      await this.admin.deleteLesson(this.courseId, lessonId);
      await this.refreshLessons();
      if (this.lessonForm.get('id')!.value === lessonId) {
        this.resetLessonForm();
      }
    } catch (e: any) {
      this.error = e?.message ?? 'تعذّر حذف الدرس';
    } finally {
      this.loading = false;
    }
  }
}
