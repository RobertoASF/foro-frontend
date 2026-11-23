import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Comentario, Resultado, TipoContenido } from '../../models/modelos';
import { ForoService } from '../../services/foro.service';
import { ModeracionService } from '../../services/moderacion.service';
import { SesionService } from '../../services/sesion.service';
import { ErrorCampo } from '../../shared/error-campo/error-campo';
import { textoNoVacio } from '../../validators/validadores';

/** Qué panel está abierto y sobre qué contenido. */
interface PanelAbierto {
  accion: 'reportar' | 'banear' | 'editar' | 'eliminar';
  tipo: TipoContenido;
  id: number;
}

@Component({
  selector: 'app-tema-detalle',
  imports: [ReactiveFormsModule, RouterLink, DatePipe, NgTemplateOutlet, ErrorCampo],
  templateUrl: './tema-detalle.html',
  styleUrl: './tema-detalle.css',
})
export class TemaDetalle {
  private readonly foro = inject(ForoService);
  private readonly moderacion = inject(ModeracionService);
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly datos = toSignal(this.foro.cambios$);

  readonly id = input.required<string>();
  readonly usuario = toSignal(inject(SesionService).usuario$, { initialValue: null });
  readonly normas = this.moderacion.listarNormas();

  readonly tema = computed(() => {
    this.datos();
    return this.foro.temaVisible(Number(this.id()));
  });
  readonly categoria = computed(() => this.foro.categoria(this.tema()?.categoriaId ?? 0));
  readonly comentarios = computed(() => {
    this.datos();
    return this.foro.comentariosDe(Number(this.id()));
  });

  readonly panel = signal<PanelAbierto | null>(null);
  readonly aviso = signal<{ ok: boolean; mensaje: string } | null>(null);

  readonly formComentario = this.fb.group({
    contenido: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(1000), textoNoVacio]],
  });
  readonly formEdicion = this.fb.group({
    contenido: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(1000), textoNoVacio]],
  });
  readonly formReporte = this.fb.group({
    normaId: [0, [Validators.min(1)]],
    detalle: ['', [Validators.maxLength(500)]],
  });
  readonly formBaneo = this.fb.group({
    normaId: [0, [Validators.min(1)]],
    motivo: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500), textoNoVacio]],
  });

  // ---------- Permisos que se muestran en pantalla ----------

  esAutor(autorId: number): boolean {
    return this.usuario()?.id === autorId;
  }

  esModerador(): boolean {
    const rol = this.usuario()?.rol;
    return rol === 'MODERADOR' || rol === 'ADMIN';
  }

  puedeEliminar(autorId: number): boolean {
    return this.esAutor(autorId) || this.esModerador();
  }

  panelAbierto(accion: PanelAbierto['accion'], tipo: TipoContenido, id: number): boolean {
    const actual = this.panel();
    return actual?.accion === accion && actual.tipo === tipo && actual.id === id;
  }

  // ---------- Acciones ----------

  abrir(accion: PanelAbierto['accion'], tipo: TipoContenido, id: number, comentario?: Comentario): void {
    this.aviso.set(null);
    this.formReporte.reset();
    this.formBaneo.reset();
    if (accion === 'editar' && comentario) {
      this.formEdicion.reset({ contenido: comentario.contenido });
    }
    this.panel.set(this.panelAbierto(accion, tipo, id) ? null : { accion, tipo, id });
  }

  cerrarPanel(): void {
    this.panel.set(null);
  }

  comentar(): void {
    const usuario = this.usuario();
    const tema = this.tema();
    if (!usuario || !tema) {
      return;
    }
    if (this.formComentario.invalid) {
      this.formComentario.markAllAsTouched();
      return;
    }
    const resultado = this.foro.comentar(tema.id, this.formComentario.controls.contenido.value, usuario);
    this.mostrar(resultado);
    if (resultado.ok) {
      this.formComentario.reset();
    }
  }

  guardarEdicion(comentarioId: number): void {
    const usuario = this.usuario();
    if (!usuario) {
      return;
    }
    if (this.formEdicion.invalid) {
      this.formEdicion.markAllAsTouched();
      return;
    }
    this.terminar(this.foro.editarComentario(comentarioId, this.formEdicion.controls.contenido.value, usuario));
  }

  eliminar(tipo: TipoContenido, id: number): void {
    const usuario = this.usuario();
    if (!usuario) {
      return;
    }
    this.terminar(tipo === 'TEMA' ? this.foro.eliminarTema(id, usuario) : this.foro.eliminarComentario(id, usuario));
  }

  reportar(tipo: TipoContenido, id: number): void {
    const usuario = this.usuario();
    if (!usuario) {
      return;
    }
    if (this.formReporte.invalid) {
      this.formReporte.markAllAsTouched();
      return;
    }
    const { normaId, detalle } = this.formReporte.getRawValue();
    this.terminar(this.moderacion.reportar({ tipoContenido: tipo, contenidoId: id, normaId, detalle }, usuario));
  }

  banear(tipo: TipoContenido, id: number): void {
    const usuario = this.usuario();
    if (!usuario) {
      return;
    }
    if (this.formBaneo.invalid) {
      this.formBaneo.markAllAsTouched();
      return;
    }
    const { normaId, motivo } = this.formBaneo.getRawValue();
    this.terminar(this.moderacion.banear({ tipoContenido: tipo, contenidoId: id, normaId, motivo }, usuario));
  }

  private terminar(resultado: Resultado<unknown>): void {
    this.mostrar(resultado);
    if (resultado.ok) {
      this.panel.set(null);
    }
  }

  private mostrar(resultado: Resultado<unknown>): void {
    this.aviso.set({ ok: resultado.ok, mensaje: resultado.mensaje });
  }
}
