import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
@Component({ selector:'app-login', standalone:true, imports:[CommonModule,FormsModule,RouterLink], templateUrl:'./login.component.html', styleUrls:['./login.component.scss'] })
export class LoginComponent {
  auth = inject(AuthService); toast = inject(ToastService); router = inject(Router);
  form = { username:'', password:'' };
  loading = signal(false); error = signal('');
  submit() {
    if(!this.form.username||!this.form.password){this.error.set('Veuillez remplir tous les champs.');return;}
    this.loading.set(true); this.error.set('');
    try {
      this.auth.login(this.form).subscribe({
        next:(r)=>{ this.toast.show('Bienvenue '+r.user.prenom+' !'); this.router.navigate(['/']); },
        error:(e)=>{ this.error.set('Identifiants incorrects.'); this.loading.set(false); }
      });
    } catch(e:any){ this.error.set(e.message); this.loading.set(false); }
  }
}
