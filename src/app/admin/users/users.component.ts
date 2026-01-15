import { Component, OnInit } from '@angular/core';
import { UsersAdminService, AdminUserRow } from '../services/users-admin.service';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  loading = true;
  error?: string;

  users: AdminUserRow[] = [];
  filtered: AdminUserRow[] = [];

  searchForm = this.fb.group({
    q: ['']
  });

  constructor(private adminUsers: UsersAdminService, private fb: FormBuilder) {}

  async ngOnInit() {
    await this.refresh();
    this.searchForm.valueChanges.subscribe(v => this.applyFilter(v.q || ''));
  }

  async refresh() {
    this.loading = true; this.error = undefined;
    try {
      this.users = await this.adminUsers.listUsers();
      this.applyFilter(this.searchForm.value.q || '');
    } catch (e: any) {
      this.error = e?.message ?? 'حدث خطأ أثناء تحميل المستخدمين';
    } finally {
      this.loading = false;
    }
  }

  applyFilter(q: string) {
    const k = q.trim().toLowerCase();
    this.filtered = !k
      ? [...this.users]
      : this.users.filter(u =>
          (u.email || '').toLowerCase().includes(k) ||
          (u.displayName || '').toLowerCase().includes(k) ||
          (u.uid || '').toLowerCase().includes(k)
        );
  }

  async toggleAdmin(u: AdminUserRow) {
    const val = !u.isAdmin;
    this.loading = true;
    try {
      await this.adminUsers.setAdmin(u.uid, val);
      u.isAdmin = val;
    } catch (e: any) {
      this.error = e?.message ?? 'تعذّر تحديث صلاحية الأدمن';
    } finally {
      this.loading = false;
    }
  }

  async toggleDisabled(u: AdminUserRow) {
    const val = !u.isDisabled;
    this.loading = true;
    try {
      await this.adminUsers.setDisabled(u.uid, val);
      u.isDisabled = val;
    } catch (e: any) {
      this.error = e?.message ?? 'تعذّر تحديث حالة الحساب';
    } finally {
      this.loading = false;
    }
  }

  async deleteUserData(u: AdminUserRow) {
    if (!confirm(`حذف سجل البيانات للمستخدم: ${u.email || u.uid} ؟ (لن يحذف حسابه من Auth)`)) return;
    this.loading = true;
    try {
      await this.adminUsers.deleteUserData(u.uid);
      await this.refresh();
    } catch (e: any) {
      this.error = e?.message ?? 'تعذّر حذف بيانات المستخدم';
    } finally {
      this.loading = false;
    }
  }
}
