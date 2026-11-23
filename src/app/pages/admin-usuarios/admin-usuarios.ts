import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Resultado, Rol, Usuario } from '../../models/modelos';
import { SesionService } from '../../services/sesion.service';
import { UsuarioService } from '../../services/usuario.service';
import { ErrorCampo } from '../../shared/error-campo/error-campo';
import { claveSegura, disponible } from '../../validators/validadores';

@Component({
  selector: 'app-admin-usuarios',
  imports: [ReactiveFormsModule, DatePipe, ErrorCampo],
  templateUrl: './admin-usuarios.html',
})
export class AdminUsuarios {
  private readonly usuarioService = inject(UsuarioService);
  private readonly fb = inject(FormBuilder).nonNullable;

  readonly roles: Rol[] = ['USUARIO', 'MODERADOR', 'ADMIN'];
  readonly admin = toSignal(inject(SesionService).usuario$, { initialValue: null });
  readonly todos = toSignal(this.usuarioService.usuarios$, { initialValue: [] });
  readonly aviso = signal<Resultado<unknown> | null>(null);
  readonly porEliminar = signal<number | null>(null);
  readonly mostrarFormulario = signal(false);

  readonly filtros = this.fb.group({
    texto: ['', [Validators.maxLength(60)]],
    rol: ['' as Rol | ''],
    estado: ['todos' as 'todos' | 'activos' | 'inactivos'],
  });
  private readonly valoresFiltro = toSignal(this.filtros.valueChanges, { initialValue: this.filtros.getRawValue() });

  readonly usuarios = computed(() => {
    const { texto = '', rol = '', estado = 'todos' } = this.valoresFiltro();
    const busqueda = texto.trim().toLowerCase();
    return this.todos()
      .filter((u) => !rol || u.rol === rol)
      .filter((u) => estado === 'todos' || u.activo === (estado === 'activos'))
      .filter((u) => !busqueda || u.nombreUsuario.toLowerCase().includes(busqueda) || u.email.includes(busqueda));
  });

  readonly totalPorRol = computed(() =>
    this.roles.map((rol) => ({ rol, total: this.todos().filter((u) => u.rol === rol).length })),
  );

  readonly formNuevo = this.fb.group({
    nombreUsuario: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(30),
        Validators.pattern(/^[a-zA-Z0-9._-]+$/),
        disponible((nombre) => this.usuarioService.existeNombre(nombre)),
      ],
    ],
    email: [
      '',
      [Validators.required, Validators.email, Validators.maxLength(120), disponible((e) => this.usuarioService.existeEmail(e))],
    ],
    rol: ['USUARIO' as Rol, [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20), claveSegura]],
  });

  esYo(usuario: Usuario): boolean {
    return usuario.id === this.admin()?.id;
  }

  cambiarRol(usuario: Usuario, rol: string): void {
    this.aviso.set(this.usuarioService.cambiarRol(usuario.id, rol as Rol, this.admin()?.id ?? 0));
  }

  cambiarEstado(usuario: Usuario): void {
    this.aviso.set(this.usuarioService.cambiarEstado(usuario.id, !usuario.activo, this.admin()?.id ?? 0));
  }

  eliminar(usuario: Usuario): void {
    this.aviso.set(this.usuarioService.eliminar(usuario.id, this.admin()?.id ?? 0));
    this.porEliminar.set(null);
  }

  crear(): void {
    if (this.formNuevo.invalid) {
      this.formNuevo.markAllAsTouched();
      return;
    }
    const datos = this.formNuevo.getRawValue();
    const resultado = this.usuarioService.registrar({ ...datos, juegoFavoritoId: null });
    this.aviso.set(resultado);
    if (resultado.ok) {
      this.formNuevo.reset();
      this.mostrarFormulario.set(false);
    }
  }
}
