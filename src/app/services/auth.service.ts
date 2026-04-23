import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { AnyUser, LoginRequest, RegisterRequest, AuthResponse } from '../models';

const API = 'http://localhost:8080/api';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<AnyUser | null>(this.loadUser());
  private _token = signal<string | null>(localStorage.getItem('token'));

  readonly user = this._user.asReadonly();
  readonly token = this._token.asReadonly();
  readonly isLoggedIn = computed(() => !!this._user());
  readonly isAdmin = computed(() => this._user()?.role === 'ADMIN');
  readonly isOrganisateur = computed(() => this._user()?.role === 'ORGANISATEUR');
  readonly isUtilisateur = computed(() => this._user()?.role === 'UTILISATEUR');

  constructor(private http: HttpClient, private router: Router) {}

  login(req: LoginRequest): Observable<AuthResponse> {
    // En attendant le vrai backend, on simule
    return this.simulateLogin(req);
  }

  register(req: RegisterRequest): Observable<AuthResponse> {
    return this.simulateRegister(req);
  }

  logout() {
    this._user.set(null);
    this._token.set(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  private saveSession(resp: AuthResponse) {
    this._user.set(resp.user);
    this._token.set(resp.token);
    localStorage.setItem('token', resp.token);
    localStorage.setItem('user', JSON.stringify(resp.user));
  }

  private loadUser(): AnyUser | null {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  }

  // ── Simulation backend (à remplacer par vrais appels HTTP) ──────
  private simulateLogin(req: LoginRequest): Observable<AuthResponse> {
    const users: AnyUser[] = [
      { id: 1, nom: 'Admin', prenom: 'System', username: 'admin', role: 'ADMIN' },
      { id: 2, nom: 'Martin', prenom: 'Sophie', username: 'sophie', role: 'UTILISATEUR', nbreTicket: 2 },
      { id: 3, nom: 'Dupont', prenom: 'Jean', username: 'jean', role: 'ORGANISATEUR' },
    ];
    const found = users.find(u => u.username === req.username);
    if (!found) throw new Error('Utilisateur introuvable');
    const resp: AuthResponse = { token: 'fake-jwt-' + Date.now(), user: found };
    this.saveSession(resp);
    return of(resp);
  }

  private simulateRegister(req: RegisterRequest): Observable<AuthResponse> {
    const newUser: AnyUser = req.role === 'ORGANISATEUR'
      ? { id: Date.now(), nom: req.nom, prenom: req.prenom, username: req.username, role: 'ORGANISATEUR' }
      : { id: Date.now(), nom: req.nom, prenom: req.prenom, username: req.username, role: 'UTILISATEUR', nbreTicket: 0 };
    const resp: AuthResponse = { token: 'fake-jwt-' + Date.now(), user: newUser };
    this.saveSession(resp);
    return of(resp);
  }
}
