// import { Component } from '@angular/core';
// import { FormBuilder, Validators } from '@angular/forms';
// import { SessionRequestsService } from 'src/app/core/services/session-requests.service';

// @Component({
//   selector: 'app-consultation-booking',
//   templateUrl: './consultation-booking.component.html',
//   styleUrls: ['./consultation-booking.component.css'],
// })
// export class ConsultationBookingComponent {
//   sending = false;
//   sent = false;
//   error?: string;

//   // ✅ constants
//   readonly EGYPT = 'مصر';

//   form = this.fb.group({
//     name: ['', [Validators.required, Validators.minLength(3)]],
//     age: [null as any, [Validators.required, Validators.min(10), Validators.max(120)]],
//     job: ['', [Validators.required, Validators.minLength(2)]],
//     maritalStatus: ['', [Validators.required]],
//     whatsapp: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{8,15}$/)]],
//     nationality: ['', [Validators.required]],
//     problem: ['', [Validators.required, Validators.minLength(10)]],
//     acceptedPolicy: [false, [Validators.requiredTrue]],
//   });

//   constructor(private fb: FormBuilder, private reqSvc: SessionRequestsService) {}

//   get isEgyptian(): boolean {
//     const n = (this.form.value.nationality || '').trim();
//     return n === this.EGYPT;
//   }

//   get priceText(): string {
//     return this.isEgyptian ? '800 جنيه' : '25 دولار';
//   }

//   private buildPrice() {
//     return this.isEgyptian
//       ? { currency: 'EGP' as const, price: 800 }
//       : { currency: 'USD' as const, price: 25 };
//   }

//   async submit() {
//     this.error = undefined;
//     this.sent = false;

//     if (this.form.invalid) {
//       this.form.markAllAsTouched();
//       return;
//     }

//     this.sending = true;
//     try {
//       const p = this.buildPrice();

//       await this.reqSvc.createRequest({
//         name: this.form.value.name!.trim(),
//         age: Number(this.form.value.age),
//         job: this.form.value.job!.trim(),
//         maritalStatus: this.form.value.maritalStatus!,
//         whatsapp: this.form.value.whatsapp!.trim(),
//         nationality: this.form.value.nationality!.trim(),
//         problem: this.form.value.problem!.trim(),
//         acceptedPolicy: !!this.form.value.acceptedPolicy,
//         currency: p.currency,
//         price: p.price,
//       });

//       this.sent = true;
//       this.form.reset({ acceptedPolicy: false } as any);
//     } catch (e: any) {
//       this.error = e?.message ?? 'حدث خطأ أثناء إرسال الطلب';
//     } finally {
//       this.sending = false;
//     }
//   }

  
// }


// // src/app/public/consultation-booking/consultation-booking.component.ts
// import { Component } from '@angular/core';
// import { FormBuilder, Validators } from '@angular/forms';
// import { SessionRequestsService } from 'src/app/core/services/session-requests.service';

// @Component({
//   selector: 'app-consultation-booking',
//   templateUrl: './consultation-booking.component.html',
//   styleUrls: ['./consultation-booking.component.css'],
// })
// export class ConsultationBookingComponent {
//   sending = false;
//   sent = false;
//   error?: string;

//   // ✅ constants
//   readonly EGYPT = 'مصر';

//   form = this.fb.group({
//     name: ['', [Validators.required, Validators.minLength(3)]],
//     age: [null as any, [Validators.required, Validators.min(10), Validators.max(120)]],
//     job: ['', [Validators.required, Validators.minLength(2)]],
//     maritalStatus: ['', [Validators.required]],
//     whatsapp: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{8,15}$/)]],
//     nationality: ['', [Validators.required]],
//     problem: ['', [Validators.required, Validators.minLength(10)]],
//     acceptedPolicy: [false, [Validators.requiredTrue]],
//   });

//   constructor(private fb: FormBuilder, private reqSvc: SessionRequestsService) {}

//   get isEgyptian(): boolean {
//     const n = (this.form.value.nationality || '').trim();
//     return n === this.EGYPT;
//   }

//   get priceText(): string {
//     return this.isEgyptian ? '800 جنيه' : '25 دولار';
//   }

//   private buildPrice() {
//     return this.isEgyptian
//       ? { currency: 'EGP' as const, price: 800 }
//       : { currency: 'USD' as const, price: 25 };
//   }

//   // ✅ Helper: console detailed error
//   private logFirebaseError(err: any) {
//     console.error('❌ Firebase Error FULL:', err);
//     console.error('❌ code:', err?.code);
//     console.error('❌ message:', err?.message);
//     console.error('❌ stack:', err?.stack);
//   }

//   async submit() {
//     this.error = undefined;
//     this.sent = false;

//     if (this.form.invalid) {
//       this.form.markAllAsTouched();
//       return;
//     }

//     this.sending = true;

//     const p = this.buildPrice();

//     // ✅ payload normal
//     const payload: any = {
//       name: this.form.value.name!.trim(),
//       age: Number(this.form.value.age),
//       job: this.form.value.job!.trim(),
//       maritalStatus: this.form.value.maritalStatus!,
//       whatsapp: this.form.value.whatsapp!.trim(),
//       nationality: this.form.value.nationality!.trim(),
//       problem: this.form.value.problem!.trim(),
//       acceptedPolicy: !!this.form.value.acceptedPolicy,
//       // ✅ for debugging rules mismatch:
//       acknowledged: !!this.form.value.acceptedPolicy,
//       currency: p.currency,
//       price: p.price,
//     };

//     console.group('📨 SUBMIT Booking Request');
//     console.log('payload:', payload);
//     console.groupEnd();

//     try {
//       const id = await this.reqSvc.createRequest(payload);
//       console.log('✅ Request created id:', id);

//       this.sent = true;
//       this.form.reset({ acceptedPolicy: false } as any);
//     } catch (e: any) {
//       this.logFirebaseError(e);
//       this.error = e?.message ?? 'حدث خطأ أثناء إرسال الطلب';
//     } finally {
//       this.sending = false;
//     }
//   }

//   // ✅ TEST (no need to fill the form)
//   async sendTest() {
//     this.error = undefined;
//     this.sent = false;
//     this.sending = true;

//     const p = { currency: 'EGP' as const, price: 800 };

//     // ✅ test payload (send both acceptedPolicy + acknowledged)
//     const testPayload: any = {
//       name: 'TEST Ahmed',
//       age: 30,
//       job: 'Developer',
//       maritalStatus: 'أعزب/عزباء',
//       whatsapp: '+201000000000',
//       nationality: 'مصر',
//       problem: 'TEST: debugging permission denied. This is a sample request from Angular.',
//       acceptedPolicy: true,
//       acknowledged: true, // ✅ important for rules if expecting acknowledged
//       currency: p.currency,
//       price: p.price,
//     };

//     console.group('🧪 SEND TEST Request');
//     console.log('testPayload:', testPayload);
//     console.groupEnd();

//     try {
//       const id = await this.reqSvc.createRequest(testPayload);
//       console.log('✅ TEST created id:', id);
//       this.sent = true;
//       alert('✅ TEST OK: ' + id);
//     } catch (e: any) {
//       this.logFirebaseError(e);
//       this.error = e?.message ?? 'Permission denied / error';
//       alert('❌ TEST FAILED: ' + (e?.code || '') + ' ' + (e?.message || ''));
//     } finally {
//       this.sending = false;
//     }
//   }
// }



// src/app/public/consultation-booking/consultation-booking.component.ts
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { SessionRequestsService } from 'src/app/core/services/session-requests.service';

@Component({
  selector: 'app-consultation-booking',
  templateUrl: './consultation-booking.component.html',
  styleUrls: ['./consultation-booking.component.css'],
})
export class ConsultationBookingComponent {
  sending = false;
  sent = false;
  error?: string;

  // ✅ constants
  readonly EGYPT = 'مصر';

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    age: [null as any, [Validators.required, Validators.min(10), Validators.max(120)]],
    job: ['', [Validators.required, Validators.minLength(2)]],
    maritalStatus: ['', [Validators.required]],
    whatsapp: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{8,15}$/)]],
    nationality: ['', [Validators.required]],
    problem: ['', [Validators.required, Validators.minLength(10)]],
    acceptedPolicy: [false, [Validators.requiredTrue]],
  });

  constructor(private fb: FormBuilder, private reqSvc: SessionRequestsService) {}

  get isEgyptian(): boolean {
    const n = (this.form.value.nationality || '').trim();
    return n === this.EGYPT;
  }

  get priceText(): string {
    return this.isEgyptian ? '800 جنيه' : '25 دولار';
  }

  private buildPrice() {
    return this.isEgyptian
      ? { currency: 'EGP' as const, price: 800 }
      : { currency: 'USD' as const, price: 25 };
  }

  // ✅ Helper: console detailed error
  private logFirebaseError(err: any) {
    console.error('❌ Firebase Error FULL:', err);
    console.error('❌ code:', err?.code);
    console.error('❌ message:', err?.message);
    console.error('❌ stack:', err?.stack);
  }

  async submit() {
    this.error = undefined;
    this.sent = false;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.sending = true;

    const p = this.buildPrice();

    // ✅ payload
    const payload: any = {
      name: this.form.value.name!.trim(),
      age: Number(this.form.value.age),
      job: this.form.value.job!.trim(),
      maritalStatus: this.form.value.maritalStatus!,
      whatsapp: this.form.value.whatsapp!.trim(),
      nationality: this.form.value.nationality!.trim(),
      problem: this.form.value.problem!.trim(),

      acceptedPolicy: !!this.form.value.acceptedPolicy,

      // ✅ keep this ONLY if your RTDB rules require "acknowledged"
      acknowledged: !!this.form.value.acceptedPolicy,

      currency: p.currency,
      price: p.price,
    };

    console.group('📨 SUBMIT Booking Request');
    console.log('payload:', payload);
    console.groupEnd();

    try {
      const id = await this.reqSvc.createRequest(payload);
      console.log('✅ Request created id:', id);

      this.sent = true;
      this.form.reset({ acceptedPolicy: false } as any);
    } catch (e: any) {
      this.logFirebaseError(e);
      this.error = e?.message ?? 'حدث خطأ أثناء إرسال الطلب';
    } finally {
      this.sending = false;
    }
  }
}
