import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Patrón Observer: guarda un arreglo y avisa a quienes estén suscritos cada vez que cambia.
 * Los servicios la usan como su "tabla" en memoria y los componentes se suscriben a cambios$.
 */
export class ColeccionObservable<T extends { id: number }> {
  private readonly fuente: BehaviorSubject<T[]>;
  readonly cambios$: Observable<T[]>;

  constructor(iniciales: T[]) {
    // Se copian los registros para no modificar los datos iniciales
    this.fuente = new BehaviorSubject<T[]>(iniciales.map((item) => ({ ...item })));
    this.cambios$ = this.fuente.asObservable();
  }

  get todos(): T[] {
    return this.fuente.value;
  }

  buscar(id: number): T | undefined {
    return this.todos.find((item) => item.id === id);
  }

  agregar(datos: Omit<T, 'id'>): T {
    const siguienteId = Math.max(0, ...this.todos.map((item) => item.id)) + 1;
    const nuevo = { ...datos, id: siguienteId } as T;
    this.fuente.next([...this.todos, nuevo]);
    return nuevo;
  }

  actualizar(id: number, cambios: Partial<T>): T | undefined {
    const actual = this.buscar(id);
    if (!actual) {
      return undefined;
    }
    const actualizado = { ...actual, ...cambios, id };
    this.fuente.next(this.todos.map((item) => (item.id === id ? actualizado : item)));
    return actualizado;
  }

  eliminarDonde(condicion: (item: T) => boolean): void {
    this.fuente.next(this.todos.filter((item) => !condicion(item)));
  }
}
