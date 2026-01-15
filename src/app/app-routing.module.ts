import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CoursesListComponent } from './public/courses-list/courses-list.component';
import { CourseDetailsComponent } from './public/course-details/course-details.component';
import { LessonViewComponent } from './learning/lesson-view/lesson-view.component';

import { ProfileComponent } from './account/profile/profile.component';
import { SettingsComponent } from './account/settings/settings.component';

import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';

import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';
import { StaffGuard } from './core/guards/staff.guard';

import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { CourseEditorComponent } from './admin/course-editor/course-editor.component';
import { UsersComponent } from './admin/users/users.component';
import { SalesAnalyticsComponent } from './admin/sales-analytics/sales-analytics.component';

import { StaffCasesComponent } from './staff/cases/cases.component';
import { AdminCasesComponent } from './admin/cases/cases-admin.component';

import { AccessManagerComponent } from './admin/access/access-manager/access-manager.component';
import { EnrollmentGuard } from './core/guards/enrollment.guard';

import { HomeComponent } from './public/home/home.component';
import { AboutComponent } from './public/about/about.component';
import { ConsultationsComponent } from './public/consultations/consultations.component';
import { ContactComponent } from './public/contact/contact.component';
import { MyCoursesComponent } from './learning/my-courses/my-courses.component';

// ✅ NEW: Booking form + Admin requests page
import { ConsultationBookingComponent } from './public/consultation-booking/consultation-booking.component';
import { SessionRequestsComponent } from './admin/session-requests/session-requests.component';
import { DiplomasListComponent } from './public/diplomas-list/diplomas-list.component';
import { DiplomaDetailsComponent } from './public/diploma-details/diploma-details.component';
import { DiplomaEditorComponent } from './admin/diploma-editor/diploma-editor.component';

const routes: Routes = [
  // 🏠 الصفحة الرئيسية الجديدة
  {
    path: '',
    component: HomeComponent,
    data: { title: $localize`:@@title_home:الرئيسية` },
  },

  {
    path: 'about',
    component: AboutComponent,
    data: { title: $localize`:@@title_about:عن الدكتورة` },
  },

  // 🏷️ الكورسات
  {
    path: 'courses',
    component: CoursesListComponent,
    data: { title: $localize`:@@title_courses:الكورسات` },
  },
  {
    path: 'courses/:id',
    component: CourseDetailsComponent,
    data: { title: $localize`:@@title_course_details:تفاصيل الكورس` },
  },

  {
    path: 'consultations',
    component: ConsultationsComponent,
    data: { title: $localize`:@@title_consultations:الاستشارات` },
  },
  {
    path: 'contact',
    component: ContactComponent,
    data: { title: $localize`:@@title_contact:تواصل` },
  },

  // ✅ صفحة حجز جلسة (Public)
  {
    path: 'book-session',
    component: ConsultationBookingComponent,
    data: { title: $localize`:@@title_book_session:حجز جلسة` },
  },

  // 🎓 الدروس محمية
  {
    path: 'lesson/:courseId/:lessonId',
    component: LessonViewComponent,
    canActivate: [EnrollmentGuard],
    data: { title: $localize`:@@title_lesson_view:الدرس` },
  },
  {
    path: 'my-courses',
    component: MyCoursesComponent,
    canActivate: [AuthGuard],
    data: { title: $localize`:@@title_my_courses:كورساتي` },
  },

  // 👤 المستخدم
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard],
    data: { title: $localize`:@@title_profile:الملف الشخصي` },
  },
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [AuthGuard],
    data: { title: $localize`:@@title_settings:الإعدادات` },
  },

  {
    path: 'diplomas',
    component: DiplomasListComponent,
    data: { title: $localize`:@@title_diplomas:الدبلومات` },
  },
  {
    path: 'diplomas/:id',
    component: DiplomaDetailsComponent,
    data: { title: $localize`:@@title_diploma_details:تفاصيل الدبلومة` },
  },

  // 👷 موظف
  {
    path: 'staff/cases',
    component: StaffCasesComponent,
    canActivate: [StaffGuard],
    data: { title: $localize`:@@title_staff_cases:الحالات` },
  },

  // 🛠️ لوحة الإدارة
  {
    path: 'admin',
    canActivate: [AdminGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: { title: $localize`:@@title_admin_dashboard:لوحة التحكم` },
      },
      {
        path: 'course-editor',
        component: CourseEditorComponent,
        data: { title: $localize`:@@title_admin_course_editor:إدارة الكورسات` },
      },
      {
        path: 'course-editor/:id',
        component: CourseEditorComponent,
        data: { title: $localize`:@@title_admin_course_editor_edit:تعديل الكورس` },
      },
      {
        path: 'users',
        component: UsersComponent,
        data: { title: $localize`:@@title_admin_users:المستخدمين` },
      },
      {
        path: 'cases',
        component: AdminCasesComponent,
        data: { title: $localize`:@@title_admin_cases:الحالات` },
      },
      {
        path: 'access',
        component: AccessManagerComponent,
        data: { title: $localize`:@@title_admin_access:الصلاحيات` },
      },
      {
        path: 'sales-analytics',
        component: SalesAnalyticsComponent,
        data: { title: $localize`:@@title_admin_sales_analytics:تحليلات المبيعات` },
      },
      {
        path: 'diploma-editor',
        component: DiplomaEditorComponent,
        data: { title: $localize`:@@title_admin_diploma_editor:إدارة الدبلومات` },
      },
      {
        path: 'diploma-editor/:id',
        component: DiplomaEditorComponent,
        data: { title: $localize`:@@title_admin_diploma_editor_edit:تعديل الدبلومة` },
      },

      // ✅ NEW: Admin session requests (Realtime)
      {
        path: 'session-requests',
        component: SessionRequestsComponent,
        data: { title: $localize`:@@title_admin_session_requests:طلبات الجلسات` },
      },

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  // 🔐 Authentication
  {
    path: 'login',
    component: LoginComponent,
    data: { title: $localize`:@@title_login:دخول` },
  },
  {
    path: 'register',
    component: RegisterComponent,
    data: { title: $localize`:@@title_register:حساب جديد` },
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
    data: { title: $localize`:@@title_forgot_password:نسيت كلمة المرور` },
  },

  // 404
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      anchorScrolling: 'enabled',
      scrollPositionRestoration: 'enabled',
      scrollOffset: [0, 80],
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
