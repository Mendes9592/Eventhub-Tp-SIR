import { Injectable, signal, computed, inject } from "@angular/core";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

import {
  AnyUser,
  Utilisateur,
  Organisateur,
  RegisterRequest,
  AuthResponse,
} from "app/models";

import { ApiService } from "services/api.service";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private api = inject(ApiService);
  private router = inject(Router);

  private _user = signal<AnyUser | null>(this.loadUser());
  private _token = signal<string | null>(localStorage.getItem("token"));

  readonly user = this._user.asReadonly();
  readonly token = this._token.asReadonly();

  readonly isLoggedIn = computed(() => !!this._user());

  readonly isAdmin = computed(() => (this._user() as any)?.role === "ADMIN");

  readonly isOrganisateur = computed(
    () => (this._user() as any)?.role === "ORGANISATEUR",
  );

  readonly isUtilisateur = computed(
    () => (this._user() as any)?.role === "UTILISATEUR",
  );

  // =========================
  // LOGIN
  // =========================

  login(req: { username: string; password: string }): Observable<AuthResponse> {
    return this.api
      .post<AuthResponse>("auth/login", {
        email: req.username,
        password: req.password,
      })
      .pipe(
        tap((response) => {
          this.saveSession(response);
        }),
      );
  }

  // =========================
  // REGISTER UTILISATEUR
  // =========================

  registerUtilisateur(req: RegisterRequest): Observable<Utilisateur> {
    const payload: Partial<Utilisateur> = {
      nom: req.nom,
      prenom: req.prenom,
      email: req.username,
      password: req.password,
      dateInscription: new Date().toISOString().slice(0, 10),
      role: "UTILISATEUR",
    };

    return this.api.post<Utilisateur>("utilisateurs", payload).pipe(
      tap((user: any) => {
        const u = {
          ...user,
          role: "UTILISATEUR",
        };

        this.saveSession({
          token: "registered-" + Date.now(),
          user: u,
        });
      }),
    );
  }

  // =========================
  // REGISTER ORGANISATEUR
  // =========================

  registerOrganisateur(req: RegisterRequest): Observable<Organisateur> {
    const payload: Partial<Organisateur> = {
      nom: req.nom,
      prenom: req.prenom,
      email: req.username,
      password: req.password,
      nomStructure: `Structure de ${req.nom}`,
      role: "ORGANISATEUR",
    };

    return this.api.post<Organisateur>("organisateurs", payload).pipe(
      tap((user: any) => {
        const u = {
          ...user,
          role: "ORGANISATEUR",
        };

        this.saveSession({
          token: "registered-" + Date.now(),
          user: u,
        });
      }),
    );
  }

  // =========================
  // REGISTER GLOBAL
  // =========================

  register(req: RegisterRequest): Observable<any> {
    return req.role === "ORGANISATEUR"
      ? this.registerOrganisateur(req)
      : this.registerUtilisateur(req);
  }

  // =========================
  // LOGOUT
  // =========================

  logout() {
    this._user.set(null);
    this._token.set(null);

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    this.router.navigate(["/login"]);
  }

  // =========================
  // SESSION
  // =========================

  private saveSession(resp: AuthResponse) {
    this._user.set(resp.user);
    this._token.set(resp.token);

    localStorage.setItem("token", resp.token);

    localStorage.setItem("user", JSON.stringify(resp.user));
  }

  private loadUser(): AnyUser | null {
    try {
      return JSON.parse(localStorage.getItem("user") ?? "null");
    } catch {
      return null;
    }
  }
}
