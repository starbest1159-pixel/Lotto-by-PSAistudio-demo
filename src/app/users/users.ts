import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">การจัดการผู้ใช้งาน</h1>
        <button class="flex items-center justify-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-colors shadow-sm">
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
              class="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
              placeholder="ค้นหาชื่อผู้ใช้, เบอร์โทร..."
            >
          </div>
          <div class="flex space-x-2 w-full sm:w-auto">
            <select class="block w-full sm:w-auto pl-3 pr-10 py-2 border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm appearance-none">
              <option value="">ทุกระดับสิทธิ์</option>
              <option value="admin">Admin</option>
              <option value="master">Master</option>
              <option value="agent">Agent</option>
              <option value="member">Member</option>
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
              @for (user of users(); track user.id) {
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
                      <button class="p-1.5 text-slate-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50" title="เติม/ถอนเครดิต">
                        <mat-icon class="!w-5 !h-5 text-[20px]">account_balance_wallet</mat-icon>
                      </button>
                      <button class="p-1.5 text-slate-400 hover:text-slate-900 transition-colors rounded-lg hover:bg-slate-100" title="แก้ไขข้อมูล">
                        <mat-icon class="!w-5 !h-5 text-[20px]">edit</mat-icon>
                      </button>
                      <button class="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50" title="ระงับผู้ใช้">
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
            แสดง 1 ถึง 5 จาก 124 รายการ
          </div>
          <div class="flex space-x-1">
            <button class="px-3 py-1 border border-slate-300 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 disabled:opacity-50">ก่อนหน้า</button>
            <button class="px-3 py-1 border border-slate-300 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100">ถัดไป</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UsersComponent {
  users = signal([
    { id: 1, username: 'admin_super', name: 'Super Admin', role: 'Admin', credit: 9999999.00, discount: 0, active: true },
    { id: 2, username: 'master_bkk', name: 'Master Bangkok', role: 'Master', credit: 500000.00, discount: 10, active: true },
    { id: 3, username: 'agent_007', name: 'Agent Seven', role: 'Agent', credit: 150000.00, discount: 8, active: true },
    { id: 4, username: 'member_vip', name: 'VIP Player', role: 'Member', credit: 25000.00, discount: 5, active: true },
    { id: 5, username: 'member_002', name: 'Normal Player', role: 'Member', credit: 1500.00, discount: 5, active: false },
  ]);

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
