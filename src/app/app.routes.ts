import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'normas',
    title: 'Normas del foro · Mesa TCG',
    loadComponent: () => import('./pages/normas/normas').then((m) => m.Normas),
  },
  {
    path: 'sin-permiso',
    title: 'Sin permiso · Mesa TCG',
    loadComponent: () => import('./pages/sin-permiso/sin-permiso').then((m) => m.SinPermiso),
  },
  {
    path: '**',
    title: 'Página no encontrada · Mesa TCG',
    loadComponent: () => import('./pages/no-encontrada/no-encontrada').then((m) => m.NoEncontrada),
  },
];
