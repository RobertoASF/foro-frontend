import { Injectable } from '@angular/core';
import { combineLatest, map } from 'rxjs';
import { CATEGORIAS, COMENTARIOS, TEMAS } from '../data/datos-iniciales';
import { Categoria, Comentario, Resultado, Tema, TipoContenido, Usuario } from '../models/modelos';
import { ColeccionObservable } from './coleccion-observable';

export interface DatosTema {
  titulo: string;
  contenido: string;
  categoriaId: number;
}

export interface DatosCategoria {
  nombre: string;
  descripcion: string;
  color: string;
}

export interface FiltroTemas {
  texto?: string;
  categoriaId?: number | null;
  autor?: string;
}

export interface ResumenCategoria {
  categoria: Categoria;
  totalTemas: number;
  totalComentarios: number;
  ultimoTema: Tema | null;
}

const IMAGEN_GENERICA = 'img/categorias/generica.svg';

@Injectable({ providedIn: 'root' })
export class ForoService {
  private readonly categorias = new ColeccionObservable<Categoria>(CATEGORIAS);
  private readonly temas = new ColeccionObservable<Tema>(TEMAS);
  private readonly comentarios = new ColeccionObservable<Comentario>(COMENTARIOS);

  readonly categorias$ = this.categorias.cambios$;
  readonly temas$ = this.temas.cambios$;
  readonly comentarios$ = this.comentarios.cambios$;

  /** Se vuelve a calcular cada vez que cambia un tema, comentario o categoría. */
  readonly resumen$ = combineLatest([this.categorias$, this.temas$, this.comentarios$]).pipe(
    map(() => this.resumenCategorias()),
  );

  // ---------- Consultas del foro: solo muestran contenido visible ----------

  listarCategorias(): Categoria[] {
    return [...this.categorias.todos].sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  categoria(id: number): Categoria | undefined {
    return this.categorias.buscar(id);
  }

  buscarTemas(filtro: FiltroTemas = {}): Tema[] {
    const texto = filtro.texto?.trim().toLowerCase() ?? '';
    const autor = filtro.autor?.trim().toLowerCase() ?? '';
    return this.temas.todos
      .filter((tema) => !tema.baneado)
      .filter((tema) => !filtro.categoriaId || tema.categoriaId === filtro.categoriaId)
      .filter((tema) => !autor || tema.autorNombre.toLowerCase().includes(autor))
      .filter(
        (tema) => !texto || tema.titulo.toLowerCase().includes(texto) || tema.contenido.toLowerCase().includes(texto),
      )
      .sort((a, b) => b.fechaCreacion.getTime() - a.fechaCreacion.getTime());
  }

  temasRecientes(cantidad: number): Tema[] {
    return this.buscarTemas().slice(0, cantidad);
  }

  temaVisible(id: number): Tema | undefined {
    const tema = this.temas.buscar(id);
    return tema && !tema.baneado ? tema : undefined;
  }

  comentariosDe(temaId: number): Comentario[] {
    return this.comentarios.todos
      .filter((comentario) => comentario.temaId === temaId && !comentario.baneado)
      .sort((a, b) => a.fechaCreacion.getTime() - b.fechaCreacion.getTime());
  }

  totalComentarios(temaId: number): number {
    return this.comentariosDe(temaId).length;
  }

  resumenCategorias(): ResumenCategoria[] {
    return this.listarCategorias().map((categoria) => {
      const temas = this.buscarTemas({ categoriaId: categoria.id });
      return {
        categoria,
        totalTemas: temas.length,
        totalComentarios: temas.reduce((total, tema) => total + this.totalComentarios(tema.id), 0),
        ultimoTema: temas[0] ?? null,
      };
    });
  }

  /** Para moderación: muestra el texto aunque el contenido esté baneado. */
  vistaPrevia(tipo: TipoContenido, id: number): string | null {
    const contenido = tipo === 'TEMA' ? this.temas.buscar(id) : this.comentarios.buscar(id);
    if (!contenido) {
      return null;
    }
    return 'titulo' in contenido ? `${contenido.titulo}: ${contenido.contenido}` : contenido.contenido;
  }

  existeVisible(tipo: TipoContenido, id: number): boolean {
    const contenido = tipo === 'TEMA' ? this.temas.buscar(id) : this.comentarios.buscar(id);
    return !!contenido && !contenido.baneado;
  }

  // ---------- Acciones de los usuarios ----------

  publicarTema(datos: DatosTema, autor: Usuario): Resultado<Tema> {
    if (!this.categoria(datos.categoriaId)) {
      return { ok: false, mensaje: 'La categoría no existe' };
    }
    const tema = this.temas.agregar({
      titulo: datos.titulo.trim(),
      contenido: datos.contenido.trim(),
      categoriaId: datos.categoriaId,
      autorId: autor.id,
      autorNombre: autor.nombreUsuario,
      baneado: false,
      fechaCreacion: new Date(),
      fechaActualizacion: null,
    });
    return { ok: true, mensaje: 'Tema publicado', dato: tema };
  }

  editarTema(id: number, datos: DatosTema, usuario: Usuario): Resultado {
    const tema = this.temaVisible(id);
    if (!tema) {
      return { ok: false, mensaje: 'El tema no existe' };
    }
    if (tema.autorId !== usuario.id) {
      return { ok: false, mensaje: 'Solo el autor puede editar este tema' };
    }
    this.temas.actualizar(id, {
      titulo: datos.titulo.trim(),
      contenido: datos.contenido.trim(),
      categoriaId: datos.categoriaId,
      fechaActualizacion: new Date(),
    });
    return { ok: true, mensaje: 'Tema actualizado' };
  }

  eliminarTema(id: number, usuario: Usuario): Resultado {
    const tema = this.temaVisible(id);
    if (!tema) {
      return { ok: false, mensaje: 'El tema no existe' };
    }
    if (!this.puedeBorrar(tema.autorId, usuario)) {
      return { ok: false, mensaje: 'No puedes eliminar temas de otros usuarios' };
    }
    this.comentarios.eliminarDonde((comentario) => comentario.temaId === id);
    this.temas.eliminarDonde((item) => item.id === id);
    return { ok: true, mensaje: 'Tema eliminado' };
  }

  comentar(temaId: number, contenido: string, autor: Usuario): Resultado<Comentario> {
    if (!this.temaVisible(temaId)) {
      return { ok: false, mensaje: 'El tema no existe' };
    }
    const comentario = this.comentarios.agregar({
      temaId,
      contenido: contenido.trim(),
      autorId: autor.id,
      autorNombre: autor.nombreUsuario,
      baneado: false,
      fechaCreacion: new Date(),
      fechaActualizacion: null,
    });
    return { ok: true, mensaje: 'Comentario publicado', dato: comentario };
  }

  editarComentario(id: number, contenido: string, usuario: Usuario): Resultado {
    const comentario = this.comentarios.buscar(id);
    if (!comentario || comentario.baneado) {
      return { ok: false, mensaje: 'El comentario no existe' };
    }
    if (comentario.autorId !== usuario.id) {
      return { ok: false, mensaje: 'Solo el autor puede editar este comentario' };
    }
    this.comentarios.actualizar(id, { contenido: contenido.trim(), fechaActualizacion: new Date() });
    return { ok: true, mensaje: 'Comentario actualizado' };
  }

  eliminarComentario(id: number, usuario: Usuario): Resultado {
    const comentario = this.comentarios.buscar(id);
    if (!comentario || comentario.baneado) {
      return { ok: false, mensaje: 'El comentario no existe' };
    }
    if (!this.puedeBorrar(comentario.autorId, usuario)) {
      return { ok: false, mensaje: 'No puedes eliminar comentarios de otros usuarios' };
    }
    this.comentarios.eliminarDonde((item) => item.id === id);
    return { ok: true, mensaje: 'Comentario eliminado' };
  }

  // ---------- Moderación y administración ----------

  cambiarBaneo(tipo: TipoContenido, id: number, baneado: boolean): Resultado {
    const actualizado =
      tipo === 'TEMA' ? this.temas.actualizar(id, { baneado }) : this.comentarios.actualizar(id, { baneado });
    if (!actualizado) {
      return { ok: false, mensaje: tipo === 'TEMA' ? 'El tema no existe' : 'El comentario no existe' };
    }
    return { ok: true, mensaje: baneado ? 'Contenido oculto del foro' : 'Contenido visible nuevamente' };
  }

  crearCategoria(datos: DatosCategoria): Resultado<Categoria> {
    if (this.existeCategoria(datos.nombre)) {
      return { ok: false, mensaje: 'Ya existe una categoría con ese nombre' };
    }
    const categoria = this.categorias.agregar({ ...this.limpiar(datos), imagen: IMAGEN_GENERICA });
    return { ok: true, mensaje: 'Categoría creada', dato: categoria };
  }

  actualizarCategoria(id: number, datos: DatosCategoria): Resultado {
    if (this.existeCategoria(datos.nombre, id)) {
      return { ok: false, mensaje: 'Ya existe una categoría con ese nombre' };
    }
    this.categorias.actualizar(id, this.limpiar(datos));
    return { ok: true, mensaje: 'Categoría actualizada' };
  }

  eliminarCategoria(id: number): Resultado {
    if (this.temas.todos.some((tema) => tema.categoriaId === id)) {
      return { ok: false, mensaje: 'No se puede eliminar una categoría que tiene temas' };
    }
    this.categorias.eliminarDonde((categoria) => categoria.id === id);
    return { ok: true, mensaje: 'Categoría eliminada' };
  }

  private puedeBorrar(autorId: number, usuario: Usuario): boolean {
    return autorId === usuario.id || usuario.rol === 'MODERADOR' || usuario.rol === 'ADMIN';
  }

  private existeCategoria(nombre: string, exceptoId?: number): boolean {
    const texto = nombre.trim().toLowerCase();
    return this.categorias.todos.some((c) => c.nombre.toLowerCase() === texto && c.id !== exceptoId);
  }

  private limpiar(datos: DatosCategoria): DatosCategoria {
    return { nombre: datos.nombre.trim(), descripcion: datos.descripcion.trim(), color: datos.color };
  }
}
