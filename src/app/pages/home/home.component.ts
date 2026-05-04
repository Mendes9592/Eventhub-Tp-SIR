import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroComponent } from '../../components/hero/hero.component';
import { StatsBarComponent } from '../../components/stats-bar/stats-bar.component';
import { CategoryFilterComponent } from '../../components/category-filter/category-filter.component';
import { EventListComponent } from '../../components/event-list/event-list.component';
import { ToastComponent } from '../../components/toast/toast.component';
import { EvenementService } from '../../services/evenement.service';
import { ArtisteService } from '../../services/artiste.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeroComponent, StatsBarComponent, CategoryFilterComponent, EventListComponent, ToastComponent],
  template: `
    <app-hero/>
    <app-stats-bar/>
    <app-category-filter/>
    <app-event-list/>
    <app-toast/>
  `
})
export class HomeComponent implements OnInit {
  private evService = inject(EvenementService);
  private arService = inject(ArtisteService);

  ngOnInit() {
    // Charger depuis le backend, avec fallback sur les données mock
    this.evService.loadAll().subscribe({
      next: () => console.log('✅ Événements chargés depuis le backend'),
      error: () => {
        console.warn('⚠ Backend offline — utilisation des données mock');
        this.evService.loadMock();
      }
    });

    this.arService.loadAll().subscribe({
      next: () => console.log('✅ Artistes chargés depuis le backend'),
      error: () => this.arService.loadMock()
    });
  }
}
