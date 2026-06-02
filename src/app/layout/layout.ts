import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-slate-50 flex">
      <!-- Sidebar -->
      <aside class="w-64 bg-slate-900 text-slate-300 flex flex-col transition-all duration-300" [class.-ml-64]="!sidebarOpen()">
        <div class="h-16 flex items-center px-6 border-b border-slate-800">
          <div class="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mr-3">
            <mat-icon class="!w-5 !h-5 text-[20px]">casino</mat-icon>
          </div>
          <span class="text-white font-semibold tracking-wide text-lg">Lotto System</span>
        </div>
        
        <div class="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          @for (item of menuItems; track item.path) {
            <a 
              [routerLink]="item.path" 
              routerLinkActive="bg-emerald-500/10 text-emerald-400"
              class="flex items-center px-3 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white transition-colors group"
            >
              <mat-icon class="!w-5 !h-5 text-[20px] mr-3 opacity-70 group-hover:opacity-100" [class.text-emerald-400]="router.isActive(item.path, false)">{{ item.icon }}</mat-icon>
              <span class="font-medium text-sm">{{ item.label }}</span>
            </a>
          }
        </div>
        
        <div class="p-4 border-t border-slate-800">
          <div class="flex items-center px-3 py-2">
            <div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold mr-3 uppercase">
              {{ authService.currentUser()?.username?.charAt(0) || 'A' }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-white truncate">{{ authService.currentUser()?.username || 'Admin User' }}</p>
              <p class="text-xs text-slate-500 truncate uppercase">{{ authService.currentUser()?.role || 'Super Admin' }}</p>
            </div>
          </div>
          <button 
            (click)="logout()"
            class="mt-2 w-full flex items-center justify-center px-3 py-2 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <mat-icon class="!w-4 !h-4 text-[16px] mr-2">logout</mat-icon>
            ออกจากระบบ
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <!-- Header -->
        <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 z-10">
          <button 
            (click)="toggleSidebar()"
            class="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <mat-icon>{{ sidebarOpen() ? 'menu_open' : 'menu' }}</mat-icon>
          </button>
          
          <div class="flex items-center space-x-4">
            <div class="hidden sm:flex items-center text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
              <mat-icon class="!w-4 !h-4 text-[16px] mr-1.5 text-emerald-500">account_balance_wallet</mat-icon>
              เครดิต: <span class="text-slate-900 ml-1">{{ (authService.currentUser()?.balance || 1500000) | number }}</span>
            </div>
            <button class="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors relative">
              <mat-icon>notifications</mat-icon>
              <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        <!-- Page Content -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div class="max-w-7xl mx-auto">
            <router-outlet></router-outlet>
          </div>
        </div>
      </main>
    </div>
  `
})
export class LayoutComponent {
  router = inject(Router);
  authService = inject(AuthService);
  
  sidebarOpen = signal(true);

  menuItems = [
    { path: '/dashboard', label: 'ภาพรวมระบบ', icon: 'dashboard' },
    { path: '/betting', label: 'ระบบรับแทง', icon: 'edit_note' },
    { path: '/lotteries', label: 'จัดการหวย & งวด', icon: 'calendar_month' },
    { path: '/users', label: 'การจัดการผู้ใช้งาน', icon: 'group' },
    { path: '/links', label: 'ลิงก์รับแทง', icon: 'link' },
    { path: '/risk', label: 'ความเสี่ยง & เลขอั้น', icon: 'gpp_maybe' },
    { path: '/results', label: 'ผลรางวัล', icon: 'emoji_events' },
    { path: '/reports', label: 'รายงาน', icon: 'receipt_long' },
  ];

  toggleSidebar() {
    this.sidebarOpen.update(v => !v);
  }

  logout() {
    this.authService.logout();
  }
}
