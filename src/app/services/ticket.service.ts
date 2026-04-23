import { Injectable, signal, computed, inject } from '@angular/core';
import { Ticket, Evenement } from '../models';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private authService = inject(AuthService);

  private _tickets = signal<Ticket[]>([
    { idTicket:1, numeroTicket:892, statut:'VALIDE', evenement:{ id:2, nom:'Soirée Jazz au Sunset', date:'2026-04-20', heure:'21:00', lieu:'Le Sunset', prix:22, categorie:'jazz', imageUrl:'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400&q=80' }, utilisateur:{ id:2, nom:'Martin', prenom:'Sophie', username:'sophie', role:'UTILISATEUR', nbreTicket:2 } },
    { idTicket:2, numeroTicket:1123, statut:'VALIDE', evenement:{ id:6, nom:'MC Flow - Hip-Hop Night', date:'2026-04-18', heure:'21:00', lieu:'La Cigale', prix:28, categorie:'hiphop', imageUrl:'https://images.unsplash.com/photo-1571266028243-d220c6a5d84c?w=400&q=80' }, utilisateur:{ id:2, nom:'Martin', prenom:'Sophie', username:'sophie', role:'UTILISATEUR', nbreTicket:2 } },
    { idTicket:3, numeroTicket:4471, statut:'UTILISE', evenement:{ id:99, nom:'New Year Rave 2026', date:'2025-12-31', heure:'22:00', lieu:'Warehouse Paris', prix:30, categorie:'electronique', imageUrl:'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=400&q=80' }, utilisateur:{ id:2, nom:'Martin', prenom:'Sophie', username:'sophie', role:'UTILISATEUR', nbreTicket:2 } },
  ]);

  readonly tickets = this._tickets.asReadonly();
  readonly validTickets = computed(() => this._tickets().filter(t => t.statut === 'VALIDE'));
  readonly usedTickets = computed(() => this._tickets().filter(t => t.statut !== 'VALIDE'));

  acheterTicket(evenement: Evenement, quantite = 1): Ticket[] {
    const newTickets: Ticket[] = Array.from({ length: quantite }, (_, i) => ({
      idTicket: Date.now() + i,
      numeroTicket: Math.floor(Math.random() * 90000) + 10000,
      statut: 'VALIDE' as const,
      evenement,
      utilisateur: this.authService.user() as any,
    }));
    this._tickets.update(t => [...newTickets, ...t]);
    return newTickets;
  }

  annulerTicket(idTicket: number) {
    this._tickets.update(list =>
      list.map(t => t.idTicket === idTicket ? { ...t, statut: 'ANNULE' as const } : t)
    );
  }

  hasTicketForEvent(eventId: number): boolean {
    return this._tickets().some(t => t.evenement?.id === eventId && t.statut === 'VALIDE');
  }
}
