import { Injectable } from '@angular/core';
import { USUARIOS } from '../data/datos-iniciales';
import { Resultado, Rol, Usuario } from '../models/modelos';
import { ColeccionObservable } from './coleccion-observable';

export interface DatosRegistro {
  nombreUsuario: string;
  email: string;
  password: string;
  juegoFavoritoId: number | null;
  /** Solo un administrador elige el rol; en el registro público siempre es USUARIO. */
  rol?: Rol;
}

export interface DatosPerfil {
  email: string;
  juegoFavoritoId: number | null;
  biografia: string;
}

interface CodigoRecuperacion {
  codigo: string;
  venceEn: number;
}

const MINUTOS_VALIDEZ_CODIGO = 10;

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly usuarios = new ColeccionObservable<Usuario>(USUARIOS);
  private readonly codigos = new Map<string, CodigoRecuperacion>();

  readonly usuarios$ = this.usuarios.cambios$;

  listar(rol?: Rol | ''): Usuario[] {
    return this.usuarios.todos.filter((usuario) => !rol || usuario.rol === rol);
  }

  buscarPorId(id: number): Usuario | undefined {
    return this.usuarios.buscar(id);
  }

  /** Busca por nombre de usuario o email, sin importar mayúsculas. */
  buscarPorIdentificador(identificador: string): Usuario | undefined {
    const texto = identificador.trim().toLowerCase();
    return this.usuarios.todos.find(
      (usuario) => usuario.nombreUsuario.toLowerCase() === texto || usuario.email.toLowerCase() === texto,
    );
  }

  existeNombre(nombreUsuario: string): boolean {
    const texto = nombreUsuario.trim().toLowerCase();
    return this.usuarios.todos.some((usuario) => usuario.nombreUsuario.toLowerCase() === texto);
  }

  existeEmail(email: string, exceptoId?: number): boolean {
    const texto = email.trim().toLowerCase();
    return this.usuarios.todos.some((usuario) => usuario.email.toLowerCase() === texto && usuario.id !== exceptoId);
  }

  registrar(datos: DatosRegistro): Resultado<Usuario> {
    if (this.existeNombre(datos.nombreUsuario)) {
      return { ok: false, mensaje: 'Ese nombre de usuario ya está en uso' };
    }
    if (this.existeEmail(datos.email)) {
      return { ok: false, mensaje: 'Ya existe una cuenta con ese email' };
    }

    const nuevo = this.usuarios.agregar({
      nombreUsuario: datos.nombreUsuario.trim(),
      email: datos.email.trim().toLowerCase(),
      password: datos.password,
      rol: datos.rol ?? 'USUARIO',
      activo: true,
      juegoFavoritoId: datos.juegoFavoritoId,
      biografia: '',
      fechaCreacion: new Date(),
    });
    return { ok: true, mensaje: 'Cuenta creada', dato: nuevo };
  }

  actualizarPerfil(id: number, datos: DatosPerfil): Resultado {
    if (this.existeEmail(datos.email, id)) {
      return { ok: false, mensaje: 'Ese email ya lo usa otra cuenta' };
    }
    this.usuarios.actualizar(id, {
      email: datos.email.trim().toLowerCase(),
      juegoFavoritoId: datos.juegoFavoritoId,
      biografia: datos.biografia.trim(),
    });
    return { ok: true, mensaje: 'Perfil actualizado' };
  }

  cambiarClave(id: number, claveActual: string, claveNueva: string): Resultado {
    const usuario = this.buscarPorId(id);
    if (!usuario || usuario.password !== claveActual) {
      return { ok: false, mensaje: 'La clave actual no es correcta' };
    }
    if (claveActual === claveNueva) {
      return { ok: false, mensaje: 'La clave nueva debe ser distinta a la actual' };
    }
    this.usuarios.actualizar(id, { password: claveNueva });
    return { ok: true, mensaje: 'Clave actualizada' };
  }

  /** Simula el envío del correo: devuelve el código para mostrarlo en pantalla. */
  solicitarRecuperacion(email: string): Resultado<string> {
    const usuario = this.usuarios.todos.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!usuario || !usuario.activo) {
      return { ok: false, mensaje: 'No hay una cuenta activa con ese email' };
    }
    const codigo = String(Math.floor(100000 + Math.random() * 900000));
    this.codigos.set(usuario.email, { codigo, venceEn: Date.now() + MINUTOS_VALIDEZ_CODIGO * 60_000 });
    return { ok: true, mensaje: 'Código generado', dato: codigo };
  }

  restablecerClave(email: string, codigo: string, claveNueva: string): Resultado {
    const correo = email.trim().toLowerCase();
    const guardado = this.codigos.get(correo);
    if (!guardado || guardado.codigo !== codigo.trim()) {
      return { ok: false, mensaje: 'El código no es correcto' };
    }
    if (Date.now() > guardado.venceEn) {
      this.codigos.delete(correo);
      return { ok: false, mensaje: 'El código venció, pide uno nuevo' };
    }
    const usuario = this.usuarios.todos.find((u) => u.email === correo);
    if (!usuario) {
      return { ok: false, mensaje: 'No hay una cuenta con ese email' };
    }
    this.usuarios.actualizar(usuario.id, { password: claveNueva });
    this.codigos.delete(correo);
    return { ok: true, mensaje: 'Tu clave fue cambiada. Ya puedes iniciar sesión.' };
  }

  cambiarRol(id: number, rol: Rol, adminId: number): Resultado {
    if (id === adminId) {
      return { ok: false, mensaje: 'No puedes cambiar tu propio rol' };
    }
    this.usuarios.actualizar(id, { rol });
    return { ok: true, mensaje: 'Rol actualizado' };
  }

  cambiarEstado(id: number, activo: boolean, adminId: number): Resultado {
    if (id === adminId) {
      return { ok: false, mensaje: 'No puedes desactivar tu propia cuenta' };
    }
    this.usuarios.actualizar(id, { activo });
    return { ok: true, mensaje: activo ? 'Cuenta activada' : 'Cuenta desactivada' };
  }

  eliminar(id: number, adminId: number): Resultado {
    if (id === adminId) {
      return { ok: false, mensaje: 'No puedes eliminar tu propia cuenta' };
    }
    this.usuarios.eliminarDonde((usuario) => usuario.id === id);
    return { ok: true, mensaje: 'Usuario eliminado' };
  }
}
