import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { ForoService } from '../../services/foro.service';
import { ModeracionService } from '../../services/moderacion.service';
import { SesionService } from '../../services/sesion.service';
import { UsuarioService } from '../../services/usuario.service';
import { ErrorCampo } from '../../shared/error-campo/error-campo';
import { claveSegura, coincidir, disponible } from '../../validators/validadores';

@Component({
  selector: 'app-perfil',
  imports: [ReactiveFormsModule, RouterLink, DatePipe, ErrorCampo],
  templateUrl: './perfil.html',
})
export class Perfil {
  private readonly sesion = inject(SesionService);
  private readonly usuarios = inject(UsuarioService);
  private readonly foro = inject(ForoService);
  private readonly moderacion = inject(ModeracionService);
  private readonly fb = inject(FormBuilder).nonNullable;

  /** Llega en 1 cuando la persona recién creó su cuenta. */
  readonly bienvenida = input<string>();

  readonly usuario = toSignal(this.sesion.usuario$, { initialValue: this.sesion.usuario });
  readonly categorias = this.foro.listarCategorias();
  readonly juegoFavorito = computed(() => this.foro.categoria(this.usuario()?.juegoFavoritoId ?? 0));

  readonly misTemas = toSignal(
    this.foro.cambios$.pipe(map(() => this.foro.conDetalle(this.foro.buscarTemas({ autorId: this.idActual() })))),
    { initialValue: [] },
  );
  readonly misReportes = toSignal(this.moderacion.reportes$.pipe(map(() => this.moderacion.reportesDe(this.idActual()))), {
    initialValue: [],
  });

  readonly mensajeDatos = signal('');
  readonly errorDatos = signal('');
  readonly mensajeClave = signal('');
  readonly errorClave = signal('');

  readonly formDatos = this.fb.group({
    email: [
      this.sesion.usuario?.email ?? '',
      [
        Validators.required,
        Validators.email,
        Validators.maxLength(120),
        disponible((email) => this.usuarios.existeEmail(email, this.idActual())),
      ],
    ],
    juegoFavoritoId: [this.sesion.usuario?.juegoFavoritoId ?? 0, [Validators.min(1)]],
    biografia: [this.sesion.usuario?.biografia ?? '', [Validators.maxLength(200)]],
  });

  readonly formClave = this.fb.group(
    {
      actual: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20), claveSegura]],
      confirmar: ['', [Validators.required]],
    },
    { validators: coincidir('password', 'confirmar') },
  );

  readonly largoBiografia = toSignal(this.formDatos.controls.biografia.valueChanges.pipe(map((texto) => texto.length)), {
    initialValue: this.formDatos.controls.biografia.value.length,
  });

  guardarDatos(): void {
    this.mensajeDatos.set('');
    this.errorDatos.set('');
    if (this.formDatos.invalid) {
      this.formDatos.markAllAsTouched();
      return;
    }
    const datos = this.formDatos.getRawValue();
    const resultado = this.usuarios.actualizarPerfil(this.idActual(), {
      email: datos.email,
      juegoFavoritoId: datos.juegoFavoritoId || null,
      biografia: datos.biografia,
    });
    resultado.ok ? this.mensajeDatos.set(resultado.mensaje) : this.errorDatos.set(resultado.mensaje);
    this.formDatos.markAsPristine();
  }

  cambiarClave(): void {
    this.mensajeClave.set('');
    this.errorClave.set('');
    if (this.formClave.invalid) {
      this.formClave.markAllAsTouched();
      return;
    }
    const { actual, password } = this.formClave.getRawValue();
    const resultado = this.usuarios.cambiarClave(this.idActual(), actual, password);
    if (!resultado.ok) {
      this.errorClave.set(resultado.mensaje);
      return;
    }
    this.mensajeClave.set(resultado.mensaje);
    this.formClave.reset();
  }

  private idActual(): number {
    return this.sesion.usuario?.id ?? 0;
  }
}
