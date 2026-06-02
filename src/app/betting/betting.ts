import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-betting',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
      <!-- Left Side: Betting Interface -->
      <div class="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl shadow-sm">
              🇹🇭
            </div>
            <div>
              <h2 class="text-lg font-bold text-slate-900">หวยรัฐบาลไทย</h2>
              <p class="text-sm text-slate-500">งวดวันที่ 16 มีนาคม 2567</p>
            </div>
          </div>
          <div class="text-right">
            <div class="text-xs text-slate-500 mb-1">ปิดรับแทงในอีก</div>
            <div class="text-lg font-mono font-bold text-red-500">02:15:40</div>
          </div>
        </div>

        <!-- Mode Switcher -->
        <div class="p-4 border-b border-slate-200">
          <div class="flex p-1 bg-slate-100 rounded-xl">
            <button 
              class="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all"
              [class]="mode() === 'text' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
              (click)="mode.set('text')"
            >
              <div class="flex items-center justify-center">
                <mat-icon class="!w-4 !h-4 text-[16px] mr-2">keyboard</mat-icon>
                คีย์ด่วน (Text)
              </div>
            </button>
            <button 
              class="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all"
              [class]="mode() === 'select' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
              (click)="mode.set('select')"
            >
              <div class="flex items-center justify-center">
                <mat-icon class="!w-4 !h-4 text-[16px] mr-2">touch_app</mat-icon>
                กดเลือกเลข
              </div>
            </button>
          </div>
        </div>

        <!-- Betting Area -->
        <div class="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          @if (mode() === 'text') {
            <div class="space-y-4">
              <div class="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
                <p class="font-semibold mb-1">รูปแบบการพิมพ์:</p>
                <p>ตัวเลข=ราคาบน=ราคาล่าง หรือ ตัวเลข=ราคา (เช่น 123=100=100, 45=50)</p>
              </div>
              <textarea 
                [(ngModel)]="quickText"
                rows="10"
                class="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono text-lg resize-none shadow-sm"
                placeholder="พิมพ์ตัวเลขที่นี่..."
              ></textarea>
              <button 
                (click)="parseQuickText()"
                class="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-medium transition-colors shadow-sm"
              >
                เพิ่มลงโพย
              </button>
            </div>
          } @else {
            <div class="space-y-6">
              <!-- Bet Types -->
              <div class="grid grid-cols-3 gap-3">
                @for (type of betTypes; track type.id) {
                  <button 
                    class="py-3 px-4 rounded-xl border text-sm font-medium transition-all"
                    [class]="selectedType() === type.id ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'"
                    (click)="selectedType.set(type.id)"
                  >
                    {{ type.name }}
                  </button>
                }
              </div>

              <!-- Number Pad -->
              <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div class="flex items-center space-x-4 mb-6">
                  <input 
                    type="text" 
                    [(ngModel)]="currentNumber"
                    class="flex-1 text-center text-3xl font-mono font-bold py-4 border-b-2 border-slate-200 focus:border-emerald-500 focus:outline-none bg-transparent"
                    placeholder="000"
                    maxlength="3"
                  >
                  <div class="w-px h-12 bg-slate-200"></div>
                  <div class="flex-1 relative">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">฿</span>
                    <input 
                      type="number" 
                      [(ngModel)]="currentAmount"
                      class="w-full text-right text-2xl font-bold py-4 pl-8 pr-4 border-b-2 border-slate-200 focus:border-emerald-500 focus:outline-none bg-transparent"
                      placeholder="0"
                    >
                  </div>
                </div>

                <div class="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                  @for (n of [1,2,3,4,5,6,7,8,9]; track n) {
                    <button 
                      (click)="appendNumber(n.toString())"
                      class="h-14 rounded-xl bg-slate-50 hover:bg-slate-100 text-xl font-semibold text-slate-700 transition-colors"
                    >
                      {{ n }}
                    </button>
                  }
                  <button 
                    class="h-14 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-medium transition-colors flex items-center justify-center"
                    (click)="clearNumber()"
                  >
                    <mat-icon>backspace</mat-icon>
                  </button>
                  <button 
                    (click)="appendNumber('0')"
                    class="h-14 rounded-xl bg-slate-50 hover:bg-slate-100 text-xl font-semibold text-slate-700 transition-colors"
                  >
                    0
                  </button>
                  <button 
                    class="h-14 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors flex items-center justify-center shadow-sm"
                    (click)="addBet()"
                  >
                    <mat-icon>keyboard_return</mat-icon>
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Right Side: Bet Slip -->
      <div class="w-full lg:w-96 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-200 bg-slate-800 text-white flex items-center justify-between">
          <div class="flex items-center">
            <mat-icon class="mr-2">receipt_long</mat-icon>
            <h2 class="text-lg font-semibold">สรุปโพย</h2>
          </div>
          <span class="bg-slate-700 px-2 py-1 rounded text-xs font-medium">{{ bets().length }} รายการ</span>
        </div>

        <div class="flex-1 overflow-y-auto p-2">
          @if (bets().length === 0) {
            <div class="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
              <mat-icon class="!w-12 !h-12 text-[48px] mb-4 opacity-20">receipt</mat-icon>
              <p>ยังไม่มีรายการแทง</p>
              <p class="text-sm mt-1">กรุณาเลือกตัวเลขและใส่ราคา</p>
            </div>
          } @else {
            <div class="space-y-2">
              @for (bet of bets(); track bet.id) {
                <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group">
                  <div class="flex items-center space-x-3">
                    <button 
                      (click)="removeBet(bet.id)"
                      class="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <mat-icon class="!w-4 !h-4 text-[16px]">close</mat-icon>
                    </button>
                    <div>
                      <div class="font-mono font-bold text-lg text-slate-900">{{ bet.number }}</div>
                      <div class="text-xs text-slate-500">{{ getTypeName(bet.type) }}</div>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="font-semibold text-slate-900">฿{{ bet.amount | number }}</div>
                    <div class="text-xs text-emerald-600">จ่าย {{ bet.payRate }}</div>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <div class="p-6 border-t border-slate-200 bg-slate-50">
          <div class="space-y-3 mb-6">
            <div class="flex justify-between text-sm text-slate-600">
              <span>ยอดรวม</span>
              <span>฿{{ totalAmount() | number }}</span>
            </div>
            <div class="flex justify-between text-sm text-emerald-600">
              <span>ส่วนลด (5%)</span>
              <span>-฿{{ discount() | number }}</span>
            </div>
            <div class="w-full h-px bg-slate-200"></div>
            <div class="flex justify-between font-bold text-lg text-slate-900">
              <span>ยอดสุทธิ</span>
              <span>฿{{ netAmount() | number }}</span>
            </div>
          </div>
          
          <div class="flex space-x-3">
            <button 
              (click)="clearAll()"
              class="px-4 py-3 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-100 transition-colors"
            >
              ล้าง
            </button>
            <button 
              [disabled]="bets().length === 0"
              class="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ยืนยันการแทง
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BettingComponent {
  mode = signal<'text' | 'select'>('select');
  selectedType = signal('3up');
  
  quickText = '';
  currentNumber = '';
  currentAmount: number | null = null;

  betTypes = [
    { id: '3up', name: '3 ตัวบน', payRate: 900 },
    { id: '3tod', name: '3 ตัวโต๊ด', payRate: 150 },
    { id: '2up', name: '2 ตัวบน', payRate: 90 },
    { id: '2down', name: '2 ตัวล่าง', payRate: 90 },
    { id: 'runup', name: 'วิ่งบน', payRate: 3.2 },
    { id: 'rundown', name: 'วิ่งล่าง', payRate: 4.2 },
  ];

  bets = signal<any[]>([]);

  totalAmount = computed(() => this.bets().reduce((sum, bet) => sum + bet.amount, 0));
  discount = computed(() => this.totalAmount() * 0.05);
  netAmount = computed(() => this.totalAmount() - this.discount());

  getTypeName(id: string) {
    return this.betTypes.find(t => t.id === id)?.name || id;
  }

  appendNumber(n: string) {
    if (this.currentNumber.length < 3) {
      this.currentNumber += n;
    }
  }

  clearNumber() {
    this.currentNumber = this.currentNumber.slice(0, -1);
  }

  addBet() {
    if (!this.currentNumber || !this.currentAmount || this.currentAmount <= 0) return;

    const type = this.betTypes.find(t => t.id === this.selectedType());
    if (!type) return;

    this.bets.update(b => [...b, {
      id: Date.now().toString(),
      number: this.currentNumber,
      type: type.id,
      amount: this.currentAmount,
      payRate: type.payRate
    }]);

    this.currentNumber = '';
    this.currentAmount = null;
  }

  removeBet(id: string) {
    this.bets.update(b => b.filter(bet => bet.id !== id));
  }

  clearAll() {
    this.bets.set([]);
  }

  parseQuickText() {
    if (!this.quickText.trim()) return;
    
    const lines = this.quickText.split('\n');
    const newBets: any[] = [];

    lines.forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const num = parts[0].trim();
        const amt1 = parseInt(parts[1].trim());
        
        if (num.length === 3) {
          if (amt1 > 0) {
            newBets.push({
              id: Date.now().toString() + Math.random(),
              number: num,
              type: '3up',
              amount: amt1,
              payRate: 900
            });
          }
          if (parts.length === 3) {
            const amt2 = parseInt(parts[2].trim());
            if (amt2 > 0) {
              newBets.push({
                id: Date.now().toString() + Math.random(),
                number: num,
                type: '3tod',
                amount: amt2,
                payRate: 150
              });
            }
          }
        } else if (num.length === 2) {
          if (amt1 > 0) {
            newBets.push({
              id: Date.now().toString() + Math.random(),
              number: num,
              type: '2up',
              amount: amt1,
              payRate: 90
            });
          }
          if (parts.length === 3) {
            const amt2 = parseInt(parts[2].trim());
            if (amt2 > 0) {
              newBets.push({
                id: Date.now().toString() + Math.random(),
                number: num,
                type: '2down',
                amount: amt2,
                payRate: 90
              });
            }
          }
        }
      }
    });

    if (newBets.length > 0) {
      this.bets.update(b => [...b, ...newBets]);
      this.quickText = '';
    }
  }
}
