// src/app/admin/diploma-editor/diploma-editor.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DiplomasAdminService } from '../services/diplomas-admin.service';
import { AdminService } from '../services/admin.service';
import {
  Diploma,
  DiplomaPricingPlan,
  DiplomaTestimonial,
} from 'src/app/shared/models/diploma.model';

type DiplomaMeta = {
  level: string;
  totalCourses: number;
  totalLessons: number;
};

type DiplomaOffer = {
  percent: number;
  heading: string;
  text: string;
  ctaText: string;
};

type DiplomaBottomCta = {
  text: string;
  buttonText: string;
};

type DiplomaEditorForm = Diploma & {
  courseIds: Record<string, boolean>;
  meta: DiplomaMeta;
  specs: string[];
  testimonials: DiplomaTestimonial[];
  pricingPlans: DiplomaPricingPlan[];
  communityPerks: string[];
  offer: DiplomaOffer;
  bottomCta: DiplomaBottomCta;
};

@Component({
  selector: 'app-diploma-editor',
  templateUrl: './diploma-editor.component.html',
  styleUrls: ['./diploma-editor.component.css'],
})
export class DiplomaEditorComponent implements OnInit {
  loading = false;
  error?: string;

  diplomaId?: string;

  courses: { id: string; title?: string }[] = [];

  // ✅ Data (initialized with full defaults to satisfy template checker)
  data: DiplomaEditorForm = this.buildDefaults();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private diplomasAdmin: DiplomasAdminService,
    private adminCourses: AdminService
  ) {}

  async ngOnInit(): Promise<void> {
    this.loading = true;
    this.error = undefined;

    try {
      const rawCourses = await this.adminCourses.listCourses();
      this.courses = rawCourses.map((c) => ({ id: c.id, title: c.title }));

      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.diplomaId = id;
        const d = await this.diplomasAdmin.getDiploma(id);
        if (!d) throw new Error('الدبلومة غير موجودة');

        // ✅ Merge stored data with safe defaults
        const defaults = this.buildDefaults();

        this.data = {
          ...defaults,
          ...d,

          // always objects/arrays
          courseIds: d.courseIds ?? defaults.courseIds,
          meta: { ...defaults.meta, ...(d as any).meta },
          specs: (d as any).specs ?? defaults.specs,
          testimonials: (d as any).testimonials ?? defaults.testimonials,
          pricingPlans: (d as any).pricingPlans ?? defaults.pricingPlans,
          communityPerks: (d as any).communityPerks ?? defaults.communityPerks,
          offer: { ...defaults.offer, ...(d as any).offer },
          bottomCta: { ...defaults.bottomCta, ...(d as any).bottomCta },
        };
      } else {
        // new diploma -> ensure defaults
        this.data = this.buildDefaults();
      }

      this.ensureDefaults();
      this.recalcMeta();
    } catch (e: any) {
      this.error = e?.message ?? 'تعذر التحميل';
    } finally {
      this.loading = false;
    }
  }

  // =========================
  // Helpers
  // =========================
  private buildDefaults(): DiplomaEditorForm {
    return {
      title: '',
      description: '',
      price: 0,
      thumbnail: '',
      categoryId: '',
      published: true,
      createdAt: undefined,

      programDuration: '',
      targetAudience: '',

      // legacy fields if exist in model
      goalTitle: '',
      goalDescription: '',
      expectedStudyTimeTitle: '',
      expectedStudyTimeDescription: '',
      prerequisitesTitle: '',
      prerequisitesDescription: '',
      introVideoUrl: '',

      // ✅ courses
      courseIds: {},

      // ✅ meta
      meta: {
        level: '',
        totalCourses: 0,
        totalLessons: 0,
      },

      // ✅ arrays
      specs: [''],
      communityPerks: [''],

      // ✅ testimonials
      testimonials: [
        { name: '', tag: '', rating: 5, text: '' },
        { name: '', tag: '', rating: 5, text: '' },
        { name: '', tag: '', rating: 5, text: '' },
      ],

      // ✅ pricing plans
      pricingPlans: [
        {
          name: 'Basic',
          badge: '',
          priceText: '',
          note: '',
          highlighted: false,
          features: [''],
        },
        {
          name: 'Group',
          badge: '',
          priceText: '',
          note: '',
          highlighted: true,
          features: [''],
        },
        {
          name: 'Premium',
          badge: '',
          priceText: '',
          note: '',
          highlighted: false,
          features: [''],
        },
      ],

      // ✅ offer + bottom CTA
      offer: {
        percent: 30,
        heading: '',
        text: '',
        ctaText: 'اشترك الآن',
      },

      bottomCta: {
        text: 'لو لسه مشتركتش… متضيعش الفرصة',
        buttonText: 'اشترك الآن',
      },
    };
  }

  private ensureDefaults(): void {
    // meta
    if (!this.data.meta) this.data.meta = { level: '', totalCourses: 0, totalLessons: 0 };

    // arrays
    if (!Array.isArray(this.data.specs)) this.data.specs = [];
    if (!Array.isArray(this.data.communityPerks)) this.data.communityPerks = [];
    if (!Array.isArray(this.data.testimonials)) this.data.testimonials = [];
    if (!Array.isArray(this.data.pricingPlans)) this.data.pricingPlans = [];

    // Testimonials: ensure at least 3
    while (this.data.testimonials.length < 3) {
      this.data.testimonials.push({
        name: '',
        tag: 'متدرب',
        rating: 5,
        text: '',
      });
    }
    this.data.testimonials = this.data.testimonials.slice(0, 3);

    // Pricing plans: ensure 3
    if (this.data.pricingPlans.length === 0) {
      this.data.pricingPlans = [
        {
          name: 'الخطة الأساسية',
          badge: 'لبداية هادئة ومركّزة',
          priceText: '—',
          note: 'دفع لمرة واحدة – دخول فوري للمحتوى',
          features: ['الوصول الكامل لمحتوى الدبلومة.', 'تحميل الملفات والتطبيقات العملية.'],
          highlighted: false,
        },
        {
          name: 'خطة المتابعة الجماعية',
          badge: 'دعم أكبر + متابعة',
          priceText: '—',
          note: 'تشمل مزايا الخطة الأساسية وأكثر',
          features: ['كل مزايا الخطة الأساسية.', 'متابعة داخل جروب للأسئلة والنقاش.'],
          highlighted: true,
        },
        {
          name: 'الخطة المميّزة',
          badge: 'لمن يحتاج مساحة أعمق',
          priceText: '—',
          note: 'مزايا إضافية للمشتركين',
          features: ['كل مزايا خطة المتابعة.', 'خصومات على الجلسات الفردية.'],
          highlighted: false,
        },
      ];
    }

    this.data.pricingPlans = this.data.pricingPlans.slice(0, 3);
    while (this.data.pricingPlans.length < 3) {
      this.data.pricingPlans.push({
        name: '',
        badge: '',
        priceText: '—',
        note: '',
        features: [],
        highlighted: false,
      });
    }

    // ensure features arrays exist
    this.data.pricingPlans = this.data.pricingPlans.map((p) => ({
      ...p,
      features: Array.isArray(p.features) ? p.features : [],
    }));

    // offer + bottomCta
    if (!this.data.offer) {
      this.data.offer = { percent: 30, heading: 'عرض خاص', text: '', ctaText: 'اشترك الآن' };
    } else {
      this.data.offer.percent = typeof this.data.offer.percent === 'number' ? this.data.offer.percent : 30;
      this.data.offer.heading = this.data.offer.heading ?? '';
      this.data.offer.text = this.data.offer.text ?? '';
      this.data.offer.ctaText = this.data.offer.ctaText ?? 'اشترك الآن';
    }

    if (!this.data.bottomCta) {
      this.data.bottomCta = { text: '', buttonText: 'اشترك الآن' };
    } else {
      this.data.bottomCta.text = this.data.bottomCta.text ?? '';
      this.data.bottomCta.buttonText = this.data.bottomCta.buttonText ?? 'اشترك الآن';
    }

    // courseIds always object
    if (!this.data.courseIds) this.data.courseIds = {};
  }

  private recalcMeta(): void {
    const totalCourses = Object.keys(this.data.courseIds ?? {}).length;
    this.data.meta.totalCourses = totalCourses;
  }

  // =========================
  // Courses inside diploma
  // =========================
  toggleCourse(courseId: string, checked: boolean): void {
    if (!this.data.courseIds) this.data.courseIds = {};
    if (checked) this.data.courseIds[courseId] = true;
    else delete this.data.courseIds[courseId];
    this.recalcMeta();
  }

  isSelected(courseId: string): boolean {
    return !!this.data.courseIds?.[courseId];
  }

  // =========================
  // List controls
  // =========================
  addSpec(): void {
    this.data.specs = [...(this.data.specs ?? []), ''];
  }

  removeSpec(i: number): void {
    this.data.specs = (this.data.specs ?? []).filter((_, idx) => idx !== i);
  }

  addPerk(): void {
    this.data.communityPerks = [...(this.data.communityPerks ?? []), ''];
  }

  removePerk(i: number): void {
    this.data.communityPerks = (this.data.communityPerks ?? []).filter((_, idx) => idx !== i);
  }

  addFeature(planIndex: number): void {
    const p = this.data.pricingPlans?.[planIndex];
    if (!p) return;
    p.features = [...(p.features ?? []), ''];
  }

  removeFeature(planIndex: number, featureIndex: number): void {
    const p = this.data.pricingPlans?.[planIndex];
    if (!p) return;
    p.features = (p.features ?? []).filter((_, idx) => idx !== featureIndex);
  }

  // =========================
  // Save
  // =========================
  async save(): Promise<void> {
    this.error = undefined;
    this.loading = true;

    try {
      if (!this.data.title?.trim()) throw new Error('اكتب عنوان الدبلومة');

      // clean arrays (remove empty items)
      this.data.specs = (this.data.specs ?? []).map((x) => (x ?? '').trim()).filter(Boolean);
      this.data.communityPerks = (this.data.communityPerks ?? []).map((x) => (x ?? '').trim()).filter(Boolean);

      // testimonials
      this.data.testimonials = (this.data.testimonials ?? [])
        .slice(0, 3)
        .map((t) => ({
          ...t,
          name: (t.name ?? '').trim(),
          tag: (t.tag ?? '').trim(),
          text: (t.text ?? '').trim(),
          rating: typeof t.rating === 'number' ? t.rating : 5,
        }))
        .filter((t) => t.name && t.text);

      // pricing plans
      this.data.pricingPlans = (this.data.pricingPlans ?? [])
        .slice(0, 3)
        .map((p: DiplomaPricingPlan) => ({
          ...p,
          name: (p.name ?? '').trim(),
          badge: (p.badge ?? '').trim(),
          priceText: (p.priceText ?? '—').trim(),
          note: (p.note ?? '').trim(),
          features: (p.features ?? []).map((x) => (x ?? '').trim()).filter(Boolean),
          highlighted: !!p.highlighted,
        }));

      // meta totalCourses auto
      this.recalcMeta();

      if (this.diplomaId) {
        await this.diplomasAdmin.updateDiploma(this.diplomaId, this.data);
      } else {
        const newId = await this.diplomasAdmin.createDiploma(this.data);
        this.diplomaId = newId;
      }

      this.router.navigate(['/admin/dashboard']);
    } catch (e: any) {
      this.error = e?.message ?? 'تعذر الحفظ';
    } finally {
      this.loading = false;
    }
  }
}
