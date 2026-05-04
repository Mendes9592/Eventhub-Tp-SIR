import { Injectable, signal, computed, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Ticket, Evenement } from '../models';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private api  = inject(ApiService);
  private auth = inject(AuthService);

  private _tickets = signal<Ticket[]>([]);
  readonly tickets      = this._tickets.asReadonly();
  readonly validTickets = computed(() => this._tickets().filter(t => t.statut === 'VALIDE'));
  readonly usedTickets  = computed(() => this._tickets().filter(t => t.statut !== 'VALIDE'));

  // ── Charger les tickets de l'utilisateur connecté ──────────────
  loadMyTickets(): Observable<Ticket[]> {
    const userId = this.auth.user()?.id;
    if (!userId) return new Observable();
    return this.api.get<Ticket[]>(`tickets/utilisateur/${userId}`).pipe(
      tap(data => this._tickets.set(data))
    );
  }

  // ── Acheter un ticket (POST /tickets) ──────────────────────────
  acheterTicket(evenement: Evenement, quantite = 1): Observable<Ticket> {
    const payload = {
      evenement: { id: evenement.id },
      utilisateur: { idPersonne: this.auth.user()?.id },
      numeroTicket: Math.floor(Math.random() * 90000) + 10000,
      statut: 'VALIDE',
    };
    return this.api.post<Ticket>('tickets', payload).pipe(
      tap(ticket => this._tickets.update(t => [ticket, ...t]))
    );
  }

  // ── Annuler (PUT /tickets/{id}) ────────────────────────────────
  annulerTicket(idTicket: number): Observable<Ticket> {
    return this.api.put<Ticket>(`tickets/${idTicket}`, { statut: 'ANNULE' }).pipe(
      tap(updated => this._tickets.update(list =>
        list.map(t => t.idTicket === idTicket ? updated : t)
      ))
    );
  }

  // ── Places restantes ───────────────────────────────────────────
  getPlacesRestantes(eventId: number): Observable<{ places_restantes: number }> {
    return this.api.get(`tickets/places-restantes/${eventId}`);
  }

  hasTicketForEvent(eventId: number): boolean {
    return this._tickets().some(t => t.evenement?.id === eventId && t.statut === 'VALIDE');
  }

  // ── Fallback mock ──────────────────────────────────────────────
  loadMock() {
    this._tickets.set([
      { idTicket:1, numeroTicket:892,  statut:'VALIDE',  evenement:{ id:2, nom:'Soirée Jazz au Sunset', date:'2026-04-20', heure:'21:00', lieu:'Le Sunset', prix:22, categorie:'jazz', imageUrl:'assets/images/events/jazz.jpg' }, utilisateur:{id:2,nom:'Martin',prenom:'Sophie',username:'sophie',role:'UTILISATEUR',nbreTicket:2} },
      { idTicket:2, numeroTicket:1123, statut:'VALIDE',  evenement:{ id:6, nom:'MC Flow - Hip-Hop Night', date:'2026-04-18', heure:'21:00', lieu:'La Cigale', prix:28, categorie:'hiphop', imageUrl:'assets/images/events/hiphop.jpg' }, utilisateur:{id:2,nom:'Martin',prenom:'Sophie',username:'sophie',role:'UTILISATEUR',nbreTicket:2} },
      { idTicket:3, numeroTicket:4471, statut:'UTILISE', evenement:{ id:99, nom:'New Year Rave 2026', date:'2025-12-31', heure:'22:00', lieu:'Warehouse Paris', prix:30, categorie:'electronique', imageUrl:'assets/images/events/electronique.jpg' }, utilisateur:{id:2,nom:'Martin',prenom:'Sophie',username:'sophie',role:'UTILISATEUR',nbreTicket:2} },
    ]);
  }
}
