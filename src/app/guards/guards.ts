import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Rol } from '../models/modelos';
import { SesionService } from '../services/sesion.service';

/** Pide sesión iniciada. Si no hay, manda al login y luego vuelve a la página pedida. */
export const sesionGuard: CanActivateFn = (_ruta, estado) => {
  if (inject(SesionService).conectado) {
    return true;
  }
  return inject(Router).createUrlTree(['/login'], { queryParams: { volver: estado.url } });
};

/** Login, registro y recuperar clave solo tienen sentido sin sesión. */
export const invitadoGuard: CanActivateFn = () => {
  return inject(SesionService).conectado ? inject(Router).createUrlTree(['/']) : true;
};

/** Revisa que el rol del usuario esté en data.roles de la ruta. */
export const rolGuard: CanActivateFn = (ruta, estado) => {
  const sesion = inject(SesionService);
  const router = inject(Router);
  if (!sesion.conectado) {
    return router.createUrlTree(['/login'], { queryParams: { volver: estado.url } });
  }
  const roles = (ruta.data['roles'] as Rol[]) ?? [];
  return sesion.tieneRol(...roles) ? true : router.createUrlTree(['/sin-permiso']);
};
