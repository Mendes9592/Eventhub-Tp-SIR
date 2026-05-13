import { Injectable, signal, computed, inject } from "@angular/core";
import { Observable, tap, forkJoin } from "rxjs";

import { Ticket, Evenement } from "../models";
import { ApiService } from "./api.service";
import { AuthService } from "./auth.service";
import jsPDF from "jspdf";
@Injectable({ providedIn: "root" })
export class TicketService {
  // Services nécessaires aux appels API et à l'utilisateur connecté
  private api = inject(ApiService);
  private auth = inject(AuthService);

  // État local des tickets chargés
  private _tickets = signal<Ticket[]>([]);

  readonly tickets = this._tickets.asReadonly();

  readonly validTickets = computed(() =>
    this._tickets().filter((t) => t.statut === "ACHETE"),
  );

  readonly usedTickets = computed(() =>
    this._tickets().filter((t) => t.statut !== "ACHETE"),
  );

  /**
   * Charge les tickets de l'utilisateur connecté.
   * Endpoint backend : GET /tickets/utilisateur/{id}
   */
  loadMyTickets(): Observable<Ticket[]> {
    const userId = this.auth.user()?.idPersonne;

    if (!userId) {
      return new Observable<Ticket[]>((sub) => sub.complete());
    }

    return this.api
      .get<Ticket[]>(`tickets/utilisateur/${userId}`)
      .pipe(tap((data) => this._tickets.set(data ?? [])));
  }

  /**
   * Crée un ou plusieurs tickets pour l'événement sélectionné.
   * Le backend attend les IDs de l'événement et de l'utilisateur.
   */
  /**
   * Crée un ou plusieurs tickets pour l'événement sélectionné.
   * Le backend attend les IDs de l'événement et de l'utilisateur.
   */
  acheterTicket(
    evenement: Evenement,
    quantite: number = 1,
  ): Observable<Ticket[]> {
    const user = this.auth.user();
    const eventId = evenement.idEvenement ?? evenement.id;

    if (!user?.idPersonne) {
      throw new Error("Utilisateur non connecté");
    }

    if (!eventId) {
      throw new Error("Événement introuvable");
    }

    const requests: Observable<Ticket>[] = [];

    for (let i = 0; i < quantite; i++) {
      const payload = {
        numeroPlace: `T-${Date.now()}-${i}`,
        statut: "ACHETE",
        prixUnitaire: evenement.prix ?? 0,
        dateAchat: new Date().toISOString().slice(0, 19),

        evenement: {
          idEvenement: eventId,
        },

        utilisateur: {
          idPersonne: user.idPersonne,
        },
      };

      requests.push(this.api.post<Ticket>("tickets", payload));
    }

    return forkJoin(requests).pipe(
      tap((tickets) => {
        this._tickets.update((list) => [...tickets, ...list]);
      }),
    );
  }

  /**
   * Annule un ticket existant.
   * Endpoint backend : PUT /tickets/{id}
   */
  annulerTicket(idTicket: number): Observable<Ticket> {
    const payload = {
      statut: "ANNULE",
      dateAnnulation: new Date().toISOString().slice(0, 19),
    };

    return this.api.put<Ticket>(`tickets/${idTicket}`, payload).pipe(
      tap((updated) => {
        this._tickets.update((list) =>
          list.map((t) => (t.idTicket === idTicket ? { ...t, ...updated } : t)),
        );
      }),
    );
  }

  /**
   * Récupère le nombre de places restantes pour un événement.
   */
  getPlacesRestantes(
    eventId: number,
  ): Observable<{ places_restantes: number }> {
    return this.api.get<{ places_restantes: number }>(
      `tickets/places-restantes/${eventId}`,
    );
  }

  /**
   * Récupère tous les tickets liés à un événement.
   */
  getByEvenement(eventId: number): Observable<Ticket[]> {
    return this.api.get<Ticket[]>(`tickets/evenement/${eventId}`);
  }

  /**
   * Vérifie si l'utilisateur possède déjà un ticket valide pour un événement.
   */
  hasTicketForEvent(eventId?: number): boolean {
    if (!eventId) return false;

    return this._tickets().some(
      (t) => t.evenement?.idEvenement === eventId && t.statut === "ACHETE",
    );
  }

  /**
   * Génère et télécharge le ticket en PDF.
   */
  /**
   * Génère et télécharge un ticket PDF.
   */
  downloadTicketPdf(ticket: Ticket) {
    const user = this.auth.user();
    const event = ticket.evenement;

    const doc = new jsPDF();

    // Header
    doc.setFontSize(22);
    doc.text("EVENTHUB", 20, 20);

    doc.setFontSize(16);
    doc.text("Billet électronique", 20, 32);

    // Infos ticket
    doc.setFontSize(12);

    doc.text(`Référence : TKT-${ticket.idTicket}`, 20, 50);

    doc.text(
      `Place : ${ticket.numeroPlace ?? ticket.numeroTicket ?? "N/A"}`,
      20,
      60,
    );

    doc.text(`Statut : ${ticket.statut}`, 20, 70);

    doc.text(`Prix : ${ticket.prixUnitaire ?? event?.prix ?? 0} €`, 20, 80);

    // Infos événement
    doc.setFontSize(14);
    doc.text("Événement", 20, 100);

    doc.setFontSize(12);

    doc.text(`Nom : ${event?.nom ?? ""}`, 20, 112);

    doc.text(`Date : ${event?.date ?? ""}`, 20, 122);

    doc.text(`Heure : ${event?.heure ?? ""}`, 20, 132);

    doc.text(`Lieu : ${event?.lieu ?? ""}`, 20, 142);

    // Infos utilisateur
    doc.setFontSize(14);
    doc.text("Participant", 20, 162);

    doc.setFontSize(12);

    doc.text(`${user?.prenom ?? ""} ${user?.nom ?? ""}`, 20, 174);

    doc.text(`${user?.email ?? ""}`, 20, 184);

    // Footer
    doc.setFontSize(10);

    doc.text("Merci pour votre réservation sur EventHub.", 20, 260);

    doc.save(`ticket-${ticket.idTicket}.pdf`);
  }
  /**
   * Données locales utilisées uniquement si besoin de test sans backend.
   */
  loadMock() {
    this._tickets.set([
      {
        idTicket: 1,
        numeroPlace: "A-001",
        statut: "ACHETE",
        prixUnitaire: 22,
        dateAchat: "2026-05-01T10:00:00",
        evenement: {
          idEvenement: 2,
          nom: "Soirée Jazz au Sunset",
          date: "2026-06-20",
          lieu: "Le Sunset",
          imageUrl: "assets/images/events/jazz-sunset.jpg",
        } as Evenement,
      },
    ]);
  }
}
