import { DatePipe, SlicePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Categoria, Tema } from '../../models/modelos';

@Component({
  selector: 'app-tarjeta-tema',
  imports: [RouterLink, DatePipe, SlicePipe],
  template: `
    <article class="tarjeta tarjeta-interactiva position-relative p-3 h-100 d-flex gap-3">
      <span class="avatar d-none d-sm-inline-flex">{{ tema().autorNombre.charAt(0) }}</span>
      <div class="flex-grow-1 min-w-0">
        <div class="d-flex flex-wrap align-items-center gap-2 mb-1">
          @if (categoria(); as cat) {
            <a class="badge etiqueta-categoria text-decoration-none enlace-sobre" [style.background]="cat.color"
               [routerLink]="['/categorias', cat.id]">{{ cat.nombre }}</a>
          }
          <small class="text-body-secondary">
            por <strong>{{ tema().autorNombre }}</strong> · {{ tema().fechaCreacion | date: 'd MMM y, HH:mm' }}
          </small>
        </div>
        <h3 class="h6 mb-1">
          <a class="stretched-link text-decoration-none titulo" [routerLink]="['/temas', tema().id]">{{ tema().titulo }}</a>
        </h3>
        <p class="mb-2 small text-body-secondary">
          {{ tema().contenido | slice: 0 : 140 }}{{ tema().contenido.length > 140 ? '…' : '' }}
        </p>
        <small class="text-body-secondary">
          <i class="bi bi-chat-dots me-1"></i>{{ totalComentarios() }}
          {{ totalComentarios() === 1 ? 'comentario' : 'comentarios' }}
        </small>
      </div>
    </article>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
    }
    .titulo {
      color: var(--mesa-azul);
    }
    .min-w-0 {
      min-width: 0;
    }
    /* El título abarca toda la tarjeta; la categoría queda encima para poder hacer clic */
    .enlace-sobre {
      position: relative;
      z-index: 2;
    }
  `,
})
export class TarjetaTema {
  readonly tema = input.required<Tema>();
  readonly categoria = input<Categoria | undefined>();
  readonly totalComentarios = input(0);
}
