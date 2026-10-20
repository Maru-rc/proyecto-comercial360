# Convención de Git: Ramas y Commits — Comercial 360

> **Guía Oficial de Control de Versiones para el Equipo (7 Integrantes)**  
> Estándares adoptados:  
> 1. **Estrategia de Ramas:** Trunk-Based / Git Flow Simplificado por Historia de Usuario (`HU-XX`).  
> 2. **Convención de Commits:** Conventional Commits 1.0.0 (NestJS Standard), validado automáticamente mediante **Husky** y **Commitlint**.

---

## 1. Estrategia de Ramas (Branching Model)

El flujo de trabajo se basa en **dos ramas principales protegidas** y **ramas cortas de funcionalidad/corrección** asignadas por Historia de Usuario (`HU-XX`):

```text
main (Producción en AWS EC2 - Despliegues automatizados con Jenkins)
  ▲
  │ (Pull Request al final de cada ciclo / sprint)
develop (Rama común de integración - Todo el equipo integra aquí)
  ▲
  ├── feature/HU-06-create-client
  ├── feature/HU-09-better-auth-session
  ├── feature/HU-12-route-planning
  ├── feature/HU-17-register-visit
  ├── fix/HU-04-s3-cors-policy
  └── chore/monorepo-husky-setup
```

### 1.1. Ramas Principales

* **`main`:**
  - Código desplegado y probado en la nube (**AWS EC2 / Jenkins**).
  - **Nadie hace `git push` directo a `main`**. Solo recibe código mediante Pull Request (PR) aprobado desde `develop`.
* **`develop`:**
  - Rama común de integración. Cada integrante saca su rama desde `develop` y hace PR hacia `develop`.

---

### 1.2. Nomenclatura Oficial de Ramas

$$\text{Formato: } \mathbf{<tipo>/<historia-o-alcance>-<descripcion-corta>}$$

| Prefijo | Propósito | Formato / Ejemplo |
| :--- | :--- | :--- |
| **`feature/`** | Desarrollo de una Historia de Usuario (`HU-01` a `HU-24`). | `feature/HU-06-create-client`<br>`feature/HU-14-assign-routes`<br>`feature/HU-17-register-visit`<br>`feature/HU-22-dashboard-kpis` |
| **`fix/`** | Corrección de un fallo o error en código existente. | `fix/HU-04-s3-cors-policy`<br>`fix/HU-07-nominatim-rate-limit` |
| **`chore/`** | Configuración de tooling, monorepo, dependencias o scripts. | `chore/initial-architecture`<br>`chore/setup-husky-commitlint`<br>`chore/typeorm-seed-config` |
| **`docs/`** | Cambios exclusivamente en documentación o diagramas. | `docs/clean-architecture-guide`<br>`docs/git-commit-convention` |
| **`ci/`** | Cambios en el `Jenkinsfile`, Dockerfile o Docker Compose. | `ci/jenkins-pipeline-config` |
| **`refactor/`** | Reestructuración de código sin alterar la funcionalidad. | `refactor/clients-mapper-cleanup` |

---

## 2. Convención de Commits (Conventional Commits 1.0.0 — NestJS)

Todos los mensajes de confirmación de Git son validados automáticamente por **Husky** y **Commitlint** antes de crearse.

### 2.1. Estructura

```text
<type>(<scope>): <description>
```

* **`type`:** tipo de cambio realizado (obligatorio).
* **`scope`:** módulo o componente afectado (opcional).
* **`description`:** descripción breve y clara del cambio en imperativo y en inglés.

---

### 2.2. Tipos de Commit Permitidos (`<type>`)

| Tipo | Descripción |
| :--- | :--- |
| **`feat`** | Nueva funcionalidad. |
| **`fix`** | Corrección de errores. |
| **`docs`** | Cambios en la documentación. |
| **`style`** | Cambios de formato sin alterar la lógica (espacios, comas, etc.). |
| **`refactor`** | Reestructuración del código sin cambiar su comportamiento. |
| **`test`** | Creación o modificación de pruebas. |
| **`perf`** | Mejoras de rendimiento. |
| **`build`** | Cambios en dependencias o herramientas de construcción. |
| **`ci`** | Cambios en pipelines de integración continua (Jenkins, Docker, GitHub Actions). |
| **`chore`** | Tareas generales de mantenimiento. |
| **`revert`** | Reversión de un commit anterior. |

---

### 2.3. Scopes Recomendados (`<scope>`)

El `scope` es opcional, pero cuando se use debe identificar claramente el módulo o historia afectada:
- **Por Módulo:** `auth`, `clients`, `routes`, `visits`, `commercial`, `dashboard`, `reports`, `storage`, `core`, `deps`.
- **Por Historia:** `HU-01` a `HU-24` (ej. `HU-06`, `HU-17`, `HU-22`).

---

### 2.4. Buenas Prácticas

* Escribir los mensajes en **inglés**.
* Utilizar **verbos en imperativo**, como *add*, *fix*, *update* o *remove*.
* Mantener las descripciones breves y específicas.
* **No terminar la descripción con un punto.**
* Evitar mensajes genéricos como *update code*, *fix bug* o *changes*.
* Realizar commits pequeños, enfocados en un único cambio lógico.

---

### 2.5. Cambios Incompatibles (Breaking Changes)

Para indicar un cambio que rompe la compatibilidad, utilizar `!` después del tipo o incluir `BREAKING CHANGE:` en el pie del commit:

```bash
feat(api)!: change response structure
```

---

## 3. Ejemplos de Referencia

```bash
feat(auth): implement JWT authentication
fix(requests): validate status transitions
docs(api): update Swagger documentation
refactor(users): extract user validation logic
test(requests): add service unit tests
build(deps): update NestJS dependencies
ci(jenkins): configure test workflow
chore: update gitignore
feat(clients): add create client use case with unit of work
feat(HU-06): add create client endpoint and swagger docs
feat(visits): implement transactional register visit use case
fix(storage): add s3 bucket cors policy configuration
```

---

## 4. Flujo Diario del Desarrollador (Paso a Paso)

```bash
# 1. Asegurarse de tener la última versión de develop
git checkout develop
git pull origin develop

# 2. Crear tu rama de trabajo según la historia asignada
git checkout -b feature/HU-06-create-client

# 3. Desarrollar tu Caso de Uso, entidades, puertos y pruebas
# ... código ...

# 4. Agregar cambios y commitear con el estándar
git add .
git commit -m "feat(clients): implement create client use case"

# 5. Subir tu rama a GitHub
git push -u origin feature/HU-06-create-client

# 6. Abrir Pull Request (PR) en GitHub:
# Base: develop  <--  Compare: feature/HU-06-create-client
# Solicitar revisión al Líder Técnico.
```

