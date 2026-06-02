import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';

export const AuthGuard: CanActivateFn = () => {
  const router = inject(Router);
  
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    
    if (token) {
      return true;
    }
    
    return router.createUrlTree(['/login']);
  }
  
  return true;
};
