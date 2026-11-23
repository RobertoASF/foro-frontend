import { Baneo, Categoria, Comentario, Norma, Reporte, Tema, Usuario } from '../models/modelos';

// Datos de partida del foro. Son los mismos registros que se cargan en Oracle para los microservicios.
// La clave de prueba de todos los usuarios es Foro2026*

export const USUARIOS: Usuario[] = [
  { id: 1, nombreUsuario: 'admin', email: 'admin@foro.cl', password: 'Foro2026*', rol: 'ADMIN', activo: true,
    juegoFavoritoId: 1, biografia: 'Administro el foro y sus categorías.', fechaCreacion: new Date('2026-10-01T09:00:00') },
  { id: 2, nombreUsuario: 'moderador', email: 'moderador@foro.cl', password: 'Foro2026*', rol: 'MODERADOR', activo: true,
    juegoFavoritoId: 5, biografia: 'Reviso los reportes y cuido que se respeten las normas.', fechaCreacion: new Date('2026-10-02T09:30:00') },
  { id: 3, nombreUsuario: 'camila', email: 'camila@foro.cl', password: 'Foro2026*', rol: 'USUARIO', activo: true,
    juegoFavoritoId: 3, biografia: 'Juego Pokemon desde chica y ahora estoy aprendiendo Magic.', fechaCreacion: new Date('2026-10-05T16:20:00') },
  { id: 4, nombreUsuario: 'diego', email: 'diego@foro.cl', password: 'Foro2026*', rol: 'USUARIO', activo: true,
    juegoFavoritoId: 2, biografia: 'Fanático de Mitos y Leyendas, juego torneos en Santiago.', fechaCreacion: new Date('2026-10-06T11:45:00') },
  { id: 5, nombreUsuario: 'valentina', email: 'valentina@foro.cl', password: 'Foro2026*', rol: 'USUARIO', activo: true,
    juegoFavoritoId: 4, biografia: '', fechaCreacion: new Date('2026-10-12T19:10:00') },
  { id: 6, nombreUsuario: 'tomas', email: 'tomas@foro.cl', password: 'Foro2026*', rol: 'USUARIO', activo: false,
    juegoFavoritoId: null, biografia: '', fechaCreacion: new Date('2026-10-15T08:05:00') },
];

export const CATEGORIAS: Categoria[] = [
  { id: 1, nombre: 'Magic The Gathering', descripcion: 'Mazos, formatos, reglas y novedades de Magic',
    imagen: 'img/categorias/magic.svg', color: '#c0392b' },
  { id: 2, nombre: 'Mitos y Leyendas', descripcion: 'El TCG chileno: ediciones, mazos y torneos',
    imagen: 'img/categorias/mitos.svg', color: '#b9770e' },
  { id: 3, nombre: 'Pokemon TCG', descripcion: 'Expansiones, mazos y torneos del juego de cartas',
    imagen: 'img/categorias/pokemon.svg', color: '#d4ac0d' },
  { id: 4, nombre: 'One Piece TCG', descripcion: 'Líderes, mazos y expansiones',
    imagen: 'img/categorias/onepiece.svg', color: '#1f618d' },
  { id: 5, nombre: 'Yu-Gi-Oh!', descripcion: 'Arquetipos, listas de cartas prohibidas y duelos',
    imagen: 'img/categorias/yugioh.svg', color: '#6c3483' },
];

export const TEMAS: Tema[] = [
  { id: 1, titulo: '¿Commander o Modern para partir?', categoriaId: 1, autorId: 3, autorNombre: 'camila', baneado: false,
    contenido: 'Quiero entrar a Magic este año y no sé si armar un mazo de Commander para jugar con amigos o partir con uno de Modern.',
    fechaCreacion: new Date('2026-10-20T10:15:00'), fechaActualizacion: null },
  { id: 2, titulo: 'Torneos de Mitos y Leyendas en Santiago', categoriaId: 2, autorId: 4, autorNombre: 'diego', baneado: false,
    contenido: 'Busco tiendas que organicen torneos los fines de semana. ¿Dónde están jugando?',
    fechaCreacion: new Date('2026-10-21T18:40:00'), fechaActualizacion: null },
  { id: 3, titulo: 'Mazos económicos para aprender a jugar', categoriaId: 3, autorId: 3, autorNombre: 'camila', baneado: false,
    contenido: 'Quiero partir sin gastar tanto. ¿Qué mazo recomiendan para aprender las reglas?',
    fechaCreacion: new Date('2026-10-22T07:30:00'), fechaActualizacion: null },
  { id: 4, titulo: '¿Qué líder recomiendan para mi primer mazo?', categoriaId: 4, autorId: 4, autorNombre: 'diego', baneado: false,
    contenido: 'Estoy armando mi primer mazo y no sé qué líder elegir. ¿Cuál es más fácil de jugar?',
    fechaCreacion: new Date('2026-10-23T21:05:00'), fechaActualizacion: null },
  { id: 5, titulo: 'Dónde revisar la lista de cartas prohibidas', categoriaId: 5, autorId: 2, autorNombre: 'moderador', baneado: false,
    contenido: 'Cada actualización cambia harto el formato. ¿Dónde revisan la lista vigente?',
    fechaCreacion: new Date('2026-10-24T22:10:00'), fechaActualizacion: null },
  { id: 6, titulo: 'Cómo guardar las cartas más caras', categoriaId: 1, autorId: 3, autorNombre: 'camila', baneado: false,
    contenido: 'Se me están doblando algunas cartas. ¿Usan doble funda o carpetas?',
    fechaCreacion: new Date('2026-10-25T12:20:00'), fechaActualizacion: null },
  { id: 7, titulo: 'Compra seguidores para tu canal de cartas', categoriaId: 3, autorId: 4, autorNombre: 'diego', baneado: true,
    contenido: 'Vendo seguidores y visitas para tu canal. Escríbeme por interno y te hago precio.',
    fechaCreacion: new Date('2026-10-26T08:50:00'), fechaActualizacion: null },
  { id: 8, titulo: 'Liga de One Piece en regiones', categoriaId: 4, autorId: 5, autorNombre: 'valentina', baneado: false,
    contenido: 'En Concepción estamos armando una liga mensual. ¿Alguien más de regiones se suma para compartir fechas?',
    fechaCreacion: new Date('2026-11-02T17:45:00'), fechaActualizacion: null },
  { id: 9, titulo: 'Arquetipos fáciles para volver a Yu-Gi-Oh!', categoriaId: 5, autorId: 4, autorNombre: 'diego', baneado: false,
    contenido: 'Dejé de jugar hace años y quiero volver. ¿Qué arquetipo es sencillo de aprender y no tan caro?',
    fechaCreacion: new Date('2026-11-05T20:30:00'), fechaActualizacion: null },
];

export const COMENTARIOS: Comentario[] = [
  { id: 1, temaId: 1, autorId: 4, autorNombre: 'diego', baneado: false,
    contenido: 'Commander es más entretenido en grupo, y puedes partir con un mazo preconstruido.',
    fechaCreacion: new Date('2026-10-20T11:00:00'), fechaActualizacion: null },
  { id: 2, temaId: 1, autorId: 2, autorNombre: 'moderador', baneado: false,
    contenido: 'Modern pide más inversión, así que yo partiría por el otro formato.',
    fechaCreacion: new Date('2026-10-20T12:30:00'), fechaActualizacion: null },
  { id: 3, temaId: 2, autorId: 3, autorNombre: 'camila', baneado: false,
    contenido: 'Revisa las tiendas de cartas del centro, varias publican sus torneos en redes sociales.',
    fechaCreacion: new Date('2026-10-21T19:15:00'), fechaActualizacion: null },
  { id: 4, temaId: 3, autorId: 4, autorNombre: 'diego', baneado: false,
    contenido: 'Los mazos preconstruidos sirven harto para aprender a jugar.',
    fechaCreacion: new Date('2026-10-22T08:45:00'), fechaActualizacion: null },
  { id: 5, temaId: 4, autorId: 3, autorNombre: 'camila', baneado: false,
    contenido: 'Los mazos de inicio traen un líder listo para jugar, es buena forma de partir.',
    fechaCreacion: new Date('2026-10-23T21:40:00'), fechaActualizacion: null },
  { id: 6, temaId: 6, autorId: 2, autorNombre: 'moderador', baneado: false,
    contenido: 'Doble funda para las más caras y carpeta de nueve bolsillos para el resto.',
    fechaCreacion: new Date('2026-10-25T13:00:00'), fechaActualizacion: null },
  { id: 7, temaId: 3, autorId: 4, autorNombre: 'diego', baneado: true,
    contenido: 'Si no tienes plata no juegues, deja de llorar en el foro.',
    fechaCreacion: new Date('2026-10-27T18:20:00'), fechaActualizacion: null },
  { id: 8, temaId: 8, autorId: 3, autorNombre: 'camila', baneado: false,
    contenido: '¡Qué buena idea! Si hacen una fecha en Santiago me apunto.',
    fechaCreacion: new Date('2026-11-03T10:10:00'), fechaActualizacion: null },
  { id: 9, temaId: 9, autorId: 2, autorNombre: 'moderador', baneado: false,
    contenido: 'Revisa los mazos de estructura, traen un arquetipo completo y son baratos.',
    fechaCreacion: new Date('2026-11-05T21:00:00'), fechaActualizacion: null },
];

export const NORMAS: Norma[] = [
  { id: 1, titulo: 'Respeto entre jugadores', descripcion: 'No se permiten insultos, burlas ni ataques personales.' },
  { id: 2, titulo: 'Sin spam ni publicidad', descripcion: 'No se permite publicidad, enlaces de venta ni mensajes repetidos.' },
  { id: 3, titulo: 'Publicar en la categoría correcta', descripcion: 'Cada tema debe ir en la categoría del juego del que habla.' },
  { id: 4, titulo: 'Sin cartas falsificadas', descripcion: 'No se permite ofrecer ni promover cartas falsas o réplicas no autorizadas.' },
  { id: 5, titulo: 'Sin datos personales', descripcion: 'No compartas teléfonos, direcciones ni datos de otras personas.' },
];

export const REPORTES: Reporte[] = [
  { id: 1, tipoContenido: 'TEMA', contenidoId: 7, normaId: 2, detalle: 'Ofrece seguidores pagados, no tiene nada que ver con cartas.',
    reportadoPorId: 3, reportadoPorNombre: 'camila', estado: 'ACEPTADO', revisadoPorNombre: 'moderador',
    fechaCreacion: new Date('2026-10-26T09:10:00'), fechaRevision: new Date('2026-10-26T10:00:00') },
  { id: 2, tipoContenido: 'COMENTARIO', contenidoId: 7, normaId: 1, detalle: 'Insulta a los demás jugadores del tema.',
    reportadoPorId: 3, reportadoPorNombre: 'camila', estado: 'ACEPTADO', revisadoPorNombre: 'admin',
    fechaCreacion: new Date('2026-10-27T18:30:00'), fechaRevision: new Date('2026-10-27T19:05:00') },
  { id: 3, tipoContenido: 'TEMA', contenidoId: 6, normaId: 3, detalle: 'Creo que este tema debería ir en otra categoría.',
    reportadoPorId: 4, reportadoPorNombre: 'diego', estado: 'ACEPTADO', revisadoPorNombre: 'moderador',
    fechaCreacion: new Date('2026-10-28T11:00:00'), fechaRevision: new Date('2026-10-28T12:15:00') },
  { id: 4, tipoContenido: 'TEMA', contenidoId: 2, normaId: 2, detalle: 'Nombra varias tiendas, parece publicidad.',
    reportadoPorId: 3, reportadoPorNombre: 'camila', estado: 'PENDIENTE', revisadoPorNombre: null,
    fechaCreacion: new Date('2026-11-01T16:40:00'), fechaRevision: null },
];

export const BANEOS: Baneo[] = [
  { id: 1, tipoContenido: 'TEMA', contenidoId: 7, normaId: 2, motivo: 'Publicidad de servicios que no tienen relación con el foro.',
    moderadorId: 2, moderadorNombre: 'moderador', activo: true, fechaBaneo: new Date('2026-10-26T10:00:00'),
    levantadoPorNombre: null, fechaLevantamiento: null },
  { id: 2, tipoContenido: 'COMENTARIO', contenidoId: 7, normaId: 1, motivo: 'Insultos directos a otros jugadores.',
    moderadorId: 1, moderadorNombre: 'admin', activo: true, fechaBaneo: new Date('2026-10-27T19:05:00'),
    levantadoPorNombre: null, fechaLevantamiento: null },
  { id: 3, tipoContenido: 'TEMA', contenidoId: 6, normaId: 3, motivo: 'El tema parecía estar fuera de su categoría.',
    moderadorId: 2, moderadorNombre: 'moderador', activo: false, fechaBaneo: new Date('2026-10-28T12:15:00'),
    levantadoPorNombre: 'admin', fechaLevantamiento: new Date('2026-10-28T15:30:00') },
];
