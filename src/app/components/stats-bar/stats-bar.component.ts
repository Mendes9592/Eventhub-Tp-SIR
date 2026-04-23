import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EvenementService } from '../../services/evenement.service';
import { ArtisteService } from '../../services/artiste.service';
@Component({ selector:'app-stats-bar', standalone:true, imports:[CommonModule],
  template:`<div class="sb"><div class="sb__inner">
    <div class="sb__item"><span class="sb__icon">🎫</span><div><span class="sb__val">{{ev.totalTickets()|number}}</span><span class="sb__lbl">Tickets vendus</span></div></div>
    <div class="sb__div"></div>
    <div class="sb__item"><span class="sb__icon">🎭</span><div><span class="sb__val">{{ev.filteredEvenements().length}}</span><span class="sb__lbl">Événements trouvés</span></div></div>
    <div class="sb__div"></div>
    <div class="sb__item"><span class="sb__icon">🎤</span><div><span class="sb__val">{{ar.artistes().length}}</span><span class="sb__lbl">Artistes</span></div></div>
  </div></div>`,
  styles:[`.sb{background:var(--white);border-bottom:1px solid var(--dark-10)}.sb__inner{max-width:1280px;margin:0 auto;padding:0 24px;height:64px;display:flex;align-items:center}.sb__item{display:flex;align-items:center;gap:12px;flex:1}.sb__icon{font-size:1.4rem}.sb__val{font-size:1rem;font-weight:700;font-family:'Playfair Display',serif;display:block;line-height:1.2}.sb__lbl{font-size:.7rem;color:var(--dark-40);text-transform:uppercase;letter-spacing:.04em;display:block}.sb__div{width:1px;height:36px;background:var(--dark-10);margin:0 20px}@media(max-width:600px){.sb__inner{height:auto;padding:12px 16px;flex-direction:column;align-items:flex-start;gap:8px}.sb__div{display:none}}`]
})
export class StatsBarComponent { ev = inject(EvenementService); ar = inject(ArtisteService); }
