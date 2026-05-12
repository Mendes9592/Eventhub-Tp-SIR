import { Injectable, signal, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Artiste } from '../models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ArtisteService {
  private api = inject(ApiService);
  private _artistes = signal<Artiste[]>([]);
  readonly artistes = this._artistes.asReadonly();

  loadAll(): Observable<Artiste[]> {
    return this.api.get<Artiste[]>('artistes').pipe(
      tap(data => this._artistes.set(data ?? []))
    );
  }

  getById(id: number): Observable<Artiste> {
    return this.api.get<Artiste>(`artistes/${id}`);
  }

  create(a: Partial<Artiste>): Observable<Artiste> {
    // Envoie les champs réels JPA uniquement
    const payload = {
      nom:             a.nom,
      prenom:          a.prenom,
      styleArtistique: a.styleArtistique,
      nationalite:     a.nationalite,
      description:     a.description,
      popularite:      a.popularite,
      dateNaissance:   a.dateNaissance,
      siteWeb:         a.siteWeb,
    };
    return this.api.post<Artiste>('artistes', payload).pipe(
      tap(created => this._artistes.update(list => [...list, created]))
    );
  }

  update(id: number, a: Partial<Artiste>): Observable<Artiste> {
    const payload = {
      nom:             a.nom,
      prenom:          a.prenom,
      styleArtistique: a.styleArtistique,
      nationalite:     a.nationalite,
      description:     a.description,
      popularite:      a.popularite,
    };
    return this.api.put<Artiste>(`artistes/${id}`, payload).pipe(
      tap(updated => this._artistes.update(list =>
        list.map(x => x.idArtiste === id ? { ...x, ...updated } : x)
      ))
    );
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`artistes/${id}`).pipe(
      tap(() => this._artistes.update(list => list.filter(a => a.idArtiste !== id)))
    );
  }

  getByStyle(style: string): Observable<Artiste[]> {
    return this.api.get<Artiste[]>(`artistes/by-style/${style}`);
  }

  getByNationalite(nationalite: string): Observable<Artiste[]> {
    return this.api.get<Artiste[]>(`artistes/by-nationalite/${nationalite}`);
  }

  loadMock() {
    this._artistes.set([
      { idArtiste:1, nom:'Eclipse',    prenom:'Luna',      styleArtistique:'Techno', nationalite:'Française', imageUrl:'assets/images/artistes/luna-eclipse.jpg' },
      { idArtiste:2, nom:'Nexus',      prenom:'DJ',        styleArtistique:'House',  nationalite:'Belge',     imageUrl:'assets/images/artistes/dj-nexus.jpg' },
      { idArtiste:3, nom:'Jazz',       prenom:'Marcus',    styleArtistique:'Jazz',   nationalite:'Américaine',imageUrl:'assets/images/artistes/marcus-jazz.jpg' },
      { idArtiste:4, nom:'Voltage',    prenom:'The',       styleArtistique:'Rock',   nationalite:'Britannique',imageUrl:'assets/images/artistes/the-voltage.jpg' },
      { idArtiste:5, nom:'Symphonique',prenom:'Orchestre', styleArtistique:'Classique',nationalite:'Française',imageUrl:'assets/images/artistes/orchestre.jpg' },
      { idArtiste:6, nom:'Flow',       prenom:'MC',        styleArtistique:'Hip-Hop',nationalite:'Française', imageUrl:'assets/images/artistes/mc-flow.jpg' },
    ]);
  }
}
