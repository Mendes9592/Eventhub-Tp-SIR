// ────────────────────────────────────────────────────────────────
// Composant Organisateur
// Gestion des événements créés par un organisateur
// CRUD : création, modification, suppression, affichage
// ────────────────────────────────────────────────────────────────
import { Component, inject, signal, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { EvenementService } from "../../services/evenement.service";
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
    };
  }

  ngOnInit() {
    this.ev.loadAll().subscribe({ error: () => this.ev.loadMock() });
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
      lieu: e.lieu ?? "",
      capacite: e.capacite ?? 500,
      popularite: e.popularite ?? 4.0,
      description: e.description ?? "",
      heure: e.heure ?? "20:00",
      categorie: e.categorie ?? e.genre ?? "electronique",
      prix: e.prix ?? 0,
      imageUrl: e.imageUrl ?? "",
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
      organisateur: user?.idPersonne
        ? {
            idPersonne: user.idPersonne,
            nom: user.nom ?? "",
            prenom: user.prenom ?? "",
            email: user.email ?? user.username ?? "",
            nomStructure: user.nomStructure ?? "Structure non renseignée",
          }
        : undefined,
    };
    if (this.editTarget()) {
      this.ev.update(this.editTarget()!.idEvenement!, payload).subscribe({
        next: () => {
          this.toast.show("Mis à jour !");
          this.tab.set("list");
          this.loading.set(false);
        },
        error: () => {
          this.toast.show("Erreur.", "error");
          this.loading.set(false);
        },
      });
    } else {
      this.ev.create(payload).subscribe({
        next: () => {
          this.toast.show("Créé !");
          this.tab.set("list");
          this.loading.set(false);
        },
        error: () => {
          this.toast.show("Erreur.", "error");
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
    if (id)
      this.ev.delete(id).subscribe({
        next: () => {
          this.toast.show("Supprimé.", "info");
          this.deleteConfirm.set(null);
        },
        error: () => {
          this.toast.show("Erreur.", "error");
          this.deleteConfirm.set(null);
        },
      });
  }
}
