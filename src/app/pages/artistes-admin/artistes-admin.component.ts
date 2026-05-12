import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ArtisteService } from '../../services/artiste.service';
import { ToastService } from '../../services/toast.service';
import { Artiste } from '../../models';

@Component({
  selector: 'app-artistes-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './artistes-admin.component.html',
  styleUrls: ['./artistes-admin.component.scss'],
})
export class ArtistesAdminComponent implements OnInit {
  ar    = inject(ArtisteService);
  toast = inject(ToastService);

  tab           = signal<'list' | 'create' | 'edit'>('list');
  editTarget    = signal<Artiste | null>(null);
  deleteConfirm = signal<number | null>(null);
  loading       = signal(false);
  searchQuery   = signal('');

  form = this.emptyForm();

  // Styles pour le select
  readonly styles = ['Techno', 'House', 'Jazz', 'Rock', 'Classique', 'Hip-Hop', 'Pop', 'Blues', 'Reggae', 'Metal', 'Electro', 'Soul', 'R&B', 'Folk', 'Autre'];
  readonly nationalites = ['Française', 'Américaine', 'Britannique', 'Belge', 'Allemande', 'Espagnole', 'Italienne', 'Canadienne', 'Brésilienne', 'Japonaise', 'Autre'];

  emptyForm() {
    return {
      nom: '',
      prenom: '',
      styleArtistique: '',
      nationalite: 'Française',
      description: '',
      popularite: 75,
      siteWeb: '',
      dateNaissance: '',
      imageUrl: '',
    };
  }

  ngOnInit() {
    this.ar.loadAll().subscribe({ error: () => this.ar.loadMock() });
  }

  get filteredArtistes() {
    const q = this.searchQuery().toLowerCase();
    return this.ar.artistes().filter(a =>
      !q || a.nom.toLowerCase().includes(q) || a.prenom.toLowerCase().includes(q) || (a.styleArtistique ?? '').toLowerCase().includes(q)
    );
  }

  startCreate() {
    this.form = this.emptyForm();
    this.editTarget.set(null);
    this.tab.set('create');
  }

  startEdit(a: Artiste) {
    this.editTarget.set(a);
    this.form = {
      nom:             a.nom,
      prenom:          a.prenom,
      styleArtistique: a.styleArtistique ?? '',
      nationalite:     a.nationalite ?? 'Française',
      description:     a.description ?? '',
      popularite:      a.popularite ?? 75,
      siteWeb:         a.siteWeb ?? '',
      dateNaissance:   a.dateNaissance ?? '',
      imageUrl:        a.imageUrl ?? '',
    };
    this.tab.set('edit');
  }

  cancel() {
    this.tab.set('list');
    this.editTarget.set(null);
    this.form = this.emptyForm();
  }

  submit() {
    if (!this.form.nom?.trim() || !this.form.prenom?.trim()) {
      this.toast.show('Le nom et le prénom sont obligatoires.', 'error');
      return;
    }
    this.loading.set(true);

    // Payload exact pour le backend — uniquement champs JPA
    const payload: Partial<Artiste> = {
      nom:             this.form.nom.trim(),
      prenom:          this.form.prenom.trim(),
      styleArtistique: this.form.styleArtistique || undefined,
      nationalite:     this.form.nationalite || undefined,
      description:     this.form.description || undefined,
      popularite:      this.form.popularite || undefined,
      siteWeb:         this.form.siteWeb || undefined,
      dateNaissance:   this.form.dateNaissance || undefined,
    };

    if (this.editTarget()) {
      const id = this.editTarget()!.idArtiste!;
      this.ar.update(id, payload).subscribe({
        next: () => {
          this.toast.show(`Artiste "${payload.nom} ${payload.prenom}" mis à jour !`);
          this.tab.set('list');
          this.loading.set(false);
        },
        error: () => {
          this.toast.show('Erreur lors de la mise à jour.', 'error');
          this.loading.set(false);
        }
      });
    } else {
      this.ar.create(payload).subscribe({
        next: () => {
          this.toast.show(`Artiste "${payload.nom} ${payload.prenom}" créé !`);
          this.tab.set('list');
          this.loading.set(false);
        },
        error: () => {
          this.toast.show('Erreur lors de la création.', 'error');
          this.loading.set(false);
        }
      });
    }
  }

  askDelete(id: number) { this.deleteConfirm.set(id); }
  cancelDelete()        { this.deleteConfirm.set(null); }

  confirmDelete() {
    const id = this.deleteConfirm();
    if (id !== null) {
      this.ar.delete(id).subscribe({
        next: () => { this.toast.show('Artiste supprimé.', 'info'); this.deleteConfirm.set(null); },
        error: () => { this.toast.show('Erreur suppression.', 'error'); this.deleteConfirm.set(null); }
      });
    }
  }

  avatarColor(id?: number): string {
    return `#${(((id ?? 1) * 37) % 999999).toString().padStart(6, '0')}`;
  }

  populariteLabel(p: number): string {
    if (p >= 90) return '⭐ Superstar';
    if (p >= 75) return '🔥 Populaire';
    if (p >= 50) return '🎵 En montée';
    return '🌱 Émergent';
  }

  populariteColor(p: number): string {
    if (p >= 90) return '#C82909';
    if (p >= 75) return '#e07000';
    if (p >= 50) return '#2E7D32';
    return '#666';
  }
}
