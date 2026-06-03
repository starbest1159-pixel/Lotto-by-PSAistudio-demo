/* eslint-disable */
import { ChangeDetectionStrategy, Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../core/services/api.service';

@Component({
  selector: 'app-lotteries',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">จัดการหวย & งวด</h1>
        <button 
          (click)="isAddModalOpen.set(true)"
          class="flex items-center justify-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-colors shadow-sm cursor-pointer"
        >
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
                    <button 
                      (click)="toggleStatus(lotto)"
                      class="relative flex items-center cursor-pointer group"
                      title="คลิกเพื่อสลับ สถานะ เปิด/ปิด"
                    >
                      <span class="relative flex h-2.5 w-2.5 mr-2">
                        @if (lotto.status === 'open') {
                          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        } @else {
                          <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                        }
                      </span>
                      <span class="text-sm font-medium transition-colors group-hover:text-slate-950" [class]="lotto.status === 'open' ? 'text-emerald-600' : 'text-red-600'">
                        {{ lotto.status === 'open' ? 'เปิดรับแทง' : 'ปิดรับแทง' }}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
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
              <button 
                (click)="toggleStatus(lotto)"
                class="flex-1 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                {{ lotto.status === 'open' ? 'ปิดรับแทง' : 'เปิดรับแทง' }}
              </button>
            </div>
          </div>
        }
      </div>
    </div>

    <!-- Modal: Add Lottery -->
    @if (isAddModalOpen()) {
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 class="text-lg font-bold text-slate-900">เปิดรับแทงงวดใหม่</h3>
            <button (click)="isAddModalOpen.set(false)" class="text-slate-400 hover:text-slate-600">
              <mat-icon>close</mat-icon>
            </button>
          </div>
          <form (submit)="createLottery($event)" class="p-6 space-y-4">
            <div>
              <div class="block text-sm font-medium text-slate-700 mb-1">ชื่อหวย *</div>
              <input type="text" [(ngModel)]="addForm.name" name="name" required class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white text-slate-950">
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <div class="block text-sm font-medium text-slate-700 mb-1">ธง/สัญลักษณ์</div>
                <input type="text" [(ngModel)]="addForm.flag" name="flag" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white text-slate-950" placeholder="เช่น 🇻🇳 หรือ 🎲">
              </div>
              <div>
                <div class="block text-sm font-medium text-slate-700 mb-1">งวดประจำวันที่</div>
                <input type="text" [(ngModel)]="addForm.period" name="period" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white text-slate-950" placeholder="เช่น 16 มี.ค. 67">
              </div>
            </div>
            <div>
              <div class="block text-sm font-medium text-slate-700 mb-1">เวลาปิดรับแทง</div>
              <input type="text" [(ngModel)]="addForm.closeTime" name="closeTime" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white text-slate-950" placeholder="เช่น วันนี้ 18:00 น.">
            </div>
            <div>
              <div class="block text-sm font-medium text-slate-700 mb-1">วงเงินลิมิตผู้แทงทั้งหมด (฿)</div>
              <input type="number" [(ngModel)]="addForm.limit" name="limit" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white text-slate-950" min="0">
            </div>
            <div class="pt-4 flex space-x-3 justify-end border-t border-slate-100">
              <button type="button" (click)="isAddModalOpen.set(false)" class="px-4 py-2 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">ยกเลิก</button>
              <button type="submit" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium shadow-sm transition-colors">บันทึก</button>
            </div>
          </form>
        </div>
      </div>
    }
  `
})
export class LotteriesComponent implements OnInit {
  private api = inject(ApiService);
  
  lotteries = signal<any[]>([]);
  isAddModalOpen = signal(false);

  addForm = {
    name: '',
    flag: '🎲',
    period: '20 มี.ค. 67',
    closeTime: 'วันนี้ 18:00 น.',
    limit: 500000
  };

  ngOnInit() {
    this.loadLotteries();
  }

  loadLotteries() {
    this.api.get<any[]>('lotteries').subscribe({
      next: (data) => this.lotteries.set(data),
      error: (err) => console.error('Error fetching lotteries:', err)
    });
  }

  toggleStatus(lotto: any) {
    const nextStatus = lotto.status === 'open' ? 'closed' : 'open';
    this.api.put<any>(`lotteries/${lotto.id}`, { status: nextStatus }).subscribe({
      next: () => {
        this.loadLotteries();
      },
      error: (err) => console.error('Error updating status:', err)
    });
  }

  createLottery(event: Event) {
    event.preventDefault();
    if (!this.addForm.name) return;

    this.api.post<any>('lotteries', this.addForm).subscribe({
      next: () => {
        this.isAddModalOpen.set(false);
        this.loadLotteries();
      },
      error: (err) => console.error('Error creating lottery:', err)
    });
  }
}
