import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ModeracionService } from '../../services/moderacion.service';

@Component({
  selector: 'app-normas',
  template: `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-12 col-lg-9 col-xl-8">
          <h1 class="titulo-seccion mb-2">Normas del foro</h1>
          <p class="text-body-secondary mb-4">
            Estas reglas cuidan la convivencia. Si un tema o comentario no las cumple, puedes reportarlo y un moderador lo
            revisará. El contenido que rompe las normas se banea y deja de verse en el foro.
          </p>
          <div class="row g-3">
            @for (norma of normas(); track norma.id; let i = $index) {
              <div class="col-12 col-md-6">
                <div class="tarjeta p-4 h-100 d-flex gap-3">
                  <span class="numero">{{ i + 1 }}</span>
                  <div>
                    <h2 class="h5 mb-1">{{ norma.titulo }}</h2>
                    <p class="mb-0 text-body-secondary">{{ norma.descripcion }}</p>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .numero {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 0.6rem;
      background: var(--mesa-dorado);
      color: var(--mesa-azul);
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
  `,
})
export class Normas {
  readonly normas = toSignal(inject(ModeracionService).normas$, { initialValue: [] });
}
