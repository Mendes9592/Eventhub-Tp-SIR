import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AnyUser, Utilisateur, Organisateur, RegisterRequest, AuthResponse } from '../models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api    = inject(ApiService);
  private http   = inject(HttpClient);
  private router = inject(Router);

  private _user  = signal<AnyUser | null>(this.loadUser());
  private _token = signal<string | null>(localStorage.getItem('token'));

  readonly user       = this._user.asReadonly();
  readonly token      = this._token.asReadonly();
  readonly isLoggedIn     = computed(() => !!this._user());
  readonly isAdmin        = computed(() => this._user()?.role === 'ADMIN');
  readonly isOrganisateur = computed(() => this._user()?.role === 'ORGANISATEUR');
  readonly isUtilisateur  = computed(() => this._user()?.role === 'UTILISATEUR');

  // ── Connexion : cherche l'utilisateur par email/username ────────
  login(req: { username: string; password: string }): Observable<AuthResponse> {
    // Le backend n'a pas d'endpoint /login → on cherche par email
    return this.http.get<Utilisateur[]>(
      `${this.api.BASE_URL}/utilisateurs/by-email/${req.username}`
    ).pipe(
      tap((user: any) => {
        // user peut être un tableau ou un objet
        const u: AnyUser = Array.isArray(user) ? user[0] : user;
        if (!u) throw new Error('Utilisateur introuvable');
        const resp: AuthResponse = { token: 'token-' + Date.now(), user: u };
        this.saveSession(resp);
      }),
      catchError(() => {
        // Fallback : simulation si backend offline
        return of(this.simulateLogin(req));
      })
    ) as Observable<AuthResponse>;
  }

  // ── Inscription : POST /utilisateurs ou POST /organisateurs ─────
  register(req: RegisterRequest): Observable<AuthResponse> {
    const endpoint = req.role === 'ORGANISATEUR' ? 'organisateurs' : 'utilisateurs';
    const payload  = { nom: req.nom, prenom: req.prenom, email: req.username, motDePasse: req.password };

    return this.api.post<AnyUser>(endpoint, payload).pipe(
      tap((user: AnyUser) => {
        const resp: AuthResponse = { token: 'token-' + Date.now(), user };
        this.saveSession(resp);
      }),
      catchError(() => of(this.simulateRegister(req)))
    ) as Observable<AuthResponse>;
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
    try { return JSON.parse(localStorage.getItem('user') ?? 'null'); }
    catch { return null; }
  }

  // ── Simulations (fallback backend offline) ──────────────────────
  private simulateLogin(req: { username: string }): AuthResponse {
    const map: Record<string, AnyUser> = {
      'admin':  { id:1, nom:'Admin',  prenom:'System', username:'admin',  role:'ADMIN' } as any,
      'sophie': { id:2, nom:'Martin', prenom:'Sophie', username:'sophie', role:'UTILISATEUR', nbreTicket:2 } as Utilisateur,
      'jean':   { id:3, nom:'Dupont', prenom:'Jean',   username:'jean',   role:'ORGANISATEUR' } as Organisateur,
    };
    const user = map[req.username] ?? map['sophie'];
    const resp: AuthResponse = { token: 'mock-' + Date.now(), user };
    this.saveSession(resp);
    return resp;
  }

  private simulateRegister(req: RegisterRequest): AuthResponse {
    const user: AnyUser = req.role === 'ORGANISATEUR'
      ? { id: Date.now(), nom: req.nom, prenom: req.prenom, username: req.username, role: 'ORGANISATEUR' } as Organisateur
      : { id: Date.now(), nom: req.nom, prenom: req.prenom, username: req.username, role: 'UTILISATEUR', nbreTicket: 0 } as Utilisateur;
    const resp: AuthResponse = { token: 'mock-' + Date.now(), user };
    this.saveSession(resp);
    return resp;
  }
}
