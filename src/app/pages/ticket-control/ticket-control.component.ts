import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TicketService } from "../../services/ticket.service";
import { Ticket } from "../../models";

@Component({
  selector: "app-ticket-control",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./ticket-control.component.html",
  styleUrls: ["./ticket-control.component.scss"],
})
export class TicketControlComponent {
  tk = inject(TicketService);

  ticketId = "";
  ticket = signal<Ticket | null>(null);
  message = signal("");
  error = signal("");

  verifier() {
    this.message.set("");
    this.error.set("");
    this.ticket.set(null);

    const id = Number(this.ticketId);

    if (!id) {
      this.error.set("Veuillez saisir un ID de ticket valide.");
      return;
    }

    this.tk.verifyTicket(id).subscribe({
      next: (t) => {
        this.ticket.set(t);
        this.message.set("Ticket valide.");
      },
      error: () => {
        this.error.set("Ticket introuvable, annulé ou déjà utilisé.");
      },
    });
  }

  valider() {
    const id = Number(this.ticketId);

    this.tk.validateTicket(id).subscribe({
      next: (t) => {
        this.ticket.set(t);
        this.message.set("Ticket validé avec succès.");
      },
      error: () => {
        this.error.set("Impossible de valider ce ticket.");
      },
    });
  }
}
