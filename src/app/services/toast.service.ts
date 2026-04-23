import { Injectable, signal } from '@angular/core';

export interface Toast { id: number; message: string; type: 'success'|'error'|'info'; }

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  show(message: string, type: 'success'|'error'|'info' = 'success') {
    const t: Toast = { id: Date.now(), message, type };
    this._toasts.update(list => [...list, t]);
    setTimeout(() => this.remove(t.id), 3500);
  }

  remove(id: number) { this._toasts.update(list => list.filter(t => t.id !== id)); }
}
