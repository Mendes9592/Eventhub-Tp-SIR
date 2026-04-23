import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EvenementService } from '../../services/evenement.service';
@Component({ selector:'app-category-filter', standalone:true, imports:[CommonModule],
  template:`<div class="cf"><div class="cf__scroll">
    @for(cat of ev.categories; track cat.id){
      <button class="cf__chip" [class.active]="ev.selectedCategory()===cat.id" (click)="ev.setCategory(cat.id)" type="button">
        <span>{{cat.icon}}</span><span>{{cat.label}}</span>
      </button>}
  </div></div>`,
  styles:[`.cf{background:var(--white);border-bottom:1px solid var(--dark-10)}.cf__scroll{max-width:1280px;margin:0 auto;padding:14px 24px;display:flex;gap:8px;overflow-x:auto;scrollbar-width:none}.cf__scroll::-webkit-scrollbar{display:none}.cf__chip{display:flex;align-items:center;gap:7px;padding:8px 18px;border-radius:24px;font-size:.85rem;font-weight:500;background:var(--beige);color:var(--dark-80);white-space:nowrap;border:1.5px solid transparent;transition:all .2s;cursor:pointer}.cf__chip:hover{border-color:var(--pink)}.cf__chip.active{background:var(--red);color:#fff;border-color:var(--red);box-shadow:0 4px 12px rgba(200,41,9,.25)}`]
})
export class CategoryFilterComponent { ev = inject(EvenementService); }
