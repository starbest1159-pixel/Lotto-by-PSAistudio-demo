import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-links',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">ลิงก์รับแทง</h1>
        <button class="flex items-center justify-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-colors shadow-sm">
          <mat-icon class="!w-5 !h-5 text-[20px] mr-2">add_link</mat-icon>
          สร้างลิงก์ใหม่
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Create Link Form -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-fit">
          <h2 class="text-lg font-semibold text-slate-900 mb-4">สร้างลิงก์เฉพาะบุคคล</h2>
          <form class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">ชื่ออ้างอิง</label>
              <input type="text" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent" placeholder="เช่น ลูกค้า VIP">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">อายุการใช้งาน</label>
              <select class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                <option>1 วัน</option>
                <option>7 วัน</option>
                <option>30 วัน</option>
                <option>ไม่มีวันหมดอายุ</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">ประเภทการใช้งาน</label>
              <select class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                <option>ใช้งานได้หลายครั้ง</option>
                <option>ใช้งานได้ครั้งเดียว</option>
              </select>
            </div>
            <button type="button" class="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-colors mt-2">
              สร้างลิงก์
            </button>
          </form>
        </div>

        <!-- Links Table -->
        <div class="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm whitespace-nowrap">
              <thead class="uppercase tracking-wider border-b border-slate-200 bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th scope="col" class="px-6 py-4">ชื่ออ้างอิง / ลิงก์</th>
                  <th scope="col" class="px-6 py-4 text-center">สถานะ</th>
                  <th scope="col" class="px-6 py-4 text-right">ยอดแทงสะสม</th>
                  <th scope="col" class="px-6 py-4 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                @for (link of links(); track link.id) {
                  <tr class="hover:bg-slate-50/50 transition-colors">
                    <td class="px-6 py-4">
                      <div class="font-medium text-slate-900 mb-1">{{ link.name }}</div>
                      <div class="flex items-center text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-lg w-fit">
                        <span class="truncate max-w-[150px] sm:max-w-[200px]">{{ link.url }}</span>
                        <button class="ml-2 text-emerald-600 hover:text-emerald-700" title="คัดลอก">
                          <mat-icon class="!w-4 !h-4 text-[16px]">content_copy</mat-icon>
                        </button>
                      </div>
                      <div class="text-xs text-slate-400 mt-1">หมดอายุ: {{ link.expires }}</div>
                    </td>
                    <td class="px-6 py-4 text-center">
                      @if (link.active) {
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          ใช้งานได้
                        </span>
                      } @else {
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          หมดอายุ
                        </span>
                      }
                    </td>
                    <td class="px-6 py-4 text-right font-mono font-medium text-slate-900">
                      ฿{{ link.totalBet | number }}
                    </td>
                    <td class="px-6 py-4 text-right">
                      <button class="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50" title="ลบลิงก์">
                        <mat-icon class="!w-5 !h-5 text-[20px]">delete</mat-icon>
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
export class LinksComponent {
  links = signal([
    { id: 1, name: 'ลูกค้า VIP กลุ่ม A', url: 'https://lotto.app/bet/ref_a9b8c7', expires: 'ไม่มีวันหมดอายุ', active: true, totalBet: 150000 },
    { id: 2, name: 'โปรโมชั่น Facebook', url: 'https://lotto.app/bet/ref_fb2024', expires: '30 เม.ย. 67', active: true, totalBet: 45000 },
    { id: 3, name: 'ลูกค้าใหม่ทดลอง', url: 'https://lotto.app/bet/ref_test01', expires: '15 มี.ค. 67', active: false, totalBet: 500 },
  ]);
}
