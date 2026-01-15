
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// ====== Public Components ======
import { HomeComponent } from './public/home/home.component';
import { CoursesListComponent } from './public/courses-list/courses-list.component';
import { CourseDetailsComponent } from './public/course-details/course-details.component';
import { AboutComponent } from './public/about/about.component';
import { ContactComponent } from './public/contact/contact.component';
import { FaqComponent } from './public/faq/faq.component';

// ====== Auth / Account ======
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { ProfileComponent } from './account/profile/profile.component';
import { SettingsComponent } from './account/settings/settings.component';

// ====== Learning / Billing / Admin ======
import { LessonViewComponent } from './learning/lesson-view/lesson-view.component';
import { CourseReviewsComponent } from './learning/course-reviews/course-reviews.component';
import { CertificatesComponent } from './learning/certificates/certificates.component';
import { PurchaseCourseComponent } from './billing/purchase-course/purchase-course.component';
import { SubscriptionComponent } from './billing/subscription/subscription.component';
import { PaymentResultComponent } from './billing/payment-result/payment-result.component';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { CourseEditorComponent } from './admin/course-editor/course-editor.component';
import { UsersComponent } from './admin/users/users.component';
import { SalesAnalyticsComponent } from './admin/sales-analytics/sales-analytics.component';

// ====== Firebase (Modular API) ======
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';

import { provideDatabase, getDatabase } from '@angular/fire/database';
import { provideStorage, getStorage } from '@angular/fire/storage';
// (اختياري) Analytics لو محتاجه:
// import { provideAnalytics, getAnalytics, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';

import { environment } from '../environments/environment';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from './core/navbar/navbar.component';
import { AdminCasesComponent } from './admin/cases/cases-admin.component';
import { StaffCasesComponent } from './staff/cases/cases.component';
import { AccessManagerComponent } from './admin/access/access-manager/access-manager.component';
import { SearchCoursesPipe } from './shared/pipes/search-courses.pipe';
import { ConsultationsComponent } from './public/consultations/consultations.component';
import { MyCoursesComponent } from './learning/my-courses/my-courses.component';
import { FooterComponent } from './core/footer/footer.component';
import { ConsultationBookingComponent } from './public/consultation-booking/consultation-booking.component';
import { SessionRequestsComponent } from './admin/session-requests/session-requests.component';
import { DiplomasListComponent } from './public/diplomas-list/diplomas-list.component';
import { DiplomaDetailsComponent } from './public/diploma-details/diploma-details.component';
import { DiplomaEditorComponent } from './admin/diploma-editor/diploma-editor.component';

          


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    CoursesListComponent,
    CourseDetailsComponent,
    AboutComponent,
    ContactComponent,
    FaqComponent,
    LoginComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    ProfileComponent,
    SettingsComponent,
    LessonViewComponent,
    CourseReviewsComponent,
    CertificatesComponent,
    PurchaseCourseComponent,
    SubscriptionComponent,
    PaymentResultComponent,
    DashboardComponent,
    CourseEditorComponent,
    UsersComponent,
    SalesAnalyticsComponent,
    NavbarComponent,
    AdminCasesComponent,
    StaffCasesComponent,
    AccessManagerComponent,
     SearchCoursesPipe,
     ConsultationsComponent,
     MyCoursesComponent,
     FooterComponent,
     ConsultationBookingComponent,
     SessionRequestsComponent,
     DiplomasListComponent,
     DiplomaDetailsComponent,
     DiplomaEditorComponent, 
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    // ✅ ضع الـ Firebase هنا بدل providers
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    
    provideDatabase(() => getDatabase()),
    provideStorage(() => getStorage()),
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
