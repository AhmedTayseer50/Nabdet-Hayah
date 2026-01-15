import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  sent = false;
  error?: string;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  constructor(private fb: FormBuilder, private auth: AuthService) {}

  async onSubmit() {
    if (this.form.invalid) return;
    this.error = undefined;
    try {
      await this.auth.resetPassword(this.form.value.email!);
      this.sent = true;
    } catch (e: any) {
      this.error = e?.message ?? 'تعذّر إرسال رابط الاستعادة';
    }
  }
}
