import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Resultado, Rol, Usuario } from '../models/modelos';
import { UsuarioService } from './usuario.service';

const CLAVE_SESION = 'mesa-tcg-sesion';

@Injectable({ providedIn: 'root' })
export class SesionService {
  private readonly usuarioService = inject(UsuarioService);
  private readonly actual = new BehaviorSubject<Usuario | null>(null);

  /** La barra de navegación y las páginas se suscriben para saber quién está conectado. */
  readonly usuario$ = this.actual.asObservable();

  constructor() {
    const idGuardado = Number(sessionStorage.getItem(CLAVE_SESION));
    if (idGuardado) {
      this.actual.next(this.usuarioService.buscarPorId(idGuardado) ?? null);
    }

    // Si un admin cambia el rol o desactiva la cuenta, la sesión se entera al instante
    this.usuarioService.usuarios$.subscribe((usuarios) => {
      const conectado = this.actual.value;
      if (!conectado) {
        return;
      }
      const vigente = usuarios.find((usuario) => usuario.id === conectado.id);
      if (!vigente || !vigente.activo) {
        this.cerrar();
      } else if (vigente !== conectado) {
        this.actual.next(vigente);
      }
    });
  }

  get usuario(): Usuario | null {
    return this.actual.value;
  }

  get conectado(): boolean {
    return this.actual.value !== null;
  }

  iniciar(identificador: string, password: string): Resultado<Usuario> {
    const usuario = this.usuarioService.buscarPorIdentificador(identificador);
    if (!usuario || usuario.password !== password) {
      return { ok: false, mensaje: 'Usuario o clave incorrectos' };
    }
    if (!usuario.activo) {
      return { ok: false, mensaje: 'Tu cuenta está desactivada. Escribe a un administrador.' };
    }
    this.actual.next(usuario);
    sessionStorage.setItem(CLAVE_SESION, String(usuario.id));
    return { ok: true, mensaje: `Hola, ${usuario.nombreUsuario}`, dato: usuario };
  }

  cerrar(): void {
    this.actual.next(null);
    sessionStorage.removeItem(CLAVE_SESION);
  }

  tieneRol(...roles: Rol[]): boolean {
    const usuario = this.actual.value;
    return usuario !== null && roles.includes(usuario.rol);
  }

  esModerador(): boolean {
    return this.tieneRol('MODERADOR', 'ADMIN');
  }
}
