import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { ErrorCampo } from '../../shared/error-campo/error-campo';
import { REGLAS_CLAVE, claveSegura, coincidir } from '../../validators/validadores';

type Paso = 'email' | 'codigo' | 'listo';

@Component({
  selector: 'app-recuperar-clave',
  imports: [ReactiveFormsModule, RouterLink, ErrorCampo],
  templateUrl: './recuperar-clave.html',
})
export class RecuperarClave {
  private readonly usuarios = inject(UsuarioService);
  private readonly fb = inject(FormBuilder).nonNullable;

  readonly paso = signal<Paso>('email');
  readonly error = signal('');
  readonly codigoEnviado = signal('');
  readonly mensajeFinal = signal('');
  readonly reglas = REGLAS_CLAVE;

  readonly formEmail = this.fb.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
  });

  readonly formClave = this.fb.group(
    {
      codigo: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20), claveSegura]],
      confirmar: ['', [Validators.required]],
    },
    { validators: coincidir('password', 'confirmar') },
  );

  readonly clave = toSignal(this.formClave.controls.password.valueChanges, { initialValue: '' });

  solicitarCodigo(): void {
    this.error.set('');
    if (this.formEmail.invalid) {
      this.formEmail.markAllAsTouched();
      return;
    }
    const resultado = this.usuarios.solicitarRecuperacion(this.formEmail.controls.email.value);
    if (!resultado.ok) {
      this.error.set(resultado.mensaje);
      return;
    }
    this.codigoEnviado.set(resultado.dato ?? '');
    this.paso.set('codigo');
  }

  cambiarClave(): void {
    this.error.set('');
    if (this.formClave.invalid) {
      this.formClave.markAllAsTouched();
      return;
    }
    const { codigo, password } = this.formClave.getRawValue();
    const resultado = this.usuarios.restablecerClave(this.formEmail.controls.email.value, codigo, password);
    if (!resultado.ok) {
      this.error.set(resultado.mensaje);
      return;
    }
    this.mensajeFinal.set(resultado.mensaje);
    this.paso.set('listo');
  }

  volverAEmpezar(): void {
    this.formClave.reset();
    this.error.set('');
    this.paso.set('email');
  }
}
