import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  auth = inject(AuthService);
  menuOpen = false;
  toggle() { this.menuOpen = !this.menuOpen; }
  close() { this.menuOpen = false; }
  logout() { this.auth.logout(); this.close(); }
}
