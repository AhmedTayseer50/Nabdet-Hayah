// src/app/public/diploma-details/diploma-details.component.ts

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { DiplomasService } from '../services/diplomas.service';
import { CoursesService } from '../services/courses.service';
import {
  Diploma,
  DiplomaPricingPlan,
  DiplomaTestimonial,
} from 'src/app/shared/models/diploma.model';

@Component({
  selector: 'app-diploma-details',
  templateUrl: './diploma-details.component.html',
  styleUrls: ['./diploma-details.component.css'],
})
export class DiplomaDetailsComponent implements OnInit, OnDestroy {
  diplomaId!: string;
  diploma: (Diploma & { id: string }) | null = null;

  loading = true;
  error?: string;

  defaultThumbnail =
    'https://images.pexels.com/photos/4100423/pexels-photo-4100423.jpeg?auto=compress&cs=tinysrgb&w=800';

  introVideoSafeUrl: SafeResourceUrl | null = null;

  includedCourses: any[] = [];

  // offer popup
  showOfferPopup = false;
  private offerShown = false;

  private destroyed$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private diplomasSvc: DiplomasService,
    private coursesSvc: CoursesService,
    private sanitizer: DomSanitizer
  ) {}

  private onWindowScroll = () => {
    if (this.loading || this.error || !this.diploma) return;

    const scrollPosition = window.innerHeight + window.scrollY;
    const threshold = document.body.offsetHeight - 80;

    if (!this.offerShown && scrollPosition >= threshold) {
      this.offerShown = true;
      this.showOfferPopup = true;
    }
  };

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroyed$)).subscribe(async (pm) => {
      const id = pm.get('id');
      if (!id) return;

      this.diplomaId = id;
      this.loading = true;
      this.error = undefined;

      this.diploma = null;
      this.includedCourses = [];
      this.introVideoSafeUrl = null;

      this.showOfferPopup = false;
      this.offerShown = false;

      // مهم: إزالة الـ listener قبل ما نضيفه تاني (لو تنقلت بين صفحات)
      window.removeEventListener('scroll', this.onWindowScroll);

      try {
        const d = await this.diplomasSvc.getDiplomaById(this.diplomaId);
        if (!d) {
          this.error = 'الدبلومة غير موجودة';
          return;
        }

        this.diploma = this.withDefaults(d);

        const introUrl = this.diploma.introVideoUrl;
        this.introVideoSafeUrl = introUrl
          ? this.sanitizer.bypassSecurityTrustResourceUrl(introUrl)
          : null;

        const ids = Object.keys(this.diploma.courseIds || {});
        if (ids.length) {
          const list = await Promise.all(
            ids.map((cid) => this.coursesSvc.getCourseById(cid))
          );
          this.includedCourses = list.filter(Boolean);
        }

        window.addEventListener('scroll', this.onWindowScroll);
      } catch (e: any) {
        this.error = e?.message ?? 'حدث خطأ أثناء تحميل الدبلومة';
      } finally {
        this.loading = false;
      }
    });
  }

  private withDefaults(d: any): Diploma & { id: string } {
    const totalCourses = Object.keys(d.courseIds || {}).length;

    const pricingPlans: DiplomaPricingPlan[] = (
      d.pricingPlans && Array.isArray(d.pricingPlans) && d.pricingPlans.length
        ? d.pricingPlans
        : [
            {
              name: 'الخطة الأساسية',
              badge: 'لبداية هادئة ومركّزة',
              priceText: d.price ? `${d.price}` : '—',
              note: 'دفع لمرة واحدة – دخول فوري للمحتوى',
              features: [
                'الوصول الكامل لمحتوى الدبلومة.',
                'تحميل الملفات والتطبيقات العملية.',
              ],
              highlighted: false,
            },
            {
              name: 'خطة المتابعة الجماعية',
              badge: 'لمن يريد دعمًا أكبر وأسئلة مباشرة',
              priceText: '—',
              note: 'تشمل كل مزايا الخطة الأساسية وأكثر',
              features: [
                'كل مزايا الخطة الأساسية.',
                'متابعة داخل جروب للأسئلة والنقاش.',
              ],
              highlighted: true,
            },
            {
              name: 'الخطة المميّزة',
              badge: 'لمن يحتاج مساحة أعمق',
              priceText: '—',
              note: 'مميزات إضافية للمشتركين',
              features: [
                'كل مزايا خطة المتابعة.',
                'خصومات على الجلسات الفردية.',
              ],
              highlighted: false,
            },
          ]
    ).slice(0, 3);

    while (pricingPlans.length < 3) {
      pricingPlans.push({
        name: '',
        priceText: '—',
        features: [],
        highlighted: false,
      } as DiplomaPricingPlan);
    }

    const testimonials: DiplomaTestimonial[] = (
      d.testimonials && Array.isArray(d.testimonials) && d.testimonials.length
        ? d.testimonials
        : [
            {
              name: 'أسماء',
              tag: 'متدربة',
              rating: 5,
              text: 'تجربة مفيدة جدًا وساعدتني أفهم نفسي بشكل أعمق.',
            },
            {
              name: 'محمد',
              tag: 'مشترك',
              rating: 5,
              text: 'الشرح بسيط ومنظم… والمسار مترتب بطريقة ممتازة.',
            },
            {
              name: 'سارة',
              tag: 'متدربة',
              rating: 5,
              text: 'أفضل شيء كان المتابعة والجروبات.. حسّيت بدعم حقيقي.',
            },
          ]
    ).slice(0, 3);

    while (testimonials.length < 3) {
      testimonials.push({ name: '', text: '' } as DiplomaTestimonial);
    }

    const specs = Array.isArray(d.specs) ? d.specs : [];
    const communityPerks = Array.isArray(d.communityPerks)
      ? d.communityPerks
      : [
          'جروب واتساب للرد على الاستفسارات والمتابعة.',
          'مجتمع فيسبوك للنقاش وتبادل الخبرات.',
          'أسعار خاصة على الجلسات الفردية بعد شراء الدبلومة.',
        ];

    return {
      ...d,
      heroEyebrow: d.heroEyebrow || 'دبلومة متكاملة بمسار تدريجي',
      heroTagline: d.heroTagline || 'مسار متدرج يجمع أهم الكورسات داخل دبلومة واحدة.',
      programDuration: d.programDuration || '—',
      targetAudience: d.targetAudience || '—',

      goalTitle: d.goalTitle || 'الهدف من الدراسة',
      goalDescription: d.goalDescription || 'تكوين فهم أعمق وخطة عملية للتطبيق خطوة بخطوة.',

      expectedStudyTimeTitle: d.expectedStudyTimeTitle || 'المدة المتوقعة للدراسة',
      expectedStudyTimeDescription:
        d.expectedStudyTimeDescription || 'جدول مرن يناسب وقتك — مشاهدة + تطبيق عملي.',

      prerequisitesTitle: d.prerequisitesTitle || 'الخبرات السابقة المطلوبة',
      prerequisitesDescription:
        d.prerequisitesDescription || 'لا يشترط خبرة مسبقة — المهم الاستمرارية.',

      specs,
      communityPerks,

      pricingPlans,
      testimonials,

      offer: d.offer || {
        percent: 30,
        heading: 'عرض خاص بخصم 30٪',
        text: 'احصل على خصم 30٪ عند الاشتراك الآن وابدأ رحلتك داخل المسار.',
        ctaText: 'اشترك الآن',
      },

      bottomCta: d.bottomCta || {
        text: 'لو لسه مشتركتش… متضيعش الفرصة. ابدأ الآن وخد أول خطوة بوعي.',
        buttonText: 'اشترك الآن',
      },

      meta: {
        ...(d.meta || {}),
        totalCourses: d.meta?.totalCourses ?? totalCourses,
      },
    };
  }

  goToPurchase(): void {
    console.log('[goToPurchase] شراء الدبلومة:', this.diplomaId);
    // لاحقاً: this.router.navigate(['/checkout', this.diplomaId])
  }

  openOfferFromBottomCta(): void {
    this.showOfferPopup = true;
    this.offerShown = true;
  }

  closeOffer(): void {
    this.showOfferPopup = false;
  }

  onOfferBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.closeOffer();
  }

  onOfferSubscribe(): void {
    this.closeOffer();
    this.goToPurchase();
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.onWindowScroll);
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
