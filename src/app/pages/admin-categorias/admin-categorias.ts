import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Categoria, Resultado } from '../../models/modelos';
import { ForoService } from '../../services/foro.service';
import { ErrorCampo } from '../../shared/error-campo/error-campo';
import { textoNoVacio } from '../../validators/validadores';

@Component({
  selector: 'app-admin-categorias',
  imports: [ReactiveFormsModule, RouterLink, ErrorCampo],
  templateUrl: './admin-categorias.html',
})
export class AdminCategorias {
  private readonly foro = inject(ForoService);

  readonly resumen = toSignal(this.foro.resumen$, { initialValue: [] });
  readonly enEdicion = signal<number | null>(null);
  readonly aviso = signal<Resultado<unknown> | null>(null);
  readonly titulo = computed(() => (this.enEdicion() ? 'Editar categoría' : 'Nueva categoría'));

  readonly form = inject(FormBuilder).nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(60), textoNoVacio]],
    descripcion: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(255), textoNoVacio]],
    color: ['#5b3cc4', [Validators.required, Validators.pattern(/^#[0-9a-fA-F]{6}$/)]],
  });

  editar(categoria: Categoria): void {
    this.aviso.set(null);
    this.enEdicion.set(categoria.id);
    this.form.setValue({ nombre: categoria.nombre, descripcion: categoria.descripcion, color: categoria.color });
  }

  cancelar(): void {
    this.enEdicion.set(null);
    this.form.reset();
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const datos = this.form.getRawValue();
    const id = this.enEdicion();
    const resultado = id ? this.foro.actualizarCategoria(id, datos) : this.foro.crearCategoria(datos);
    this.aviso.set(resultado);
    if (resultado.ok) {
      this.cancelar();
    }
  }

  eliminar(id: number): void {
    this.aviso.set(this.foro.eliminarCategoria(id));
  }
}
