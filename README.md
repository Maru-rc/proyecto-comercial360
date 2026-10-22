# Comercial 360 — Plataforma de Gestión Comercial

> **Monorepo Modular en NestJS & React con Clean Architecture, DDD, Docker Compose, CI/CD y Agentes de IA Especializados.**

---

## 🏗️ 1. Arquitectura del Monorepo

El proyecto está organizado como un **monorepo estructurado bajo el directorio `app/`**, gobernado por `pnpm-workspace.yaml`:

```text
proyecto-comercial360/
├── app/
│   ├── backend/               # API REST NestJS (Clean Architecture & DDD)
│   └── frontend/              # SPA React 19 + Vite + Tailwind + Leaflet
│
├── agents/                    # Perfiles y directivas de los 7 Agentes de IA
│   ├── README.md              # Manifiesto Zero-Trust y Anti-Vibecoding
│   ├── agent-alejandroesbr.md # Co-Lead: Clientes, Rutas y Bitácora
│   ├── agent-manulz.md        # Co-Lead: Visitas, Comercial y S3
│   ├── agent-saul.md          # Database: Migraciones TypeORM, Aurora y Reportes
│   ├── agent-Andres-1109.md   # DevOps: Jenkins, EC2 y Docker
│   ├── agent-Frankcanas.md    # Frontend: UI/UX, Leaflet Maps y Vistas
│   ├── agent-Maru-rc.md       # QA: Pruebas Vitest, Mocks y Cobertura
│   └── agent-valentina.md     # Security: Better Auth y RBAC
│
├── .github/                   # Gobernanza y Automatización
│   ├── CODEOWNERS             # Propietarios de código obligatorios para PRs
│   ├── labeler.yml            # Reglas de auto-etiquetado por dominio
│   ├── release-drafter.yml    # Generador de notas de versión y Changelog
│   └── workflows/             # Suite de 7 Workflows de CI/CD en GitHub Actions
│       ├── ci-pr-validation.yml   # Quality Gate de Clean Architecture & SOLID
│       ├── sonarqube.yml          # Análisis de calidad en SonarQube Cloud
│       ├── codeql.yml             # Análisis de seguridad SAST oficial de GitHub
│       ├── gitleaks.yml           # Escáner de fuga de secretos y credenciales
│       ├── dependency-review.yml  # Auditoría de vulnerabilidades en librerías
│       ├── pr-size-labeler.yml    # Control de tamaño de PRs (XS a XL)
│       └── pr-labeler.yml         # Etiquetador automático por área
│
├── docs/                      # Documentación Técnica Canónica
│   ├── PLAN.MD                # Plan maestro de arquitectura de dominios
│   ├── Explicacion_Clean_Architecture.md # Fundamentos teóricos (Uncle Bob)
│   ├── Convencion_Git_Ramas_y_Commits.md # Estándares Git y Husky
│   ├── Propuestas_Arquitectura_Agentes_AI.md # Propuestas de IA
│   └── Bitacora_Cambios_Arquitectura_e_Infraestructura.md # Registro técnico
│
├── docker/                    # Scripts SQL para inicialización de base de datos
├── scripts/                   # Scripts de auditoría de arquitectura y Git hooks
│   └── check-clean-architecture.sh # Validador automático de SOLID y Clean Architecture
│
├── docker-compose.yml         # Entorno local integrado (Demo rápida: Postgres + MinIO + App)
├── docker-compose.dev.yml     # Entorno de desarrollo activo (Hot-Reload en vivo)
├── docker-compose.prod.yml    # Entorno de producción en AWS EC2 (Aurora + S3 + Nginx)
├── pnpm-workspace.yaml        # Configuración de paquetes del monorepo
├── AGENTS.md                  # Instrucción universal obligatoria para cualquier IA
├── .cursorrules               # Directiva de sistema para Cursor IDE
├── .windsurfrules             # Directiva de sistema para Windsurf (Cascade)
└── CLAUDE.md                  # Directiva de sistema para Claude Code
```

---

## 👥 2. Liderazgo Técnico y Matriz del Equipo

| Integrante | Usuario GitHub | Rol Oficial | Módulos y Responsabilidades |
|---|---|---|---|
| **Manuel Vásquez** | [`@manulz`](https://github.com/manulz) | **Líder Oficial de Arquitectura e Infraestructura** | Custodio global de Clean Architecture, Docker Compose, Amazon Aurora PostgreSQL, Amazon S3. Módulos `visits`, `commercial` (cotizaciones y pedidos), `follow-ups` y `storage`. |
| **Alejandro** | [`@alejandroesbr`](https://github.com/alejandroesbr) | **Líder Oficial de Arquitectura e Infraestructura** | Custodio global de Clean Architecture, barril central (`src/domain-contracts`). Módulos `clients` (formulario y carga masiva CSV), `routes` (ordenamiento y asignación) y `history` (bitácora). |
| **Saúl** | [`@saul`](https://github.com/saul) | Database & Analytics Specialist | **Único autorizado para migraciones TypeORM** (`HU-02`), clúster Aurora, KPIs de la semana, tabla de seguimiento y exportación CSV con BOM UTF-8 (`\uFEFF`). |
| **Andrés** | [`@Andres-1109`](https://github.com/Andres-1109) | DevOps & Cloud Deployment | Pipeline de Jenkins en AWS EC2 (`HU-21`), configuración de Swap (4GB), Docker multi-stage y Nginx. |
| **Frank** | [`@Frankcanas`](https://github.com/Frankcanas) | Frontend Lead & UI/UX | Aplicación React 19 + Vite: componentes modulares, mapa Leaflet interactivo sin fugas de memoria y Dashboard comercial. |
| **Manuel Rueda** | [`@Maru-rc`](https://github.com/Maru-rc) | QA & Quality Assurance Specialist | Pruebas unitarias en Vitest con *In-Memory Test Doubles*, SonarQube Cloud y cobertura de casos críticos. |
| **Valentina** | [`@valentina`](https://github.com/valentina) | Security & Authentication Specialist | Better Auth, Guards RBAC (`DIRECTOR` vs `ASESOR`), prevención de IDOR y pantalla de Login. |

---

## 🐳 3. Entornos de Ejecución con Docker Compose

El proyecto cuenta con **3 perfiles de Docker Compose**, cada uno diseñado para un caso de uso específico:

### 3.1. Entorno de Prueba Rápida / Demo Integrada (`docker-compose.yml`)
Levanta todos los servicios compilados localmente con base de datos y almacenamiento emulado:
```bash
docker compose up --build
```
* **Frontend:** [http://localhost:3021](http://localhost:3021)
* **Backend API:** [http://localhost:3020](http://localhost:3020)
* **Swagger Docs:** [http://localhost:3020/api/docs](http://localhost:3020/api/docs)
* **MinIO Console (S3 Web):** [http://localhost:9001](http://localhost:9001) (`minioadmin` / `minioadmin`)

### 3.2. Entorno de Desarrollo Activo con Hot-Reload (`docker-compose.dev.yml`)
Enlaza el código fuente local a los contenedores para recarga en vivo (**HMR**) sin reconstruir imágenes:
```bash
docker compose -f docker-compose.dev.yml up --build
```
* **Frontend Vite Dev:** [http://localhost:5173](http://localhost:5173)
* **Backend NestJS:** [http://localhost:3000](http://localhost:3000)
* **PostgreSQL directo:** `localhost:5432` (`comercial360_db`)

### 3.3. Entorno de Producción en AWS EC2 (`docker-compose.prod.yml`)
Gestionado exclusivamente por el pipeline automatizado de Jenkins en la máquina EC2:
```bash
docker compose -f docker-compose.prod.yml up -d --build
```
* **Nota Arquitectónica:** No levanta PostgreSQL ni MinIO; se conecta al clúster gestionado **Amazon Aurora PostgreSQL (RDS)** y al bucket real de **Amazon S3** mediante las credenciales seguras del archivo `.env` de la EC2.

---

## 🛡️ 4. Protocolo Zero-Trust y Anti-Vibecoding para Agentes de IA

Cualquier Inteligencia Artificial utilizada por el equipo (Cursor, Windsurf, Claude Code, GitHub Copilot o interfaces web) debe cumplir la directiva obligatoria de [`AGENTS.md`](./AGENTS.md):
1. **Identificación Inmediata:** Detectar al integrante activo y cargar su perfil en `agents/agent-{usuario}.md`.
2. **Evaluación de Clean Code & SOLID:** Auditar que todo código cumpla:
   - **S (SRP):** Casos de uso con un único método `execute()`. Prohibidos servicios gigantes.
   - **O (OCP):** Nuevas reglas mediante Strategy o polimorfismo, sin cadenas de `if-else`.
   - **L (LSP):** Mocks en memoria (`InMemory*Repository`) sustituibles sin alterar contratos.
   - **I (ISP):** Interfaces pequeñas y segregadas (`*Reader`) en `src/domain-contracts`.
   - **D (DIP):** Los casos de uso dependen de Puertos inyectados por Token, nunca de TypeORM.
3. **Respeto a Clean Architecture:** La capa `domain/` no puede importar frameworks ni librerías externas.
4. **Barril Central:** Prohibido importar carpetas internas de otro módulo; la comunicación se realiza exclusivamente a través de `src/domain-contracts`.

---

## 🚦 5. Blindaje Mecánico de Git y CI/CD

El repositorio cuenta con dos barreras que impiden la entrada de código que viole los estándares:

1. **Localmente en Husky (`.husky/pre-commit`):**
   - Ejecuta [`scripts/check-clean-architecture.sh`](./scripts/check-clean-architecture.sh).
   - Si detecta imports prohibidos en el dominio, saltos al barril central o inyecciones de TypeORM en controladores, **aborta el commit de inmediato**.
2. **En GitHub Pull Requests ([`.github/workflows/`](./.github/workflows/)):**
   - **Quality Gate:** Ejecuta el validador de Clean Architecture y pruebas de Vitest.
   - **CodeQL & Gitleaks:** Bloquea brechas de seguridad o fugas de secretos de AWS.
   - **Dependency Review:** Bloquea librerías con vulnerabilidades.
   - **CODEOWNERS:** Exige la aprobación obligatoria de `@manulz` o `@alejandroesbr` antes de que un PR pueda integrarse a `develop` o `main`.
