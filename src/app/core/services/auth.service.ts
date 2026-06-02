import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, User } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private baseUrl = environment.apiUrl;

  private currentUserSignal = signal<User | null>(null);
  
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isLoggedIn = computed(() => !!this.currentUserSignal());
  readonly isAdmin = computed(() => this.currentUserSignal()?.role === 'admin');

  constructor() {
    this.loadUserFromStorage();
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, {
      username,
      password
    }).pipe(
      tap(response => {
        this.saveTokens(response);
        this.currentUserSignal.set(response.user);
        console.log('✅ เข้าสู่ระบบสำเร็จ');
      }),
      catchError(error => {
        console.error('❌ เข้าสู่ระบบล้มเหลว:', error.error?.message || error.message);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
    }
    this.currentUserSignal.set(null);
    
    this.router.navigate(['/login']);
    console.log('👋 ออกจากระบบแล้ว');
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refresh_token');
    }
    return null;
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/refresh`, {
      refresh_token: refreshToken
    }).pipe(
      tap(response => {
        this.saveTokens(response);
        console.log('🔄 ต่ออายุ Token สำเร็จ');
      })
    );
  }

  private saveTokens(response: AuthResponse): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      localStorage.setItem('user_data', JSON.stringify(response.user));
    }
  }

  private loadUserFromStorage(): void {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user_data');
      const token = this.getToken();
      
      if (userData && token) {
        try {
          const user: User = JSON.parse(userData);
          this.currentUserSignal.set(user);
        } catch {
          this.logout();
        }
      }
    }
  }
}
