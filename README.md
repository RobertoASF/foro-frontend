# Mesa TCG: frontend

Frontend del foro de juegos de cartas coleccionables. Tiene cinco categorías: Magic The Gathering, Mitos y Leyendas, Pokemon TCG, One Piece TCG y Yu-Gi-Oh!

Hecho con Angular 22, Bootstrap 5.3, Bootstrap Icons, HTML, CSS y TypeScript.

Como pide la actividad, este frontend funciona separado del backend: los datos viven en arreglos dentro de los servicios de Angular. Son los mismos registros que se cargan en Oracle para los microservicios. Al recargar la página, los datos vuelven a su estado inicial.

## Roles

| Acción | USUARIO | MODERADOR | ADMIN |
|---|---|---|---|
| Publicar, comentar y editar lo propio | Sí | Sí | Sí |
| Reportar temas y comentarios | Sí | Sí | Sí |
| Eliminar contenido de otros | No | Sí | Sí |
| Banear contenido y revisar reportes | No | Sí | Sí |
| Levantar baneos y gestionar normas | No | No | Sí |
| Gestionar usuarios y categorías | No | No | Sí |

Las rutas privadas están protegidas con guards: `sesionGuard` pide sesión iniciada y `rolGuard` revisa el rol.

## Pantallas

| Ruta | Pantalla | Acceso |
|---|---|---|
| `/` | Inicio con categorías y temas recientes | Público |
| `/login` | Inicio de sesión | Sin sesión |
| `/registro` | Registro de usuarios | Sin sesión |
| `/recuperar-clave` | Recuperar contraseña con código (correo simulado) | Sin sesión |
| `/perfil` | Modificación de perfil y cambio de clave | Con sesión |
| `/categorias/:id` | Temas de una categoría | Público |
| `/buscar` | Búsqueda por texto, categoría y autor | Público |
| `/temas/:id` | Tema con comentarios, reportes y baneo | Público |
| `/temas/nuevo` y `/temas/:id/editar` | Publicar y editar temas | Con sesión |
| `/normas` | Normas del foro | Público |
| `/moderacion` | Reportes, baneos y normas | MODERADOR y ADMIN |
| `/admin/usuarios` | Crear, cambiar rol, activar y eliminar usuarios | ADMIN |
| `/admin/categorias` | Crear, editar y eliminar categorías | ADMIN |

## Patrón de diseño

Se usa el patrón **Observer** junto con servicios **Singleton**.

- Cada servicio (`UsuarioService`, `SesionService`, `ForoService`, `ModeracionService`) se registra con `providedIn: 'root'`, así existe una sola instancia para toda la aplicación.
- Los datos se guardan en `ColeccionObservable`, una clase que envuelve un arreglo en un `BehaviorSubject` de RxJS. Cada vez que el arreglo cambia, avisa a quienes estén suscritos.
- Los componentes se suscriben a esos observables y los convierten en signals con `toSignal`. Por eso la barra de navegación muestra al instante el contador de reportes pendientes cuando alguien reporta un tema, o cierra la sesión si un administrador desactiva la cuenta.

```
Servicio (sujeto)  ──cambios$──▶  Componente (observador)  ──▶  Vista
     ▲                                     │
     └──────────── acción del usuario ─────┘
```

## Validaciones

Todos los formularios usan Reactive Forms y también atributos HTML (`required`, `minlength`, `maxlength`, `type="email"`, `pattern`). Los mensajes se muestran bajo cada campo cuando la persona lo toca.

La clave tiene seis reglas, las mismas que valida `ms-usuarios`:

1. Entre 8 y 20 caracteres.
2. Al menos una mayúscula.
3. Al menos una minúscula.
4. Al menos un número.
5. Al menos un carácter especial.
6. Sin espacios.

Además se valida que el nombre de usuario y el email no estén en uso, que las claves coincidan y que los textos no queden solo con espacios.

## Diseño adaptable

Se usa el grid de 12 columnas de Bootstrap y se probó en tres tamaños:

| Tamaño | Ancho | Qué cambia |
|---|---|---|
| Celular | 375 px | Menú colapsado, una columna, usuarios en tarjetas |
| Tablet | 768 px | Dos columnas de categorías, tablas con scroll |
| Escritorio | 1366 px | Menú completo, tres columnas y barra lateral |

## Estructura

```
src/app
├── data         Arreglos con los datos iniciales
├── guards       Protección de rutas por sesión y rol
├── models       Interfaces del dominio
├── pages        Una carpeta por pantalla
├── services     Servicios Singleton con colecciones observables
├── shared       Barra de navegación, pie, tarjeta de tema y mensajes de error
└── validators   Validadores propios de los formularios
```

## Cuentas de prueba

Todas usan la clave `Foro2026*`.

| Usuario | Rol |
|---|---|
| `admin` | ADMIN |
| `moderador` | MODERADOR |
| `camila` | USUARIO |
| `tomas` | USUARIO desactivado (no puede entrar) |

## Cómo ejecutarlo

Con Node 22:

```bash
npm install
npm start
```

Queda en `http://localhost:4200`.

Con Docker, se compila y se sirve con Nginx:

```bash
docker build -t foro-frontend .
docker run -p 4200:80 foro-frontend
```

## Pruebas

```bash
npm test -- --watch=false
```
