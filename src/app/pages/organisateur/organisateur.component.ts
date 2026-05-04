import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EvenementService } from '../../services/evenement.service';
import { ToastService } from '../../services/toast.service';
import { Evenement } from '../../models';

@Component({
  selector: 'app-organisateur',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './organisateur.component.html',
  styleUrls: ['./organisateur.component.scss'],
})
export class OrganisateurComponent implements OnInit {
  auth  = inject(AuthService);
  ev    = inject(EvenementService);
  toast = inject(ToastService);

  tab           = signal<'list' | 'create' | 'edit'>('list');
  editTarget    = signal<Evenement | null>(null);
  deleteConfirm = signal<number | null>(null);
  loading       = signal(false);

  form = this.emptyForm();

  emptyForm() {
    return {
      nom: '', date: '', heure: '20:00', lieu: '',
      categorie: 'electronique', prix: 30, capacite: 500,
      description: '', imageUrl: 'assets/images/events/luna-eclipse.jpg'
    };
  }

  ngOnInit() {
    this.ev.loadAll().subscribe({ error: () => this.ev.loadMock() });
  }

  get myEvents() { return this.ev.evenements(); }

  formatDate(d: string) {
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  startCreate() {
    this.form = this.emptyForm();
    this.editTarget.set(null);
    this.tab.set('create');
  }

  startEdit(e: Evenement) {
    this.editTarget.set(e);
    this.form = {
      nom: e.nom, date: e.date, heure: e.heure ?? '20:00',
      lieu: e.lieu ?? '', categorie: e.categorie ?? 'electronique',
      prix: e.prix, capacite: e.capacite ?? 500,
      description: e.description ?? '', imageUrl: e.imageUrl ?? ''
    };
    this.tab.set('edit');
  }

  submit() {
    if (!this.form.nom || !this.form.date || !this.form.lieu) {
      this.toast.show('Champs obligatoires manquants.', 'error');
      return;
    }
    this.loading.set(true);

    // On cast en Partial<Evenement> proprement sans propriété incompatible
    const payload: Partial<Evenement> = {
      nom: this.form.nom,
      date: this.form.date,
      heure: this.form.heure,
      lieu: this.form.lieu,
      categorie: this.form.categorie,
      prix: this.form.prix,
      capacite: this.form.capacite,
      description: this.form.description,
      imageUrl: this.form.imageUrl,
    };

    if (this.editTarget()) {
      this.ev.update(this.editTarget()!.id, payload).subscribe({
        next: () => { this.toast.show('Événement mis à jour !'); this.tab.set('list'); this.loading.set(false); },
        error: () => { this.toast.show('Erreur mise à jour.', 'error'); this.loading.set(false); }
      });
    } else {
      this.ev.create(payload).subscribe({
        next: () => { this.toast.show('Événement créé !'); this.tab.set('list'); this.loading.set(false); },
        error: () => { this.toast.show('Erreur création.', 'error'); this.loading.set(false); }
      });
    }
  }

  askDelete(id: number) { this.deleteConfirm.set(id); }

  confirmDelete() {
    const id = this.deleteConfirm();
    if (id) {
      this.ev.delete(id).subscribe({
        next: () => { this.toast.show('Événement supprimé.', 'info'); this.deleteConfirm.set(null); },
        error: () => { this.toast.show('Erreur suppression.', 'error'); this.deleteConfirm.set(null); }
      });
    }
  }
}
