// src/app/admin/services/admin.service.ts
import { Injectable, inject } from '@angular/core';
import { Database, ref, push, set, update, remove, get } from '@angular/fire/database';

export interface AdminCourse {
  title: string;
  description?: string;
  price?: number;
  thumbnail?: string;
  categoryId?: string;
  published?: boolean;
  createdAt?: number;
  /** أسماء الدروس للعرض فقط */
  lectureNames?: string[];

  /** ✅ الحقول الجديدة للصفحة التسويقية */
  programDuration?: string;                // مدة البرنامج
  targetAudience?: string;                 // لمن الكورس

  goalTitle?: string;                      // الهدف من الدراسة - العنوان
  goalDescription?: string;                // الهدف من الدراسة - الوصف

  expectedStudyTimeTitle?: string;         // المدة المتوقعة للدراسة - العنوان
  expectedStudyTimeDescription?: string;   // المدة المتوقعة للدراسة - الوصف

  prerequisitesTitle?: string;             // الخبرات السابقة المطلوبة - العنوان
  prerequisitesDescription?: string;       // الخبرات السابقة المطلوبة - الوصف

  introVideoUrl?: string;                  // رابط الفيديو التعريفي

  testimonialName?: string;                // رأي المتدرب - الاسم
  testimonialProblem?: string;             // رأي المتدرب - المشكلة
  testimonialText?: string;                // رأي المتدرب - الوصف
  testimonialRating?: string;              // رأي المتدرب - التقييم (كنص أو رقم)

  pricingBasic?: string;                   // الخطة الأساسية
  pricingGroup?: string;                   // خطة المتابعة الجماعية
  pricingPremium?: string;                 // الخطة المميزة
}

export interface AdminLesson {
  title: string;
  lessonIndex: number;
  playbackUrl?: string;
  createdAt?: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private db = inject(Database);

  // ------- Courses -------
  async listCourses(): Promise<Array<{ id: string } & AdminCourse>> {
    const snap = await get(ref(this.db, 'courses'));
    if (!snap.exists()) return [];
    const obj = snap.val() as Record<string, AdminCourse>;
    return Object.entries(obj).map(([id, data]) => ({ id, ...data }));
  }

  async getCourse(id: string): Promise<({ id: string } & AdminCourse) | null> {
    const snap = await get(ref(this.db, `courses/${id}`));
    return snap.exists() ? { id, ...(snap.val() as AdminCourse) } : null;
  }

  async createCourse(data: AdminCourse, opts?: { id?: string }): Promise<string> {
    const now = Date.now();
    let id = opts?.id?.trim();

    const basePayload: AdminCourse = {
      ...data,
      createdAt: now,
      published: !!data.published,
      lectureNames: data.lectureNames ?? [],
    };

    if (id) {
      const existsSnap = await get(ref(this.db, `courses/${id}`));
      if (existsSnap.exists()) throw new Error(`المعرّف "${id}" مستخدم بالفعل.`);
      await set(ref(this.db, `courses/${id}`), basePayload);
      return id;
    }

    const listRef = ref(this.db, 'courses');
    const newRef = push(listRef);
    id = newRef.key!;
    await set(ref(this.db, `courses/${id}`), basePayload);
    return id;
  }

  async updateCourse(id: string, data: Partial<AdminCourse>): Promise<void> {
    await update(ref(this.db, `courses/${id}`), data);
  }

  async deleteCourse(id: string): Promise<void> {
    await remove(ref(this.db, `courses/${id}`));
    // مفيش تعامل تلقائي مع lessons/syllabus هنا
  }

  // ------- Lessons (RTDB: /lessons/{courseId}/{lessonId}) -------
  async listLessons(courseId: string): Promise<Array<{ id: string } & AdminLesson>> {
    const snap = await get(ref(this.db, `lessons/${courseId}`));
    if (!snap.exists()) return [];
    const obj = snap.val() as Record<string, AdminLesson>;
    return Object.entries(obj)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => (a.lessonIndex ?? 0) - (b.lessonIndex ?? 0));
  }

  async addLesson(courseId: string, data: AdminLesson): Promise<string> {
    const listRef = ref(this.db, `lessons/${courseId}`);
    const newRef = push(listRef);
    const id = newRef.key!;
    const payload: AdminLesson = {
      title: data.title,
      lessonIndex: data.lessonIndex,
      playbackUrl: data.playbackUrl || '',
      createdAt: Date.now(),
    };
    await set(ref(this.db, `lessons/${courseId}/${id}`), payload);
    return id;
  }

  async updateLesson(courseId: string, lessonId: string, data: Partial<AdminLesson>): Promise<void> {
    await update(ref(this.db, `lessons/${courseId}/${lessonId}`), data);
  }

  async deleteLesson(courseId: string, lessonId: string): Promise<void> {
    await remove(ref(this.db, `lessons/${courseId}/${lessonId}`));
  }
}
