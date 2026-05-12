import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
@Component({ selector:'app-register', standalone:true, imports:[CommonModule,FormsModule,RouterLink], templateUrl:'./register.component.html', styleUrls:['./register.component.scss'] })
export class RegisterComponent {
  auth = inject(AuthService); toast = inject(ToastService); router = inject(Router);
  form = { nom:'', prenom:'', username:'', password:'', confirmPassword:'', role:'UTILISATEUR' as 'UTILISATEUR'|'ORGANISATEUR' };
  loading = signal(false); error = signal('');
  submit() {
    if(!this.form.nom||!this.form.prenom||!this.form.username||!this.form.password){this.error.set('Tous les champs sont obligatoires.');return;}
    if(this.form.password!==this.form.confirmPassword){this.error.set('Les mots de passe ne correspondent pas.');return;}
    if(this.form.password.length<4){this.error.set('Mot de passe trop court (min. 4 caractères).');return;}
    this.loading.set(true); this.error.set('');
    this.auth.register(this.form).subscribe({
      next: () => {
        const user = this.auth.user();
        this.toast.show(
          "Bienvenue " + (user?.prenom ?? "") + " !Compte créé avec succès. Veuillez vous connecter.",
        );
        this.router.navigate(["/login"]);
      },
      error: () => {
        this.error.set("Erreur lors de la création du compte.");
        this.loading.set(false);
      },
    });
  }
}
