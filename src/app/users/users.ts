/* eslint-disable */
import { ChangeDetectionStrategy, Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../core/services/api.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">การจัดการผู้ใช้งาน</h1>
        <button 
          (click)="openAddModal()"
          class="flex items-center justify-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-colors shadow-sm cursor-pointer"
        >
          <mat-icon class="!w-5 !h-5 text-[20px] mr-2">person_add</mat-icon>
          เพิ่มผู้ใช้งานใหม่
        </button>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div class="relative w-full sm:w-96">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <mat-icon class="text-slate-400 !w-5 !h-5 text-[20px]">search</mat-icon>
            </div>
            <input 
              type="text" 
              [(ngModel)]="searchQuery"
              (input)="filterUsers()"
              class="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
              placeholder="ค้นหาชื่อผู้ใช้..."
            >
          </div>
          <div class="flex space-x-2 w-full sm:w-auto">
            <select 
              [(ngModel)]="roleFilter"
              (change)="filterUsers()"
              class="block w-full sm:w-auto pl-3 pr-10 py-2 border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
            >
              <option value="">ทุกระดับสิทธิ์</option>
              <option value="Admin">Admin</option>
              <option value="Master">Master</option>
              <option value="Agent">Agent</option>
              <option value="Member">Member</option>
            </select>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm whitespace-nowrap">
            <thead class="uppercase tracking-wider border-b border-slate-200 bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th scope="col" class="px-6 py-4">ผู้ใช้งาน</th>
                <th scope="col" class="px-6 py-4">ระดับสิทธิ์</th>
                <th scope="col" class="px-6 py-4 text-right">เครดิตคงเหลือ</th>
                <th scope="col" class="px-6 py-4 text-center">ส่วนลด (%)</th>
                <th scope="col" class="px-6 py-4 text-center">สถานะ</th>
                <th scope="col" class="px-6 py-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              @for (user of filteredUsers(); track user.id) {
                <tr class="hover:bg-slate-50/50 transition-colors">
                  <td class="px-6 py-4">
                    <div class="flex items-center">
                      <div class="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold mr-3">
                        {{ user.username.charAt(0).toUpperCase() }}
                      </div>
                      <div>
                        <div class="font-medium text-slate-900">{{ user.username }}</div>
                        <div class="text-xs text-slate-500">{{ user.name }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" [class]="getRoleClass(user.role)">
                      {{ user.role }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right font-mono font-medium text-slate-900">
                    ฿{{ user.credit | number:'1.2-2' }}
                  </td>
                  <td class="px-6 py-4 text-center text-emerald-600 font-medium">
                    {{ user.discount }}%
                  </td>
                  <td class="px-6 py-4 text-center">
                    @if (user.active) {
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        ใช้งานปกติ
                      </span>
                    } @else {
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        ระงับการใช้งาน
                      </span>
                    }
                  </td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end space-x-2">
                      <button 
                        (click)="openCreditModal(user)"
                        class="p-1.5 text-slate-400 hover:text-emerald-600 transition-colors rounded-lg hover:bg-emerald-50 cursor-pointer" 
                        title="ปรับเครดิต"
                      >
                        <mat-icon class="!w-5 !h-5 text-[20px]">account_balance_wallet</mat-icon>
                      </button>
                      <button 
                        (click)="toggleSuspendUser(user)"
                        class="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 cursor-pointer" 
                        title="เปิด/ระงับใช้งาน"
                      >
                        <mat-icon class="!w-5 !h-5 text-[20px]">block</mat-icon>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        
        <div class="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div class="text-sm text-slate-500">
            แสดง 1 ถึง {{ filteredUsers().length }} จาก {{ users().length }} รายการ
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Add User -->
    @if (isAddModalOpen()) {
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 class="text-lg font-bold text-slate-900">เพิ่มผู้ใช้งานใหม่</h3>
            <button (click)="isAddModalOpen.set(false)" class="text-slate-400 hover:text-slate-600">
              <mat-icon>close</mat-icon>
            </button>
          </div>
          <form (submit)="createUser($event)" class="p-6 space-y-4">
            <div>
              <div class="block text-sm font-medium text-slate-700 mb-1">ชื่อผู้ใช้งาน (Username) *</div>
              <input type="text" [(ngModel)]="newUserForm.username" name="username" required class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white text-slate-950 font-medium">
            </div>
            <div>
              <div class="block text-sm font-medium text-slate-700 mb-1">ชื่อ-นามสกุล *</div>
              <input type="text" [(ngModel)]="newUserForm.name" name="name" required class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white text-slate-950 font-medium">
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <div class="block text-sm font-medium text-slate-700 mb-1">ระดับสิทธิ์</div>
                <select [(ngModel)]="newUserForm.role" name="role" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white text-slate-950 font-medium">
                  <option value="Admin">Admin</option>
                  <option value="Master">Master</option>
                  <option value="Agent">Agent</option>
                  <option value="Member">Member</option>
                </select>
              </div>
              <div>
                <div class="block text-sm font-medium text-slate-700 mb-1">ส่วนลด (%)</div>
                <input type="number" [(ngModel)]="newUserForm.discount" name="discount" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white text-slate-950 font-medium" min="0" max="30">
              </div>
            </div>
            <div>
              <div class="block text-sm font-medium text-slate-700 mb-1">วงเงินเครดิตเริ่มต้น (฿)</div>
              <input type="number" [(ngModel)]="newUserForm.credit" name="credit" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white text-slate-950 font-medium" min="0">
            </div>
            <div class="pt-4 flex space-x-3 justify-end border-t border-slate-100">
              <button type="button" (click)="isAddModalOpen.set(false)" class="px-4 py-2 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">ยกเลิก</button>
              <button type="submit" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium shadow-sm transition-colors">บันทึก</button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Modal: Adjust Credit -->
    @if (isCreditModalOpen()) {
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 class="text-lg font-bold text-slate-900">เพิ่ม/ลด เครดิตผู้ใช้งาน</h3>
            <button (click)="isCreditModalOpen.set(false)" class="text-slate-400 hover:text-slate-600">
              <mat-icon>close</mat-icon>
            </button>
          </div>
          <div class="p-6 space-y-4">
            <div class="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div class="text-xs text-slate-500">ผู้ใช้งาน</div>
              <div class="font-bold text-slate-950 text-base mb-2">{{ selectedUser()?.username }} ({{ selectedUser()?.name }})</div>
              <div class="text-xs text-slate-500">เครดิตปัจจุบัน</div>
              <div class="font-mono text-xl font-black text-slate-900">฿{{ selectedUser()?.credit | number:'1.2-2' }}</div>
            </div>
            <div>
              <div class="block text-sm font-medium text-slate-700 mb-1">ระบุวงเงินเครดิตใหม่ (฿)</div>
              <input type="number" [(ngModel)]="newCreditValue" name="newCreditValue" class="w-full px-3 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg font-mono font-bold bg-white text-slate-950" placeholder="ระบุจำนวณเครดิต">
            </div>
            <div class="pt-4 flex space-x-3 justify-end border-t border-slate-100">
              <button (click)="isCreditModalOpen.set(false)" class="px-4 py-2 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">ยกเลิก</button>
              <button (click)="updateUserCredit()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium shadow-sm transition-colors">ตกลง</button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class UsersComponent implements OnInit {
  private api = inject(ApiService);
  
  users = signal<any[]>([]);
  filteredUsers = signal<any[]>([]);
  
  searchQuery = '';
  roleFilter = '';

  // Modals state
  isAddModalOpen = signal(false);
  isCreditModalOpen = signal(false);

  selectedUser = signal<any>(null);
  newCreditValue = 0;

  newUserForm = {
    username: '',
    name: '',
    role: 'Member',
    discount: 5,
    credit: 10000
  };

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.api.get<any[]>('users').subscribe({
      next: (data) => {
        this.users.set(data);
        this.filterUsers();
      },
      error: (err) => console.error('Error fetching users:', err)
    });
  }

  filterUsers() {
    const q = this.searchQuery.toLowerCase().trim();
    const role = this.roleFilter;
    
    let res = this.users();
    
    if (q) {
      res = res.filter(u => 
        u.username.toLowerCase().includes(q) || 
        u.name.toLowerCase().includes(q)
      );
    }
    
    if (role) {
      res = res.filter(u => u.role.toLowerCase() === role.toLowerCase());
    }
    
    this.filteredUsers.set(res);
  }

  toggleSuspendUser(user: any) {
    const targetStatus = !user.active;
    this.api.put<any>(`users/${user.id}`, { active: targetStatus }).subscribe({
      next: () => {
        this.loadUsers();
      },
      error: (err) => console.error('Error toggling suspend user:', err)
    });
  }

  openAddModal() {
    this.newUserForm = {
      username: '',
      name: '',
      role: 'Member',
      discount: 5,
      credit: 10000
    };
    this.isAddModalOpen.set(true);
  }

  createUser(event: Event) {
    event.preventDefault();
    if (!this.newUserForm.username || !this.newUserForm.name) return;

    this.api.post<any>('users', this.newUserForm).subscribe({
      next: () => {
        this.isAddModalOpen.set(false);
        this.loadUsers();
      },
      error: (err) => console.error('Error creating user:', err)
    });
  }

  openCreditModal(user: any) {
    this.selectedUser.set(user);
    this.newCreditValue = user.credit;
    this.isCreditModalOpen.set(true);
  }

  updateUserCredit() {
    const user = this.selectedUser();
    if (!user) return;

    this.api.put<any>(`users/${user.id}`, { credit: this.newCreditValue }).subscribe({
      next: () => {
        this.isCreditModalOpen.set(false);
        this.loadUsers();
      },
      error: (err) => console.error('Error adjusting user credit:', err)
    });
  }

  getRoleClass(role: string): string {
    switch (role.toLowerCase()) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'master': return 'bg-blue-100 text-blue-800';
      case 'agent': return 'bg-amber-100 text-amber-800';
      case 'member': return 'bg-slate-100 text-slate-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  }
}
