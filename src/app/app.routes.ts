import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'bet/:linkId',
    loadComponent: () => import('./public-bet/public-bet').then(m => m.PublicBetComponent)
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./login/login').then(m => m.LoginComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/layout').then(m => m.LayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard').then(m => m.DashboardComponent) },
      { path: 'users', loadComponent: () => import('./users/users').then(m => m.UsersComponent) },
      { path: 'lotteries', loadComponent: () => import('./lotteries/lotteries').then(m => m.LotteriesComponent) },
      { path: 'betting', loadComponent: () => import('./betting/betting').then(m => m.BettingComponent) },
      { path: 'links', loadComponent: () => import('./links/links').then(m => m.LinksComponent) },
      { path: 'risk', loadComponent: () => import('./risk/risk').then(m => m.RiskComponent) },
      { path: 'results', loadComponent: () => import('./results/results').then(m => m.ResultsComponent) },
      { path: 'reports', loadComponent: () => import('./reports/reports').then(m => m.ReportsComponent) },
    ]
  }
];
