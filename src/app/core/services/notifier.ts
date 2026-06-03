import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  technical?: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class Notifier {
  private toastsSignal = signal<Toast[]>([]);
  readonly toasts = this.toastsSignal.asReadonly();

  show(toast: Omit<Toast, 'id'>): string {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { ...toast, id };
    
    this.toastsSignal.update((current) => [...current, newToast]);

    const duration = toast.duration ?? (toast.type === 'error' ? 8000 : 4000);
    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }

    return id;
  }

  showSuccess(message: string, title?: string): string {
    return this.show({
      type: 'success',
      title: title || 'สำเร็จ',
      message
    });
  }

  showError(message: string, title?: string, technical?: string): string {
    return this.show({
      type: 'error',
      title: title || 'เกิดข้อผิดพลาด',
      message,
      technical
    });
  }

  showWarning(message: string, title?: string): string {
    return this.show({
      type: 'warning',
      title: title || 'คำเตือน',
      message
    });
  }

  showInfo(message: string, title?: string): string {
    return this.show({
      type: 'info',
      title: title || 'แจ้งเตือน',
      message
    });
  }

  dismiss(id: string): void {
    this.toastsSignal.update((current) => current.filter((t) => t.id !== id));
  }

  clearAll(): void {
    this.toastsSignal.set([]);
  }
}
