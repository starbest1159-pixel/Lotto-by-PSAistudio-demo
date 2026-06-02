import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">ภาพรวมระบบ</h1>
        <div class="text-sm text-slate-500">ข้อมูลอัปเดตล่าสุด: วันนี้ 14:30 น.</div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <div class="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <mat-icon class="!w-5 !h-5 text-[20px]">payments</mat-icon>
            </div>
            <span class="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+12.5%</span>
          </div>
          <p class="text-sm font-medium text-slate-500 mb-1">ยอดแทงรวมวันนี้</p>
          <h3 class="text-2xl font-bold text-slate-900">฿125,430</h3>
        </div>

        <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <div class="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
              <mat-icon class="!w-5 !h-5 text-[20px]">outbox</mat-icon>
            </div>
            <span class="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">+5.2%</span>
          </div>
          <p class="text-sm font-medium text-slate-500 mb-1">ยอดจ่ายรางวัล</p>
          <h3 class="text-2xl font-bold text-slate-900">฿45,200</h3>
        </div>

        <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <div class="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <mat-icon class="!w-5 !h-5 text-[20px]">trending_up</mat-icon>
            </div>
            <span class="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+18.3%</span>
          </div>
          <p class="text-sm font-medium text-slate-500 mb-1">กำไรสุทธิ</p>
          <h3 class="text-2xl font-bold text-slate-900">฿80,230</h3>
        </div>

        <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <div class="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
              <mat-icon class="!w-5 !h-5 text-[20px]">group</mat-icon>
            </div>
            <span class="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+12</span>
          </div>
          <p class="text-sm font-medium text-slate-500 mb-1">จำนวนสมาชิกทั้งหมด</p>
          <h3 class="text-2xl font-bold text-slate-900">1,248</h3>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Active Lotteries -->
        <div class="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 class="text-lg font-semibold text-slate-900">หวยที่เปิดรับแทงขณะนี้</h2>
            <button class="text-sm font-medium text-emerald-600 hover:text-emerald-700">ดูทั้งหมด</button>
          </div>
          <div class="divide-y divide-slate-100">
            @for (lotto of activeLotteries; track lotto.id) {
              <div class="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div class="flex items-center space-x-4">
                  <div class="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl">
                    {{ lotto.flag }}
                  </div>
                  <div>
                    <h4 class="text-base font-semibold text-slate-900">{{ lotto.name }}</h4>
                    <p class="text-sm text-slate-500">งวดวันที่ {{ lotto.period }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-sm font-medium text-slate-900 mb-1">ปิดรับแทง: {{ lotto.closeTime }}</div>
                  <div class="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div class="h-full bg-emerald-500 rounded-full" [style.width]="lotto.progress + '%'"></div>
                  </div>
                  <div class="text-xs text-slate-500 mt-1">ยอดแทง {{ lotto.progress }}%</div>
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
          <div class="flex-1 p-6 overflow-y-auto">
            <div class="space-y-6">
              @for (activity of recentActivities; track activity.id) {
                <div class="flex space-x-3">
                  <div class="relative mt-1">
                    <div class="w-2 h-2 rounded-full" [class]="activity.colorClass"></div>
                    @if (!$last) {
                      <div class="absolute top-3 bottom-[-20px] left-1/2 -ml-px w-px bg-slate-200"></div>
                    }
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-slate-900">{{ activity.title }}</p>
                    <p class="text-sm text-slate-500 truncate">{{ activity.description }}</p>
                    <p class="text-xs text-slate-400 mt-0.5">{{ activity.time }}</p>
                  </div>
                  <div class="text-sm font-semibold" [class]="activity.amountClass">{{ activity.amount }}</div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {
  activeLotteries = [
    { id: 1, name: 'หวยรัฐบาลไทย', flag: '🇹🇭', period: '16 มี.ค. 67', closeTime: '15:20 น.', progress: 85 },
    { id: 2, name: 'หวยฮานอย (ปกติ)', flag: '🇻🇳', period: '14 มี.ค. 67', closeTime: '18:00 น.', progress: 42 },
    { id: 3, name: 'หวยลาวพัฒนา', flag: '🇱🇦', period: '15 มี.ค. 67', closeTime: '20:00 น.', progress: 60 },
  ];

  recentActivities = [
    { id: 1, title: 'แทงหวยรัฐบาล', description: 'user_001 • โพย #10293', time: '2 นาทีที่แล้ว', amount: '฿1,500', colorClass: 'bg-blue-500', amountClass: 'text-slate-900' },
    { id: 2, title: 'เติมเครดิต', description: 'agent_vip • โอนผ่านธนาคาร', time: '15 นาทีที่แล้ว', amount: '+฿10,000', colorClass: 'bg-emerald-500', amountClass: 'text-emerald-600' },
    { id: 3, title: 'แทงหวยฮานอย', description: 'member_99 • โพย #10292', time: '32 นาทีที่แล้ว', amount: '฿500', colorClass: 'bg-blue-500', amountClass: 'text-slate-900' },
    { id: 4, title: 'ถอนเงิน', description: 'user_001 • โอนผ่านธนาคาร', time: '1 ชั่วโมงที่แล้ว', amount: '-฿5,000', colorClass: 'bg-red-500', amountClass: 'text-red-600' },
    { id: 5, title: 'แทงหวยลาว', description: 'lucky_boy • โพย #10291', time: '2 ชั่วโมงที่แล้ว', amount: '฿2,000', colorClass: 'bg-blue-500', amountClass: 'text-slate-900' },
  ];
}
