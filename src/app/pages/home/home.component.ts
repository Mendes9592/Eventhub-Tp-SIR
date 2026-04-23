import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroComponent } from '../../components/hero/hero.component';
import { StatsBarComponent } from '../../components/stats-bar/stats-bar.component';
import { CategoryFilterComponent } from '../../components/category-filter/category-filter.component';
import { EventListComponent } from '../../components/event-list/event-list.component';
import { ToastComponent } from '../../components/toast/toast.component';
@Component({ selector:'app-home', standalone:true,
  imports:[CommonModule,HeroComponent,StatsBarComponent,CategoryFilterComponent,EventListComponent,ToastComponent],
  template:`<app-hero/><app-stats-bar/><app-category-filter/><app-event-list/><app-toast/>`
})
export class HomeComponent {}
