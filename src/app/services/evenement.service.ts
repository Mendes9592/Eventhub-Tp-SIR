import { Injectable, signal, computed } from '@angular/core';
import { Evenement, Artiste, Category } from '../models';

@Injectable({ providedIn: 'root' })
export class EvenementService {
  private _selectedCategory = signal<string>('all');
  private _searchQuery = signal<string>('');
  private _selectedEvent = signal<Evenement | null>(null);
  private _showModal = signal<boolean>(false);

  readonly categories: Category[] = [
    { id: 'all', label: 'Toutes les catégories', icon: '🎵' },
    { id: 'electronique', label: 'Électronique', icon: '🎛️' },
    { id: 'jazz', label: 'Jazz', icon: '🎷' },
    { id: 'rock', label: 'Rock', icon: '🎸' },
    { id: 'house', label: 'House', icon: '🔊' },
    { id: 'classique', label: 'Classique', icon: '🎻' },
    { id: 'hiphop', label: 'Hip-Hop', icon: '🎤' },
  ];

  private _evenements = signal<Evenement[]>([
    { id:1, nom:'Luna Eclipse - Spring Festival', date:'2026-05-15', heure:'20:00', lieu:'Zenith Paris', categorie:'electronique', prix:35, capacite:6500, nbTicketsVendus:4800, imageUrl:'assets/images/events/electronique.jpg', description:'Une nuit électronique explosive avec les meilleurs artistes de la scène techno parisienne.', artistes:[{idArtiste:1,nom:'Eclipse',prenom:'Luna',styleArtistique:'Techno',imageUrl:'assets/images/artistes/luna-eclipse.jpg'},{idArtiste:2,nom:'Nexus',prenom:'DJ',styleArtistique:'House',imageUrl:'assets/images/artistes/dj-nexus.jpg'}], organisateur:{id:3,nom:'Dupont',prenom:'Jean',username:'jean',role:'ORGANISATEUR'} },
    { id:2, nom:'Soirée Jazz au Sunset', date:'2026-04-20', heure:'21:00', lieu:'Le Sunset', categorie:'jazz', prix:22, capacite:250, nbTicketsVendus:198, imageUrl:'assets/images/events/jazz.jpg', description:'Une soirée intimiste au cœur du Paris jazz.', artistes:[{idArtiste:3,nom:'Jazz',prenom:'Marcus',styleArtistique:'Jazz',imageUrl:'assets/images/artistes/marcus-jazz.jpg'}], organisateur:{id:3,nom:'Dupont',prenom:'Jean',username:'jean',role:'ORGANISATEUR'} },
    { id:3, nom:'The Voltage - Rock Night', date:'2026-06-08', heure:'19:30', lieu:'Olympia', categorie:'rock', prix:45, capacite:2000, nbTicketsVendus:1456, imageUrl:'assets/images/events/rock.jpeg', description:"The Voltage débarque à l'Olympia pour une nuit de rock.", artistes:[{idArtiste:4,nom:'Voltage',prenom:'The',styleArtistique:'Rock',imageUrl:'assets/images/artistes/the-voltage.jpg'}], organisateur:{id:3,nom:'Dupont',prenom:'Jean',username:'jean',role:'ORGANISATEUR'} },
    { id:4, nom:'DJ Nexus - Underground Sessions', date:'2026-04-25', heure:'23:00', lieu:'Concrete', categorie:'house', prix:18, capacite:1500, nbTicketsVendus:1320, imageUrl:'assets/images/events/house.jpg', description:'Les soirées Underground de DJ Nexus sont légendaires.', artistes:[{idArtiste:2,nom:'Nexus',prenom:'DJ',styleArtistique:'House',imageUrl:'assets/images/artistes/dj-nexus.jpg'}], organisateur:{id:3,nom:'Dupont',prenom:'Jean',username:'jean',role:'ORGANISATEUR'} },
    { id:5, nom:'Concert Symphonique - Beethoven', date:'2026-05-30', heure:'20:00', lieu:'Philharmonie de Paris', categorie:'classique', prix:55, capacite:2400, nbTicketsVendus:2156, imageUrl:'assets/images/events/classique.jpg', description:"Une soirée d'exception à la Philharmonie de Paris.", artistes:[{idArtiste:5,nom:'Symphonique',prenom:'Orchestre',styleArtistique:'Classique',imageUrl:'assets/images/artistes/orchestre.jpg'}], organisateur:{id:3,nom:'Dupont',prenom:'Jean',username:'jean',role:'ORGANISATEUR'} },
    { id:6, nom:'MC Flow - Hip-Hop Night', date:'2026-04-18', heure:'21:00', lieu:'La Cigale', categorie:'hiphop', prix:28, capacite:1389, nbTicketsVendus:987, imageUrl:'assets/images/events/hiphop.jpg', description:'MC Flow sempare de La Cigale pour une nuit hip-hop.', artistes:[{idArtiste:6,nom:'Flow',prenom:'MC',styleArtistique:'Hip-Hop',imageUrl:'assets/images/artistes/mc-flow.jpg'}], organisateur:{id:3,nom:'Dupont',prenom:'Jean',username:'jean',role:'ORGANISATEUR'} },
  ]);

  readonly selectedCategory = this._selectedCategory.asReadonly();
  readonly searchQuery = this._searchQuery.asReadonly();
  readonly selectedEvent = this._selectedEvent.asReadonly();
  readonly showModal = this._showModal.asReadonly();
  readonly evenements = this._evenements.asReadonly();

  readonly filteredEvenements = computed(() => {
    const cat = this._selectedCategory();
    const q = this._searchQuery().toLowerCase();
    return this._evenements().filter(e => {
      const matchCat = cat === 'all' || e.categorie === cat;
      const matchQ = !q || e.nom.toLowerCase().includes(q) || e.lieu?.toLowerCase().includes(q) || false;
      return matchCat && matchQ;
    });
  });

  readonly totalTickets = computed(() =>
    this._evenements().reduce((s, e) => s + (e.nbTicketsVendus ?? 0), 0)
  );

  setCategory(id: string) { this._selectedCategory.set(id); }
  setSearch(q: string) { this._searchQuery.set(q); }
  openModal(e: Evenement) { this._selectedEvent.set(e); this._showModal.set(true); document.body.style.overflow = 'hidden'; }
  closeModal() { this._showModal.set(false); this._selectedEvent.set(null); document.body.style.overflow = ''; }

  getById(id: number): Evenement | undefined { return this._evenements().find(e => e.id === id); }
  getCategoryLabel(id: string) { return this.categories.find(c => c.id === id)?.label ?? id; }
  getOccupancyPercent(e: Evenement) { return e.capacite ? Math.round((e.nbTicketsVendus ?? 0) / e.capacite * 100) : 0; }
  isLastPlaces(e: Evenement) { return this.getOccupancyPercent(e) >= 85; }

  addEvenement(e: Evenement) { this._evenements.update(list => [e, ...list]); }
  updateEvenement(updated: Evenement) { this._evenements.update(list => list.map(e => e.id === updated.id ? updated : e)); }
  deleteEvenement(id: number) { this._evenements.update(list => list.filter(e => e.id !== id)); }
}
