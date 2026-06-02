import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-bold text-slate-900 tracking-tight">ผลรางวัล</h1>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Enter Results Form -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-fit">
          <h2 class="text-lg font-semibold text-slate-900 mb-4">กรอกผลรางวัล</h2>
          <form class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">เลือกหวย</label>
              <select class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                <option>หวยรัฐบาลไทย (16 มี.ค. 67)</option>
                <option>หวยฮานอย (14 มี.ค. 67)</option>
              </select>
            </div>
            
            <div class="pt-4 border-t border-slate-200">
              <label class="block text-sm font-medium text-slate-700 mb-1">รางวัลที่ 1 (6 ตัว)</label>
              <input type="text" class="w-full px-3 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-center text-2xl font-mono font-bold tracking-[0.5em]" placeholder="000000" maxlength="6">
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">3 ตัวบน</label>
                <input type="text" class="w-full px-3 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-center text-xl font-mono font-bold tracking-widest bg-slate-50" readonly placeholder="000">
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">2 ตัวล่าง</label>
                <input type="text" class="w-full px-3 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-center text-xl font-mono font-bold tracking-widest" placeholder="00" maxlength="2">
              </div>
            </div>

            <button type="button" class="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-colors mt-4 shadow-sm">
              บันทึกผลรางวัล
            </button>
          </form>
        </div>

        <!-- Results History -->
        <div class="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <h2 class="text-lg font-semibold text-slate-900">ประวัติผลรางวัล</h2>
            <select class="px-3 py-1.5 border border-slate-300 rounded-lg text-sm">
              <option>หวยรัฐบาลไทย</option>
              <option>หวยฮานอย</option>
              <option>หวยลาว</option>
            </select>
          </div>
          
          <div class="divide-y divide-slate-100">
            @for (result of resultsHistory(); track result.id) {
              <div class="p-6 hover:bg-slate-50 transition-colors">
                <div class="flex items-center justify-between mb-4">
                  <div class="font-medium text-slate-900">งวดวันที่ {{ result.period }}</div>
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
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class ResultsComponent {
  resultsHistory = signal([
    { id: 1, period: '1 มีนาคม 2567', time: '15:30 น.', prize1: '253603', top3: '603', top2: '03', bottom2: '79' },
    { id: 2, period: '16 กุมภาพันธ์ 2567', time: '15:30 น.', prize1: '941395', top3: '395', top2: '95', bottom2: '43' },
    { id: 3, period: '1 กุมภาพันธ์ 2567', time: '15:30 น.', prize1: '607063', top3: '063', top2: '63', bottom2: '09' },
  ]);
}
