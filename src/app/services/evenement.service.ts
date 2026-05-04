import { Injectable, signal, computed, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Evenement, Category } from '../models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class EvenementService {
  private api = inject(ApiService);

  // ── State local ────────────────────────────────────────────────
  private _evenements = signal<Evenement[]>([]);
  private _loading = signal<boolean>(false);
  private _selectedCategory = signal<string>('all');
  private _searchQuery = signal<string>('');
  private _selectedEvent = signal<Evenement | null>(null);
  private _showModal = signal<boolean>(false);

  readonly categories: Category[] = [
    { id: 'all',          label: 'Toutes les catégories', icon: '🎵' },
    { id: 'electronique', label: 'Électronique',           icon: '🎛️' },
    { id: 'jazz',         label: 'Jazz',                   icon: '🎷' },
    { id: 'rock',         label: 'Rock',                   icon: '🎸' },
    { id: 'house',        label: 'House',                  icon: '🔊' },
    { id: 'classique',    label: 'Classique',              icon: '🎻' },
    { id: 'hiphop',       label: 'Hip-Hop',                icon: '🎤' },
  ];

  // ── Signals publics ─────────────────────────────────────────────
  readonly evenements       = this._evenements.asReadonly();
  readonly loading          = this._loading.asReadonly();
  readonly selectedCategory = this._selectedCategory.asReadonly();
  readonly searchQuery      = this._searchQuery.asReadonly();
  readonly selectedEvent    = this._selectedEvent.asReadonly();
  readonly showModal        = this._showModal.asReadonly();

  readonly filteredEvenements = computed(() => {
    const cat = this._selectedCategory();
    const q   = this._searchQuery().toLowerCase();
    return (this._evenements() ?? []).filter(e => {
      const matchCat = cat === 'all' || e.categorie === cat;
      const matchQ   = !q || e.nom.toLowerCase().includes(q) || (e.lieu ?? '').toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  });

  readonly totalTickets = computed(() =>
    this._evenements().reduce((s, e) => s + (e.nbTicketsVendus ?? 0), 0)
  );

  // ── Appels API réels ────────────────────────────────────────────
  loadAll(): Observable<Evenement[]> {
    this._loading.set(true);
    return this.api.get<Evenement[]>('evenements').pipe(
      tap(data => { this._evenements.set(data); this._loading.set(false); })
    );
  }

  loadById(id: number): Observable<Evenement> {
    return this.api.get<Evenement>(`evenements/${id}`);
  }

  create(e: Partial<Evenement>): Observable<Evenement> {
    return this.api.post<Evenement>('evenements', e).pipe(
      tap(created => this._evenements.update(list => [created, ...list]))
    );
  }

  update(id: number, e: Partial<Evenement>): Observable<Evenement> {
    return this.api.put<Evenement>(`evenements/${id}`, e).pipe(
      tap(updated => this._evenements.update(list => list.map(x => x.id === id ? updated : x)))
    );
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`evenements/${id}`).pipe(
      tap(() => this._evenements.update(list => list.filter(e => e.id !== id)))
    );
  }

  search(nom?: string, genre?: string, lieu?: string): Observable<Evenement[]> {
    const params: Record<string, string> = {};
    if (nom)   params['nom']   = nom;
    if (genre) params['genre'] = genre;
    if (lieu)  params['lieu']  = lieu;
    return this.api.get<Evenement[]>('evenements/search', params);
  }

  getWithArtistes(): Observable<Evenement[]> {
    return this.api.get<Evenement[]>('evenements/with-artistes');
  }

  // ── UI helpers ──────────────────────────────────────────────────
  setCategory(id: string) { this._selectedCategory.set(id); }
  setSearch(q: string)    { this._searchQuery.set(q); }

  openModal(e: Evenement)  { this._selectedEvent.set(e); this._showModal.set(true);  document.body.style.overflow = 'hidden'; }
  closeModal()             { this._showModal.set(false); this._selectedEvent.set(null); document.body.style.overflow = ''; }

  getById(id: number)          { return this._evenements().find(e => e.id === id); }
  getCategoryLabel(id: string) { return this.categories.find(c => c.id === id)?.label ?? id; }
  getOccupancyPercent(e: Evenement) { return e.capacite ? Math.round((e.nbTicketsVendus ?? 0) / e.capacite * 100) : 0; }
  isLastPlaces(e: Evenement)   { return this.getOccupancyPercent(e) >= 85; }

  // ── Fallback données mock (si backend offline) ──────────────────
  loadMock() {
    this._evenements.set([
      { id:1, nom:'Luna Eclipse - Spring Festival', date:'2026-05-15', heure:'20:00', lieu:'Zenith Paris', categorie:'electronique', prix:35, capacite:6500, nbTicketsVendus:4800, imageUrl:'assets/images/events/luna-eclipse.jpg', description:'Une nuit électronique explosive avec les meilleurs artistes de la scène techno parisienne.', artistes:[{idArtiste:1,nom:'Eclipse',prenom:'Luna',styleArtistique:'Techno',imageUrl:'assets/images/artistes/luna-eclipse.jpg'}] },
      { id:2, nom:'Soirée Jazz au Sunset', date:'2026-04-20', heure:'21:00', lieu:'Le Sunset', categorie:'jazz', prix:22, capacite:250, nbTicketsVendus:198, imageUrl:'assets/images/events/jazz-sunset.jpg', description:'Une soirée intimiste au cœur du Paris jazz.', artistes:[{idArtiste:3,nom:'Jazz',prenom:'Marcus',styleArtistique:'Jazz',imageUrl:'assets/images/artistes/marcus-jazz.jpg'}] },
      { id:3, nom:'The Voltage - Rock Night', date:'2026-06-08', heure:'19:30', lieu:'Olympia', categorie:'rock', prix:45, capacite:2000, nbTicketsVendus:1456, imageUrl:'assets/images/events/the-voltage.jpg', description:"The Voltage débarque à l'Olympia pour une nuit de rock.", artistes:[{idArtiste:4,nom:'Voltage',prenom:'The',styleArtistique:'Rock',imageUrl:'assets/images/artistes/the-voltage.jpg'}] },
      { id:4, nom:'DJ Nexus - Underground Sessions', date:'2026-04-25', heure:'23:00', lieu:'Concrete', categorie:'house', prix:18, capacite:1500, nbTicketsVendus:1320, imageUrl:'assets/images/events/dj-nexus.jpg', description:'Les soirées Underground de DJ Nexus sont légendaires.' },
      { id:5, nom:'Concert Symphonique - Beethoven', date:'2026-05-30', heure:'20:00', lieu:'Philharmonie de Paris', categorie:'classique', prix:55, capacite:2400, nbTicketsVendus:2156, imageUrl:'assets/images/events/beethoven.jpg' },
      { id:6, nom:'MC Flow - Hip-Hop Night', date:'2026-04-18', heure:'21:00', lieu:'La Cigale', categorie:'hiphop', prix:28, capacite:1389, nbTicketsVendus:987, imageUrl:'assets/images/events/mc-flow.jpg' },
    ]);
  }
}
