import { HttpInterceptorFn, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

// Mock interceptor to simulate backend responses for the demo
export const mockInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.endsWith('/auth/login') && req.method === 'POST') {
    const body = req.body as any;
    if (body.username === 'admin' && body.password === 'demo') {
      return of(new HttpResponse({
        status: 200,
        body: {
          access_token: 'mock-jwt-token-123',
          refresh_token: 'mock-refresh-token-456',
          user: {
            id: '1',
            username: 'admin',
            email: 'admin@lotto.com',
            role: 'admin',
            balance: 1500000,
            createdAt: new Date().toISOString()
          },
          expiresIn: 3600
        }
      })).pipe(delay(800));
    } else {
      return throwError(() => new HttpErrorResponse({
        status: 401,
        error: { message: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง' }
      })).pipe(delay(800));
    }
  }
  
  if (req.url.endsWith('/auth/refresh') && req.method === 'POST') {
    return of(new HttpResponse({
      status: 200,
      body: {
        access_token: 'mock-jwt-token-new-123',
        refresh_token: 'mock-refresh-token-new-456',
        user: {
          id: '1',
          username: 'admin',
          email: 'admin@lotto.com',
          role: 'admin',
          balance: 1500000,
          createdAt: new Date().toISOString()
        },
        expiresIn: 3600
      }
    })).pipe(delay(500));
  }

  return next(req);
};
