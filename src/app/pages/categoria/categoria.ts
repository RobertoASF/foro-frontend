import { Component, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ForoService, TemaConDetalle } from '../../services/foro.service';
import { SesionService } from '../../services/sesion.service';
import { ErrorCampo } from '../../shared/error-campo/error-campo';
import { TarjetaTema } from '../../shared/tarjeta-tema/tarjeta-tema';

type Orden = 'recientes' | 'comentados' | 'alfabetico';

@Component({
  selector: 'app-categoria',
  imports: [ReactiveFormsModule, RouterLink, TarjetaTema, ErrorCampo],
  templateUrl: './categoria.html',
})
export class CategoriaPagina {
  private readonly foro = inject(ForoService);

  /** Viene del :id de la ruta. */
  readonly id = input.required<string>();

  readonly usuario = toSignal(inject(SesionService).usuario$, { initialValue: null });
  private readonly datos = toSignal(this.foro.cambios$);

  readonly filtros = inject(FormBuilder).nonNullable.group({
    texto: ['', [Validators.maxLength(60)]],
    orden: ['recientes' as Orden],
  });
  private readonly valoresFiltro = toSignal(this.filtros.valueChanges, { initialValue: this.filtros.getRawValue() });

  readonly categoria = computed(() => {
    this.datos();
    return this.foro.categoria(Number(this.id()));
  });

  readonly temas = computed<TemaConDetalle[]>(() => {
    this.datos();
    const categoria = this.categoria();
    if (!categoria) {
      return [];
    }
    const { texto = '', orden = 'recientes' } = this.valoresFiltro();
    const lista = this.foro.conDetalle(this.foro.buscarTemas({ categoriaId: categoria.id, texto }));
    if (orden === 'comentados') {
      return [...lista].sort((a, b) => b.totalComentarios - a.totalComentarios);
    }
    if (orden === 'alfabetico') {
      return [...lista].sort((a, b) => a.tema.titulo.localeCompare(b.tema.titulo));
    }
    return lista;
  });

  readonly totalComentarios = computed(() => this.temas().reduce((total, item) => total + item.totalComentarios, 0));
}
