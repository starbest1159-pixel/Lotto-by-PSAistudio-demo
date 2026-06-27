/* eslint-disable */
import { ChangeDetectionStrategy, Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../core/services/api.service';

@Component({
  selector: 'app-public-bet',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-2xl w-full mx-auto space-y-6">
        
        <!-- Header / Logo -->
        <div class="flex flex-col items-center text-center space-y-2">
          <div class="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <mat-icon class="!w-8 !h-8 text-[32px]">casino</mat-icon>
          </div>
          <h1 class="text-2xl font-black tracking-tight text-white mt-3">ระบบส่งโพยด่วน (Bet Express)</h1>
          
          @if (loading()) {
            <p class="text-sm text-slate-400">กำลังตรวจสอบรหัสผู้แนะนำ...</p>
          } @else if (errorMsg()) {
            <div class="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm font-medium mt-2">
              {{ errorMsg() }}
            </div>
          } @else if (linkData()) {
            <div class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-1">
              <mat-icon class="!w-3.5 !h-3.5 text-[14px] mr-1">link</mat-icon>
              ผู้แนะนำ: {{ linkData().name }}
            </div>
          }
        </div>

        @if (linkData() && !submitted()) {
          <!-- Form Section -->
          <div class="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            
            <!-- Step 1: User Identity -->
            <div class="p-6 border-b border-slate-800 space-y-4">
              <div class="flex items-center space-x-2 text-emerald-400 font-bold text-sm uppercase tracking-wider">
                <mat-icon class="!w-4 !h-4 text-[16px]">person</mat-icon>
                <span>1. ข้อมูลผู้ส่งโพย</span>
              </div>
              <div>
                <div class="block text-xs font-semibold text-slate-400 mb-1.5">ชื่อหรือนามแฝงของคุณ *</div>
                <input 
                  type="text" 
                  [(ngModel)]="playerName" 
                  class="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white font-bold text-sm" 
                  placeholder="เช่น คุณสมชาย นครปฐม"
                >
              </div>
            </div>

            <!-- Step 2: Choose Lottery & Bets -->
            <div class="p-6 space-y-5">
              <div class="flex items-center space-x-2 text-emerald-400 font-bold text-sm uppercase tracking-wider">
                <mat-icon class="!w-4 !h-4 text-[16px]">edit_note</mat-icon>
                <span>2. ระบุรายการแทงหวย</span>
              </div>

              <!-- Lottery Selector -->
              <div>
                <div class="block text-xs font-semibold text-slate-400 mb-1.5">เลือกหวยที่ต้องการแทง *</div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  @for (lotto of activeLotteries(); track lotto.id) {
                    <button 
                      (click)="selectedLotto.set(lotto)"
                      [class]="selectedLotto()?.id === lotto.id ? 'border-emerald-500 bg-emerald-500/10 text-white font-bold' : 'border-slate-800 bg-slate-950 text-slate-300'"
                      class="px-4 py-3 border rounded-xl text-left transition-all cursor-pointer flex items-center justify-between"
                    >
                      <span class="text-sm font-semibold flex items-center">
                        <span class="mr-2 text-base leading-none">{{ getLottoFlag(lotto.name) }}</span>
                        {{ lotto.name }}
                      </span>
                      <span class="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-mono">
                        {{ lotto.name.includes('ไทย') ? 'TH' : lotto.name.includes('ฮานอย') ? 'VN' : lotto.name.includes('ลาว') ? 'LA' : 'MY' }}
                      </span>
                    </button>
                  }
                </div>
              </div>

              <!-- Number Form -->
              @if (selectedLotto()) {
                <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <div class="block text-xs text-slate-400 mb-1">ประเภทการเล่น</div>
                      <select 
                        [(ngModel)]="betForm.type" 
                        class="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white text-sm font-bold"
                      >
                        <option value="3 ตัวบน">3 ตัวบน</option>
                        <option value="3 ตัวโต๊ด">3 ตัวโต๊ด</option>
                        <option value="2 ตัวบน">2 ตัวบน</option>
                        <option value="2 ตัวล่าง">2 ตัวล่าง</option>
                        <option value="วิ่งบน">วิ่งบน</option>
                        <option value="วิ่งล่าง">วิ่งล่าง</option>
                      </select>
                    </div>
                    <div>
                      <div class="block text-xs text-slate-400 mb-1">ตัวเลขที่ต้องการแทง</div>
                      <input 
                        type="text" 
                        [(ngModel)]="betForm.number" 
                        class="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono font-bold text-sm text-center" 
                        placeholder="เช่น 123"
                        maxlength="6"
                      >
                    </div>
                  </div>

                  <div>
                    <div class="block text-xs text-slate-400 mb-1">จำนวนเงินเดิมพัน (บาท)</div>
                    <div class="flex space-x-2">
                      <input 
                        type="number" 
                        [(ngModel)]="betForm.amount" 
                        class="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-bold text-sm text-center" 
                        placeholder="จำนวนเงิน"
                      >
                      <button 
                        (click)="addBet()" 
                        class="px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        เพิ่มรายการ
                      </button>
                    </div>
                  </div>
                </div>
              }
            </div>

            <!-- Bet List -->
            <div class="p-6 bg-slate-900/50 border-t border-slate-800">
              <div class="flex items-center justify-between mb-4">
                <span class="text-xs font-semibold text-slate-400">รายการแทงในโพยนี้ ({{ bets().length }} รายการ)</span>
                @if (bets().length > 0) {
                  <button (click)="clearAllBets()" class="text-xs text-red-400 hover:text-red-300 font-medium cursor-pointer">
                    ล้างทั้งหมด
                  </button>
                }
              </div>

              @if (bets().length === 0) {
                <div class="text-center py-8 bg-slate-950 rounded-xl border border-dashed border-slate-800 text-slate-500">
                  <mat-icon class="!w-10 !h-10 text-[40px] opacity-20 mb-2">receipt</mat-icon>
                  <p class="text-sm">ยังไม่มีรายการเดิมพัน</p>
                  <p class="text-xs mt-1">กรุณาระบุประเภท ตัวเลข และเงินด้านบน</p>
                </div>
              } @else {
                <div class="max-h-60 overflow-y-auto space-y-2 pr-1">
                  @for (bet of bets(); track $index) {
                    <div class="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <div>
                        <span class="text-xs font-bold text-emerald-400 mr-2">[{{ bet.lottoName }}]</span>
                        <span class="text-sm font-semibold text-white">{{ bet.type }} [{{ bet.number }}]</span>
                      </div>
                      <div class="flex items-center space-x-3">
                        <span class="text-sm font-bold font-mono text-white">฿{{ bet.amount | number }}</span>
                        <button (click)="removeBet($index)" class="text-slate-500 hover:text-red-400 transition-colors cursor-pointer">
                          <mat-icon class="!w-4 !h-4 text-[16px]">close</mat-icon>
                        </button>
                      </div>
                    </div>
                  }
                </div>

                <div class="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span class="text-sm font-bold text-slate-300">ยอดเงินเดิมพันรวม</span>
                  <span class="text-xl font-black text-emerald-400 font-mono">฿{{ totalBetAmount() | number }}</span>
                </div>
              }
            </div>

            <!-- Submit -->
            <div class="p-6 bg-slate-950 border-t border-slate-800">
              <button 
                [disabled]="bets().length === 0 || !playerName()"
                (click)="submitBets()"
                class="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-xl transition-all shadow-lg cursor-pointer flex items-center justify-center space-x-2"
              >
                <mat-icon class="!w-5 !h-5 text-[20px]">check_circle</mat-icon>
                <span>ส่งโพยแทงเข้าระบบหลังบ้าน</span>
              </button>
            </div>

          </div>
        } @else if (submitted()) {
          <!-- Receipt on Success -->
          <div class="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden p-8 text-center space-y-6 animate-[fade-in_0.3s_ease]">
            <div class="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
              <mat-icon class="!w-8 !h-8 text-[32px]">verified</mat-icon>
            </div>
            
            <div>
              <h2 class="text-xl font-black text-white">ส่งโพยแทงสำเร็จ!</h2>
              <p class="text-sm text-slate-400 mt-1">โพยของคุณได้รับการบันทึกและแจ้งเตือนไปยังผู้ดูแลระบบเรียบร้อยแล้ว</p>
            </div>

            <div class="bg-slate-950 rounded-xl p-5 border border-slate-800 text-left space-y-4">
              <div class="flex justify-between border-b border-slate-800 pb-2 text-xs text-slate-400 font-semibold uppercase">
                <span>ชื่อผู้ส่ง</span>
                <span class="text-white">{{ playerName() }}</span>
              </div>
              <div class="flex justify-between border-b border-slate-800 pb-2 text-xs text-slate-400 font-semibold uppercase">
                <span>ผู้ดูแล / สาย</span>
                <span class="text-white">{{ linkData()?.name }}</span>
              </div>
              
              <div class="space-y-2">
                @for (bet of bets(); track $index) {
                  <div class="flex justify-between text-sm">
                    <span class="text-slate-300 flex items-center">
                      <span class="mr-1.5 leading-none">{{ getLottoFlag(bet.lottoName) }}</span>
                      {{ bet.lottoName }} • {{ bet.type }} [{{ bet.number }}]
                    </span>
                    <span class="font-bold font-mono text-white">฿{{ bet.amount | number }}</span>
                  </div>
                }
              </div>

              <div class="flex justify-between pt-4 border-t border-slate-800">
                <span class="text-sm font-bold text-slate-300">ยอดรวมทั้งสิ้น</span>
                <span class="text-lg font-black text-emerald-400 font-mono">฿{{ totalBetAmount() | number }}</span>
              </div>
            </div>

            <button 
              (click)="resetForm()"
              class="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-colors cursor-pointer"
            >
              ส่งโพยใหม่อีกครั้ง
            </button>
          </div>
        }

        <!-- Footer -->
        <p class="text-center text-xs text-slate-600">
          ระบบหลังบ้านปิดแทงอัตโนมัติเมื่อหมดเวลาเดิมพัน • ข้อมูลปลอดภัยด้วยการเข้ารหัส SHA-256
        </p>

      </div>
    </div>
  `
})
export class PublicBetComponent implements OnInit {
  getLottoFlag(name: string): string {
    const lottoName = name || '';
    if (lottoName.includes('ไทย') || lottoName.includes('TH')) return '🇹🇭';
    if (lottoName.includes('ฮานอย') || lottoName.includes('เวียดนาม') || lottoName.includes('VN')) return '🇻🇳';
    if (lottoName.includes('ลาว') || lottoName.includes('LA')) return '🇱🇦';
    if (lottoName.includes('มาเลย์') || lottoName.includes('MY')) return '🇲🇾';
    return '🎲';
  }

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);

  linkCode = signal<string>('');
  linkData = signal<any>(null);
  activeLotteries = signal<any[]>([]);
  
  loading = signal<boolean>(true);
  errorMsg = signal<string>('');
  submitted = signal<boolean>(false);

  playerName = signal<string>('');
  selectedLotto = signal<any>(null);

  betForm = {
    type: '3 ตัวบน',
    number: '',
    amount: null as number | null
  };

  bets = signal<any[]>([]);
  totalBetAmount = signal<number>(0);

  ngOnInit() {
    this.route.params.subscribe(params => {
      const code = params['linkId'];
      if (code) {
        this.linkCode.set(code);
        this.fetchLinkDetails(code);
      } else {
        this.errorMsg.set('ไม่พบรหัสผู้แนะนำ กรุณาตรวจสอบลิงก์ใหม่อีกครั้ง');
        this.loading.set(false);
      }
    });
  }

  fetchLinkDetails(code: string) {
    this.api.get<any>(`links/${code}`).subscribe({
      next: (res) => {
        this.linkData.set(res.link);
        this.activeLotteries.set(res.lotteries || []);
        if (res.lotteries && res.lotteries.length > 0) {
          this.selectedLotto.set(res.lotteries[0]);
        }
        this.loading.set(false);
      },
      error: () => {
        this.errorMsg.set('ไม่พบรหัสผู้แนะนำนี้ในระบบ หรืออาจหมดอายุไปแล้ว');
        this.loading.set(false);
      }
    });
  }

  addBet() {
    if (!this.selectedLotto()) return;
    if (!this.betForm.number || !this.betForm.amount || this.betForm.amount <= 0) {
      return;
    }

    const currentBets = this.bets();
    currentBets.push({
      lottoName: this.selectedLotto().name,
      type: this.betForm.type,
      number: this.betForm.number,
      amount: this.betForm.amount
    });
    this.bets.set([...currentBets]);
    this.calculateTotal();

    // Reset number input
    this.betForm.number = '';
  }

  removeBet(index: number) {
    const currentBets = this.bets();
    currentBets.splice(index, 1);
    this.bets.set([...currentBets]);
    this.calculateTotal();
  }

  clearAllBets() {
    this.bets.set([]);
    this.calculateTotal();
  }

  calculateTotal() {
    const total = this.bets().reduce((sum, b) => sum + b.amount, 0);
    this.totalBetAmount.set(total);
  }

  submitBets() {
    if (this.bets().length === 0 || !this.playerName()) return;

    const payload = {
      linkCode: this.linkCode(),
      playerName: this.playerName(),
      betsList: this.bets()
    };

    this.api.post<any>('bet-via-link', payload).subscribe({
      next: () => {
        this.submitted.set(true);
      },
      error: (err) => {
        alert(err.error?.message || 'เกิดข้อผิดพลาดในการส่งข้อมูลเดิมพัน');
      }
    });
  }

  resetForm() {
    this.bets.set([]);
    this.totalBetAmount.set(0);
    this.betForm.number = '';
    this.betForm.amount = null;
    this.submitted.set(false);
  }
}
