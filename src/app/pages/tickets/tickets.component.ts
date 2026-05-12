import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TicketService } from '../../services/ticket.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.scss'],
})
export class TicketsComponent implements OnInit {
  tk = inject(TicketService);
  auth = inject(AuthService);
  toast = inject(ToastService);
  confirmCancel = signal<number|null>(null);
  loading = signal(false);

  ngOnInit() {
    this.loading.set(true);
    this.tk.loadMyTickets().subscribe({
      next: () => this.loading.set(false),
      error: () => { this.tk.loadMock(); this.loading.set(false); }
    });
  }

  formatDate(d: string) { return new Date(d).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'}); }
  askCancel(id?: number) { if (id) this.confirmCancel.set(id); }
  cancelAbort() { this.confirmCancel.set(null); }
  cancelConfirmed() {
    const id = this.confirmCancel();
    if (id !== null) {
      this.tk.annulerTicket(id).subscribe({
        next: () => { this.toast.show('Ticket annulé.','info'); this.confirmCancel.set(null); },
        error: () => { this.toast.show('Erreur annulation.','error'); this.confirmCancel.set(null); }
      });
    }
  }
}
