import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EvenementService } from '../../services/evenement.service';
import { TicketService } from '../../services/ticket.service';
import { ArtisteService } from '../../services/artiste.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {
  auth  = inject(AuthService);
  ev    = inject(EvenementService);
  tk    = inject(TicketService);
  ar    = inject(ArtisteService);
  toast = inject(ToastService);

  tab = signal<'dashboard' | 'events' | 'users' | 'artistes'>('dashboard');

  formatDate(d: string) {
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  // ← utilise ev.delete() au lieu de ev.deleteEvenement()
  deleteEvent(id: number) {
    this.ev.delete(id).subscribe({
      next: () => this.toast.show('Événement supprimé.', 'info'),
      error: () => this.toast.show('Erreur suppression.', 'error')
    });
  }
}
