import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div class="max-w-md w-full bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-700">
        <div class="p-8">
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mb-4">
              <mat-icon class="!w-8 !h-8 text-[32px]">security</mat-icon>
            </div>
            <h1 class="text-2xl font-bold text-white tracking-tight">Autistic Lotto</h1>
            <p class="text-slate-400 mt-2">เข้าสู่ระบบเพื่อจัดการระบบ</p>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <div>
              <label for="username" class="block text-sm font-medium text-slate-300 mb-2">ชื่อผู้ใช้งาน</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <mat-icon class="text-slate-500 !w-5 !h-5 text-[20px]">person</mat-icon>
                </div>
                <input 
                  id="username"
                  type="text" 
                  formControlName="username"
                  class="block w-full pl-10 pr-3 py-3 border border-slate-600 rounded-xl bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="admin"
                >
              </div>
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-slate-300 mb-2">รหัสผ่าน</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <mat-icon class="text-slate-500 !w-5 !h-5 text-[20px]">lock</mat-icon>
                </div>
                <input 
                  id="password"
                  [type]="showPassword() ? 'text' : 'password'" 
                  formControlName="password"
                  class="block w-full pl-10 pr-10 py-3 border border-slate-600 rounded-xl bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                >
                <button 
                  type="button" 
                  (click)="togglePassword()"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <mat-icon class="!w-5 !h-5 text-[20px]">{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
              </div>
            </div>

            @if (error()) {
              <div class="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                {{ error() }}
              </div>
            }

            <button 
              type="submit" 
              [disabled]="loginForm.invalid || loading()"
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              @if (loading()) {
                <mat-icon class="animate-spin !w-5 !h-5 text-[20px] mr-2">refresh</mat-icon>
                กำลังเข้าสู่ระบบ...
              } @else {
                เข้าสู่ระบบ
              }
            </button>
          </form>
          
          <div class="mt-6 text-center text-xs text-slate-500">
            <p>สำหรับทดสอบ: Username: <span class="text-slate-300 font-mono">admin</span> / Password: <span class="text-slate-300 font-mono">demo</span></p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  loginForm = this.fb.group({
    username: ['admin', Validators.required],
    password: ['demo', Validators.required]
  });

  showPassword = signal(false);
  loading = signal(false);
  error = signal('');

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading.set(true);
    this.error.set('');

    const { username, password } = this.loginForm.value;
    const safeUsername = username?.toLowerCase() || '';

    // Check lockout status
    const lockoutKey = `lockout_${safeUsername}`;
    const attemptsKey = `attempts_${safeUsername}`;
    
    if (typeof window !== 'undefined') {
      const lockoutUntil = localStorage.getItem(lockoutKey);
      if (lockoutUntil) {
        const until = parseInt(lockoutUntil, 10);
        if (Date.now() < until) {
          const remainingMinutes = Math.ceil((until - Date.now()) / 60000);
          this.error.set(`บัญชีถูกระงับชั่วคราวเนื่องจากเข้าสู่ระบบผิดพลาดหลายครั้ง กรุณาลองใหม่ในอีก ${remainingMinutes} นาที`);
          this.loading.set(false);
          return;
        } else {
          // Lockout expired
          localStorage.removeItem(lockoutKey);
          localStorage.removeItem(attemptsKey);
        }
      }
    }

    this.authService.login(username!, password!).subscribe({
      next: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(lockoutKey);
          localStorage.removeItem(attemptsKey);
        }
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Login error:', err);
        if (typeof window !== 'undefined') {
          let attempts = parseInt(localStorage.getItem(attemptsKey) || '0', 10);
          attempts++;
          
          if (attempts >= 5) {
            const lockTime = Date.now() + 5 * 60 * 1000; // 5 minutes
            localStorage.setItem(lockoutKey, lockTime.toString());
            this.error.set(`บัญชีถูกระงับชั่วคราวเนื่องจากเข้าสู่ระบบผิดพลาด 5 ครั้ง กรุณาลองใหม่ในอีก 5 นาที`);
          } else {
            localStorage.setItem(attemptsKey, attempts.toString());
            this.error.set(`ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง (เหลือโอกาสอีก ${5 - attempts} ครั้ง)`);
          }
        } else {
          this.error.set('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
        }
        this.loading.set(false);
      }
    });
  }
}
