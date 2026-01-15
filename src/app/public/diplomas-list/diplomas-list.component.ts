import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DiplomasService } from '../services/diplomas.service';
import { Diploma } from 'src/app/shared/models/diploma.model';

@Component({
  selector: 'app-diplomas-list',
  templateUrl: './diplomas-list.component.html',
  styleUrls: ['./diplomas-list.component.css']
})
export class DiplomasListComponent implements OnInit, OnDestroy {
  loading = true;
  error?: string;

  diplomas: Array<{ id: string } & Diploma> = [];
  search = '';

  private sub?: Subscription;

  constructor(private diplomasSvc: DiplomasService) {}

  ngOnInit(): void {
    this.sub = this.diplomasSvc.watchDiplomas().subscribe({
      next: (list) => {
        this.diplomas = list;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.message ?? 'حدث خطأ غير متوقع';
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  filteredDiplomas() {
    const k = this.search.trim().toLowerCase();
    if (!k) return this.diplomas;
    return this.diplomas.filter(d =>
      (d.title || '').toLowerCase().includes(k) ||
      (d.description || '').toLowerCase().includes(k)
    );
  }
}
