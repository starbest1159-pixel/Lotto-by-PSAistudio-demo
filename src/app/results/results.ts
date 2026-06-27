/* eslint-disable */
import { ChangeDetectionStrategy, Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../core/services/api.service';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6 animate-[fade-in_0.3s_ease]">
      <h1 class="text-2xl font-bold text-slate-900 tracking-tight">ผลรางวัล</h1>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Enter Results Form -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-fit">
          <h2 class="text-lg font-bold text-slate-900 mb-4">กรอกผลรางวัล</h2>
          <form (submit)="saveResult($event)" class="space-y-4">
            <div>
              <div class="block text-sm font-medium text-slate-700 mb-1">เลือกหวย / งวด</div>
              <select [(ngModel)]="form.lotteryId" name="lotteryId" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-slate-950 font-medium font-bold">
                @for (lotto of activeLotteries(); track lotto.id) {
                  <option [value]="lotto.name">{{ lotto.name }} ({{ lotto.period }})</option>
                }
              </select>
            </div>
            
            <div class="pt-4 border-t border-slate-200">
              <div class="block text-sm font-medium text-slate-700 mb-1">รางวัลที่ 1 (6 ตัว) *</div>
              <input 
                type="text" 
                [(ngModel)]="form.prize1"
                (input)="autoExtract()"
                name="prize1"
                required
                class="w-full px-3 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-center text-2xl font-mono font-bold tracking-[0.5em] bg-white text-slate-950" 
                placeholder="000000" 
                maxlength="6"
              >
            </div>

            <div class="grid grid-cols-3 gap-3">
              <div>
                <div class="block text-xs font-semibold text-slate-500 mb-1">3 ตัวบน</div>
                <input 
                  type="text" 
                  [(ngModel)]="form.top3"
                  name="top3"
                  readonly 
                  class="w-full px-2 py-3 border border-slate-200 rounded-xl text-center text-lg font-mono font-bold bg-slate-50 text-slate-500" 
                  placeholder="000"
                >
              </div>
              <div>
                <div class="block text-xs font-semibold text-slate-500 mb-1">2 ตัวบน</div>
                <input 
                  type="text" 
                  [(ngModel)]="form.top2"
                  name="top2"
                  readonly 
                  class="w-full px-2 py-3 border border-slate-200 rounded-xl text-center text-lg font-mono font-bold bg-slate-50 text-slate-500" 
                  placeholder="00"
                >
              </div>
              <div>
                <div class="block text-xs font-semibold text-slate-700 mb-1">2 ตัวล่าง *</div>
                <input 
                  type="text" 
                  [(ngModel)]="form.bottom2"
                  name="bottom2"
                  required
                  class="w-full px-2 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-center text-lg font-mono font-bold bg-white text-slate-950" 
                  placeholder="00" 
                  maxlength="2"
                >
              </div>
            </div>

            <button 
              type="submit" 
              class="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-colors mt-4 shadow-sm cursor-pointer"
            >
              บันทึกผลรางวัล
            </button>
          </form>
        </div>

        <!-- Results History -->
        <div class="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <h2 class="text-lg font-bold text-slate-900">ประวัติผลรางวัล</h2>
          </div>
          
          <div class="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            @for (result of resultsHistory(); track result.id) {
              <div class="p-6 hover:bg-slate-50/50 transition-colors">
                <div class="flex items-center justify-between mb-4">
                  <div class="font-bold text-slate-900 flex items-center">
                    <span class="mr-1.5 text-base leading-none">{{ getLottoFlag(result.lotteryId) }}</span>
                    {{ result.lotteryId || 'หวยรัฐบาลไทย' }} (งวด {{ result.period }})
                  </div>
                  <div class="text-sm text-slate-500">ประกาศเมื่อ {{ result.time }}</div>
                </div>
                
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div class="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                    <div class="text-xs text-slate-500 mb-1">รางวัลที่ 1</div>
                    <div class="text-xl font-mono font-bold text-slate-900 tracking-wider">{{ result.prize1 }}</div>
                  </div>
                  <div class="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100">
                    <div class="text-xs text-emerald-600 mb-1">3 ตัวบน</div>
                    <div class="text-xl font-mono font-bold text-emerald-700 tracking-wider">{{ result.top3 }}</div>
                  </div>
                  <div class="bg-blue-50 rounded-xl p-3 text-center border border-blue-100">
                    <div class="text-xs text-blue-600 mb-1">2 ตัวบน</div>
                    <div class="text-xl font-mono font-bold text-blue-700 tracking-wider">{{ result.top2 }}</div>
                  </div>
                  <div class="bg-purple-50 rounded-xl p-3 text-center border border-purple-100">
                    <div class="text-xs text-purple-600 mb-1">2 ตัวล่าง</div>
                    <div class="text-xl font-mono font-bold text-purple-700 tracking-wider">{{ result.bottom2 }}</div>
                  </div>
                </div>
              </div>
            } @empty {
              <div class="p-8 text-center text-slate-400">ยังไม่มีรางวัลประวัติ</div>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class ResultsComponent implements OnInit {
  private api = inject(ApiService);

  getLottoFlag(name: string): string {
    const lottoName = name || '';
    if (lottoName.includes('ไทย') || lottoName.includes('TH')) return '🇹🇭';
    if (lottoName.includes('ฮานอย') || lottoName.includes('เวียดนาม') || lottoName.includes('VN')) return '🇻🇳';
    if (lottoName.includes('ลาว') || lottoName.includes('LA')) return '🇱🇦';
    if (lottoName.includes('มาเลย์') || lottoName.includes('MY')) return '🇲🇾';
    return '🎲';
  }

  resultsHistory = signal<any[]>([]);
  activeLotteries = signal<any[]>([]);

  form = {
    lotteryId: 'หวยรัฐบาลไทย',
    prize1: '',
    top3: '',
    top2: '',
    bottom2: ''
  };

  ngOnInit() {
    this.loadResults();
    this.loadLotteries();
  }

  loadResults() {
    this.api.get<any[]>('results').subscribe({
      next: (data) => this.resultsHistory.set(data),
      error: (err) => console.error(err)
    });
  }

  loadLotteries() {
    this.api.get<any[]>('lotteries').subscribe({
      next: (data) => {
        this.activeLotteries.set(data);
        if (data.length > 0) {
          this.form.lotteryId = data[0].name;
        }
      },
      error: (err) => console.error(err)
    });
  }

  autoExtract() {
    const val = this.form.prize1.trim();
    if (val.length === 6) {
      this.form.top3 = val.substring(3, 6);
      this.form.top2 = val.substring(4, 6);
    } else {
      this.form.top3 = '';
      this.form.top2 = '';
    }
  }

  saveResult(event: Event) {
    event.preventDefault();
    if (!this.form.prize1 || !this.form.bottom2) return;

    this.api.post<any>('results', this.form).subscribe({
      next: () => {
        this.form.prize1 = '';
        this.form.top3 = '';
        this.form.top2 = '';
        this.form.bottom2 = '';
        this.loadResults();
      },
      error: (err) => console.error(err)
    });
  }
}
