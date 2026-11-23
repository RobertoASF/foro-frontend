import { Routes } from '@angular/router';
import { invitadoGuard, sesionGuard } from './guards/guards';

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
    path: 'perfil',
    title: 'Mi perfil · Mesa TCG',
    canActivate: [sesionGuard],
    loadComponent: () => import('./pages/perfil/perfil').then((m) => m.Perfil),
  },
  {
    path: 'buscar',
    title: 'Buscar temas · Mesa TCG',
    loadComponent: () => import('./pages/buscar/buscar').then((m) => m.Buscar),
  },
  {
    path: 'normas',
    title: 'Normas del foro · Mesa TCG',
    loadComponent: () => import('./pages/normas/normas').then((m) => m.Normas),
  },
  {
    path: 'categorias/:id',
    title: 'Categoría · Mesa TCG',
    loadComponent: () => import('./pages/categoria/categoria').then((m) => m.CategoriaPagina),
  },
  {
    path: 'temas/nuevo',
    title: 'Publicar tema · Mesa TCG',
    canActivate: [sesionGuard],
    loadComponent: () => import('./pages/tema-formulario/tema-formulario').then((m) => m.TemaFormulario),
  },
  {
    path: 'temas/:id/editar',
    title: 'Editar tema · Mesa TCG',
    canActivate: [sesionGuard],
    loadComponent: () => import('./pages/tema-formulario/tema-formulario').then((m) => m.TemaFormulario),
  },
  {
    path: 'temas/:id',
    title: 'Tema · Mesa TCG',
    loadComponent: () => import('./pages/tema-detalle/tema-detalle').then((m) => m.TemaDetalle),
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
