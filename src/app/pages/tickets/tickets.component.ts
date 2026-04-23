import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TicketService } from '../../services/ticket.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { Ticket } from '../../models';
@Component({ selector:'app-tickets', standalone:true, imports:[CommonModule,RouterLink], templateUrl:'./tickets.component.html', styleUrls:['./tickets.component.scss'] })
export class TicketsComponent {
  tk = inject(TicketService);
  auth = inject(AuthService);
  toast = inject(ToastService);
  confirmCancel = signal<number|null>(null);

  formatDate(d:string){return new Date(d).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'});}

  askCancel(id:number){ this.confirmCancel.set(id); }
  cancelConfirmed(){
    const id = this.confirmCancel();
    if(id!==null){
      this.tk.annulerTicket(id);
      this.toast.show('Ticket annulé avec succès.','info');
      this.confirmCancel.set(null);
    }
  }
  cancelAbort(){ this.confirmCancel.set(null); }
}
