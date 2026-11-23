import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ForoService } from '../../services/foro.service';
import { SesionService } from '../../services/sesion.service';
import { UsuarioService } from '../../services/usuario.service';
import { ErrorCampo } from '../../shared/error-campo/error-campo';
import { REGLAS_CLAVE, claveSegura, coincidir, disponible } from '../../validators/validadores';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink, ErrorCampo],
  templateUrl: './registro.html',
})
export class Registro {
  private readonly usuarios = inject(UsuarioService);
  private readonly sesion = inject(SesionService);
  private readonly router = inject(Router);

  readonly categorias = inject(ForoService).listarCategorias();
  readonly reglas = REGLAS_CLAVE;
  readonly error = signal('');
  readonly mostrarClave = signal(false);

  readonly form = inject(FormBuilder).nonNullable.group(
    {
      nombreUsuario: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(30),
          Validators.pattern(/^[a-zA-Z0-9._-]+$/),
          disponible((nombre) => this.usuarios.existeNombre(nombre)),
        ],
      ],
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.maxLength(120),
          disponible((email) => this.usuarios.existeEmail(email)),
        ],
      ],
      juegoFavoritoId: [0, [Validators.required, Validators.min(1)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20), claveSegura]],
      confirmar: ['', [Validators.required]],
      aceptaNormas: [false, [Validators.requiredTrue]],
    },
    { validators: coincidir('password', 'confirmar') },
  );

  /** Se usa para pintar la lista de reglas mientras la persona escribe la clave. */
  readonly clave = toSignal(this.form.controls.password.valueChanges, { initialValue: '' });

  registrar(): void {
    this.error.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const datos = this.form.getRawValue();
    const resultado = this.usuarios.registrar({
      nombreUsuario: datos.nombreUsuario,
      email: datos.email,
      password: datos.password,
      juegoFavoritoId: datos.juegoFavoritoId,
    });
    if (!resultado.ok) {
      this.error.set(resultado.mensaje);
      return;
    }
    this.sesion.iniciar(datos.nombreUsuario, datos.password);
    this.router.navigate(['/perfil'], { queryParams: { bienvenida: 1 } });
  }
}
