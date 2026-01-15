import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Auth, user as user$ } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent {
  private auth = inject(Auth);

  // Email فقط (قراءة فقط)
  email$: Observable<string | null> = user$(this.auth).pipe(
    map(u => u?.email ?? null)
  );
}
