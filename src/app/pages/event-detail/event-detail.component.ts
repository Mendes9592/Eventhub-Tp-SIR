import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { EvenementService } from '../../services/evenement.service';
import { TicketService } from '../../services/ticket.service';
import { AuthService } from '../../services/auth.service';
import { ReservationModalComponent } from '../../components/reservation-modal/reservation-modal.component';
import { Evenement } from '../../models';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ReservationModalComponent],
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss']
})
export class EventDetailComponent implements OnInit {
  ev = inject(EvenementService);
  tk = inject(TicketService);
  auth = inject(AuthService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  event = signal<Evenement | null>(null);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const found = this.ev.getById(id);
    if (found) this.event.set(found);
    else this.router.navigate(['/']);
  }

  get pct() { return this.event() ? this.ev.getOccupancyPercent(this.event()!) : 0; }
  get occCls() { return this.pct >= 90 ? 'critical' : this.pct >= 70 ? 'high' : 'normal'; }
  get hasTicket() { return this.event() ? this.tk.hasTicketForEvent(this.event()!.id) : false; }

  // Calcul des initiales dans le TS pour éviter les erreurs de template
  get orgInitiales(): string {
    const org = this.event()?.organisateur;
    if (!org) return '';
    return (org.prenom?.[0] ?? '') + (org.nom?.[0] ?? '');
  }

  formatDate(d: string) {
    return new Date(d).toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  reserve() {
    if (this.event() && this.auth.isLoggedIn()) {
      this.ev.openModal(this.event()!);
    }
  }
}
