import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EvenementService } from '../../services/evenement.service';
import { FormsModule } from '@angular/forms';
@Component({ selector:'app-hero', standalone:true, imports:[CommonModule,RouterLink,FormsModule], templateUrl:'./hero.component.html', styleUrls:['./hero.component.scss'] })
export class HeroComponent {
  auth = inject(AuthService);
  evService = inject(EvenementService);
  search = '';
  onSearch() { this.evService.setSearch(this.search); }
}
