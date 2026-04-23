import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Evenement } from '../../models';
import { EvenementService } from '../../services/evenement.service';
import { TicketService } from '../../services/ticket.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.scss']
})
export class EventCardComponent {
  @Input({ required: true }) event!: Evenement;
  ev = inject(EvenementService);
  tk = inject(TicketService);
  auth = inject(AuthService);

  get pct() { return this.ev.getOccupancyPercent(this.event); }
  get cls() { const p = this.pct; return p >= 90 ? 'critical' : p >= 70 ? 'high' : 'normal'; }
  get catLabel() { return this.ev.getCategoryLabel(this.event.categorie ?? ''); }
  get hasTicket() { return this.tk.hasTicketForEvent(this.event.id); }
  get isLast() { return this.ev.isLastPlaces(this.event); }

  // Construit le nom des artistes dans le TS pour éviter l'erreur Angular template
  get artistesLabel(): string {
    return (this.event.artistes ?? []).map(a => a.prenom + ' ' + a.nom).join(', ');
  }

  onReserver(e: MouseEvent) {
    e.stopPropagation();
    if (this.auth.isLoggedIn()) this.ev.openModal(this.event);
  }

  formatDate(d: string) {
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }
}
