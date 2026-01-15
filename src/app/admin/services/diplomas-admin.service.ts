import { Injectable, inject } from '@angular/core';
import { Database, ref, push, set, update, remove, get } from '@angular/fire/database';
import { Diploma } from 'src/app/shared/models/diploma.model';

@Injectable({ providedIn: 'root' })
export class DiplomasAdminService {
  private db = inject(Database);

  async listDiplomas(): Promise<Array<{ id: string } & Diploma>> {
    const snap = await get(ref(this.db, 'diplomas'));
    if (!snap.exists()) return [];
    const obj = snap.val() as Record<string, Diploma>;
    return Object.entries(obj).map(([id, data]) => ({ id, ...data }));
  }

  async getDiploma(id: string): Promise<({ id: string } & Diploma) | null> {
    const snap = await get(ref(this.db, `diplomas/${id}`));
    return snap.exists() ? { id, ...(snap.val() as Diploma) } : null;
  }

  async createDiploma(data: Diploma, opts?: { id?: string }): Promise<string> {
    const now = Date.now();
    let id = opts?.id?.trim();

    const payload: Diploma = {
      ...data,
      createdAt: now,
      published: !!data.published,
      courseIds: data.courseIds ?? {}
    };

    if (id) {
      const existsSnap = await get(ref(this.db, `diplomas/${id}`));
      if (existsSnap.exists()) throw new Error(`المعرّف "${id}" مستخدم بالفعل.`);
      await set(ref(this.db, `diplomas/${id}`), payload);
      return id;
    }

    const listRef = ref(this.db, 'diplomas');
    const newRef = push(listRef);
    id = newRef.key!;
    await set(ref(this.db, `diplomas/${id}`), payload);
    return id;
  }

  async updateDiploma(id: string, data: Partial<Diploma>): Promise<void> {
    await update(ref(this.db, `diplomas/${id}`), data);
  }

  async deleteDiploma(id: string): Promise<void> {
    await remove(ref(this.db, `diplomas/${id}`));
  }
}
