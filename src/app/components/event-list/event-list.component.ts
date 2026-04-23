import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EvenementService } from '../../services/evenement.service';
import { EventCardComponent } from '../event-card/event-card.component';
import { ReservationModalComponent } from '../reservation-modal/reservation-modal.component';
@Component({ selector:'app-event-list', standalone:true, imports:[CommonModule,EventCardComponent,ReservationModalComponent], templateUrl:'./event-list.component.html', styleUrls:['./event-list.component.scss'] })
export class EventListComponent { ev = inject(EvenementService); }
