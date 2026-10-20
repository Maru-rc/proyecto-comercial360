# Comercial 360 - Sistema Integral de Gestión Comercial y Rutas en Campo

Plataforma web moderna y responsiva diseñada para optimizar la gestión comercial en campo, la planeación y asignación de rutas, el seguimiento geoespacial sobre mapas interactivos, y el control de pedidos, cotizaciones e indicadores de rendimiento para **Asesores Comerciales** y **Directores Regionales**.

---

## 🚀 Inicio Rápido

### Requisitos Previos
- **Node.js**: Versión 18.0 o superior (recomendado Node.js 20+ LTS).
- **npm**: Versión 9.0 o superior.

### Instalación y Ejecución Local

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/Frankcanas/proyecto-comercial360.git
   cd proyecto-comercial360
   ```

2. **Ir al directorio del frontend e instalar dependencias**:
   ```bash
   cd frontend
   npm install
   ```

3. **Iniciar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```
   El proyecto se iniciará en `http://localhost:5173/`. Abre tu navegador en esta dirección para interactuar con la plataforma.

---

## 🛠️ Scripts Disponibles

Dentro del directorio `frontend/`:

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo Vite con Hot Module Replacement (HMR). |
| `npm run build` | Ejecuta la verificación de tipos (`tsc -b`) y empaqueta los assets de producción en `/dist`. |
| `npm run preview` | Sirve la compilación de producción de `/dist` localmente para pruebas previas al despliegue. |
| `npm run lint` | Ejecuta el linter **Oxlint** para análisis estático ultra-rápido de código sin errores. |

---

## 🔐 Credenciales Demo de Acceso

La aplicación cuenta con autenticación interactiva mediante Zustand. En la pantalla de Login (`/login`) se incluyen **botones de acceso rápido de un clic**:

| Rol | Correo Electrónico | Contraseña | Permisos y Enfoque |
| :--- | :--- | :--- | :--- |
| **Asesor Comercial** | `asesor@comercial360.co` | `password123` | Ejecución de visitas en campo, registro con firma/fotos, rutas asignadas, creación de cotizaciones y pedidos. |
| **Director Regional** | `director@comercial360.co` | `password123` | Supervisión regional, planeación de rutas, agenda de asesores, ranking de ventas y matriz de indicadores. |

> **Nota:** Puedes alternar el rol activo en cualquier momento desde el menú de usuario en la barra superior (**Header**), haciendo clic en el avatar y seleccionando *"Cambiar a Asesor / Director"*.

---

## 🧭 Módulos y Funcionalidades del Sistema

Todas las opciones de la barra lateral izquierda son 100% funcionales e interactivas:

```
├── 📊 Dashboard                  (/, /dashboard)
├── 🗺️ Planeación de rutas
│   ├── Creación de rutas         (/rutas)
│   ├── Rutas asignadas           (/rutas/asignadas)
│   └── Agenda de asesores        (/rutas/agenda)
├── 📅 Agenda Diaria              (/agenda)
├── 📍 Mapa de Visitas            (/mapa)
├── 👥 Clientes                   (/clientes)
├── 📋 Historial de Visitas       (/visitas)
│   └── Registro de Visita        (/visitas/registrar)
├── 📄 Cotizaciones               (/cotizaciones)
├── 🛒 Pedidos                    (/pedidos)
├── 📈 Indicadores                (/indicadores)
├── 📑 Centro de Reportes         (/reportes)
└── ⚙️ Configuración              (/configuracion)
```

### Detalle de Módulos

1. **Dashboard Principal (`/`, `/dashboard`)**:
   - Tarjetas KPI con valor, porcentaje de meta y tendencia positiva/negativa.
   - Mapa interactivo Leaflet con clientes asignados al día.
   - Tabla de visitas del día con filtrado rápido y acciones directas.
   - Agenda lateral con horario y cumplimiento del día.

2. **Planeación de Rutas (`/rutas`)**:
   - Asistente de 3 pasos: Parámetros generales, selección de clientes y optimización de ruta.
   - Reordenamiento de paradas en tiempo real mediante **Drag & Drop** (`@dnd-kit`).
   - Cálculo automático de distancia (km), tiempo estimado y trazado sobre el mapa.

3. **Rutas Asignadas (`/rutas/asignadas`)**:
   - Visualización de rutas asignadas con progreso porcentual y estado (`Programada`, `En curso`, `Completada`).
   - Modal de detalle de paradas con secuencia de visitas y tiempos estimados.

4. **Agenda de Asesores (`/rutas/agenda`)**:
   - Matriz semanal tipo Gantt/calendario para Directores Regionales.
   - Estado de carga de trabajo, clientes asignados por día y disponibilidad por asesor.

5. **Agenda Diaria (`/agenda`)**:
   - Vista por bloques horarios del día.
   - Modal de agendamiento para programar nuevas citas con fecha, cliente y tipo de reunión.

6. **Mapa de Visitas en Pantalla Completa (`/mapa`)**:
   - Mapa OpenStreetMap full-screen con marcadores personalizados por estado (`Pendiente`, `Completada`, `En curso`).
   - Panel lateral desplegable de clientes con buscador y centrado automático de cámara al hacer clic.

7. **Directorio de Clientes (`/clientes`)**:
   - Listado paginado con búsqueda en vivo por razón social, NIT o contacto.
   - Modal para creación de nuevos clientes con validación de datos.

8. **Historial de Visitas (`/visitas`)**:
   - Registro histórico de visitas realizadas con paginación dinámica y filtros por resultado (`Venta cerrada`, `Seguimiento`, `No contactado`).

9. **Asistente de Registro de Visita en Campo (`/visitas/registrar`)**:
   - Formulario por pasos: Datos generales con geolocalización, información del cliente, checklist de detalle, toma de pedidos/cotizaciones y acuerdos de seguimiento.
   - **Canvas de firma digital**: Permite capturar la firma del cliente directamente en pantalla.
   - **Carga de fotografías**: Adjunta evidencia fotográfica de la visita.

10. **Cotizaciones (`/cotizaciones`)**:
    - Catálogo paginado con selector de estados (`Borrador`, `Enviada`, `Aprobada`, `Rechazada`).
    - Modal de vista previa e impresión de cotización formal.
    - Modal de creación de nueva cotización con cálculo automático de totales e impuestos.

11. **Pedidos (`/pedidos`)**:
    - Listado de pedidos comerciales con filtros de estado.
    - Modal de seguimiento con **Stepper de entrega** (`Pendiente` ➔ `En preparación` ➔ `Despachado` ➔ `Entregado`).
    - Modal de creación rápida de pedido.

12. **Indicadores Comerciales (`/indicadores`)**:
    - Gráficos interactivos de evolución de ventas, cumplimiento de metas semanales, ranking de asesores y embudo de conversión.

13. **Centro de Reportes (`/reportes`)**:
    - Filtros por rango de fechas, asesor y tipo de reporte (Visitas, Cotizaciones, Cobertura, Rendimiento).
    - **Descarga real en formato CSV / Excel** para análisis offline.

14. **Configuración del Sistema (`/configuracion`)**:
    - Gestión de perfil de usuario, preferencias de notificación y parámetros del negocio.

---

## 💻 Arquitectura y Stack Tecnológico

- **Frontend Core**: React 18 con TypeScript en modo estricto.
- **Herramienta de Construcción (Build Tool)**: Vite 8 con Rolldown / SWC.
- **Estilos**: Tailwind CSS 4 con diseño mobile-first y soporte de layout fluido.
- **Iconografía**: [Lucide React](https://lucide.dev/) (más de 30 íconos semánticos).
- **Manejo de Estado**:
  - `useAuthStore` (Zustand): Sesión de usuario, rol (`ASESOR_COMERCIAL` / `DIRECTOR_REGIONAL`) y persistencia.
  - `useFilterStore` (Zustand): Territorio, regional, semana y búsqueda global.
- **Mapas y Geolocalización**: [Leaflet](https://leafletjs.com/) y `react-leaflet` sobre OpenStreetMap con capas de marcadores dinámicos.
- **Drag & Drop**: `@dnd-kit/core` y `@dnd-kit/sortable` para la secuenciación de rutas.
- **Enrutamiento**: React Router DOM v7 con layouts anidados y scroll top automático.
- **Paginación**: Componente reusable [`Pagination.tsx`](./src/components/common/Pagination.tsx) con soporte para páginas dinámicas, tamaño configurable y salto directo.
- **Menú Lateral Responsivo**:
  - En escritorio ($\ge 768\text{px}$): Alterna de forma suave entre barra completa (`w-64`) y barra compacta de íconos (`w-20`), permaneciendo siempre visible y accesible.
  - En móviles ($< 768\text{px}$): Cajón lateral off-canvas (`translate-x-0` / `-translate-x-full`) con backdrop oscuro semitransparente.

---

## 📂 Estructura de Directorios

```
frontend/
├── public/                 # Favicon y recursos estáticos
├── src/
│   ├── api/                # Clientes Axios y capas de datos (rutas, clientes, pedidos, cotizaciones)
│   ├── components/
│   │   ├── common/         # Componentes transversales (Pagination, ErrorBoundary)
│   │   ├── dashboard/      # Widgets del dashboard (KpiCards, VisitsTable, TodayAgenda)
│   │   ├── layout/         # UI Shell (AppLayout, Header, Sidebar colapsable)
│   │   ├── rutas/          # Asistente de creación de rutas (RutasStepper, StopsList)
│   │   └── visitas/        # Formularios del registro de visitas (CustomerSummary, Modals)
│   ├── pages/              # Vistas principales de la aplicación (14 páginas)
│   ├── store/              # Stores globales con Zustand (useAuthStore, useFilterStore)
│   ├── types/              # Tipos y contratos TypeScript (visita, ruta, cliente, pedido)
│   ├── App.tsx             # Configuración central de rutas (React Router)
│   ├── main.tsx            # Punto de entrada de la aplicación
│   └── index.css           # Estilos globales y utilidades Tailwind
├── package.json            # Dependencias y scripts
├── tsconfig.json           # Configuración de TypeScript
└── vite.config.ts          # Configuración del bundler Vite
```

---

## 👥 Equipo y Créditos

Proyecto desarrollado para el módulo de Gestión Comercial y Logística de Rutas de **Comercial 360**.
Licencia MIT.
