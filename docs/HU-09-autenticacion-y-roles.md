# HU-09: Iniciar sesión con correo y contraseña

**ÉPICA 3**
**Autenticación y roles**
Pantalla: `diseno_01.png`

**HU-09: Iniciar sesión con correo y contraseña**
**OBLIGATORIA** · **5 pts**

**Como** asesor o director, **quiero** iniciar sesión con mi correo corporativo **para** acceder a la plataforma de forma segura.

---

## 1. Criterios de aceptación

| Criterio | Estado | Evidencia / Notas |
| --- | --- | --- |
| Autenticación con Better Auth mediante correo y contraseña | Implementado | `backend/src/modules/auth/infrastructure/better-auth/auth.factory.ts` (`betterAuth({ emailAndPassword: { enabled: true, disableSignUp: true } })`) |
| Inicio de sesión con credenciales válidas | Implementado y probado | Endpoint `POST /api/auth/sign-in/email` (Better Auth). Prueba e2e: `HU-09: inicio de sesión` "inicia sesión con credenciales válidas y crea una cookie httpOnly" (PASS). |
| Rechazo de credenciales incorrectas | Implementado y probado | Better Auth devuelve 401. Prueba e2e: "rechaza credenciales incorrectas (contraseña o correo)" (PASS). La cookie no se envía. |
| Duración de sesión con y sin la opción «Recordarme» | Implementado y probado | `session.expiresIn = 30 días` con `rememberMe: true`, sin `rememberMe` se usa cookie de sesión del navegador y expiración ~1 día. Pruebas e2e (12) confirman `Max-Age=2592000` y ~30 días en BD, y `dont_remember` + ~1 día sin recordarme (PASS). |
| Protección del rol del usuario frente a modificaciones desde el cliente | Implementado y probado | `user.additionalFields.role` con `input: false`, `defaultValue: 'ASESOR'`. Pruebas e2e (10): intentar `update-user` con `role: 'DIRECTOR'` devuelve 400; cambiar vía query/cabecera no eleva privilegios; el rol se lee desde BD. También existe constraint `CHK_user_role` en `user` (solo ASESOR/DIRECTOR). |
| Consulta del usuario autenticado mediante `GET /api/me` | Implementado y probado | `MeController` + `GetMeUseCase` + `AuthGuard`. Pruebas e2e: devuelve perfil con `rol` y `asesor` para ASESOR; `asesor: null` para DIRECTOR; 401 sin sesión/cookie inventada (PASS). |
| Protección de rutas y rechazo de sesiones inválidas | Implementado y probado | `AuthGuard` valida sesión con `auth.api.getSession()` desde cookies; sin sesión → `401`. `RolesGuard` corta con `403` si rol no permitido. Pruebas e2e confirman 401/403/200 (PASS). |
| Cierre de sesión e invalidación de la sesión | Implementado y probado | `POST /api/auth/sign-out` (Better Auth). Prueba e2e: tras sign-out, `GET /api/me` devuelve 401 y la fila de `session` se elimina de BD (PASS). |
| Diferencias de permisos entre ASESOR y DIRECTOR | Implementado y probado | `@Auth('DIRECTOR')` / `@Auth('ASESOR','DIRECTOR')` con `RolesGuard`. ASESOR recibe 403 en ruta exclusiva de DIRECTOR, DIRECTOR accede (PASS). |
| Requisitos visuales de `diseno_01.png`, icono mostrar/ocultar contraseña, botón Microsoft, enlace «¿Olvidaste tu contraseña?» | Pendiente de verificación / No implementado en backend | Estos son requisitos de **frontend**. En esta historia el trabajo fue principalmente **backend**; no se han verificado/modificado archivos del frontend en el alcance actual. No se marca como implementado. |

---

## 2. Endpoints

### Endpoints propios de Better Auth (montados en `/api/auth/*`)

| Método | Ruta | Propósito | Autenticación | Petición | Respuesta exitosa | Errores relevantes | Cookies/Sesión |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `POST` | `/api/auth/sign-in/email` | Iniciar sesión con correo y contraseña | No (público) | JSON: `{ email: string, password: string, rememberMe?: boolean }` (origen debe estar autorizado). | `200 OK`. Better Auth establece cookie de sesión `httpOnly` (`better-auth.session_token`). Puede incluir `better-auth.dont_remember` si `rememberMe: false`. | `401` credenciales incorrectas; `403` origen no autorizado (`trustedOrigins`); `400` datos inválidos. | Cookie `httpOnly`, `SameSite=Lax`, `Secure` solo en producción. Con `rememberMe: true` → `Max-Age=2592000` (30 días). |
| `GET` | `/api/auth/get-session` | Consultar sesión actual | Opcional (lee cookie) | Sin body (lee cookies). | `200 OK` con sesión/usuario si existe, o `null`/vacío según Better Auth. | Según configuración puede devolver 401/otros si no hay sesión válida. | Requiere cookie de sesión. |
| `POST` | `/api/auth/sign-out` | Cerrar sesión | Requiere sesión válida (cookie) | JSON vacío `{}` (según pruebas). | `200 OK`. Invalida sesión y expira cookie. | `401` si no hay sesión válida. | Elimina/invalida cookie y borra fila en `session`. |

Documentado en Swagger (`backend/src/main.ts`) con descripciones de estos endpoints.

### Endpoint propio de la aplicación

| Método | Ruta | Propósito | Autenticación | Petición | Respuesta exitosa | Errores relevantes | Cookies/Sesión |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `GET` | `/api/me` | Perfil del usuario autenticado | Requerida (`@Auth()`, `AuthGuard`) | Sin body. Requiere cookie de sesión válida. | `200 OK` - `MeResponseDto`: `{ id: string, nombre: string, email: string, rol: 'ASESOR' \| 'DIRECTOR', asesor: { id_asesor: number, telefono: string \| null, estado: string } \| null }` | `401` sin sesión/cookie inválida; `403` si rol no válido (`AuthGuard`) o si ASESOR sin registro en `asesor` (`AsesorNoVinculadoError` → `DomainErrorsFilter`). | Usa sesión validada por `AuthGuard` vía `auth.api.getSession()`. |

---

## 3. Implementación técnica

### Configuración de Better Auth
- **Archivo:** `backend/src/modules/auth/infrastructure/better-auth/auth.factory.ts`
- `betterAuth({ database: pool, secret: BETTER_AUTH_SECRET, baseURL: BETTER_AUTH_URL, trustedOrigins: allowedOrigins(env), ... })`
- **Validaciones:** `BETTER_AUTH_SECRET` >= 32 chars; `BETTER_AUTH_URL` debe ser origen sin ruta.
- **emailAndPassword:** `enabled: true`, `disableSignUp: true` (registro público deshabilitado).
- **Sesión:** `expiresIn: REMEMBER_ME_SESSION_SECONDS` (30 días), `updateAge: SESSION_UPDATE_AGE_SECONDS` (1 día).
- **Usuario:** `additionalFields.role` con `type: 'string'`, `required: true`, `defaultValue: 'ASESOR'`, `input: false` (no modificable desde cliente).
- **Avanzado:** `useSecureCookies` solo en producción; `defaultCookieAttributes: { httpOnly: true, sameSite: 'lax' }`; `disableOriginCheck: false`.
- `allowedOrigins()` combina `FRONTEND_URL` (separados por coma) y origen de `BETTER_AUTH_URL`.

### Conexión con PostgreSQL
- **Pool pg:** `backend/src/core/infrastructure/database/pg-pool.ts` (`createPgPool()`) usando variables `DATABASE_HOST/PORT/USER/PASSWORD/NAME/SSL`. Pool max 10.
- **TypeORM DataSource:** `backend/src/core/infrastructure/database/data-source.ts` (migraciones, `synchronize: false`, `ssl` según env).
- **Better Auth usa pool pg directamente:** `AuthModule` inyecta `PG_POOL` y crea `AUTH` con `createAuth(pool)`. Se cierra en `onApplicationShutdown()`.

### Gestión de sesiones y cookies
- Better Auth gestiona cookies `httpOnly`/`SameSite=Lax`. Con `rememberMe: true` cookie persistente con `Max-Age` 30 días; con `rememberMe: false` cookie de sesión del navegador + flag `dont_remember` y expiración de sesión ~1 día en BD.
- `AuthGuard` obtiene sesión con `auth.api.getSession({ headers: fromNodeHeaders(request.headers) })` usando las cookies del request.
- Orígenes validados vía `trustedOrigins` y CORS configurado en `app.setup.ts` con `allowedOrigins()` y `credentials: true`.
- Better Auth montado en Express: `app.getHttpAdapter().getInstance().all('/api/auth/*splat', toNodeHandler(auth))` antes de pipes JSON de Nest.

### Manejo de roles ASESOR y DIRECTOR
- **Dominio:** `backend/src/modules/auth/domain/role.ts` (`isRole`, roles `ASESOR | DIRECTOR`). `backend/src/modules/auth/domain/authenticated-user.ts`.
- **BD:** Migración `backend/src/core/infrastructure/database/migrations/1792500000001-CreateBetterAuthTables.ts` crea tabla `user` con `role TEXT NOT NULL DEFAULT 'ASESOR'` y `CONSTRAINT "CHK_user_role" CHECK ("role" IN ('ASESOR', 'DIRECTOR'))`. Rol almacenado en BD (no solo cookie).
- **Protección:** `AuthGuard` valida rol con `isRole()` → 403 si inválido. `RolesGuard` verifica contra metadata de `@Roles()`. `@Auth(...roles)` aplica guards y decoradores Swagger.
- **Sin elevación de privilegios:** `role` tiene `input: false` en Better Auth; pruebas confirman intento de `update-user` devuelve 400 y cambios vía query/cabecera son ignorados.

### Guards, decoradores y protección de rutas
- **Guards:** `backend/src/modules/auth/presentation/auth.guard.ts` (`AuthGuard`), `backend/src/modules/auth/presentation/roles.guard.ts` (`RolesGuard`).
- **Decoradores:** `backend/src/modules/auth/presentation/auth.decorator.ts` (`@Auth(...roles)`, `@CurrentUser()`), `backend/src/modules/auth/presentation/roles.decorator.ts` (`@Roles()`).
- **Filtro de errores de dominio:** `backend/src/modules/auth/presentation/domain-errors.filter.ts` convierte `AsesorNoVinculadoError` y `AsesorFueraDeAlcanceError` en `403 Forbidden`. Registrado globalmente en `AuthModule`.

### Funcionamiento de `GET /api/me`
- **Controlador:** `backend/src/modules/auth/presentation/me.controller.ts` (`GET /me` con `@Auth()`).
- **Caso de uso:** `backend/src/modules/auth/application/use-cases/get-me.use-case.ts`
  - Si `rol === 'DIRECTOR'` → `asesor: null`.
  - Si `rol === 'ASESOR'` → busca en `asesor` por `correo` (case-insensitive, vía `TypeOrmAsesorRepository`). Si no existe → lanza `AsesorNoVinculadoError` (403). Si existe → devuelve datos del asesor.
- **DTO:** `backend/src/modules/auth/presentation/dto/me-response.dto.ts` (`MeResponseDto`).
- **Vinculación:** `user.email = asesor.correo` (comparación case-insensitive).

### Validaciones y manejo de errores
- `AuthGuard`: sin sesión → `401 "Sesión no válida"`. Rol inválido → `403 "Rol no válido"`.
- `RolesGuard`: sin usuario → `401 "Sesión no válida"`. Rol no permitido → `403 "No tienes permisos para esta operación"`.
- `DomainErrorsFilter`: `AsesorNoVinculadoError` / `AsesorFueraDeAlcanceError` → `403` con mensaje.
- CORS/orígenes: origen no autorizado a auth → `403`.
- Registro público deshabilitado (`disableSignUp: true`).
- BD: `CHK_user_role` rechaza roles inválidos.

### Archivos principales involucrados
| Archivo | Responsabilidad |
| --- | --- |
| `backend/src/modules/auth/infrastructure/better-auth/auth.factory.ts` | Configuración de Better Auth, constantes de sesión, `allowedOrigins`. |
| `backend/src/modules/auth/auth.module.ts` | Módulo Auth (pool pg, AUTH, guards, use cases, repositorio). |
| `backend/src/modules/auth/presentation/auth.guard.ts` | Validación de sesión con Better Auth. |
| `backend/src/modules/auth/presentation/roles.guard.ts` | Autorización por roles. |
| `backend/src/modules/auth/presentation/auth.decorator.ts` | `@Auth()` y `@CurrentUser()`. |
| `backend/src/modules/auth/presentation/me.controller.ts` | Endpoint `GET /me`. |
| `backend/src/modules/auth/application/use-cases/get-me.use-case.ts` | Lógica de perfil y vínculo asesor/correo. |
| `backend/src/modules/auth/application/use-cases/resolve-asesor-scope.use-case.ts` | Anti-IDOR para operaciones comerciales (preparado). |
| `backend/src/modules/auth/infrastructure/persistence/typeorm-asesor.repository.ts` | Búsqueda de asesor por correo (case-insensitive). |
| `backend/src/core/infrastructure/database/migrations/1792500000000-CreateAsesorTable.ts` | Tabla `asesor`. |
| `backend/src/core/infrastructure/database/migrations/1792500000001-CreateBetterAuthTables.ts` | Tablas `user/session/account/verification` con `role`. |
| `backend/src/core/infrastructure/database/seeds/seed-demo-users.ts` | Creación de usuarios demo con hasher nativo de Better Auth. |
| `backend/src/app.setup.ts` | Montaje de Better Auth en Express, CORS, prefijo `/api`. |
| `backend/src/main.ts` | Bootstrap, Swagger (incluye docs de endpoints Better Auth). |

---

## 4. Pruebas realizadas

### Comandos automatizados (estado actual)
| Comando | Resultado | Detalle |
| --- | --- | --- |
| `npm run lint` | **PASS** | `oxlint --type-aware src/ test/` sin errores. |
| `npm run build` | **PASS** | `nest build` exitoso. |
| `npm test` | **PASS** | 5 archivos de test / **22 pruebas unitarias aprobadas**. |
| `npm run test:e2e` | **PASS** | 2 archivos de test / **22 pruebas e2e aprobadas** (PostgreSQL real). |

### Pruebas e2e cubiertas (HU-09/HU-10)
- **HU-09:** Login válido con cookie `httpOnly`/`SameSite=Lax`; credenciales incorrectas → 401 sin cookie; registro público deshabilitado (400); origen no autorizado → 403; CORS correcto; `rememberMe: true` → `Max-Age=2592000` y ~30 días en BD; `rememberMe: false` → cookie de sesión + `dont_remember` y ~1 día; sign-out invalida sesión y elimina fila en `session`.
- **GET /api/me:** 401 sin sesión/cookie inventada; ASESOR con asesor vinculado devuelve perfil+asesor; DIRECTOR devuelve `asesor: null`; vínculo por correo case-insensitive; ASESOR sin registro en `asesor` → **403** (via `DomainErrorsFilter`).
- **HU-10:** Director accede a ruta exclusiva; Asesor recibe 403 en ruta exclusiva pero accede a ruta común; 401 sin sesión; rol no modificable desde cliente (update-user/query/header); constraint de BD rechaza roles inválidos; cambio de rol en BD se refleja inmediatamente.

### Pruebas manuales en Swagger (recomendadas)
| Escenario | Método/Ruta | Resultado esperado |
| --- | --- | --- |
| Inicio de sesión con rol ASESOR | `POST /api/auth/sign-in/email` | `200 OK`, cookie de sesión establecida. Luego `GET /api/me` devuelve rol ASESOR y datos de asesor. |
| Inicio de sesión con rol DIRECTOR | `POST /api/auth/sign-in/email` | `200 OK`, cookie establecida. `GET /api/me` devuelve rol DIRECTOR y `asesor: null`. |
| Rechazo de credenciales incorrectas | `POST /api/auth/sign-in/email` | `401 Unauthorized`. |
| Consulta de sesión | `GET /api/auth/get-session` | `200 OK` con sesión si hay cookie válida. |
| Cierre de sesión | `POST /api/auth/sign-out` | `200 OK`. |
| Respuesta 401 tras cierre de sesión | `GET /api/me` | `401 Unauthorized` después de `sign-out`. |

---

## 5. Resultado final y pendientes

### Implementado
- **Autenticación:** Better Auth con email/contraseña, registro público deshabilitado, roles protegidos contra modificación.
- **Sesiones:** Cookies `httpOnly`/`SameSite=Lax`, "Recordarme" 30 días, sin recordarme ~1 día, renovación de sesión configurada.
- **Autorización:** `AuthGuard`, `RolesGuard`, `@Auth()`, `@CurrentUser()`, control por roles ASESOR/DIRECTOR.
- **Perfil:** `GET /api/me` con vínculo `user.email = asesor.correo` (case-insensitive). DIRECTOR → `asesor: null`. ASESOR sin registro → 403.
- **Cierre de sesión:** `POST /api/auth/sign-out` invalida sesión.
- **Infraestructura:** Migraciones para `asesor` y tablas Better Auth, seed con hasher nativo, pool pg compartido, montaje en Express, Swagger documentado.
- **Pruebas:** 22 unitarias + 22 e2e pasando, lint y build correctos.

### Verificado
- Configuración de Better Auth, cookies, "Recordarme"/sin recordarme, guards/roles, `/api/me`, sign-out, CORS/orígenes, restricción de registro, protección del rol.

### Pendientes
| Item | Tipo | Notas |
| --- | --- | --- |
| Requisitos visuales de `diseno_01.png` (icono mostrar/ocultar contraseña, botón Microsoft, enlace «¿Olvidaste tu contraseña?») | Frontend (no implementado/verificado en backend) | Fuera del alcance principal de backend; no se marca como implementado. |
| Recuperación de contraseña / login con Microsoft | Deseable (HU-11) | Marcado como deseable en la guía; no requerido para HU-09 obligatoria. |
| Integración de `AuthGuard`/`RolesGuard` en controladores de negocio | Pendiente según módulos | `ResolveAsesorScopeUseCase` preparado para anti-IDOR; aplicar cuando existan endpoints de negocio. |

**Archivo generado/actualizado:** `docs/HU-09-autenticacion-y-roles.md`
**Resumen:** Documentación completa de HU-09 (criterios, endpoints reales Better Auth + `/api/me`, implementación técnica, pruebas con resultados reales y pendientes), sin cambios de código/BD/frontend/commits.
