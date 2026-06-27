/* eslint-disable */
import { ChangeDetectionStrategy, Component, inject, signal, OnInit, OnDestroy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../core/services/auth.service';
import { ApiService } from '../core/services/api.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-slate-50 flex relative">
      <!-- Backdrop for mobile -->
      @if (sidebarOpen()) {
        <button (click)="sidebarOpen.set(false)" class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 md:hidden w-full h-full border-0 cursor-default" aria-label="Close sidebar"></button>
      }

      <!-- Sidebar -->
      <aside class="fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 md:static md:translate-x-0" 
             [class.translate-x-0]="sidebarOpen()" 
             [class.-translate-x-full]="!sidebarOpen()">
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
              (click)="closeSidebarOnMobile()"
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
            
            <div class="relative">
              <button 
                (click)="notificationsDropdownOpen.set(!notificationsDropdownOpen())"
                class="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors relative cursor-pointer flex items-center justify-center"
                aria-label="Toggle notifications dropdown"
              >
                <mat-icon>notifications</mat-icon>
                @if (unreadCount() > 0) {
                  <span class="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border border-white animate-pulse">
                    {{ unreadCount() }}
                  </span>
                }
              </button>

              <!-- Notifications Dropdown -->
              @if (notificationsDropdownOpen()) {
                <div class="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 divide-y divide-slate-200 animate-[fade-in_0.2s_ease]">
                  <div class="p-4 flex items-center justify-between">
                    <h3 class="text-sm font-bold text-slate-900">การแจ้งเตือนล่าสุด</h3>
                    @if (unreadCount() > 0) {
                      <button (click)="markAllAsRead()" class="text-xs text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer">
                        อ่านทั้งหมด
                      </button>
                    }
                  </div>
                  
                  <div class="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    @for (n of notifications(); track n.id) {
                      <div class="p-4 flex items-start space-x-3 hover:bg-slate-50 transition-colors" [class.bg-slate-50/50]="!n.read">
                        <div class="w-2 h-2 rounded-full mt-1.5 shrink-0" [class]="n.read ? 'bg-slate-300' : 'bg-red-500'"></div>
                        <div class="flex-1 min-w-0">
                          <p class="text-xs font-bold text-slate-900">{{ n.title }}</p>
                          <p class="text-xs text-slate-600 mt-0.5 whitespace-normal break-words">{{ n.message }}</p>
                          <p class="text-[10px] text-slate-400 mt-1">{{ n.time }}</p>
                        </div>
                      </div>
                    } @empty {
                      <div class="p-6 text-center text-slate-400 text-xs">
                        ยังไม่มีการแจ้งเตือนในระบบ
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
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
export class LayoutComponent implements OnInit, OnDestroy {
  router = inject(Router);
  authService = inject(AuthService);
  api = inject(ApiService);
  
  sidebarOpen = signal(false);
  notifications = signal<any[]>([]);
  unreadCount = computed(() => this.notifications().filter(n => !n.read).length);
  notificationsDropdownOpen = signal<boolean>(false);
  private pollInterval: any;

  constructor() {
    if (typeof window !== 'undefined') {
      this.sidebarOpen.set(window.innerWidth >= 768);
    }
  }

  ngOnInit() {
    this.loadNotifications();
    if (typeof window !== 'undefined') {
      this.pollInterval = setInterval(() => {
        this.loadNotifications();
      }, 5000);
    }
  }

  ngOnDestroy() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  }

  loadNotifications() {
    this.api.get<any[]>('notifications').subscribe({
      next: (data) => this.notifications.set(data),
      error: (err) => console.error('Error fetching notifications:', err)
    });
  }

  markAllAsRead() {
    this.api.post<any>('notifications/read-all', {}).subscribe({
      next: () => {
        this.loadNotifications();
      }
    });
  }

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

  closeSidebarOnMobile() {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      this.sidebarOpen.set(false);
    }
  }

  logout() {
    this.authService.logout();
  }
}
