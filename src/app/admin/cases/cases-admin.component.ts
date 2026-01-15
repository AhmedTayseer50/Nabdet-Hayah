import { Component, OnInit } from '@angular/core';
import { CasesService } from '../services/cases.service';
import { AdminService } from '../services/admin.service';
import { CaseRecord } from 'src/app/shared/models/case.model';
import { Database, ref as dbRef, set, update } from '@angular/fire/database';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-cases-admin',
  templateUrl: './cases-admin.component.html',
  styleUrls: ['./cases-admin.component.css']
})
export class AdminCasesComponent implements OnInit {
  loading = true;
  error?: string;

  allCases: CaseRecord[] = [];
  filtered: CaseRecord[] = [];
  statusFilter: 'all' | 'onhold' | 'processed' = 'all';

  constructor(
    private casesSvc: CasesService,
    private adminSvc: AdminService,
    private db: Database,
    private auth: Auth
  ) {}

  async ngOnInit() {
    await this.refresh();
  }

  async refresh() {
    this.loading = true; this.error = undefined;
    try {
      this.allCases = await this.casesSvc.listAll();
      this.applyFilter();
    } catch (e: any) {
      this.error = e?.message ?? 'تعذر التحميل';
    } finally {
      this.loading = false;
    }
  }

  applyFilter() {
    this.filtered = this.statusFilter === 'all'
      ? [...this.allCases]
      : this.allCases.filter(c => c.status === this.statusFilter);
  }

  totalProcessed(): number {
    return this.casesSvc.sumProcessedAmount(this.allCases);
  }

  async grantEnrollments(c: CaseRecord) {
    try {
      // كتابة إتاحة الكورسات للمستخدم
      const entries = Object.keys(c.courseIds || {});
      for (const courseId of entries) {
        await set(dbRef(this.db, `enrollments/${c.userId}/${courseId}`), true);
      }

      // ✅ تحديث سجل العميل في customers/{uid}
      await update(dbRef(this.db, `customers/${c.userId}`), {
        email: c.userEmail || null,
        lastOrderAt: Date.now()
      });

      alert('تم إتاحة الكورسات للمستخدم وتحديث بيانات العميل');
    } catch (e: any) {
      this.error = e?.message ?? 'تعذر الإتاحة';
    }
  }

  async markProcessed(c: CaseRecord) {
    const me = this.auth.currentUser;
    if (!me) return;
    try {
      // وسم الحالة كمُعالَجة
      await this.casesSvc.markProcessed(c.id!, me.uid);

      // ✅ (تعزيز) تأكيد وجود العميل في customers حتى لو ما ضغطتش "إتاحة" قبله
      await update(dbRef(this.db, `customers/${c.userId}`), {
        email: c.userEmail || null,
        lastOrderAt: Date.now()
      });

      await this.refresh();
    } catch (e: any) {
      this.error = e?.message ?? 'تعذر تحديث الحالة';
    }
  }
}
