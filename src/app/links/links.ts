/* eslint-disable */
import { ChangeDetectionStrategy, Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../core/services/api.service';

@Component({
  selector: 'app-links',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6 animate-[fade-in_0.3s_ease]">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">ลิงก์รับแทง</h1>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Create Link Form -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-fit">
          <h2 class="text-lg font-bold text-slate-900 mb-4">สร้างลิงก์เฉพาะบุคคล</h2>
          <form (submit)="createLink($event)" class="space-y-4">
            <div>
              <div class="block text-sm font-medium text-slate-700 mb-1">ชื่ออ้างอิง *</div>
              <input 
                type="text" 
                [(ngModel)]="form.name"
                name="name"
                required
                class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-slate-950 text-sm font-medium" 
                placeholder="เช่น ลูกค้า VIP สุขุมวิท"
              >
            </div>
            <div>
              <div class="block text-sm font-medium text-slate-700 mb-1">อายุการใช้งาน</div>
              <select [(ngModel)]="form.duration" name="duration" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-slate-950 font-medium">
                <option value="1 วัน">1 วัน</option>
                <option value="7 วัน">7 วัน</option>
                <option value="30 วัน">30 วัน</option>
                <option value="ไม่มีวันหมดอายุ">ไม่มีวันหมดอายุ</option>
              </select>
            </div>
            <div>
              <div class="block text-sm font-medium text-slate-700 mb-1">ประเภทการใช้งาน</div>
              <select [(ngModel)]="form.usage" name="usage" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-slate-950 font-medium font-bold">
                <option value="ใช้งานได้หลายครั้ง">ใช้งานได้หลายครั้ง</option>
                <option value="ใช้งานได้ครั้งเดียว">ใช้งานได้ครั้งเดียว</option>
              </select>
            </div>
            <button 
              type="submit" 
              class="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-colors mt-2 cursor-pointer shadow-sm"
            >
              สร้างลิงก์
            </button>
          </form>
        </div>

        <!-- Links Table -->
        <div class="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm whitespace-nowrap">
              <thead class="uppercase tracking-wider border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold">
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
                      <div class="font-bold text-slate-900 mb-1">{{ link.name }}</div>
                      <div class="flex items-center text-xs text-slate-500 bg-slate-100 px-2 py-1.5 rounded-lg w-fit border border-slate-200 font-mono">
                        <span class="truncate max-w-[150px] sm:max-w-[200px] font-semibold select-all">{{ getFullUrl(link) }}</span>
                        <button (click)="copyToClipboard(getFullUrl(link))" class="ml-2 text-emerald-600 hover:text-emerald-700 cursor-pointer" title="คัดลอกลิงก์">
                          <mat-icon class="!w-4 !h-4 text-[16px]">content_copy</mat-icon>
                        </button>
                      </div>
                      <div class="text-[11px] text-slate-400 mt-1">หมดอายุ: {{ link.expires }}</div>
                    </td>
                    <td class="px-6 py-4 text-center">
                      @if (link.active) {
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          ใช้งานได้
                        </span>
                      } @else {
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                          หมดอายุ
                        </span>
                      }
                    </td>
                    <td class="px-6 py-4 text-right font-mono font-bold text-slate-900">
                      ฿{{ link.totalBet | number }}
                    </td>
                    <td class="px-6 py-4 text-right">
                      <button (click)="deleteLink(link.id)" class="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 cursor-pointer" title="ลบลิงก์">
                        <mat-icon class="!w-5 !h-5 text-[20px]">delete</mat-icon>
                      </button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="4" class="px-6 py-8 text-center text-slate-400">ยังไม่มีลิงก์สะสม</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Notification: Copied feedback -->
    @if (copiedMessage()) {
      <div class="fixed bottom-6 right-6 bg-slate-900 text-white font-medium px-4 py-3 rounded-xl shadow-lg flex items-center z-50 animate-[fade-in_0.2s_ease]">
        <mat-icon class="mr-2 text-emerald-400">check_circle</mat-icon>
        <span>{{ copiedMessage() }}</span>
      </div>
    }
  `
})
export class LinksComponent implements OnInit {
  private api = inject(ApiService);

  links = signal<any[]>([]);
  copiedMessage = signal<string>('');

  form = {
    name: '',
    duration: 'ไม่มีวันหมดอายุ',
    usage: 'ใช้งานได้หลายครั้ง'
  };

  ngOnInit() {
    this.loadLinks();
  }

  loadLinks() {
    this.api.get<any[]>('links').subscribe({
      next: (data) => this.links.set(data),
      error: (err) => console.error(err)
    });
  }

  createLink(event: Event) {
    event.preventDefault();
    if (!this.form.name) return;

    this.api.post<any>('links', this.form).subscribe({
      next: () => {
        this.form.name = '';
        this.loadLinks();
      },
      error: (err) => console.error(err)
    });
  }

  getFullUrl(link: any): string {
    if (typeof window !== 'undefined') {
      const url = link.url;
      if (url.startsWith('http')) {
        const path = url.substring(url.indexOf('/bet/'));
        return window.location.origin + path;
      }
      return window.location.origin + url;
    }
    return link.url;
  }

  deleteLink(id: number) {
    this.api.delete<any>(`links/${id}`).subscribe({
      next: () => this.loadLinks(),
      error: (err) => console.error(err)
    });
  }

  copyToClipboard(url: string) {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        this.showCopiedToast('คัดลอกลิงก์สำเร็จ!');
      });
    }
  }

  showCopiedToast(msg: string) {
    this.copiedMessage.set(msg);
    setTimeout(() => {
      this.copiedMessage.set('');
    }, 2500);
  }
}
