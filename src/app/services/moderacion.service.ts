import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { BANEOS, NORMAS, REPORTES } from '../data/datos-iniciales';
import { Baneo, EstadoReporte, Norma, Reporte, Resultado, TipoContenido, Usuario } from '../models/modelos';
import { ColeccionObservable } from './coleccion-observable';
import { ForoService } from './foro.service';

export interface DatosReporte {
  tipoContenido: TipoContenido;
  contenidoId: number;
  normaId: number;
  detalle: string;
}

export interface DatosBaneo {
  tipoContenido: TipoContenido;
  contenidoId: number;
  normaId: number;
  motivo: string;
}

export interface ResumenModeracion {
  reportesPendientes: number;
  baneosActivos: number;
  temasBaneados: number;
  comentariosBaneados: number;
}

@Injectable({ providedIn: 'root' })
export class ModeracionService {
  private readonly foro = inject(ForoService);
  private readonly normas = new ColeccionObservable<Norma>(NORMAS);
  private readonly reportes = new ColeccionObservable<Reporte>(REPORTES);
  private readonly baneos = new ColeccionObservable<Baneo>(BANEOS);

  readonly normas$ = this.normas.cambios$;
  readonly reportes$ = this.reportes.cambios$;
  readonly baneos$ = this.baneos.cambios$;

  /** El contador de la barra de navegación se actualiza solo. */
  readonly pendientes$ = this.reportes$.pipe(
    map((reportes) => reportes.filter((reporte) => reporte.estado === 'PENDIENTE').length),
  );

  // ---------- Normas ----------

  listarNormas(): Norma[] {
    return this.normas.todos;
  }

  norma(id: number): Norma | undefined {
    return this.normas.buscar(id);
  }

  crearNorma(titulo: string, descripcion: string): Resultado {
    if (this.existeNorma(titulo)) {
      return { ok: false, mensaje: 'Ya existe una norma con ese título' };
    }
    this.normas.agregar({ titulo: titulo.trim(), descripcion: descripcion.trim() });
    return { ok: true, mensaje: 'Norma creada' };
  }

  actualizarNorma(id: number, titulo: string, descripcion: string): Resultado {
    if (this.existeNorma(titulo, id)) {
      return { ok: false, mensaje: 'Ya existe una norma con ese título' };
    }
    this.normas.actualizar(id, { titulo: titulo.trim(), descripcion: descripcion.trim() });
    return { ok: true, mensaje: 'Norma actualizada' };
  }

  eliminarNorma(id: number): Resultado {
    const enUso =
      this.reportes.todos.some((reporte) => reporte.normaId === id) ||
      this.baneos.todos.some((baneo) => baneo.normaId === id);
    if (enUso) {
      return { ok: false, mensaje: 'La norma ya se usó en reportes o baneos y no se puede eliminar' };
    }
    this.normas.eliminarDonde((norma) => norma.id === id);
    return { ok: true, mensaje: 'Norma eliminada' };
  }

  // ---------- Reportes ----------

  listarReportes(estado?: EstadoReporte): Reporte[] {
    return this.reportes.todos
      .filter((reporte) => !estado || reporte.estado === estado)
      .sort((a, b) => b.fechaCreacion.getTime() - a.fechaCreacion.getTime());
  }

  reportesDe(usuarioId: number): Reporte[] {
    return this.listarReportes().filter((reporte) => reporte.reportadoPorId === usuarioId);
  }

  reportar(datos: DatosReporte, usuario: Usuario): Resultado {
    const repetido = this.reportes.todos.some(
      (r) =>
        r.tipoContenido === datos.tipoContenido &&
        r.contenidoId === datos.contenidoId &&
        r.reportadoPorId === usuario.id &&
        r.estado === 'PENDIENTE',
    );
    if (repetido) {
      return { ok: false, mensaje: 'Ya reportaste este contenido y está pendiente de revisión' };
    }
    if (!this.foro.existeVisible(datos.tipoContenido, datos.contenidoId)) {
      return { ok: false, mensaje: 'El contenido que quieres reportar no existe' };
    }
    this.reportes.agregar({
      ...datos,
      detalle: datos.detalle.trim(),
      reportadoPorId: usuario.id,
      reportadoPorNombre: usuario.nombreUsuario,
      estado: 'PENDIENTE',
      revisadoPorNombre: null,
      fechaCreacion: new Date(),
      fechaRevision: null,
    });
    return { ok: true, mensaje: 'Gracias, un moderador revisará tu reporte' };
  }

  descartar(id: number, moderador: Usuario): Resultado {
    const reporte = this.reportes.buscar(id);
    if (!reporte || reporte.estado !== 'PENDIENTE') {
      return { ok: false, mensaje: 'El reporte ya fue revisado' };
    }
    this.reportes.actualizar(id, {
      estado: 'DESCARTADO',
      revisadoPorNombre: moderador.nombreUsuario,
      fechaRevision: new Date(),
    });
    return { ok: true, mensaje: 'Reporte descartado' };
  }

  // ---------- Baneos ----------

  listarBaneos(activo?: boolean): Baneo[] {
    return this.baneos.todos
      .filter((baneo) => activo === undefined || baneo.activo === activo)
      .sort((a, b) => b.fechaBaneo.getTime() - a.fechaBaneo.getTime());
  }

  banear(datos: DatosBaneo, moderador: Usuario): Resultado {
    if (moderador.rol === 'USUARIO') {
      return { ok: false, mensaje: 'No tienes permisos para banear contenido' };
    }
    const yaBaneado = this.baneos.todos.some(
      (b) => b.tipoContenido === datos.tipoContenido && b.contenidoId === datos.contenidoId && b.activo,
    );
    if (yaBaneado) {
      return { ok: false, mensaje: 'Este contenido ya está baneado' };
    }
    const oculto = this.foro.cambiarBaneo(datos.tipoContenido, datos.contenidoId, true);
    if (!oculto.ok) {
      return oculto;
    }

    this.baneos.agregar({
      ...datos,
      motivo: datos.motivo.trim(),
      moderadorId: moderador.id,
      moderadorNombre: moderador.nombreUsuario,
      activo: true,
      fechaBaneo: new Date(),
      levantadoPorNombre: null,
      fechaLevantamiento: null,
    });
    // Los reportes pendientes de ese contenido quedan aceptados
    this.reportes.todos
      .filter((r) => r.tipoContenido === datos.tipoContenido && r.contenidoId === datos.contenidoId && r.estado === 'PENDIENTE')
      .forEach((r) =>
        this.reportes.actualizar(r.id, {
          estado: 'ACEPTADO',
          revisadoPorNombre: moderador.nombreUsuario,
          fechaRevision: new Date(),
        }),
      );
    return { ok: true, mensaje: 'Contenido baneado y oculto del foro' };
  }

  levantar(id: number, administrador: Usuario): Resultado {
    if (administrador.rol !== 'ADMIN') {
      return { ok: false, mensaje: 'Solo un administrador puede levantar baneos' };
    }
    const baneo = this.baneos.buscar(id);
    if (!baneo || !baneo.activo) {
      return { ok: false, mensaje: 'El baneo ya fue levantado' };
    }
    this.foro.cambiarBaneo(baneo.tipoContenido, baneo.contenidoId, false);
    this.baneos.actualizar(id, {
      activo: false,
      levantadoPorNombre: administrador.nombreUsuario,
      fechaLevantamiento: new Date(),
    });
    return { ok: true, mensaje: 'Baneo levantado, el contenido vuelve al foro' };
  }

  resumen(): ResumenModeracion {
    const activos = this.listarBaneos(true);
    return {
      reportesPendientes: this.listarReportes('PENDIENTE').length,
      baneosActivos: activos.length,
      temasBaneados: activos.filter((b) => b.tipoContenido === 'TEMA').length,
      comentariosBaneados: activos.filter((b) => b.tipoContenido === 'COMENTARIO').length,
    };
  }

  private existeNorma(titulo: string, exceptoId?: number): boolean {
    const texto = titulo.trim().toLowerCase();
    return this.normas.todos.some((norma) => norma.titulo.toLowerCase() === texto && norma.id !== exceptoId);
  }
}
