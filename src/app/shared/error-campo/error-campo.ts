import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

const MENSAJES: Record<string, (detalle: any) => string> = {
  required: () => 'Este campo es obligatorio',
  requiredTrue: () => 'Debes aceptar para continuar',
  email: () => 'Escribe un email válido, por ejemplo nombre@correo.cl',
  minlength: (e) => `Debe tener al menos ${e.requiredLength} caracteres`,
  maxlength: (e) => `No puede superar los ${e.requiredLength} caracteres`,
  soloEspacios: () => 'No puede quedar vacío ni tener solo espacios',
  mayuscula: () => 'Debe tener al menos una mayúscula',
  minuscula: () => 'Debe tener al menos una minúscula',
  numero: () => 'Debe tener al menos un número',
  especial: () => 'Debe tener al menos un carácter especial, por ejemplo * # ! ?',
  espacios: () => 'No puede tener espacios',
  noCoinciden: () => 'Las claves no coinciden',
  enUso: () => 'Ya está en uso, prueba con otro',
  pattern: () => 'El formato no es válido',
};

/** Muestra el primer error de un campo, solo después de que la persona lo tocó. */
@Component({
  selector: 'app-error-campo',
  template: `
    @if (mensaje(); as texto) {
      <div class="invalid-feedback d-block">{{ texto }}</div>
    }
  `,
  // Lee el estado del formulario, que no es un signal, por eso se revisa en cada ciclo
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class ErrorCampo {
  readonly control = input.required<AbstractControl | null>();
  readonly mensajes = input<Record<string, string>>({});

  mensaje(): string | null {
    const control = this.control();
    if (!control || !control.errors || !(control.touched || control.dirty)) {
      return null;
    }
    const clave = Object.keys(control.errors)[0];
    return this.mensajes()[clave] ?? MENSAJES[clave]?.(control.errors[clave]) ?? 'El valor no es válido';
  }
}
