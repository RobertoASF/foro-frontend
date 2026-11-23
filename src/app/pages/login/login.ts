import { Component, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SesionService } from '../../services/sesion.service';
import { ErrorCampo } from '../../shared/error-campo/error-campo';
import { textoNoVacio } from '../../validators/validadores';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, ErrorCampo],
  templateUrl: './login.html',
})
export class Login {
  private readonly sesion = inject(SesionService);
  private readonly router = inject(Router);

  /** Página a la que se vuelve después de iniciar sesión (viene en ?volver=). */
  readonly volver = input<string>();

  readonly error = signal('');
  readonly mostrarClave = signal(false);
  readonly cuentasPrueba = [
    { usuario: 'admin', rol: 'ADMIN' },
    { usuario: 'moderador', rol: 'MODERADOR' },
    { usuario: 'camila', rol: 'USUARIO' },
  ];

  readonly form = inject(FormBuilder).nonNullable.group({
    identificador: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120), textoNoVacio]],
    password: ['', [Validators.required, Validators.maxLength(20)]],
  });

  usarCuenta(usuario: string): void {
    this.form.setValue({ identificador: usuario, password: 'Foro2026*' });
  }

  ingresar(): void {
    this.error.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { identificador, password } = this.form.getRawValue();
    const resultado = this.sesion.iniciar(identificador, password);
    if (!resultado.ok) {
      this.error.set(resultado.mensaje);
      return;
    }
    this.router.navigateByUrl(this.volver() || '/');
  }
}
