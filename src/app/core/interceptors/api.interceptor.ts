import { HttpInterceptorFn, HttpErrorResponse, HttpXsrfTokenExtractor } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const tokenExtractor = inject(HttpXsrfTokenExtractor);
  
  const token = authService.getToken();

  const isAuthEndpoint = req.url.includes('/auth/login') || 
                          req.url.includes('/auth/refresh');

  let headers = req.headers;
  let url = req.url;

  if (typeof window === 'undefined') {
    const isRelative = !url.startsWith('http://') && !url.startsWith('https://');
    if (isRelative && (url.includes('/api/') || url.includes('api/'))) {
      const slash = url.startsWith('/') ? '' : '/';
      const port = process.env['PORT'] || 3000;
      url = `http://127.0.0.1:${port}${slash}${url}`;
    }
  }

  if (token && !isAuthEndpoint) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!headers.has('Content-Type')) {
    headers = headers.set('Content-Type', 'application/json');
  }

  // CSRF Protection for state-changing methods
  const stateChangingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  if (stateChangingMethods.includes(req.method.toUpperCase())) {
    const csrfToken = tokenExtractor.getToken();
    if (csrfToken !== null && !headers.has('X-XSRF-TOKEN')) {
      headers = headers.set('X-XSRF-TOKEN', csrfToken);
    }
  }

  req = req.clone({ headers, url });

  return next(req);
};

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {

      switch (error.status) {
        case 401:
          if (!req.url.includes('/auth/')) {
            return authService.refreshToken().pipe(
              switchMap(newTokens => {
                const retryReq = req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${newTokens.access_token}`
                  }
                });
                return next(retryReq);
              }),
              catchError(refreshError => {
                console.warn('🔒 เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่');
                authService.logout();
                return throwError(() => refreshError);
              })
            );
          }
          break;

        case 403:
          console.error('🚫 คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้');
          router.navigate(['/login']);
          break;

        case 404:
          console.error('🔍 ไม่พบข้อมูลที่ร้องขอ');
          break;

        case 429:
          console.error('⏳ คำขอมากเกินไป กรุณารอสักครู่');
          break;

        case 500:
        case 502:
        case 503:
          console.error('💥 เซิร์ฟเวอร์มีปัญหา กรุณาลองใหม่ภายหลัง');
          break;

        case 0:
          console.error('🌐 ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ ตรวจสอบอินเทอร์เน็ต');
          break;
      }

      return throwError(() => error);
    })
  );
};
