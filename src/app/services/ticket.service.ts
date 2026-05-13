import { Injectable, signal, computed, inject } from "@angular/core";
import { Observable, tap, forkJoin } from "rxjs";

import { Ticket, Evenement } from "../models";
import { ApiService } from "./api.service";
import { AuthService } from "./auth.service";
import jsPDF from "jspdf";
import QRCode from "qrcode";
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
   * Génère et télécharge un ticket PDF avec QR Code.
   */
  /**
   * Génère un ticket PDF au design professionnel.
   */
  async downloadTicketPdf(ticket: Ticket) {
    const user = this.auth.user();
    const event = ticket.evenement;
const qrContent = String(ticket.idTicket);

    const qrImage = await QRCode.toDataURL(qrContent);

    const doc = new jsPDF("landscape", "mm", "a5");

    doc.setFillColor(45, 33, 28);
    doc.rect(0, 0, 210, 148, "F");

    doc.setFillColor(255, 248, 247);
    doc.roundedRect(10, 15, 190, 115, 6, 6, "F");

    doc.setFillColor(200, 41, 9);
    doc.roundedRect(10, 15, 55, 115, 6, 6, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text("EventHub", 18, 35);

    doc.setFontSize(12);
    doc.text("BILLET OFFICIEL", 18, 47);

    doc.setFontSize(10);
    doc.text(`REF : TKT-${ticket.idTicket}`, 18, 62);
    doc.text(`PLACE : ${ticket.numeroPlace ?? "N/A"}`, 18, 72);
    doc.text(`STATUT : ${ticket.statut}`, 18, 82);

    doc.setTextColor(45, 33, 28);
    doc.setFontSize(22);
    doc.text(event?.nom ?? "Événement", 75, 35);

    doc.setFontSize(12);
    doc.text(`Date : ${event?.date ?? "Non renseignée"}`, 75, 52);
    doc.text(`Heure : ${event?.heure ?? "Non renseignée"}`, 75, 62);
    doc.text(`Lieu : ${event?.lieu ?? "Non renseigné"}`, 75, 72);
    doc.text(`Prix : ${ticket.prixUnitaire ?? event?.prix ?? 0} €`, 75, 82);

    doc.setFontSize(11);
    doc.text(`Participant : ${user?.prenom ?? ""} ${user?.nom ?? ""}`, 75, 100);
    doc.text(`Email : ${user?.email ?? ""}`, 75, 110);

    doc.setDrawColor(231, 222, 217);
    doc.setLineWidth(0.5);
    doc.line(150, 25, 150, 120);

    doc.addImage(qrImage, "PNG", 160, 40, 30, 30);

    doc.setFontSize(9);
    doc.text("Présentez ce QR code à l'entrée.", 155, 80);
    doc.text("Ticket personnel et non transférable.", 155, 88);

    doc.setFillColor(252, 198, 187);
    doc.roundedRect(155, 100, 36, 12, 3, 3, "F");

    doc.setTextColor(200, 41, 9);
    doc.setFontSize(11);
    doc.text("VALIDÉ", 165, 108);

    doc.save(`ticket-TKT-${ticket.idTicket}.pdf`);
  }

  /**
   * Vérifie un ticket depuis son ID.
   */
  verifyTicket(idTicket: number): Observable<Ticket> {
    return this.api.get<Ticket>(`tickets/verify/${idTicket}`);
  }

  /**
   * Marque un ticket comme utilisé.
   */
  validateTicket(idTicket: number): Observable<Ticket> {
    return this.api.put<Ticket>(`tickets/validate/${idTicket}`, {});
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
