# Bitácora Técnica de Cambios: Arquitectura, Infraestructura y Agentes AI

> **Proyecto:** Comercial 360  
> **Fecha:** 21 de Octubre de 2026  
> **Líderes Técnicos:** Manuel Vásquez ([`@manulz`](https://github.com/manulz)) y Alejandro ([`@alejandroesbr`](https://github.com/alejandroesbr))  
> **Estado:** Consolidado en rama `chore/initial-architecture` para apertura de Pull Request hacia `develop`.

---

## 1. Resumen Ejecutivo de la Intervención

En esta sesión se establecieron los cimientos definitivos de arquitectura de software, infraestructura de contenedores, gobernanza de control de versiones y el sistema de soporte con Agentes de Inteligencia Artificial para los 7 integrantes del equipo.

El objetivo central fue erradicar el riesgo de *vibecoding* (código generado a ciegas sin diseño previo ni pruebas) y garantizar que la plataforma cumpla al 100% con los estándares de **Clean Architecture**, **SOLID** (Robert C. Martin) y despliegue automatizado con **Docker**, **Amazon Aurora PostgreSQL**, **Amazon S3** y **Jenkins**.

---

## 2. Reorganización a Monorepo Estructurado (`app/`)

### Decisión de Arquitectura:
Se consolidó la estructura del repositorio bajo la carpeta central `app/`, garantizando una separación limpia entre las aplicaciones ejecutables y las herramientas de infraestructura:
* **`app/backend/`:** Aplicación NestJS estructurada en módulos de dominio con las 4 capas de Clean Architecture (`domain/`, `application/`, `infrastructure/`, `interfaces/`).
* **`app/frontend/`:** Aplicación SPA en React 19 + Vite + Tailwind CSS + Leaflet.

### Archivos de Configuración Afectados:
- **`pnpm-workspace.yaml`:** Actualizado para reconocer `'app/backend'` y `'app/frontend'`.
- **`package.json`:** Configurado el hook de `lint-staged` para auditar archivos dentro de `app/backend/src` y `app/frontend/src`.
- **`app/backend/Dockerfile` y `app/frontend/Dockerfile`:** Ubicados y adaptados dentro de sus respectivos directorios de aplicación.

---

## 3. Estandarización de los 3 Perfiles de Docker Compose

Se documentaron, estructuraron y unificaron con encabezados ASCII los 3 archivos de Docker Compose del proyecto:

1. **`docker-compose.yml` (Entorno de Demostración y Prueba Rápida):**
   - Levanta PostgreSQL 16 (`comercial360-postgres`), MinIO S3 (`comercial360-minio` con creación automática del bucket `comercial360-files`), Backend NestJS en puerto `3020:3000` y Frontend React en puerto `3021:80`.
   - Se renombraron todas las referencias residuales de plantillas previas (`cachalot` → `comercial360`).
2. **`docker-compose.dev.yml` (Entorno de Desarrollo Activo):**
   - Configurado para **Hot-Reload en vivo**: monta volúmenes enlazados (`bind mounts`) de `./app/backend` y `./app/frontend` para que los cambios en el editor se sincronicen de inmediato sin reconstruir imágenes.
   - Expone el backend en `:3000`, frontend Vite Dev en `:5173`, PostgreSQL en `:5432` y MinIO en `:9000/:9001`.
3. **`docker-compose.prod.yml` (Entorno de Producción en AWS EC2 con Jenkins):**
   - **Nota de Arquitectura:** En producción la base de datos es el clúster gestionado **Amazon Aurora PostgreSQL (RDS)** y los archivos se guardan en **Amazon S3**. Ni PostgreSQL ni MinIO corren en la EC2.
   - Corre únicamente los contenedores compilados del backend (red interna privada `:3000`) y frontend (Nginx en puerto `:80:80`).
   - Lee credenciales seguras mediante `env_file: .env` (opcional en local, obligatorio en el servidor EC2).

---

## 4. Infraestructura de Agentes de IA Especializados (`agents/`)

Se creó el directorio **`agents/`** con especificaciones personalizadas para cada uno de los 7 integrantes del equipo en GitHub, basado en las asignaciones de [docs/Comercial_360_·_Tablero.json](file:///home/manulz/Documentos/Proyectos/proyecto-comercial360/docs/Comercial_360_·_Tablero.json):

1. **[`agents/README.md`](file:///home/manulz/Documentos/Proyectos/proyecto-comercial360/agents/README.md):** Manifiesto general del equipo y reglas de oro de Pair Programming.
2. **[`agents/agent-alejandroesbr.md`](file:///home/manulz/Documentos/Proyectos/proyecto-comercial360/agents/agent-alejandroesbr.md):** Co-Lead de Arquitectura. Responsable de `clients` (`HU-05`, `HU-06`), `routes` (`HU-07..HU-09`), `history` (`HU-15`) y barril de contratos.
3. **[`agents/agent-manulz.md`](file:///home/manulz/Documentos/Proyectos/proyecto-comercial360/agents/agent-manulz.md):** Co-Lead de Arquitectura. Responsable de `visits` (`HU-10..HU-12`), `commercial` (`HU-13`), `follow-ups` (`HU-14`) y storage S3 (`HU-19`).
4. **[`agents/agent-saul.md`](file:///home/manulz/Documentos/Proyectos/proyecto-comercial360/agents/agent-saul.md):** Database Specialist. Único autorizado para migraciones TypeORM (`HU-02`), clúster Aurora (`HU-20`), KPIs (`HU-16`), tabla de seguimiento (`HU-17`) y CSV (`HU-18`).
5. **[`agents/agent-Andres-1109.md`](file:///home/manulz/Documentos/Proyectos/proyecto-comercial360/agents/agent-Andres-1109.md):** DevOps. Pipeline CI/CD de Jenkins en EC2 (`HU-21`), Docker multi-stage y Swap.
6. **[`agents/agent-Frankcanas.md`](file:///home/manulz/Documentos/Proyectos/proyecto-comercial360/agents/agent-Frankcanas.md):** Frontend Lead. React 19, componentes de Leaflet sin fugas de memoria y Dashboard comercial.
7. **[`agents/agent-Maru-rc.md`](file:///home/manulz/Documentos/Proyectos/proyecto-comercial360/agents/agent-Maru-rc.md):** QA Specialist. Pruebas unitarias en Vitest con *In-Memory Test Doubles*, SonarQube Cloud y cobertura en HUs críticas.
8. **[`agents/agent-valentina.md`](file:///home/manulz/Documentos/Proyectos/proyecto-comercial360/agents/agent-valentina.md):** Security Specialist. Better Auth, Guards RBAC (`DIRECTOR` vs `ASESOR`), prevención de IDOR y pantalla de login.

---

## 5. Compuertas Universales de Entrada para Herramientas de IA

Para asegurar que cualquier asistente o modelo de IA lea y obedezca estas directivas sin importar qué software use el desarrollador, se crearon las compuertas oficiales:
* **[`AGENTS.md`](file:///home/manulz/Documentos/Proyectos/proyecto-comercial360/AGENTS.md):** Estándar raíz universal (Paso 0 obligatorio: identificar al desarrollador, cargar su agente y auditar Clean Code).
* **[`.cursorrules`](file:///home/manulz/Documentos/Proyectos/proyecto-comercial360/.cursorrules):** Inyectado automáticamente por Cursor IDE en cada consulta.
* **[`.windsurfrules`](file:///home/manulz/Documentos/Proyectos/proyecto-comercial360/.windsurfrules):** Inyectado automáticamente por Windsurf Cascade.
* **[`CLAUDE.md`](file:///home/manulz/Documentos/Proyectos/proyecto-comercial360/CLAUDE.md):** Ingestado automáticamente por Claude Code CLI.
* **[`.clinerules`](file:///home/manulz/Documentos/Proyectos/proyecto-comercial360/.clinerules):** Ingestado por extensiones Cline / Roo-Code en VS Code.
* **[`.github/copilot-instructions.md`](file:///home/manulz/Documentos/Proyectos/proyecto-comercial360/.github/copilot-instructions.md):** Ingestado por GitHub Copilot Chat.

---

## 6. Skill Oficial de Clean Code & Principios SOLID

Se implementó la skill oficial en `~/.gemini/config/skills/clean-code/SKILL.md` desglosando los 5 principios SOLID adaptados a NestJS y TypeScript:
* **S (SRP):** Casos de uso atómicos con un único método público `execute(dto)`. Prohibidos "Servicios Dios".
* **O (OCP):** Nuevas reglas de negocio mediante Strategy o polimorfismo, sin cadenas interminables de `if-else`.
* **L (LSP):** Mocks en memoria (`InMemory*Repository`) sustituibles sin alterar contratos.
* **I (ISP):** Interfaces pequeñas y segregadas (`*Reader`) en `src/domain-contracts`.
* **D (DIP):** Inversión de control estricta: los casos de uso dependen de Puertos abstractos inyectados por Token, nunca de TypeORM ni AWS directamente.

---

## 7. Blindaje Mecánico en Git (`scripts/check-clean-architecture.sh`)

Para que la regla no dependa de la buena fe humana ni de que la IA no alucine, se creó el script de auditoría mecánica integrado en `.husky/pre-commit`:
- **Regla 1 (Dominio Puro):** Bloquea commits si algún archivo en `domain/` importa `@nestjs/*`, `typeorm`, `express`, `@aws-sdk/` o librerías HTTP.
- **Regla 2 (Barril Central):** Bloquea commits si un módulo importa carpetas internas de otro módulo en vez de usar `src/domain-contracts`.
- **Regla 3 (Separación en Controllers):** Bloquea controladores que inyecten repositorios directamente en lugar de invocar casos de uso.
- **Ejecución manual:** Disponible vía `pnpm run audit:architecture`.

---

## 8. Gobernanza de Pull Requests ([`.github/CODEOWNERS`](file:///home/manulz/Documentos/Proyectos/proyecto-comercial360/.github/CODEOWNERS))

Se configuró el archivo `CODEOWNERS` para proteger las ramas principales:
* Cualquier cambio en `src/domain-contracts/`, Docker Compose, Dockerfiles, Nginx o Jenkinsfile **requiere obligatoriamente la firma/aprobación de Manuel Vásquez (`@manulz`) o Alejandro (`@alejandroesbr`)**.
* GitHub bloquea el botón de Merge hasta que dicha revisión sea completada.

---

## 9. Suite Completa de 7 Workflows en GitHub Actions

En `.github/workflows/` se configuró una batería de integración continua de nivel empresarial:

1. **[`ci-pr-validation.yml`](file:///home/manulz/Documentos/Proyectos/proyecto-comercial360/.github/workflows/ci-pr-validation.yml):** Ejecuta la auditoría de Clean Architecture & SOLID, typecheck con `tsc --noEmit`, pruebas unitarias con Vitest y validación de sintaxis de Docker Compose en cada PR.
2. **[`sonarqube.yml`](file:///home/manulz/Documentos/Proyectos/proyecto-comercial360/.github/workflows/sonarqube.yml):** Análisis de deuda técnica y calidad en SonarQube Cloud adaptado a `app/backend/`.
3. **[`codeql.yml`](file:///home/manulz/Documentos/Proyectos/proyecto-comercial360/.github/workflows/codeql.yml):** Análisis SAST oficial de GitHub buscando fallos de seguridad (SQLi, IDOR, XSS).
4. **[`gitleaks.yml`](file:///home/manulz/Documentos/Proyectos/proyecto-comercial360/.github/workflows/gitleaks.yml):** Escáner de seguridad para prevenir la filtración accidental de llaves de AWS, Aurora o tokens de autenticación.
5. **[`dependency-review.yml`](file:///home/manulz/Documentos/Proyectos/proyecto-comercial360/.github/workflows/dependency-review.yml):** Auditoría automática contra la base de datos de vulnerabilidades de GitHub (Advisory DB) en dependencias de npm/pnpm.
6. **[`pr-size-labeler.yml`](file:///home/manulz/Documentos/Proyectos/proyecto-comercial360/.github/workflows/pr-size-labeler.yml):** Etiquetado automático por tamaño del PR (`size/XS` a `size/XL`).
7. **[`pr-labeler.yml`](file:///home/manulz/Documentos/Proyectos/proyecto-comercial360/.github/workflows/pr-labeler.yml):** Etiquetado automático por dominio funcional (`area:clientes`, `area:rutas`, `area:infraestructura`, etc.) mediante [`.github/labeler.yml`](file:///home/manulz/Documentos/Proyectos/proyecto-comercial360/.github/labeler.yml).
8. **[`release-drafter.yml`](file:///home/manulz/Documentos/Proyectos/proyecto-comercial360/.github/workflows/release-drafter.yml):** Generador de notas de versión y Changelog automático categorizado mediante [`.github/release-drafter.yml`](file:///home/manulz/Documentos/Proyectos/proyecto-comercial360/.github/release-drafter.yml).
