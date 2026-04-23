import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EvenementService } from '../../services/evenement.service';
import { TicketService } from '../../services/ticket.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({ selector:'app-reservation-modal', standalone:true, imports:[CommonModule,FormsModule,RouterLink], templateUrl:'./reservation-modal.component.html', styleUrls:['./reservation-modal.component.scss'] })
export class ReservationModalComponent {
  ev = inject(EvenementService);
  tk = inject(TicketService);
  auth = inject(AuthService);
  toast = inject(ToastService);

  qty = 1;
  step: 'detail'|'confirm'|'success' = 'detail';

  get total() { return (this.ev.selectedEvent()?.prix ?? 0) * this.qty; }
  get pct() { const e=this.ev.selectedEvent(); return e?this.ev.getOccupancyPercent(e):0; }
  get occCls() { return this.pct>=90?'critical':this.pct>=70?'high':'normal'; }
  formatDate(d:string){return new Date(d).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'});}

  incr(){if(this.qty<10)this.qty++;}
  decr(){if(this.qty>1)this.qty--;}
  toConfirm(){this.step='confirm';}
  back(){this.step='detail';}

  confirm(){
    const e=this.ev.selectedEvent();
    if(!e)return;
    this.tk.acheterTicket(e,this.qty);
    this.step='success';
    this.toast.show(`🎉 ${this.qty} billet(s) réservé(s) pour "${e.nom}"!`);
    setTimeout(()=>{this.step='detail';this.qty=1;this.ev.closeModal();},2500);
  }

  close(){this.ev.closeModal();this.step='detail';this.qty=1;}

  onBackdrop(e:MouseEvent){if((e.target as HTMLElement).classList.contains('modal-bd'))this.close();}
}
