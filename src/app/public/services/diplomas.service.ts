import { Injectable, inject } from '@angular/core';
import { Database, ref, objectVal } from '@angular/fire/database';
import { map, Observable } from 'rxjs';
import { Diploma } from 'src/app/shared/models/diploma.model';

@Injectable({ providedIn: 'root' })
export class DiplomasService {
  private db = inject(Database);

  watchDiplomas(): Observable<Array<{ id: string } & Diploma>> {
    const r = ref(this.db, 'diplomas');
    return objectVal<Record<string, Diploma>>(r).pipe(
      map((obj) => {
        if (!obj) return [];
        return Object.entries(obj).map(([id, data]) => ({ id, ...(data as Diploma) }));
      }),
      // اعرض المنشور فقط
      map((list) => list.filter(x => x.published === true))
    );
  }

  async getDiplomaById(id: string): Promise<({ id: string } & Diploma) | null> {
    const { get } = await import('@angular/fire/database');
    const snap = await get(ref(this.db, `diplomas/${id}`));
    return snap.exists() ? ({ id, ...(snap.val() as Diploma) }) : null;
  }
}
