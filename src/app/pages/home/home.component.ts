import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";

import { HeroComponent } from "../../components/hero/hero.component";
import { StatsBarComponent } from "../../components/stats-bar/stats-bar.component";
import { CategoryFilterComponent } from "../../components/category-filter/category-filter.component";
import { EventListComponent } from "../../components/event-list/event-list.component";
import { ToastComponent } from "../../components/toast/toast.component";

import { EvenementService } from "../../services/evenement.service";
import { ArtisteService } from "../../services/artiste.service";

@Component({
  selector: "app-home",
  standalone: true,
  imports: [
    CommonModule,
    HeroComponent,
    StatsBarComponent,
    CategoryFilterComponent,
    EventListComponent,
    ToastComponent,
  ],
  template: `
    <app-hero />
    <app-stats-bar />
    <app-category-filter />
    <app-event-list />
    <app-toast />
  `,
})
export class HomeComponent implements OnInit {
  private evService = inject(EvenementService);
  private arService = inject(ArtisteService);

  ngOnInit() {
    this.evService.loadAll().subscribe({
      next: () => {
        console.log("Événements chargés :", this.evService.evenements());
      },
      error: (err: unknown) => {
        console.error("Erreur chargement événements :", err);
      },
    });

    this.arService.loadAll().subscribe({
      next: () => {
        console.log("Artistes chargés :", this.arService.artistes());
      },
      error: (err: unknown) => {
        console.error("Erreur chargement artistes :", err);
      },
    });
  }
}
