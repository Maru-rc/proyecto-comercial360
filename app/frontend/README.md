# Comercial 360 - Frontend Application

Aplicación web React + TypeScript + Vite para el sistema **Comercial 360**.

---

## 🚀 Inicio Rápido

### Requisitos Previos
- **Node.js**: Versión 18.0 o superior (recomendado 20+ LTS).
- **npm**: Versión 9.0 o superior.

### Instalación y Ejecución

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo en http://localhost:5173
npm run dev

# Compilar para producción
npm run build

# Ejecutar el linter Oxlint
npm run lint
```

---

## 🔐 Credenciales Demo

| Rol | Usuario | Contraseña |
| :--- | :--- | :--- |
| **Asesor Comercial** | `asesor@comercial360.co` | `password123` |
| **Director Regional** | `director@comercial360.co` | `password123` |

También puedes usar los botones de acceso directo en la pantalla de inicio de sesión (`/login`).

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
