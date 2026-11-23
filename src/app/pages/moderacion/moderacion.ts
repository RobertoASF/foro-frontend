import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { combineLatest } from 'rxjs';
import { EstadoReporte, Norma, Reporte, Resultado, TipoContenido } from '../../models/modelos';
import { ForoService } from '../../services/foro.service';
import { ModeracionService } from '../../services/moderacion.service';
import { SesionService } from '../../services/sesion.service';
import { ErrorCampo } from '../../shared/error-campo/error-campo';
import { textoNoVacio } from '../../validators/validadores';

type Pestana = 'reportes' | 'baneos' | 'normas';

@Component({
  selector: 'app-moderacion',
  imports: [ReactiveFormsModule, DatePipe, ErrorCampo],
  templateUrl: './moderacion.html',
})
export class Moderacion {
  private readonly moderacion = inject(ModeracionService);
  private readonly foro = inject(ForoService);
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly datos = toSignal(
    combineLatest([this.moderacion.reportes$, this.moderacion.baneos$, this.moderacion.normas$, this.foro.cambios$]),
  );

  readonly usuario = toSignal(inject(SesionService).usuario$, { initialValue: null });
  readonly esAdmin = computed(() => this.usuario()?.rol === 'ADMIN');

  readonly pestana = signal<Pestana>('reportes');
  readonly filtroReportes = signal<EstadoReporte | ''>('PENDIENTE');
  readonly filtroBaneos = signal<'activos' | 'levantados' | ''>('activos');
  readonly reporteEnRevision = signal<number | null>(null);
  readonly normaEnEdicion = signal<number | null>(null);
  readonly aviso = signal<Resultado<unknown> | null>(null);

  readonly resumen = computed(() => {
    this.datos();
    return this.moderacion.resumen();
  });
  readonly normas = computed(() => {
    this.datos();
    return this.moderacion.listarNormas();
  });
  readonly reportes = computed(() => {
    this.datos();
    return this.moderacion.listarReportes(this.filtroReportes() || undefined);
  });
  readonly baneos = computed(() => {
    this.datos();
    const filtro = this.filtroBaneos();
    return this.moderacion.listarBaneos(filtro === '' ? undefined : filtro === 'activos');
  });

  readonly formBaneo = this.fb.group({
    motivo: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500), textoNoVacio]],
  });
  readonly formNorma = this.fb.group({
    titulo: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100), textoNoVacio]],
    descripcion: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500), textoNoVacio]],
  });

  vistaPrevia(tipo: TipoContenido, id: number): string {
    return this.foro.vistaPrevia(tipo, id) ?? 'Contenido eliminado por su autor';
  }

  tituloNorma(id: number): string {
    return this.moderacion.norma(id)?.titulo ?? 'Norma eliminada';
  }

  cambiarPestana(pestana: Pestana): void {
    this.aviso.set(null);
    this.pestana.set(pestana);
  }

  revisar(reporte: Reporte): void {
    this.formBaneo.reset();
    this.reporteEnRevision.set(this.reporteEnRevision() === reporte.id ? null : reporte.id);
  }

  banearDesdeReporte(reporte: Reporte): void {
    const usuario = this.usuario();
    if (!usuario) {
      return;
    }
    if (this.formBaneo.invalid) {
      this.formBaneo.markAllAsTouched();
      return;
    }
    const resultado = this.moderacion.banear(
      {
        tipoContenido: reporte.tipoContenido,
        contenidoId: reporte.contenidoId,
        normaId: reporte.normaId,
        motivo: this.formBaneo.controls.motivo.value,
      },
      usuario,
    );
    this.aviso.set(resultado);
    if (resultado.ok) {
      this.reporteEnRevision.set(null);
    }
  }

  descartar(reporte: Reporte): void {
    const usuario = this.usuario();
    if (usuario) {
      this.aviso.set(this.moderacion.descartar(reporte.id, usuario));
    }
  }

  levantar(baneoId: number): void {
    const usuario = this.usuario();
    if (usuario) {
      this.aviso.set(this.moderacion.levantar(baneoId, usuario));
    }
  }

  editarNorma(norma: Norma): void {
    this.normaEnEdicion.set(norma.id);
    this.formNorma.setValue({ titulo: norma.titulo, descripcion: norma.descripcion });
  }

  cancelarNorma(): void {
    this.normaEnEdicion.set(null);
    this.formNorma.reset();
  }

  guardarNorma(): void {
    if (this.formNorma.invalid) {
      this.formNorma.markAllAsTouched();
      return;
    }
    const { titulo, descripcion } = this.formNorma.getRawValue();
    const id = this.normaEnEdicion();
    const resultado = id
      ? this.moderacion.actualizarNorma(id, titulo, descripcion)
      : this.moderacion.crearNorma(titulo, descripcion);
    this.aviso.set(resultado);
    if (resultado.ok) {
      this.cancelarNorma();
    }
  }

  eliminarNorma(id: number): void {
    this.aviso.set(this.moderacion.eliminarNorma(id));
  }
}
