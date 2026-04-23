import { Injectable, signal } from '@angular/core';
import { Artiste } from '../models';

@Injectable({ providedIn: 'root' })
export class ArtisteService {
  private _artistes = signal<Artiste[]>([
    { idArtiste:1, nom:'Eclipse', prenom:'Luna', styleArtistique:'Techno / Électronique', imageUrl:'assets/images/artistes/electronique.jpg' },
    { idArtiste:2, nom:'Nexus', prenom:'DJ', styleArtistique:'House / Techno', imageUrl:'assets/images/artistes/house.jpg' },
    { idArtiste:3, nom:'Jazz', prenom:'Marcus', styleArtistique:'Jazz / Blues', imageUrl:'assets/images/artistes/jazz.jpg' },
    { idArtiste:4, nom:'Voltage', prenom:'The', styleArtistique:'Rock', imageUrl:'assets/images/artistes/rock.jpeg' },
    { idArtiste:5, nom:'Symphonique', prenom:'Orchestre', styleArtistique:'Classique', imageUrl:'assets/images/artistes/classique.jpg' },
    { idArtiste:6, nom:'Flow', prenom:'MC', styleArtistique:'Hip-Hop / Rap', imageUrl:'assets/images/artistes/hiphop.jpg' },
  ]);

  readonly artistes = this._artistes.asReadonly();
  getById(id: number) { return this._artistes().find(a => a.idArtiste === id); }
}
