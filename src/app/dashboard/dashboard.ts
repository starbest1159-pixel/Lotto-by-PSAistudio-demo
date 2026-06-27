/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeDetectionStrategy, Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../core/services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6 animate-[fade-in_0.3s_ease]">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">ภาพรวมระบบ</h1>
        <div class="text-sm text-slate-500">ข้อมูลอัปเดตล่าสุด: {{ lastUpdated() }}</div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Card 1 -->
        <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <div class="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <mat-icon class="!w-5 !h-5 text-[20px]">payments</mat-icon>
            </div>
            <span class="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+12.5%</span>
          </div>
          <p class="text-sm font-medium text-slate-500 mb-1">ยอดแทงรวมวันนี้</p>
          <h3 class="text-2xl font-bold text-slate-900">฿{{ stats().totalBets | number:'1.2-2' }}</h3>
        </div>

        <!-- Card 2 -->
        <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <div class="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
              <mat-icon class="!w-5 !h-5 text-[20px]">outbox</mat-icon>
            </div>
            <span class="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">+5.2%</span>
          </div>
          <p class="text-sm font-medium text-slate-500 mb-1">ยอดจ่ายรางวัล</p>
          <h3 class="text-2xl font-bold text-slate-900">฿{{ stats().payouts | number:'1.2-2' }}</h3>
        </div>

        <!-- Card 3 -->
        <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <div class="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <mat-icon class="!w-5 !h-5 text-[20px]">trending_up</mat-icon>
            </div>
            <span class="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+18.3%</span>
          </div>
          <p class="text-sm font-medium text-slate-500 mb-1">กำไรสุทธิ</p>
          <h3 class="text-2xl font-bold text-slate-900">฿{{ stats().profit | number:'1.2-2' }}</h3>
        </div>

        <!-- Card 4 -->
        <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <div class="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
              <mat-icon class="!w-5 !h-5 text-[20px]">group</mat-icon>
            </div>
            <span class="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+5</span>
          </div>
          <p class="text-sm font-medium text-slate-500 mb-1">จำนวนสมาชิกทั้งหมด</p>
          <h3 class="text-2xl font-bold text-slate-900">{{ stats().totalMembers | number }} คน</h3>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Active Lotteries -->
        <div class="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 class="text-lg font-semibold text-slate-900">หวยที่เปิดรับแทงขณะนี้</h2>
          </div>
          <div class="divide-y divide-slate-100">
            @for (lotto of activeLotteries(); track lotto.id) {
              <div class="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                <div class="flex items-center space-x-4">
                  <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xs font-black shadow-sm shrink-0 uppercase tracking-wider border"
                       [class]="lotto.flag === '🇹🇭' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                                lotto.flag === '🇻🇳' ? 'bg-red-50 text-red-700 border-red-200' : 
                                lotto.flag === '🇱🇦' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 
                                lotto.flag === '🇲🇾' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-700 border-slate-200'">
                    {{ lotto.flag === '🇹🇭' ? 'TH' : 
                       lotto.flag === '🇻🇳' ? 'VN' : 
                       lotto.flag === '🇱🇦' ? 'LA' : 
                       lotto.flag === '🇲🇾' ? 'MY' : 'LOT' }}
                  </div>
                  <div>
                    <h4 class="text-base font-bold text-slate-900">{{ lotto.name }}</h4>
                    <p class="text-sm text-slate-500">งวดวันที่ {{ lotto.period }}</p>
                  </div>
                </div>
                <div class="text-left sm:text-right flex flex-col sm:items-end w-full sm:w-auto">
                  <div class="text-sm font-medium text-slate-900 mb-1">ปิดรับแทง: <span class="text-red-500 font-semibold">{{ lotto.closeTime }}</span></div>
                  <div class="w-full sm:w-32 h-2 bg-slate-100 rounded-full overflow-hidden mb-1">
                    <div class="h-full bg-emerald-500 rounded-full" [style.width]="lotto.progress + '%'"></div>
                  </div>
                  <div class="text-xs text-slate-500">ยอดแทง {{ lotto.progress }}%</div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div class="px-6 py-4 border-b border-slate-200">
            <h2 class="text-lg font-semibold text-slate-900">รายการเคลื่อนไหวล่าสุด</h2>
          </div>
          <div class="flex-1 p-6 overflow-y-auto max-h-[360px]">
            <div class="space-y-6">
              @for (activity of recentActivities(); track activity.id; let isLast = $last) {
                <div class="flex space-x-3">
                  <div class="relative mt-1">
                    <div class="w-2.5 h-2.5 rounded-full" [class]="activity.colorClass"></div>
                    @if (!isLast) {
                      <div class="absolute top-3.5 bottom-[-24px] left-1/2 -translate-x-1/2 w-0.5 bg-slate-100"></div>
                    }
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-slate-900">{{ activity.title }}</p>
                    <p class="text-xs text-slate-500 truncate">{{ activity.description }}</p>
                    <p class="text-[10px] text-slate-400 mt-0.5">{{ activity.time }}</p>
                  </div>
                  <div class="text-sm font-bold" [class]="activity.amountClass">{{ activity.amount }}</div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);

  lastUpdated = signal<string>('กำลังโหลด...');
  stats = signal<any>({
    totalBets: 0,
    payouts: 0,
    profit: 0,
    totalMembers: 0
  });

  activeLotteries = signal<any[]>([]);
  recentActivities = signal<any[]>([]);

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    // 1. Fetch live metadata stats
    this.api.get<any>('dashboard/stats').subscribe({
      next: (res) => {
        this.stats.set({
          totalBets: res.todayBets || 0,
          payouts: res.totalPayout || 0,
          profit: res.netProfit || 0,
          totalMembers: res.totalUsers || 0
        });
        this.recentActivities.set(res.recentActivities || []);
        this.lastUpdated.set(new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.');
      },
      error: (err) => console.error('Error fetching dashboard stats:', err)
    });

    // 2. Fetch lotteries
    this.api.get<any[]>('lotteries').subscribe({
      next: (res) => {
        // filter active only
        const active = res.filter(l => l.status === 'open');
        this.activeLotteries.set(active);
      },
      error: (err) => console.error('Error fetching dashboard lotteries:', err)
    });
  }
}
