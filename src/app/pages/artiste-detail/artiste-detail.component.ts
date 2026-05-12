import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ArtisteService } from '../../services/artiste.service';
import { EvenementService } from '../../services/evenement.service';
@Component({ selector:'app-artiste-detail', standalone:true, imports:[CommonModule,RouterLink], templateUrl:'./artiste-detail.component.html', styleUrls:['./artiste-detail.component.scss'] })
export class ArtisteDetailComponent {
  ar = inject(ArtisteService);
  ev = inject(EvenementService);
  getArtistEvents(id?:number){ if (!id) return []; return this.ev.evenements().filter(e=>e.artistes?.some(a=>a.idArtiste===id)); }
  formatDate(d:string){return new Date(d).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'});}
}
