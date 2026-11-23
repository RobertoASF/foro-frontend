import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, startWith } from 'rxjs';
import { ForoService } from '../../services/foro.service';
import { ErrorCampo } from '../../shared/error-campo/error-campo';
import { TarjetaTema } from '../../shared/tarjeta-tema/tarjeta-tema';

@Component({
  selector: 'app-buscar',
  imports: [ReactiveFormsModule, TarjetaTema, ErrorCampo],
  templateUrl: './buscar.html',
})
export class Buscar {
  private readonly foro = inject(ForoService);
  private readonly datos = toSignal(this.foro.cambios$);

  readonly categorias = this.foro.listarCategorias();

  readonly form = inject(FormBuilder).nonNullable.group({
    texto: ['', [Validators.minLength(2), Validators.maxLength(60)]],
    categoriaId: [0],
    autor: ['', [Validators.maxLength(30), Validators.pattern(/^[a-zA-Z0-9._-]*$/)]],
  });

  // Espera un momento después de escribir para no filtrar con cada tecla
  private readonly filtro = toSignal(this.form.valueChanges.pipe(debounceTime(250), startWith(this.form.getRawValue())), {
    initialValue: this.form.getRawValue(),
  });

  readonly resultados = computed(() => {
    this.datos();
    const filtro = this.filtro();
    if (this.form.invalid) {
      return [];
    }
    return this.foro.conDetalle(
      this.foro.buscarTemas({ texto: filtro.texto, categoriaId: filtro.categoriaId, autor: filtro.autor }),
    );
  });

  limpiar(): void {
    this.form.reset();
  }
}
