import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pie',
  imports: [RouterLink],
  template: `
    <footer class="pie mt-auto">
      <div class="container py-4">
        <div class="row g-4 align-items-center">
          <div class="col-12 col-md-6 text-center text-md-start">
            <div class="d-flex align-items-center justify-content-center justify-content-md-start gap-2">
              <img src="logo.svg" alt="" width="32" height="32" class="logo">
              <strong class="fs-5">Mesa <span class="dorado">TCG</span></strong>
            </div>
            <p class="mb-0 mt-2 small">El foro para hablar de mazos, torneos y cartas coleccionables.</p>
          </div>
          <div class="col-12 col-md-6 text-center text-md-end small">
            <a routerLink="/normas" class="me-3">Normas del foro</a>
            <a routerLink="/buscar">Buscar temas</a>
            <p class="mb-0 mt-2">Proyecto académico Desarrollo Fullstack III · 2026</p>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: `
    .pie {
      background: var(--mesa-azul);
      color: #c9cbe0;
    }
    .pie a {
      color: #ffffff;
      text-decoration: none;
    }
    .pie a:hover {
      color: var(--mesa-dorado);
    }
    .logo {
      background: #ffffff;
      border-radius: 0.5rem;
      padding: 2px;
    }
    .dorado {
      color: var(--mesa-dorado);
    }
  `,
})
export class Pie {}
