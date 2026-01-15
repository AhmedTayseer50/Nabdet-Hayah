import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  loading = false;
  error?: string;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  async onSubmit() {
    if (this.form.invalid) return;
    this.loading = true; this.error = undefined;
    try {
      const { email, password } = this.form.value;
      await this.auth.signup(email!, password!);
      this.router.navigateByUrl('/courses');
    } catch (e: any) {
      this.error = e?.message ?? 'حدث خطأ أثناء إنشاء الحساب';
    } finally {
      this.loading = false;
    }
  }
}
