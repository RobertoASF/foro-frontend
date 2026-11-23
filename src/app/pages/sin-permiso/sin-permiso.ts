import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sin-permiso',
  imports: [RouterLink],
  template: `
    <div class="container py-5 text-center">
      <i class="bi bi-shield-lock display-1 text-danger"></i>
      <h1 class="h3 mt-3">No tienes permiso para entrar aquí</h1>
      <p class="text-body-secondary">Esta sección es solo para moderadores o administradores del foro.</p>
      <a routerLink="/" class="btn btn-primary"><i class="bi bi-house-door me-2"></i>Volver al inicio</a>
    </div>
  `,
})
export class SinPermiso {}
