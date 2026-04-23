import { Injectable, signal } from '@angular/core';
import { Artiste } from '../models';

@Injectable({ providedIn: 'root' })
export class ArtisteService {
  private _artistes = signal<Artiste[]>([
    { idArtiste:1, nom:'Eclipse', prenom:'Luna', styleArtistique:'Techno / Électronique', imageUrl:'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80' },
    { idArtiste:2, nom:'Nexus', prenom:'DJ', styleArtistique:'House / Techno', imageUrl:'https://images.unsplash.com/photo-1571266028243-d220c6a5d84c?w=400&q=80' },
    { idArtiste:3, nom:'Jazz', prenom:'Marcus', styleArtistique:'Jazz / Blues', imageUrl:'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80' },
    { idArtiste:4, nom:'Voltage', prenom:'The', styleArtistique:'Rock', imageUrl:'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&q=80' },
    { idArtiste:5, nom:'Symphonique', prenom:'Orchestre', styleArtistique:'Classique', imageUrl:'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400&q=80' },
    { idArtiste:6, nom:'Flow', prenom:'MC', styleArtistique:'Hip-Hop / Rap', imageUrl:'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=400&q=80' },
  ]);

  readonly artistes = this._artistes.asReadonly();
  getById(id: number) { return this._artistes().find(a => a.idArtiste === id); }
}
