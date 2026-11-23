import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-no-encontrada',
  imports: [RouterLink],
  template: `
    <div class="container py-5 text-center">
      <div class="display-1 fw-bold codigo">404</div>
      <h1 class="h3">Esta carta no está en el mazo</h1>
      <p class="text-body-secondary">La página que buscas no existe o fue eliminada.</p>
      <a routerLink="/" class="btn btn-primary"><i class="bi bi-house-door me-2"></i>Volver al inicio</a>
    </div>
  `,
  styles: `
    .codigo {
      color: var(--mesa-morado);
      font-family: 'Poppins', sans-serif;
    }
  `,
})
export class NoEncontrada {}
