import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-lotteries',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">จัดการหวย & งวด</h1>
        <button class="flex items-center justify-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-colors shadow-sm">
          <mat-icon class="!w-5 !h-5 text-[20px] mr-2">add_circle</mat-icon>
          เปิดรับแทงงวดใหม่
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (lotto of lotteries(); track lotto.id) {
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div class="p-6 border-b border-slate-200 flex items-start justify-between">
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl shadow-sm">
                  {{ lotto.flag }}
                </div>
                <div>
                  <h3 class="text-lg font-bold text-slate-900">{{ lotto.name }}</h3>
                  <div class="flex items-center mt-1">
                    <span class="relative flex h-2.5 w-2.5 mr-2">
                      @if (lotto.status === 'open') {
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      } @else {
                        <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                      }
                    </span>
                    <span class="text-sm font-medium" [class]="lotto.status === 'open' ? 'text-emerald-600' : 'text-red-600'">
                      {{ lotto.status === 'open' ? 'เปิดรับแทง' : 'ปิดรับแทง' }}
                    </span>
                  </div>
                </div>
              </div>
              <button class="text-slate-400 hover:text-slate-600">
                <mat-icon>more_vert</mat-icon>
              </button>
            </div>
            
            <div class="p-6 flex-1 bg-slate-50/50">
              <div class="space-y-4">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-slate-500">งวดปัจจุบัน</span>
                  <span class="text-sm font-semibold text-slate-900">{{ lotto.period }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-slate-500">เวลาปิดรับ</span>
                  <span class="text-sm font-semibold text-red-600">{{ lotto.closeTime }}</span>
                </div>
                
                <div class="pt-4 border-t border-slate-200">
                  <div class="flex justify-between items-end mb-2">
                    <span class="text-sm font-medium text-slate-700">ยอดแทงสะสม</span>
                    <span class="text-lg font-bold text-slate-900">฿{{ lotto.totalBet | number }}</span>
                  </div>
                  <div class="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      class="h-full rounded-full transition-all duration-500"
                      [class]="lotto.progress > 80 ? 'bg-red-500' : lotto.progress > 50 ? 'bg-amber-500' : 'bg-emerald-500'"
                      [style.width]="lotto.progress + '%'"
                    ></div>
                  </div>
                  <div class="flex justify-between items-center mt-1">
                    <span class="text-xs text-slate-500">{{ lotto.progress }}% ของลิมิต</span>
                    <span class="text-xs text-slate-500">ลิมิต: ฿{{ lotto.limit | number }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="p-4 border-t border-slate-200 bg-white flex space-x-3">
              <button class="flex-1 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                ตั้งค่า
              </button>
              <button class="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-sm font-medium text-white transition-colors">
                ดูโพย
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class LotteriesComponent {
  lotteries = signal([
    { id: 1, name: 'หวยรัฐบาลไทย', flag: '🇹🇭', period: '16 มี.ค. 67', closeTime: '16 มี.ค. 67 15:20 น.', status: 'open', totalBet: 1250000, limit: 2000000, progress: 62.5 },
    { id: 2, name: 'หวยฮานอย (ปกติ)', flag: '🇻🇳', period: '14 มี.ค. 67', closeTime: 'วันนี้ 18:00 น.', status: 'open', totalBet: 45000, limit: 100000, progress: 45 },
    { id: 3, name: 'หวยลาวพัฒนา', flag: '🇱🇦', period: '15 มี.ค. 67', closeTime: 'พรุ่งนี้ 20:00 น.', status: 'open', totalBet: 85000, limit: 100000, progress: 85 },
    { id: 4, name: 'หวยมาเลย์', flag: '🇲🇾', period: '13 มี.ค. 67', closeTime: 'เมื่อวาน 18:00 น.', status: 'closed', totalBet: 50000, limit: 50000, progress: 100 },
  ]);
}
