import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Reglas de la clave. Se usan para validar y para la lista que ve la persona al escribir. */
export const REGLAS_CLAVE: { texto: string; cumple: (clave: string) => boolean }[] = [
  { texto: 'Entre 8 y 20 caracteres', cumple: (c) => c.length >= 8 && c.length <= 20 },
  { texto: 'Una letra mayúscula', cumple: (c) => /[A-Z]/.test(c) },
  { texto: 'Una letra minúscula', cumple: (c) => /[a-z]/.test(c) },
  { texto: 'Un número', cumple: (c) => /\d/.test(c) },
  { texto: 'Un carácter especial (* # ! ? $ …)', cumple: (c) => /[^A-Za-z0-9\s]/.test(c) },
  { texto: 'Sin espacios', cumple: (c) => !/\s/.test(c) },
];

/** El largo lo revisan minlength y maxlength; aquí van las reglas de contenido. */
export const claveSegura: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const clave: string = control.value ?? '';
  if (!clave) {
    return null;
  }
  const errores: ValidationErrors = {};
  if (!/[A-Z]/.test(clave)) errores['mayuscula'] = true;
  if (!/[a-z]/.test(clave)) errores['minuscula'] = true;
  if (!/\d/.test(clave)) errores['numero'] = true;
  if (!/[^A-Za-z0-9\s]/.test(clave)) errores['especial'] = true;
  if (/\s/.test(clave)) errores['espacios'] = true;
  return Object.keys(errores).length > 0 ? errores : null;
};

/** Evita textos que solo tienen espacios, que "required" deja pasar. */
export const textoNoVacio: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const valor = control.value;
  return typeof valor === 'string' && valor.length > 0 && valor.trim().length === 0 ? { soloEspacios: true } : null;
};

/** Validador de grupo: los dos campos deben tener el mismo valor. */
export function coincidir(campo: string, confirmacion: string): ValidatorFn {
  return (grupo: AbstractControl): ValidationErrors | null => {
    const valor = grupo.get(campo)?.value;
    const repetido = grupo.get(confirmacion)?.value;
    return valor && repetido && valor !== repetido ? { noCoinciden: true } : null;
  };
}

/** Recibe una función que dice si el valor ya existe y marca el error enUso. */
export function disponible(existe: (valor: string) => boolean): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor: string = control.value ?? '';
    return valor.trim() && existe(valor) ? { enUso: true } : null;
  };
}
