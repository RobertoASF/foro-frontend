import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ForoService } from '../../services/foro.service';
import { SesionService } from '../../services/sesion.service';
import { ErrorCampo } from '../../shared/error-campo/error-campo';
import { textoNoVacio } from '../../validators/validadores';

@Component({
  selector: 'app-tema-formulario',
  imports: [ReactiveFormsModule, RouterLink, ErrorCampo],
  templateUrl: './tema-formulario.html',
})
export class TemaFormulario implements OnInit {
  private readonly foro = inject(ForoService);
  private readonly sesion = inject(SesionService);
  private readonly router = inject(Router);

  /** Si viene un id se edita ese tema; si no, se publica uno nuevo. */
  readonly id = input<string>();
  /** Categoría elegida al llegar desde la página de una categoría. */
  readonly categoria = input<string>();

  readonly categorias = this.foro.listarCategorias();
  readonly editando = computed(() => !!this.id());
  readonly error = signal('');
  readonly sinPermiso = signal(false);

  readonly form = inject(FormBuilder).nonNullable.group({
    titulo: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(150), textoNoVacio]],
    categoriaId: [0, [Validators.min(1)]],
    contenido: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(2000), textoNoVacio]],
  });

  ngOnInit(): void {
    if (!this.editando()) {
      this.form.patchValue({ categoriaId: Number(this.categoria()) || 0 });
      return;
    }
    const tema = this.foro.temaVisible(Number(this.id()));
    if (!tema || tema.autorId !== this.sesion.usuario?.id) {
      this.sinPermiso.set(true);
      this.form.disable();
      return;
    }
    this.form.setValue({ titulo: tema.titulo, categoriaId: tema.categoriaId, contenido: tema.contenido });
  }

  guardar(): void {
    const usuario = this.sesion.usuario;
    this.error.set('');
    if (!usuario) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const datos = this.form.getRawValue();
    if (this.editando()) {
      const id = Number(this.id());
      const resultado = this.foro.editarTema(id, datos, usuario);
      resultado.ok ? this.router.navigate(['/temas', id]) : this.error.set(resultado.mensaje);
      return;
    }
    const resultado = this.foro.publicarTema(datos, usuario);
    if (resultado.ok && resultado.dato) {
      this.router.navigate(['/temas', resultado.dato.id]);
    } else {
      this.error.set(resultado.mensaje);
    }
  }
}
