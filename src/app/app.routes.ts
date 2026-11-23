import { Routes } from '@angular/router';
import { invitadoGuard } from './guards/guards';

export const routes: Routes = [
  {
    path: '',
    title: 'Inicio · Mesa TCG',
    loadComponent: () => import('./pages/inicio/inicio').then((m) => m.Inicio),
  },
  {
    path: 'login',
    title: 'Iniciar sesión · Mesa TCG',
    canActivate: [invitadoGuard],
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'registro',
    title: 'Crear cuenta · Mesa TCG',
    canActivate: [invitadoGuard],
    loadComponent: () => import('./pages/registro/registro').then((m) => m.Registro),
  },
  {
    path: 'recuperar-clave',
    title: 'Recuperar clave · Mesa TCG',
    canActivate: [invitadoGuard],
    loadComponent: () => import('./pages/recuperar-clave/recuperar-clave').then((m) => m.RecuperarClave),
  },
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
