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
      tap(data => this._artistes.set(data))
    );
  }

  getById(id: number): Observable<Artiste> {
    return this.api.get<Artiste>(`artistes/${id}`);
  }

  create(a: Partial<Artiste>): Observable<Artiste> {
    return this.api.post<Artiste>('artistes', a).pipe(
      tap(created => this._artistes.update(list => [...list, created]))
    );
  }

  update(id: number, a: Partial<Artiste>): Observable<Artiste> {
    return this.api.put<Artiste>(`artistes/${id}`, a).pipe(
      tap(updated => this._artistes.update(list => list.map(x => x.idArtiste === id ? updated : x)))
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

  loadMock() {
    this._artistes.set([
      { idArtiste:1, nom:'Eclipse',    prenom:'Luna',      styleArtistique:'Techno / Électronique', imageUrl:'assets/images/artistes/electronique.jpg' },
      { idArtiste:2, nom:'Nexus',      prenom:'DJ',        styleArtistique:'House / Techno',         imageUrl:'assets/images/artistes/house.jpg' },
      { idArtiste:3, nom:'Jazz',       prenom:'Marcus',    styleArtistique:'Jazz / Blues',           imageUrl:'assets/images/artistes/jazz.jpg' },
      { idArtiste:4, nom:'Voltage',    prenom:'The',       styleArtistique:'Rock',                   imageUrl:'assets/images/artistes/rock.jpeg' },
      { idArtiste:5, nom:'Symphonique',prenom:'Orchestre', styleArtistique:'Classique',              imageUrl:'assets/images/artistes/classique.jpg' },
      { idArtiste:6, nom:'Flow',       prenom:'MC',        styleArtistique:'Hip-Hop / Rap',          imageUrl:'assets/images/artistes/hiphop.jpg' },
    ]);
  }
}
