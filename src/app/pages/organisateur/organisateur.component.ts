import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EvenementService } from '../../services/evenement.service';
import { ToastService } from '../../services/toast.service';
import { Evenement } from '../../models';
@Component({ selector:'app-organisateur', standalone:true, imports:[CommonModule,FormsModule,RouterLink], templateUrl:'./organisateur.component.html', styleUrls:['./organisateur.component.scss'] })
export class OrganisateurComponent {
  auth = inject(AuthService); ev = inject(EvenementService); toast = inject(ToastService);
  tab = signal<'list'|'create'|'edit'>('list');
  editTarget = signal<Evenement|null>(null);
  deleteConfirm = signal<number|null>(null);

  form = this.emptyForm();
  emptyForm(){return{nom:'',date:'',heure:'20:00',lieu:'',categorie:'electronique',prix:30,capacite:500,description:'',imageUrl:'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=600&q=80'};}

  get myEvents(){ return this.ev.evenements(); }
  formatDate(d:string){return new Date(d).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'});}

  startCreate(){ this.form=this.emptyForm(); this.editTarget.set(null); this.tab.set('create'); }
  startEdit(e:Evenement){
    this.editTarget.set(e);
    this.form={nom:e.nom,date:e.date,heure:e.heure??'20:00',lieu:e.lieu??'',categorie:e.categorie??'electronique',prix:e.prix,capacite:e.capacite??500,description:e.description??'',imageUrl:e.imageUrl??''};
    this.tab.set('edit');
  }
  submit(){
    if(!this.form.nom||!this.form.date||!this.form.lieu){this.toast.show('Champs obligatoires manquants.','error');return;}
    if(this.editTarget()){
      this.ev.updateEvenement({...this.editTarget()!,...this.form,organisateur:this.auth.user() as any});
      this.toast.show('Événement mis à jour !');
    } else {
      this.ev.addEvenement({id:Date.now(),...this.form,nbTicketsVendus:0,organisateur:this.auth.user() as any});
      this.toast.show('Événement créé !');
    }
    this.tab.set('list');
  }
  askDelete(id:number){ this.deleteConfirm.set(id); }
  confirmDelete(){ const id=this.deleteConfirm(); if(id){this.ev.deleteEvenement(id);this.toast.show('Événement supprimé.','info');this.deleteConfirm.set(null);} }
}
