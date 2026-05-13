import { Injectable, signal, computed, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Evenement, Category } from '../models';
import { ApiService } from './api.service';

@Injectable({ providedIn: "root" })
export class EvenementService {
  private api = inject(ApiService);

  private _evenements = signal<Evenement[]>([]);
  private _loading = signal<boolean>(false);
  private _selectedCategory = signal<string>("all");
  private _searchQuery = signal<string>("");
  private _selectedEvent = signal<Evenement | null>(null);
  private _showModal = signal<boolean>(false);

  readonly categories: Category[] = [
    { id: "all", label: "Toutes les catégories", icon: "🎵" },
    { id: "electronique", label: "Électronique", icon: "🎛️" },
    { id: "jazz", label: "Jazz", icon: "🎷" },
    { id: "rock", label: "Rock", icon: "🎸" },
    { id: "house", label: "House", icon: "🔊" },
    { id: "classique", label: "Classique", icon: "🎻" },
    { id: "hiphop", label: "Hip-Hop", icon: "🎤" },
  ];

  readonly evenements = this._evenements.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly selectedCategory = this._selectedCategory.asReadonly();
  readonly searchQuery = this._searchQuery.asReadonly();
  readonly selectedEvent = this._selectedEvent.asReadonly();
  readonly showModal = this._showModal.asReadonly();

  readonly filteredEvenements = computed(() => {
    const cat = this._selectedCategory().toLowerCase();
    const q = this._searchQuery().toLowerCase();

    return this._evenements().filter((e) => {
      const genre = (e.genre ?? "").toLowerCase();
      const categorie = (e.categorie ?? "").toLowerCase();

      const matchCat = cat === "all" || genre === cat || categorie === cat;

      const matchQ =
        !q ||
        e.nom.toLowerCase().includes(q) ||
        (e.lieu ?? "").toLowerCase().includes(q);

      return matchCat && matchQ;
    });
  });
  readonly totalTickets = computed(() =>
    (this._evenements() ?? []).reduce(
      (s, e) => s + (e.nbTicketsVendus ?? 0),
      0,
    ),
  );

  // ── Appels API — utilise les vrais endpoints ──────────────────
  loadAll(): Observable<Evenement[]> {
    this._loading.set(true);

    return this.api.get<Evenement[]>("evenements").pipe(
      tap({
        next: (data) => {
          console.log("Événements reçus :", data);
          this._evenements.set((data ?? []).map((e) => this.normalize(e)));
          this._loading.set(false);
        },
        error: (err) => {
          console.error("Erreur API événements :", err);
          this._loading.set(false);
        },
      }),
    );
  }

  loadById(id: number): Observable<Evenement> {
    return this.api
      .get<Evenement>(`evenements/${id}`)
      .pipe(tap((e) => this._selectedEvent.set(this.normalize(e))));
  }

  create(e: Partial<Evenement>): Observable<Evenement> {
    // Envoie uniquement les champs connus du backend
    const payload = this.toBackendPayload(e);
    return this.api
      .post<Evenement>("evenements", payload)
      .pipe(
        tap((created) =>
          this._evenements.update((list) => [this.normalize(created), ...list]),
        ),
      );
  }

  update(id: number, e: Partial<Evenement>): Observable<Evenement> {
    const payload = this.toBackendPayload(e);
    return this.api
      .put<Evenement>(`evenements/${id}`, payload)
      .pipe(
        tap((updated) =>
          this._evenements.update((list) =>
            list.map((x) =>
              x.idEvenement === id ? this.normalize({ ...x, ...updated }) : x,
            ),
          ),
        ),
      );
  }

  delete(id: number): Observable<void> {
    return this.api
      .delete<void>(`evenements/${id}`)
      .pipe(
        tap(() =>
          this._evenements.update((list) =>
            list.filter((e) => e.idEvenement !== id),
          ),
        ),
      );
  }

  search(nom?: string, genre?: string, lieu?: string): Observable<Evenement[]> {
    const params: Record<string, string> = {};
    if (nom) params["nom"] = nom;
    if (genre) params["genre"] = genre;
    if (lieu) params["lieu"] = lieu;
    return this.api.get<Evenement[]>("evenements/search", params);
  }

  getPopulaires(seuil: number = 4.0): Observable<Evenement[]> {
    return this.api.get<Evenement[]>(`evenements/populaires/${seuil}`);
  }

  getWithArtistes(): Observable<Evenement[]> {
    return this.api.get<Evenement[]>("evenements/with-artistes");
  }

  // Construit le payload exact attendu par le backend
  // Prépare les données envoyées au backend
  // Important : on envoie aussi les IDs des artistes pour gérer le ManyToMany
  private toBackendPayload(e: Partial<Evenement>): object {
    return {
      nom: e.nom,
      date: e.date,
      heure: e.heure,

      genre: e.genre ?? e.categorie,
      categorie: e.categorie ?? e.genre,

      lieu: e.lieu,
      capacite: e.capacite,
      popularite: e.popularite,
      description: e.description,
      imageUrl: e.imageUrl,
      prix: e.prix,

      nbTicketsVendus: e.nbTicketsVendus ?? 0,

      organisateur: e.organisateur
        ? { idPersonne: e.organisateur.idPersonne }
        : undefined,

      artistes:
        e.artistes?.map((a) => ({
          idArtiste: a.idArtiste,
        })) ?? [],
    };
  }
  private normalize(e: Evenement): Evenement {
    return {
      ...e,
      id: e.id ?? e.idEvenement,
      idEvenement: e.idEvenement ?? e.id,
      genre: e.genre ?? e.categorie,
      categorie: e.categorie ?? e.genre,
      artistes: e.artistes ?? [],
      tickets: e.tickets ?? [],
      nbTicketsVendus: e.nbTicketsVendus ?? 0,
    };
  }

  // ── UI helpers ──────────────────────────────────────────────────
  setCategory(id: string) {
    this._selectedCategory.set(id);
  }
  setSearch(q: string) {
    this._searchQuery.set(q);
  }

  openModal(e: Evenement) {
    this._selectedEvent.set(e);
    this._showModal.set(true);
    document.body.style.overflow = "hidden";
  }
  closeModal() {
    this._showModal.set(false);
    this._selectedEvent.set(null);
    document.body.style.overflow = "";
  }

  getById(id: number) {
    return this._evenements().find((e) => e.idEvenement === id);
  }
  getCategoryLabel(id: string) {
    return this.categories.find((c) => c.id === id)?.label ?? id;
  }
  getOccupancyPercent(e: Evenement) {
    return e.capacite
      ? Math.round(((e.nbTicketsVendus ?? 0) / e.capacite) * 100)
      : 0;
  }
  isLastPlaces(e: Evenement) {
    return this.getOccupancyPercent(e) >= 85;
  }

  loadMock() {
    this._evenements.set([
      {
        idEvenement: 1,
        nom: "Luna Eclipse - Spring Festival",
        date: "2026-05-15",
        genre: "electronique",
        lieu: "Zenith Paris",
        capacite: 6500,
        popularite: 4.8,
        description: "Une nuit électronique explosive.",
        artistes: [
          {
            idArtiste: 1,
            nom: "Eclipse",
            prenom: "Luna",
            styleArtistique: "Techno",
            imageUrl: "assets/images/artistes/electronique.jpg",
          },
        ],
        heure: "20:00",
        prix: 35,
        imageUrl: "assets/images/events/electronique.jpg",
        nbTicketsVendus: 4800,
      },
      {
        idEvenement: 2,
        nom: "Soirée Jazz au Sunset",
        date: "2026-06-20",
        genre: "jazz",
        lieu: "Le Sunset",
        capacite: 250,
        popularite: 4.5,
        description: "Une soirée intimiste.",
        artistes: [
          {
            idArtiste: 3,
            nom: "Jazz",
            prenom: "Marcus",
            styleArtistique: "Jazz",
            imageUrl: "assets/images/artistes/jazz.jpg",
          },
        ],
        heure: "21:00",
        prix: 22,
        imageUrl: "assets/images/events/jazz.jpg",
        nbTicketsVendus: 198,
      },
      {
        idEvenement: 3,
        nom: "The Voltage - Rock Night",
        date: "2026-06-08",
        genre: "rock",
        lieu: "Olympia",
        capacite: 2000,
        popularite: 4.6,
        description: "Une nuit de rock puissant.",
        artistes: [
          {
            idArtiste: 4,
            nom: "Voltage",
            prenom: "The",
            styleArtistique: "Rock",
            imageUrl: "assets/images/artistes/rock.jpeg",
          },
        ],
        heure: "19:30",
        prix: 45,
        imageUrl: "assets/images/events/rock.jpeg",
        nbTicketsVendus: 1456,
      },
      {
        idEvenement: 4,
        nom: "DJ Nexus - Underground Sessions",
        date: "2026-07-25",
        genre: "house",
        lieu: "Concrete",
        capacite: 1500,
        popularite: 4.7,
        description: "Les soirées Underground.",
        artistes: [
          {
            idArtiste: 2,
            nom: "Nexus",
            prenom: "DJ",
            styleArtistique: "House",
            imageUrl: "assets/images/artistes/house.jpg",
          },
        ],
        heure: "23:00",
        prix: 18,
        imageUrl: "assets/images/events/house.jpg",
        nbTicketsVendus: 1320,
      },
      {
        idEvenement: 5,
        nom: "Concert Symphonique - Beethoven",
        date: "2026-05-30",
        genre: "classique",
        lieu: "Philharmonie de Paris",
        capacite: 2400,
        popularite: 4.9,
        description: "Beethoven revisité.",
        artistes: [
          {
            idArtiste: 5,
            nom: "Symphonique",
            prenom: "Orchestre",
            styleArtistique: "Classique",
            imageUrl: "assets/images/artistes/classique.jpg",
          },
        ],
        heure: "20:00",
        prix: 55,
        imageUrl: "assets/images/events/classique.jpg",
        nbTicketsVendus: 2156,
      },
      {
        idEvenement: 6,
        nom: "MC Flow - Hip-Hop Night",
        date: "2026-08-18",
        genre: "hiphop",
        lieu: "La Cigale",
        capacite: 1389,
        popularite: 4.4,
        description: "MC Flow à La Cigale.",
        artistes: [
          {
            idArtiste: 6,
            nom: "Flow",
            prenom: "MC",
            styleArtistique: "Hip-Hop",
            imageUrl: "assets/images/artistes/hiphop.jpg",
          },
        ],
        heure: "21:00",
        prix: 28,
        imageUrl: "assets/images/events/hiphop.jpg",
        nbTicketsVendus: 987,
      },
    ]);
  }
}
