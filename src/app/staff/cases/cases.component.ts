import { Component, OnInit } from '@angular/core';
import { CasesService } from 'src/app/admin/services/cases.service';
import { AdminService } from 'src/app/admin/services/admin.service';
import { UsersAdminService } from 'src/app/admin/services/users-admin.service';
import { CaseRecord } from 'src/app/shared/models/case.model';
import { Auth } from '@angular/fire/auth';
import {
  NonNullableFormBuilder,
  Validators,
  FormArray,
  FormControl,
} from '@angular/forms';

@Component({
  selector: 'app-staff-cases',
  templateUrl: './cases.component.html',
  styleUrls: ['./cases.component.css'],
})
export class StaffCasesComponent implements OnInit {
  loading = true;
  error?: string;

  myCases: CaseRecord[] = [];
  users: { uid: string; email?: string }[] = [];
  courses: { id: string; title?: string }[] = [];

  // ✅ باستخدام NonNullableFormBuilder كل الحقول non-nullable
  form = this.fb.group({
    userUid: this.fb.control<string>('', { validators: [Validators.required] }),
    courseChecks: this.fb.array<FormControl<boolean>>([]),
    proofUrl: this.fb.control<string>(''),
    amount: this.fb.control<number>(0, { validators: [Validators.required, Validators.min(0)] }),
  });

  constructor(
    private fb: NonNullableFormBuilder,
    private casesSvc: CasesService,
    private usersSvc: UsersAdminService,
    private adminSvc: AdminService,
    private auth: Auth
  ) {}

  get courseChecks(): FormArray<FormControl<boolean>> {
    return this.form.get('courseChecks') as FormArray<FormControl<boolean>>;
  }

  async ngOnInit() {
      this.error = undefined;   // تنظيف الرسالة القديمة
    try {
      const u = this.auth.currentUser;
      if (!u) throw new Error('يجب تسجيل الدخول');

      // العملاء (الإيميلات فقط بعد الفلترة في الخدمة)
      this.users = await this.usersSvc.listCustomers();

      // الكورسات ثم بناء الشيك بوكس
      const rawCourses = await this.adminSvc.listCourses();
      this.courses = rawCourses.map(c => ({ id: c.id, title: c.title }));

      this.courseChecks.clear();
      for (let i = 0; i < this.courses.length; i++) {
        this.courseChecks.push(this.fb.control<boolean>(false));
      }

      // الحالات الخاصة بي
      this.myCases = await this.casesSvc.listByCreator(u.uid);
    } catch (e: any) {
      this.error = e?.message ?? 'تعذر التحميل';
    } finally {
      this.loading = false;
    }
  }

  async createCase() {
    this.error = undefined;
    const me = this.auth.currentUser;
    if (!me) return;

    if (this.form.invalid) {
      this.error = 'اكمل الحقول المطلوبة';
      return;
    }

    // IDs المختارة من الشيك بوكس
    const selectedIds = this.courses
      .map((c, i) => (this.courseChecks.at(i).value ? c.id : null))
      .filter((x): x is string => !!x);

    if (!selectedIds.length) {
      this.error = 'اختر كورس واحد على الأقل';
      return;
    }

    const { userUid, proofUrl, amount } = this.form.getRawValue();
    const user = this.users.find(x => x.uid === userUid);

    const courseIdsMap = selectedIds.reduce(
      (acc: Record<string, true>, id) => ((acc[id] = true), acc),
      {}
    );

    const rec: CaseRecord = {
      userId: userUid,
      userEmail: user?.email || '',
      courseIds: courseIdsMap,
      proofUrl: proofUrl || '',
      amount: Number(amount) || 0,
      status: 'onhold',
      createdAt: Date.now(), 
      createdBy: me.uid,
      processedAt: null,
      processedBy: null,
    };

    try {
      await this.casesSvc.create(rec);
      this.myCases = await this.casesSvc.listByCreator(me.uid);

      // Reset
      this.form.patchValue({ userUid: '', proofUrl: '', amount: 0 });
      this.courseChecks.controls.forEach(ctrl => ctrl.setValue(false));
      this.form.markAsPristine();
      this.form.markAsUntouched();
    } catch (e: any) {
      this.error = e?.message ?? 'تعذر إنشاء الحالة';
    }
  }
}
