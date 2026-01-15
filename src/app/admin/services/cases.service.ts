import { Injectable, inject } from '@angular/core';
import { Database, ref, push, set, get, update, query, orderByChild, equalTo } from '@angular/fire/database';
import { CaseRecord, CaseStatus } from 'src/app/shared/models/case.model';

@Injectable({ providedIn: 'root' })
export class CasesService {
  private db = inject(Database);

  async create(caseData: Omit<CaseRecord, 'id'|'createdAt'>): Promise<string> {
    const listRef = ref(this.db, 'cases');
    const newRef = push(listRef);
    await set(newRef, {
      ...caseData,
      createdAt: Date.now()
    });
    return newRef.key!;
  }

  async update(id: string, patch: Partial<CaseRecord>): Promise<void> {
    await update(ref(this.db, `cases/${id}`), patch);
  }

  async listByCreator(uid: string): Promise<CaseRecord[]> {
    const q = query(ref(this.db, 'cases'), orderByChild('createdBy'), equalTo(uid));
    const snap = await get(q);
    if (!snap.exists()) return [];
    const obj = snap.val() as Record<string, CaseRecord>;
    return Object.entries(obj).map(([id, v]) => ({ id, ...v })).sort((a,b)=>b.createdAt-a.createdAt);
  }

  async listAll(): Promise<CaseRecord[]> { // للمدير
    const snap = await get(ref(this.db, 'cases'));
    if (!snap.exists()) return [];
    const obj = snap.val() as Record<string, CaseRecord>;
    return Object.entries(obj).map(([id, v]) => ({ id, ...v })).sort((a,b)=>b.createdAt-a.createdAt);
  }

  async markProcessed(id: string, managerUid: string): Promise<void> {
    await update(ref(this.db, `cases/${id}`), { status: 'processed', processedAt: Date.now(), processedBy: managerUid });
  }

  sumProcessedAmount(cases: CaseRecord[]): number {
    return cases.filter(c => c.status === 'processed').reduce((s, c) => s + (Number(c.amount) || 0), 0);
  }
}
