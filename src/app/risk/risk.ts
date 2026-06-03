/* eslint-disable */
import { ChangeDetectionStrategy, Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../core/services/api.service';

@Component({
  selector: 'app-risk',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6 animate-[fade-in_0.3s_ease]">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">ความเสี่ยง & เลขอั้น</h1>
        <div class="flex space-x-2">
          <select class="px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white text-slate-900">
            <option>หวยรัฐบาลไทย</option>
            <option>หวยฮานอย</option>
            <option>หวยลาว</option>
          </select>
          <select class="px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white text-slate-900">
            <option>งวด 16 มี.ค. 2026</option>
            <option>งวด 1 มี.ค. 2026</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Blocked Numbers -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div class="px-6 py-4 border-b border-slate-200 bg-red-50/50 flex items-center justify-between">
            <div class="flex items-center text-red-800 font-semibold">
              <mat-icon class="mr-2 text-red-500">block</mat-icon>
              เลขอั้น (ไม่รับแทง)
            </div>
            <button 
              (click)="isAddBlockedOpen.set(true)"
              class="text-sm font-semibold text-red-600 hover:text-red-700 cursor-pointer"
            >
              + เพิ่มเลข
            </button>
          </div>
          <div class="p-6 flex-1">
            <div class="flex flex-wrap gap-2">
              @for (num of blockedNumbers(); track num) {
                <div class="flex items-center bg-red-50 border border-red-200 rounded-xl px-3 py-1.5 transition-all hover:border-red-300">
                  <span class="font-mono font-bold text-red-700 mr-2">{{ num }}</span>
                  <button (click)="removeBlocked(num)" class="text-red-400 hover:text-red-600 cursor-pointer">
                    <mat-icon class="!w-4 !h-4 text-[16px]">close</mat-icon>
                  </button>
                </div>
              } @empty {
                <div class="text-slate-400 text-sm py-4">ไม่มีเลขอั้น</div>
              }
            </div>
          </div>
        </div>

        <!-- Reduced Payout Numbers -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div class="px-6 py-4 border-b border-slate-200 bg-amber-50/50 flex items-center justify-between">
            <div class="flex items-center text-amber-800 font-semibold">
              <mat-icon class="mr-2 text-amber-500">trending_down</mat-icon>
              เลขอั้นจ่ายลด (จ่ายครึ่ง/กำหนดเอง)
            </div>
            <button 
              (click)="isAddReducedOpen.set(true)"
              class="text-sm font-semibold text-amber-600 hover:text-amber-700 cursor-pointer"
            >
              + เพิ่มเลขจ่ายลด
            </button>
          </div>
          <div class="p-0 flex-1">
            <table class="w-full text-left text-sm whitespace-nowrap">
              <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <tr>
                  <th class="px-6 py-3">ตัวเลข</th>
                  <th class="px-6 py-3">ประเภท</th>
                  <th class="px-6 py-3 text-right">เรทจ่าย</th>
                  <th class="px-6 py-3 text-right">ดำเนินการ</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @for (item of reducedNumbers(); track item.number) {
                  <tr class="hover:bg-slate-50 transition-colors">
                    <td class="px-6 py-3 font-mono font-bold text-slate-900">{{ item.number }}</td>
                    <td class="px-6 py-3 text-slate-600">{{ item.type }}</td>
                    <td class="px-6 py-3 text-right text-amber-600 font-medium">x{{ item.payRate }}</td>
                    <td class="px-6 py-3 text-right">
                      <button (click)="removeReduced(item.number)" class="text-slate-400 hover:text-red-500 cursor-pointer">
                        <mat-icon class="!w-4 !h-4 text-[16px]">delete</mat-icon>
                      </button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="4" class="px-6 py-4 text-center text-slate-400">ไม่มีเลขจ่ายลด</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Add Blocked Number -->
    @if (isAddBlockedOpen()) {
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-[fade-in_0.2s_ease]">
        <div class="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 class="text-base font-bold text-slate-900">เพิ่มเลขอั้น (ไม่รับแทง)</h3>
            <button (click)="isAddBlockedOpen.set(false)" class="text-slate-400 hover:text-slate-600">
              <mat-icon>close</mat-icon>
            </button>
          </div>
          <form (submit)="addBlocked($event)" class="p-6 space-y-4">
            <div>
              <div class="block text-sm font-medium text-slate-700 mb-1">ตัวเลข *</div>
              <input type="text" [(ngModel)]="newBlockedNum" name="newBlockedNum" required class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm bg-white text-slate-950 font-bold font-mono" placeholder="เช่น 289 หรือ 12">
            </div>
            <div class="pt-4 flex space-x-3 justify-end border-t border-slate-100">
              <button type="button" (click)="isAddBlockedOpen.set(false)" class="px-4 py-2 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">ยกเลิก</button>
              <button type="submit" class="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-medium shadow-sm transition-colors">ตกลง</button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Modal: Add Reduced Payout Number -->
    @if (isAddReducedOpen()) {
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-[fade-in_0.2s_ease]">
        <div class="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 class="text-base font-bold text-slate-900">เพิ่มเลขจ่ายลด</h3>
            <button (click)="isAddReducedOpen.set(false)" class="text-slate-400 hover:text-slate-600">
              <mat-icon>close</mat-icon>
            </button>
          </div>
          <form (submit)="addReduced($event)" class="p-6 space-y-4">
            <div>
              <div class="block text-sm font-medium text-slate-700 mb-1">ตัวเลข *</div>
              <input type="text" [(ngModel)]="newReducedForm.number" name="number" required class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm bg-white text-slate-950 font-bold font-mono" placeholder="เช่น 987">
            </div>
            <div>
              <div class="block text-sm font-medium text-slate-700 mb-1">ประเภท</div>
              <select [(ngModel)]="newReducedForm.type" name="type" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm bg-white text-slate-950">
                <option value="3 ตัวบน">3 ตัวบน</option>
                <option value="3 ตัวโต๊ด">3 ตัวโต๊ด</option>
                <option value="2 ตัวบน">2 ตัวบน</option>
                <option value="2 ตัวล่าง">2 ตัวล่าง</option>
              </select>
            </div>
            <div>
              <div class="block text-sm font-medium text-slate-700 mb-1">เรทจ่ายจ่าย (เช่น 450 หรือ 45) *</div>
              <input type="number" [(ngModel)]="newReducedForm.payRate" name="payRate" required class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm bg-white text-slate-950 font-mono font-bold">
            </div>
            <div class="pt-4 flex space-x-3 justify-end border-t border-slate-100">
              <button type="button" (click)="isAddReducedOpen.set(false)" class="px-4 py-2 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">ยกเลิก</button>
              <button type="submit" class="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-medium shadow-sm transition-colors">ตกลง</button>
            </div>
          </form>
        </div>
      </div>
    }
  `
})
export class RiskComponent implements OnInit {
  private api = inject(ApiService);

  blockedNumbers = signal<string[]>([]);
  reducedNumbers = signal<any[]>([]);

  // modals
  isAddBlockedOpen = signal(false);
  isAddReducedOpen = signal(false);

  newBlockedNum = '';
  newReducedForm = {
    number: '',
    type: '3 ตัวบน',
    payRate: 450
  };

  ngOnInit() {
    this.loadRiskData();
  }

  loadRiskData() {
    this.api.get<any>('risk').subscribe({
      next: (data) => {
        this.blockedNumbers.set(data.blockedNumbers || []);
        this.reducedNumbers.set(data.reducedNumbers || []);
      },
      error: (err) => console.error('Error fetching risk list:', err)
    });
  }

  addBlocked(event: Event) {
    event.preventDefault();
    const val = this.newBlockedNum.trim();
    if (!val) return;

    this.api.post<any>('risk/blocked', { number: val }).subscribe({
      next: () => {
        this.isAddBlockedOpen.set(false);
        this.newBlockedNum = '';
        this.loadRiskData();
      },
      error: (err) => console.error(err)
    });
  }

  removeBlocked(num: string) {
    this.api.delete<any>(`risk/blocked/${num}`).subscribe({
      next: () => this.loadRiskData(),
      error: (err) => console.error(err)
    });
  }

  addReduced(event: Event) {
    event.preventDefault();
    if (!this.newReducedForm.number) return;

    this.api.post<any>('risk/reduced', this.newReducedForm).subscribe({
      next: () => {
        this.isAddReducedOpen.set(false);
        this.newReducedForm = { number: '', type: '3 ตัวบน', payRate: 450 };
        this.loadRiskData();
      },
      error: (err) => console.error(err)
    });
  }

  removeReduced(num: string) {
    this.api.delete<any>(`risk/reduced/${num}`).subscribe({
      next: () => this.loadRiskData(),
      error: (err) => console.error(err)
    });
  }
}
