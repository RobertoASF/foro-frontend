import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ModeracionService } from '../../services/moderacion.service';
import { SesionService } from '../../services/sesion.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private readonly sesion = inject(SesionService);
  private readonly router = inject(Router);

  readonly usuario = toSignal(this.sesion.usuario$, { initialValue: null });
  readonly pendientes = toSignal(inject(ModeracionService).pendientes$, { initialValue: 0 });
  readonly menuAbierto = signal(false);

  esModerador(): boolean {
    const rol = this.usuario()?.rol;
    return rol === 'MODERADOR' || rol === 'ADMIN';
  }

  esAdmin(): boolean {
    return this.usuario()?.rol === 'ADMIN';
  }

  alternarMenu(): void {
    this.menuAbierto.update((abierto) => !abierto);
  }

  cerrarMenu(): void {
    this.menuAbierto.set(false);
  }

  cerrarSesion(): void {
    this.sesion.cerrar();
    this.cerrarMenu();
    this.router.navigate(['/']);
  }
}
