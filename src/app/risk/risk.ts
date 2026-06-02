import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-risk',
  standalone: true,
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">ความเสี่ยง & เลขอั้น</h1>
        <div class="flex space-x-2">
          <select class="px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm">
            <option>หวยรัฐบาลไทย</option>
            <option>หวยฮานอย</option>
            <option>หวยลาว</option>
          </select>
          <select class="px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm">
            <option>งวด 16 มี.ค. 67</option>
            <option>งวด 1 มี.ค. 67</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Blocked Numbers -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-200 bg-red-50/50 flex items-center justify-between">
            <div class="flex items-center text-red-800 font-semibold">
              <mat-icon class="mr-2 text-red-500">block</mat-icon>
              เลขอั้น (ไม่รับแทง)
            </div>
            <button class="text-sm font-medium text-red-600 hover:text-red-700">เพิ่มเลข</button>
          </div>
          <div class="p-6">
            <div class="flex flex-wrap gap-3">
              @for (num of blockedNumbers(); track num) {
                <div class="flex items-center bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
                  <span class="font-mono font-bold text-red-700 mr-2">{{ num }}</span>
                  <button class="text-red-400 hover:text-red-600">
                    <mat-icon class="!w-4 !h-4 text-[16px]">close</mat-icon>
                  </button>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Reduced Payout Numbers -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-200 bg-amber-50/50 flex items-center justify-between">
            <div class="flex items-center text-amber-800 font-semibold">
              <mat-icon class="mr-2 text-amber-500">trending_down</mat-icon>
              เลขอั้นจ่ายลด (จ่ายครึ่ง/กำหนดเอง)
            </div>
            <button class="text-sm font-medium text-amber-600 hover:text-amber-700">เพิ่มเลข</button>
          </div>
          <div class="p-0">
            <table class="w-full text-left text-sm">
              <thead class="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  <th class="px-6 py-3 font-medium">ตัวเลข</th>
                  <th class="px-6 py-3 font-medium">ประเภท</th>
                  <th class="px-6 py-3 font-medium text-right">จ่าย</th>
                  <th class="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @for (item of reducedNumbers(); track item.number) {
                  <tr class="hover:bg-slate-50 transition-colors">
                    <td class="px-6 py-3 font-mono font-bold text-slate-900">{{ item.number }}</td>
                    <td class="px-6 py-3 text-slate-600">{{ item.type }}</td>
                    <td class="px-6 py-3 text-right text-amber-600 font-medium">{{ item.payRate }}</td>
                    <td class="px-6 py-3 text-right">
                      <button class="text-slate-400 hover:text-red-500">
                        <mat-icon class="!w-4 !h-4 text-[16px]">delete</mat-icon>
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RiskComponent {
  blockedNumbers = signal(['111', '222', '333', '444', '555', '666', '777', '888', '999', '000', '12', '21']);
  
  reducedNumbers = signal([
    { number: '987', type: '3 ตัวบน', payRate: 450 },
    { number: '789', type: '3 ตัวบน', payRate: 450 },
    { number: '89', type: '2 ตัวล่าง', payRate: 45 },
    { number: '98', type: '2 ตัวล่าง', payRate: 45 },
  ]);
}
