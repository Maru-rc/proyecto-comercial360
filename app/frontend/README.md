# Comercial 360 - Frontend Application

Aplicación web React + TypeScript + Vite para el sistema **Comercial 360**.

---

## 🚀 Inicio Rápido

### Requisitos Previos
- **Node.js**: Versión 18.0 o superior (recomendado 20+ LTS).
- **pnpm**: Versión 10 (`corepack enable` lo deja disponible).

### Instalación y Ejecución

El frontend es parte del monorepo (`pnpm-workspace.yaml`). Los comandos se corren desde la raíz del repositorio:

```bash
# Instalar dependencias de todo el monorepo
pnpm install

# Iniciar servidor de desarrollo en http://localhost:5173
pnpm --filter frontend dev

# Compilar para producción
pnpm --filter frontend build

# Ejecutar el linter Oxlint
pnpm --filter frontend lint
```

### Conexión con el backend

En desarrollo, Vite reenvía `/api` al backend NestJS (por defecto `http://localhost:3001`). Para usar otra dirección, define `VITE_PROXY_TARGET` (por ejemplo, en `app/frontend/.env`). Como la app y la API quedan en el mismo origen, el navegador guarda la cookie de sesión de Better Auth sin configurar nada más.

El backend tiene que estar corriendo, con las migraciones y el seed aplicados (ver `docs/HU-09-autenticacion-y-roles.md`).

---

## 🔐 Credenciales Demo

El login es real (Better Auth). Los usuarios los crea el seed del backend (`pnpm run seed` en `app/backend`):

| Rol | Usuario | Contraseña |
| :--- | :--- | :--- |
| **Asesor Comercial** | `juan.perez@comercial360.com` | `SEED_ASESOR_PASSWORD` del `.env` del backend |
| **Director Regional** | `richard.lopez@comercial360.com` | `SEED_DIRECTOR_PASSWORD` del `.env` del backend |

El inicio de sesión con Microsoft está fuera del alcance: el botón se muestra deshabilitado.

---

## 🧭 Vistas y Rutas

- `/` o `/dashboard`: Panel de control general y KPIs.
- `/rutas`: Creación de rutas con mapa Leaflet y Drag & Drop.
- `/rutas/asignadas`: Listado de rutas asignadas con detalle de paradas.
- `/rutas/agenda`: Matriz semanal de disponibilidad de asesores.
- `/agenda`: Agenda diaria con citas y agendamiento interactivo.
- `/mapa`: Mapa de visitas en pantalla completa con buscador de clientes.
- `/clientes`: Directorio comercial de clientes con paginación y modal de creación.
- `/visitas`: Historial de visitas con paginación y filtros.
- `/visitas/registrar`: Asistente de 5 pasos para ejecución de visita con fotos y firma.
- `/cotizaciones`: Gestión de cotizaciones con modal de impresión y creación.
- `/pedidos`: Control de pedidos con stepper de seguimiento de entregas.
- `/indicadores`: Gráficos de ventas, ranking de asesores y cumplimiento de metas.
- `/reportes`: Exportación de reportes a formatos CSV y Excel.
- `/configuracion`: Parámetros del perfil, notificaciones y sistema.

Para más información, consulta el archivo [README.md principal](../README.md).
