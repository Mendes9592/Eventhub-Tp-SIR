// Composant Organisateur : création, modification, suppression des événements
// Gère aussi l'association ManyToMany entre événement et artistes

import { Component, inject, signal, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";

import { AuthService } from "../../services/auth.service";
import { EvenementService } from "../../services/evenement.service";
import { ArtisteService } from "../../services/artiste.service";
import { ToastService } from "../../services/toast.service";

import { Evenement } from "../../models";

@Component({
  selector: "app-organisateur",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: "./organisateur.component.html",
  styleUrls: ["./organisateur.component.scss"],
})
export class OrganisateurComponent implements OnInit {
  auth = inject(AuthService);
  ev = inject(EvenementService);
  ar = inject(ArtisteService);
  toast = inject(ToastService);

  tab = signal<"list" | "create" | "edit">("list");
  editTarget = signal<Evenement | null>(null);
  deleteConfirm = signal<number | null>(null);
  loading = signal(false);

  form = this.emptyForm();

  emptyForm() {
    return {
      nom: "",
      date: "",
      heure: "20:00",
      genre: "electronique",
      categorie: "electronique",
      lieu: "",
      capacite: 500,
      popularite: 4.0,
      description: "",
      prix: 0,
      imageUrl: "",
      artistes: [] as number[],
    };
  }

  ngOnInit() {
    this.ev.loadAll().subscribe({ error: () => this.ev.loadMock() });
    this.ar.loadAll().subscribe({ error: () => this.ar.loadMock() });
  }

  get myEvents() {
    return this.ev.evenements();
  }

  formatDate(d: string) {
    return new Date(d).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  startCreate() {
    this.form = this.emptyForm();
    this.editTarget.set(null);
    this.tab.set("create");
  }

  startEdit(e: Evenement) {
    this.editTarget.set(e);

    this.form = {
      nom: e.nom,
      date: e.date,
      genre: e.genre ?? "electronique",
      categorie: e.categorie ?? e.genre ?? "electronique",
      lieu: e.lieu ?? "",
      capacite: e.capacite ?? 500,
      popularite: e.popularite ?? 4.0,
      description: e.description ?? "",
      heure: e.heure ?? "20:00",
      prix: e.prix ?? 0,
      imageUrl: e.imageUrl ?? "",

      // Récupère les artistes déjà associés à l'événement
      artistes: e.artistes?.map((a) => a.idArtiste!).filter(Boolean) ?? [],
    };

    this.tab.set("edit");
  }

  submit() {
    if (!this.form.nom || !this.form.date || !this.form.lieu) {
      this.toast.show("Champs obligatoires manquants.", "error");
      return;
    }

    this.loading.set(true);

    const user = this.auth.user() as any;

    const payload: Partial<Evenement> = {
      ...this.form,

      genre: this.form.genre || this.form.categorie,
      categorie: this.form.categorie || this.form.genre,
      imageUrl: this.form.imageUrl,

      organisateur: user?.idPersonne
        ? {
            idPersonne: user.idPersonne,
            nom: user.nom ?? "",
            prenom: user.prenom ?? "",
            email: user.email ?? user.username ?? "",
            nomStructure: user.nomStructure ?? "Structure non renseignée",
          }
        : undefined,

      // ManyToMany : on envoie uniquement les IDs des artistes
      artistes: this.form.artistes.map((id) => ({
        idArtiste: Number(id),
      })) as any,
    };

    if (this.editTarget()) {
      this.ev.update(this.editTarget()!.idEvenement!, payload).subscribe({
        next: () => {
          this.toast.show("Événement mis à jour !");
          this.tab.set("list");
          this.loading.set(false);
        },
        error: () => {
          this.toast.show("Erreur lors de la mise à jour.", "error");
          this.loading.set(false);
        },
      });
    } else {
      this.ev.create(payload).subscribe({
        next: () => {
          this.toast.show("Événement créé !");
          this.tab.set("list");
          this.loading.set(false);
        },
        error: () => {
          this.toast.show("Erreur lors de la création.", "error");
          this.loading.set(false);
        },
      });
    }
  }

  askDelete(id?: number) {
    if (id) this.deleteConfirm.set(id);
  }

  confirmDelete() {
    const id = this.deleteConfirm();

    if (id) {
      this.ev.delete(id).subscribe({
        next: () => {
          this.toast.show("Événement supprimé.", "info");
          this.deleteConfirm.set(null);
        },
        error: () => {
          this.toast.show("Erreur lors de la suppression.", "error");
          this.deleteConfirm.set(null);
        },
      });
    }
  }
}
