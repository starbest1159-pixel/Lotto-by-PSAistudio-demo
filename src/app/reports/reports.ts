import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">รายงาน</h1>
        <div class="flex space-x-2">
          <input type="date" class="px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm">
          <span class="flex items-center text-slate-500">-</span>
          <input type="date" class="px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm">
          <button class="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors">
            ค้นหา
          </button>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div class="text-sm font-medium text-slate-500 mb-2">ยอดแทงรวม (ตามช่วงเวลา)</div>
          <div class="text-3xl font-bold text-slate-900">฿3,450,000</div>
          <div class="text-sm text-emerald-600 mt-2 flex items-center">
            <mat-icon class="!w-4 !h-4 text-[16px] mr-1">trending_up</mat-icon>
            +15.2% จากเดือนที่แล้ว
          </div>
        </div>
        <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div class="text-sm font-medium text-slate-500 mb-2">ยอดจ่ายรวม</div>
          <div class="text-3xl font-bold text-slate-900">฿1,240,500</div>
          <div class="text-sm text-red-600 mt-2 flex items-center">
            <mat-icon class="!w-4 !h-4 text-[16px] mr-1">trending_down</mat-icon>
            -5.4% จากเดือนที่แล้ว
          </div>
        </div>
        <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <div class="text-sm font-medium text-emerald-100 mb-2">กำไร/ขาดทุน สุทธิ</div>
          <div class="text-3xl font-bold">฿2,209,500</div>
          <div class="text-sm text-emerald-100 mt-2 flex items-center">
            <mat-icon class="!w-4 !h-4 text-[16px] mr-1">check_circle</mat-icon>
            ผลประกอบการเป็นบวก
          </div>
        </div>
      </div>

      <!-- Detailed Table -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <h2 class="text-lg font-semibold text-slate-900">ประวัติโพยแบบละเอียด</h2>
          <div class="flex space-x-2 w-full sm:w-auto">
            <select class="block w-full sm:w-auto pl-3 pr-8 py-2 border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm">
              <option value="">ทุกสถานะ</option>
              <option value="won">ถูกรางวัล</option>
              <option value="lost">ไม่ถูกรางวัล</option>
              <option value="pending">รอผล</option>
              <option value="cancelled">ยกเลิก</option>
            </select>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm whitespace-nowrap">
            <thead class="uppercase tracking-wider border-b border-slate-200 bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th scope="col" class="px-6 py-4">รหัสโพย / เวลา</th>
                <th scope="col" class="px-6 py-4">ผู้ใช้งาน</th>
                <th scope="col" class="px-6 py-4">รายการแทง</th>
                <th scope="col" class="px-6 py-4 text-right">ยอดแทง</th>
                <th scope="col" class="px-6 py-4 text-right">ยอดจ่าย</th>
                <th scope="col" class="px-6 py-4 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              @for (slip of slips(); track slip.id) {
                <tr class="hover:bg-slate-50/50 transition-colors">
                  <td class="px-6 py-4">
                    <div class="font-mono font-medium text-slate-900">#{{ slip.id }}</div>
                    <div class="text-xs text-slate-500">{{ slip.time }}</div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="font-medium text-slate-900">{{ slip.user }}</div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="font-medium text-slate-900">{{ slip.lotto }}</div>
                    <div class="text-xs text-slate-500">{{ slip.details }}</div>
                  </td>
                  <td class="px-6 py-4 text-right font-mono font-medium text-slate-900">
                    ฿{{ slip.amount | number }}
                  </td>
                  <td class="px-6 py-4 text-right font-mono font-medium" [class]="slip.payout > 0 ? 'text-emerald-600' : 'text-slate-400'">
                    {{ slip.payout > 0 ? '฿' + (slip.payout | number) : '-' }}
                  </td>
                  <td class="px-6 py-4 text-center">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" [class]="getStatusClass(slip.status)">
                      {{ getStatusText(slip.status) }}
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        
        <div class="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div class="text-sm text-slate-500">
            แสดง 1 ถึง 5 จาก 1,240 รายการ
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
export class ReportsComponent {
  slips = signal([
    { id: '10293', time: '16 มี.ค. 67 14:30', user: 'user_001', lotto: 'หวยรัฐบาลไทย', details: '3 ตัวบน [603]', amount: 1500, payout: 1350000, status: 'won' },
    { id: '10292', time: '16 มี.ค. 67 14:25', user: 'member_99', lotto: 'หวยรัฐบาลไทย', details: '2 ตัวล่าง [79]', amount: 500, payout: 45000, status: 'won' },
    { id: '10291', time: '16 มี.ค. 67 14:20', user: 'lucky_boy', lotto: 'หวยรัฐบาลไทย', details: '3 ตัวโต๊ด [306]', amount: 2000, payout: 0, status: 'lost' },
    { id: '10290', time: '16 มี.ค. 67 14:15', user: 'agent_vip', lotto: 'หวยฮานอย', details: 'วิ่งบน [6]', amount: 10000, payout: 0, status: 'pending' },
    { id: '10289', time: '16 มี.ค. 67 14:10', user: 'user_002', lotto: 'หวยลาว', details: '2 ตัวบน [03]', amount: 1000, payout: 0, status: 'cancelled' },
  ]);

  getStatusClass(status: string): string {
    switch (status) {
      case 'won': return 'bg-emerald-100 text-emerald-800';
      case 'lost': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'cancelled': return 'bg-slate-100 text-slate-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'won': return 'ถูกรางวัล';
      case 'lost': return 'ไม่ถูกรางวัล';
      case 'pending': return 'รอผล';
      case 'cancelled': return 'ยกเลิก';
      default: return status;
    }
  }
}
