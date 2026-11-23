export type Rol = 'USUARIO' | 'MODERADOR' | 'ADMIN';

export type TipoContenido = 'TEMA' | 'COMENTARIO';

export type EstadoReporte = 'PENDIENTE' | 'ACEPTADO' | 'DESCARTADO';

export interface Usuario {
  id: number;
  nombreUsuario: string;
  email: string;
  password: string;
  rol: Rol;
  activo: boolean;
  juegoFavoritoId: number | null;
  biografia: string;
  fechaCreacion: Date;
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
  imagen: string;
  color: string;
}

export interface Tema {
  id: number;
  titulo: string;
  contenido: string;
  categoriaId: number;
  autorId: number;
  autorNombre: string;
  baneado: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date | null;
}

export interface Comentario {
  id: number;
  temaId: number;
  contenido: string;
  autorId: number;
  autorNombre: string;
  baneado: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date | null;
}

export interface Norma {
  id: number;
  titulo: string;
  descripcion: string;
}

export interface Reporte {
  id: number;
  tipoContenido: TipoContenido;
  contenidoId: number;
  normaId: number;
  detalle: string;
  reportadoPorId: number;
  reportadoPorNombre: string;
  estado: EstadoReporte;
  revisadoPorNombre: string | null;
  fechaCreacion: Date;
  fechaRevision: Date | null;
}

export interface Baneo {
  id: number;
  tipoContenido: TipoContenido;
  contenidoId: number;
  normaId: number;
  motivo: string;
  moderadorId: number;
  moderadorNombre: string;
  activo: boolean;
  fechaBaneo: Date;
  levantadoPorNombre: string | null;
  fechaLevantamiento: Date | null;
}

/** Respuesta de las operaciones que pueden fallar por una regla de negocio. */
export interface Resultado<T = void> {
  ok: boolean;
  mensaje: string;
  dato?: T;
}
