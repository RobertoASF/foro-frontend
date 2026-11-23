import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ForoService } from './foro.service';
import { ModeracionService } from './moderacion.service';
import { SesionService } from './sesion.service';
import { UsuarioService } from './usuario.service';

describe('servicios del foro', () => {
  let sesion: SesionService;
  let foro: ForoService;
  let moderacion: ModeracionService;
  let usuarios: UsuarioService;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({});
    sesion = TestBed.inject(SesionService);
    foro = TestBed.inject(ForoService);
    moderacion = TestBed.inject(ModeracionService);
    usuarios = TestBed.inject(UsuarioService);
  });

  it('inicia sesión con nombre o email y avisa a los suscritos', async () => {
    expect(sesion.iniciar('camila@foro.cl', 'Foro2026*').ok).toBe(true);
    const actual = await firstValueFrom(sesion.usuario$);
    expect(actual?.nombreUsuario).toBe('camila');
  });

  it('no deja entrar a una cuenta desactivada', () => {
    const resultado = sesion.iniciar('tomas', 'Foro2026*');
    expect(resultado.ok).toBe(false);
    expect(resultado.mensaje).toContain('desactivada');
  });

  it('cierra la sesión si un admin desactiva la cuenta conectada', () => {
    sesion.iniciar('diego', 'Foro2026*');
    usuarios.cambiarEstado(4, false, 1);
    expect(sesion.usuario).toBeNull();
  });

  it('un usuario no puede eliminar el tema de otra persona, un moderador sí', () => {
    const diego = usuarios.buscarPorId(4)!;
    const moderador = usuarios.buscarPorId(2)!;
    expect(foro.eliminarTema(1, diego).ok).toBe(false);
    expect(foro.eliminarTema(1, moderador).ok).toBe(true);
  });

  it('banear oculta el tema y acepta los reportes pendientes', () => {
    const moderador = usuarios.buscarPorId(2)!;
    const resultado = moderacion.banear(
      { tipoContenido: 'TEMA', contenidoId: 2, normaId: 2, motivo: 'Publicidad de tiendas' },
      moderador,
    );
    expect(resultado.ok).toBe(true);
    expect(foro.temaVisible(2)).toBeUndefined();
    expect(moderacion.listarReportes('PENDIENTE').length).toBe(0);
  });

  it('solo un administrador puede levantar un baneo', () => {
    const moderador = usuarios.buscarPorId(2)!;
    const admin = usuarios.buscarPorId(1)!;
    expect(moderacion.levantar(1, moderador).ok).toBe(false);
    expect(moderacion.levantar(1, admin).ok).toBe(true);
    expect(foro.temaVisible(7)).toBeDefined();
  });

  it('no permite borrar una categoría que tiene temas', () => {
    expect(foro.eliminarCategoria(1).ok).toBe(false);
  });

  it('recupera la clave con el código enviado', () => {
    const codigo = usuarios.solicitarRecuperacion('camila@foro.cl').dato!;
    expect(usuarios.restablecerClave('camila@foro.cl', '000000', 'Nueva2026*').ok).toBe(codigo === '000000');
    expect(usuarios.restablecerClave('camila@foro.cl', codigo, 'Nueva2026*').ok).toBe(true);
    expect(sesion.iniciar('camila', 'Nueva2026*').ok).toBe(true);
  });
});
