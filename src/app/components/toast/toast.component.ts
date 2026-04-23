import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';
@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (t of ts.toasts(); track t.id) {
        <div class="toast" [class]="'toast--'+t.type" (click)="ts.remove(t.id)">
          <span class="toast__icon">{{ t.type==='success'?'✓':t.type==='error'?'✕':'ℹ' }}</span>
          <span>{{ t.message }}</span>
        </div>
      }
    </div>`,
  styles: [`
    .toast-container{position:fixed;bottom:24px;right:24px;z-index:2000;display:flex;flex-direction:column;gap:10px}
    .toast{display:flex;align-items:center;gap:10px;padding:14px 20px;border-radius:12px;font-size:.88rem;font-weight:500;cursor:pointer;animation:slideIn .3s ease;box-shadow:0 8px 24px rgba(0,0,0,.15);min-width:260px}
    .toast--success{background:#2d6a4f;color:#fff}
    .toast--error{background:#C82909;color:#fff}
    .toast--info{background:#2D211C;color:#fff}
    .toast__icon{font-size:1.1rem;font-weight:700}
    @keyframes slideIn{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}
  `]
})
export class ToastComponent { ts = inject(ToastService); }
