import { Routes } from '@angular/router';
import { authGuard, adminGuard, organisateurGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
  { path: 'tickets', loadComponent: () => import('./pages/tickets/tickets.component').then(m => m.TicketsComponent), canActivate: [authGuard] },
  { path: 'organisateur', loadComponent: () => import('./pages/organisateur/organisateur.component').then(m => m.OrganisateurComponent), canActivate: [organisateurGuard] },
  { path: 'admin', loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent), canActivate: [adminGuard] },
  { path: 'artistes', loadComponent: () => import('./pages/artiste-detail/artiste-detail.component').then(m => m.ArtisteDetailComponent) },
  { path: 'evenement/:id', loadComponent: () => import('./pages/event-detail/event-detail.component').then(m => m.EventDetailComponent) },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent), canActivate: [guestGuard] },
  { path: 'register', loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent), canActivate: [guestGuard] },
  { path: '**', redirectTo: '' },
];
