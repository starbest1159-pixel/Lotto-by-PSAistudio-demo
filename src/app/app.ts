import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Notifier, Toast } from './core/services/notifier';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [RouterOutlet, MatIconModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private notifier = inject(Notifier);
  readonly toasts = this.notifier.toasts;

  getToastClass(type: Toast['type']): string {
    switch (type) {
      case 'success':
        return 'bg-white border-slate-100 shadow-xl border-l-[6px] border-l-emerald-500';
      case 'error':
        return 'bg-white border-slate-100 shadow-xl border-l-[6px] border-l-rose-500';
      case 'warning':
        return 'bg-white border-slate-100 shadow-xl border-l-[6px] border-l-amber-500';
      case 'info':
        return 'bg-white border-slate-100 shadow-xl border-l-[6px] border-l-slate-700';
    }
  }

  getIconClass(type: Toast['type']): string {
    switch (type) {
      case 'success':
        return 'text-emerald-500 bg-emerald-50 p-1.5 rounded-xl !w-8 !h-8 flex items-center justify-center text-[20px]';
      case 'error':
        return 'text-rose-500 bg-rose-50 p-1.5 rounded-xl !w-8 !h-8 flex items-center justify-center text-[20px]';
      case 'warning':
        return 'text-amber-500 bg-amber-50 p-1.5 rounded-xl !w-8 !h-8 flex items-center justify-center text-[20px]';
      case 'info':
        return 'text-slate-600 bg-slate-50 p-1.5 rounded-xl !w-8 !h-8 flex items-center justify-center text-[20px]';
    }
  }

  getIconName(type: Toast['type']): string {
    switch (type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info_outline';
    }
  }

  dismiss(id: string): void {
    this.notifier.dismiss(id);
  }
}
