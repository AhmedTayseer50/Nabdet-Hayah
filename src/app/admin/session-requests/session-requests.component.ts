import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SessionRequest, SessionRequestsService, SessionRequestStatus } from 'src/app/core/services/session-requests.service';

@Component({
  selector: 'app-session-requests',
  templateUrl: './session-requests.component.html',
  styleUrls: ['./session-requests.component.css'],
})
export class SessionRequestsComponent implements OnInit, OnDestroy {
  loading = true;
  error?: string;

  all: SessionRequest[] = [];
  sub?: Subscription;

  filter: SessionRequestStatus | 'all' = 'new';

  constructor(private reqSvc: SessionRequestsService) {}

  ngOnInit(): void {
    this.sub = this.reqSvc.watchAll().subscribe({
      next: (list) => {
        this.all = list;
        this.loading = false;
      },
      error: (e) => {
        this.error = e?.message ?? 'تعذر تحميل الطلبات';
        this.loading = false;
      },
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  get filtered(): SessionRequest[] {
    if (this.filter === 'all') return this.all;
    return this.all.filter((x) => x.status === this.filter);
  }

  count(status: SessionRequestStatus) {
    return this.all.filter((x) => x.status === status).length;
  }

  waLink(phone: string): string {
    const clean = (phone || '').replace(/[^\d+]/g, '');
    return `https://wa.me/${clean.replace('+', '')}`;
  }

  async setStatus(id: string, status: SessionRequestStatus) {
    try {
      await this.reqSvc.patch(id, { status });
    } catch (e: any) {
      this.error = e?.message ?? 'تعذر تحديث الحالة';
    }
  }
}
