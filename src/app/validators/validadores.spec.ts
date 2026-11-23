import { FormControl, FormGroup } from '@angular/forms';
import { claveSegura, coincidir, disponible, textoNoVacio } from './validadores';

describe('validadores', () => {
  it('acepta una clave que cumple todas las reglas', () => {
    expect(claveSegura(new FormControl('Foro2026*'))).toBeNull();
  });

  it('indica cada regla que falta en la clave', () => {
    const errores = claveSegura(new FormControl('clave sin nada'));
    expect(errores).toEqual({ mayuscula: true, numero: true, especial: true, espacios: true });
  });

  it('rechaza textos que solo tienen espacios', () => {
    expect(textoNoVacio(new FormControl('   '))).toEqual({ soloEspacios: true });
    expect(textoNoVacio(new FormControl('hola'))).toBeNull();
  });

  it('marca cuando las claves no coinciden', () => {
    const grupo = new FormGroup(
      { password: new FormControl('Foro2026*'), confirmar: new FormControl('Otra2026*') },
      { validators: coincidir('password', 'confirmar') },
    );
    expect(grupo.hasError('noCoinciden')).toBe(true);
  });

  it('marca un valor que ya está en uso', () => {
    const enUso = disponible((valor) => valor === 'camila');
    expect(enUso(new FormControl('camila'))).toEqual({ enUso: true });
    expect(enUso(new FormControl('nuevo'))).toBeNull();
  });
});
