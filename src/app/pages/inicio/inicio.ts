import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { ForoService } from '../../services/foro.service';
import { ModeracionService } from '../../services/moderacion.service';
import { SesionService } from '../../services/sesion.service';
import { UsuarioService } from '../../services/usuario.service';
import { TarjetaTema } from '../../shared/tarjeta-tema/tarjeta-tema';

@Component({
  selector: 'app-inicio',
  imports: [RouterLink, DatePipe, TarjetaTema],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio {
  private readonly foro = inject(ForoService);

  readonly usuario = toSignal(inject(SesionService).usuario$, { initialValue: null });
  readonly resumen = toSignal(this.foro.resumen$, { initialValue: [] });
  readonly recientes = toSignal(this.foro.cambios$.pipe(map(() => this.foro.conDetalle(this.foro.temasRecientes(5)))), {
    initialValue: [],
  });
  readonly miembros = toSignal(inject(UsuarioService).usuarios$.pipe(map((u) => u.filter((x) => x.activo).length)), {
    initialValue: 0,
  });
  readonly normas = inject(ModeracionService).listarNormas().slice(0, 3);

  readonly totalTemas = computed(() => this.resumen().reduce((total, r) => total + r.totalTemas, 0));
  readonly totalComentarios = computed(() => this.resumen().reduce((total, r) => total + r.totalComentarios, 0));
}
