// src/app/shared/models/diploma.model.ts

export interface DiplomaTestimonial {
  name: string;
  tag?: string;        // مثال: "متدربة"
  rating?: number;     // 1..5
  text: string;
}

export interface DiplomaPricingPlan {
  name: string;          // اسم الخطة
  badge?: string;        // سطر صغير تحت الاسم
  priceText: string;     // "399 ر.س" أو "1200 EGP"
  note?: string;         // "دفع لمرة واحدة..."
  features: string[];    // مميزات الخطة
  highlighted?: boolean; // الخطة المميزة
}

export interface DiplomaOffer {
  percent?: number;    // 30
  heading?: string;    // "عرض خاص..."
  text?: string;
  ctaText?: string;    // نص زر الاشتراك
}

export interface DiplomaBottomCta {
  text?: string;
  buttonText?: string;
}

export interface DiplomaMeta {
  totalCourses?: number;
  totalLessons?: number; // اختياري لو هتسجلها
  level?: string;
}

export interface Diploma {
  id?: string;

  // basics
  title: string;
  description?: string;
  price?: number;
  thumbnail?: string;
  categoryId?: string;
  published?: boolean;
  createdAt?: number;

  // ✅ الدبلومة تحتوي كورسات
  courseIds?: Record<string, boolean>;

  // hero
  heroEyebrow?: string;
  heroTagline?: string;
  programDuration?: string;
  targetAudience?: string;

  // info cards
  goalTitle?: string;
  goalDescription?: string;

  expectedStudyTimeTitle?: string;
  expectedStudyTimeDescription?: string;

  prerequisitesTitle?: string;
  prerequisitesDescription?: string;

  // video
  introVideoUrl?: string;

  // specs / technical info
  specs?: string[];

  // testimonials
  testimonials?: DiplomaTestimonial[];

  // pricing (3 plans)
  pricingPlans?: DiplomaPricingPlan[];

  // community perks
  communityPerks?: string[];

  // offer popup + bottom cta
  offer?: DiplomaOffer;
  bottomCta?: DiplomaBottomCta;

  // list meta (اختياري)
  meta?: DiplomaMeta;
}
