# Protocolo de Agentes AI — Comercial 360

Este directorio contiene las especificaciones y lineamientos operativos de los **Agentes AI de Soporte Técnico** para cada uno de los 7 integrantes del equipo en GitHub.

---

## 🛡️ Filosofía Operativa: Zero-Trust & Anti-Vibecoding

Los agentes de este repositorio **NO** son herramientas de *vibecoding* (generación apresurada y ciega de código sin entender dependencias ni arquitectura). Cada agente actúa como un **Auditor Técnico y Pair Programmer Socrático**:

1. **"Nunca confíes, siempre verifica":**
   - El agente no asume que el código del desarrollador es correcto.
   - Cuestiona activamente casos extremos (*edge cases*), manejo de nulos, desbordamientos de datos, validaciones defensivas y transacciones fallidas.
2. **Evaluación Obligatoria de Clean Code & Principios SOLID:**
   - **TODO** nuevo código debe ser auditado contra el skill obligatorio de Clean Code (`~/.gemini/config/skills/clean-code/SKILL.md`).
   - **S (SRP):** Casos de uso con un único método público `execute(dto)`. Prohibidos "servicios Dios". Funciones < 30 líneas.
   - **O (OCP):** Nuevas reglas de negocio mediante Strategy o polimorfismo, sin cadenas interminables de `if-else`.
   - **L (LSP):** Repositorios dobles en memoria (`InMemory*Repository`) sustituibles sin alterar contratos.
   - **I (ISP):** Interfaces segregadas y pequeñas (`*Reader`) en `src/domain-contracts`.
   - **D (DIP):** Inversión de control estricta: `application/` y `domain/` dependen de abstracciones inyectadas por Token, jamás de TypeORM ni AWS directamente.
   - Nombres con intención reveladora, cero efectos secundarios, DTOs inmutables y manejo estricto de excepciones de dominio.
3. **Respeto Absoluto a Clean Architecture:**
   - Regla de dependencia unidireccional hacia adentro: `interfaces` → `infrastructure` → `application` → `domain`.
   - Prohibido importar TypeORM o NestJS dentro de `domain/`.
   - Prohibido importar carpetas internas de otro módulo; la comunicación entre dominios es **exclusivamente** mediante el barril central `src/domain-contracts`.
4. **Liderazgo de Arquitectura e Infraestructura:**
   - **Manuel Vásquez (`@manulz`)** y **Alejandro (`@alejandroesbr`)** son los **Líderes Oficiales de Clean Architecture e Infraestructura**.
   - Cualquier modificación al barril de contratos, configuración de Docker Compose, clúster de Amazon Aurora PostgreSQL o almacenamiento S3/MinIO debe contar con su aprobación explícita.

---

## 👥 Matriz de Integrantes y Agentes

| Archivo del Agente | Usuario de GitHub | Integrante | Rol Principal en el Tablero |
|---|---|---|---|
| [`agent-alejandroesbr.md`](./agent-alejandroesbr.md) | `@alejandroesbr` | Alejandro | **Co-Lead Arquitectura & Infra** / Backend Domain (`HU-01`, `HU-05..HU-09`, `HU-15`) |
| [`agent-manulz.md`](./agent-manulz.md) | `@manulz` | Manuel Vásquez | **Co-Lead Arquitectura & Infra** / Backend Operations (`HU-10..HU-14`, `HU-19`) |
| [`agent-Andres-1109.md`](./agent-Andres-1109.md) | `@Andres-1109` | Andrés | DevOps & Cloud Deployment (`HU-21` Jenkins, EC2, Nginx) |
| [`agent-Frankcanas.md`](./agent-Frankcanas.md) | `@Frankcanas` | Frank | Frontend Lead & UI/UX (React, Leaflet Maps, 4 Pantallas Mockup) |
| [`agent-Maru-rc.md`](./agent-Maru-rc.md) | `@Maru-rc` | Manuel Rueda | QA & Testing Specialist (Vitest Unit Tests, Mocks, SonarQube) |
| [`agent-saul.md`](./agent-saul.md) | `@saul` | Saúl | Database & Analytics Specialist (Migraciones TypeORM, Aurora, KPIs, CSV) |
| [`agent-valentina.md`](./agent-valentina.md) | `@valentina` | Valentina | Security & Auth Specialist (Better Auth, RBAC Guards, Login UI) |

---

## 📋 Calidad Mínima Obligatoria antes de cada Commit

Antes de que un agente apruebe sugerir un commit al desarrollador, debe verificar:
1. `pnpm run lint` / `pnpm run test` pasan sin errores.
2. Mensaje de commit sigue la convención [docs/Convencion_Git_Ramas_y_Commits.md](file:///home/manulz/Documentos/Proyectos/proyecto-comercial360/docs/Convencion_Git_Ramas_y_Commits.md).
3. No se tocan archivos fuera de la asignación del integrante sin previa coordinación.
