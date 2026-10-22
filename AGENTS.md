# 🚨 INSTRUCCIÓN CRÍTICA Y OBLIGATORIA PARA CUALQUIER ASISTENTE DE IA 🚨

> **APLICABLE A:** Cursor, Windsurf, Claude Code, GitHub Copilot, Gemini CLI / Antigravity, Roo-Code, Cline, ChatGPT o cualquier LLM que opere en este repositorio.

---

## 🛑 PASO 0 OBLIGATORIO: IDENTIFICACIÓN Y ROL DEL DESARROLLADOR

Antes de generar código, analizar una tarea o responder a cualquier solicitud:

1. **Identifica a qué integrante del equipo estás asistiendo:**
   - Revisa `git config user.email` o el autor del commit actual.
   - Si no está claro en el entorno, **PREGUNTA EXPLÍCITAMENTE AL USUARIO:**  
     *"¿A quién del equipo estoy asistiendo hoy? (@alejandroesbr, @manulz, @saul, @Andres-1109, @Frankcanas, @Maru-rc o @valentina)?"*
2. **Carga y obedece estrictamente el perfil del integrante:**
   - Lee y aplica las directivas del archivo correspondiente en `agents/`:
     - `@alejandroesbr` → `agents/agent-alejandroesbr.md`
     - `@manulz` → `agents/agent-manulz.md`
     - `@saul` → `agents/agent-saul.md`
     - `@Andres-1109` → `agents/agent-Andres-1109.md`
     - `@Frankcanas` → `agents/agent-Frankcanas.md`
     - `@Maru-rc` → `agents/agent-Maru-rc.md`
     - `@valentina` → `agents/agent-valentina.md`
   - Consulta las reglas generales en `agents/README.md`.

---

## ⚔️ PRINCIPIOS DE OPERACIÓN INNEGOCIABLES

### 1. Cero "Vibecoding" (Zero-Trust)
- **TÚ NO ERES EL PROGRAMADOR CIEGO.** Eres un **Pair Programmer y Auditor Técnico riguroso**.
- No escribas bloques gigantes de código sin diseño previo.
- Cuestiona activamente los supuestos del desarrollador (validación de nulos, desbordamientos, tipos en TypeScript, manejo de errores HTTP 400/403/404).

### 2. Liderazgo de Clean Architecture e Infraestructura
- **Manuel Vásquez (`@manulz`) y Alejandro (`@alejandroesbr`) son los Líderes Oficiales de Clean Architecture e Infraestructura.**
- Cualquier cambio en contratos públicos (`src/domain-contracts`), Docker Compose, base de datos (Amazon Aurora) o almacenamiento (S3/MinIO) debe estar estrictamente alineado con sus directivas.

### 3. Evaluación Obligatoria de Clean Code & SOLID (Uncle Bob)
Todo código nuevo o modificado DEBE ser evaluado contra los estándares de Uncle Bob:
- **S — Single Responsibility (SRP):** Casos de uso con un único método público `execute(dto)`. Prohibidos "servicios Dios" con decenas de métodos. Funciones < 30 líneas.
- **O — Open/Closed (OCP):** Nuevas reglas de negocio mediante patrones Strategy o polimorfismo, sin cadenas interminables de `if-else`.
- **L — Liskov Substitution (LSP):** Repositorios dobles en memoria (`InMemory*Repository`) deben cumplir exactamente los mismos contratos e invariantes que los de TypeORM.
- **I — Interface Segregation (ISP):** Puertos pequeños y segregados (`IClienteReader`, `IVisitaReader`) en `src/domain-contracts`. Ningún módulo depende de métodos que no usa.
- **D — Dependency Inversion (DIP):** Los casos de uso dependen de abstracciones (Puertos inyectados por Token), jamás de clases concretas de TypeORM ni librerías externas.
- **Nombres con significado:** Prohibidas variables vagas (`data`, `info`, `temp`, `obj`, `res`).
- **Clean Architecture estricta:**
  - `domain/` NUNCA importa `@nestjs/*`, `typeorm` ni HTTP.
  - `application/` define los casos de uso (`execute(dto)`) y puertos.
  - `infrastructure/` implementa los repositorios y adaptadores (S3, TypeORM).
  - `interfaces/` controladores HTTP y DTOs con `class-validator`.
  - La comunicación entre módulos se hace **EXCLUSIVAMENTE** a través del barril central `src/domain-contracts`.

---

## 🚫 LÍMITES DE PROPIEDAD DE MÓDULOS

- Cada desarrollador tiene módulos asignados en su respectivo `agent-*.md`.
- **NUNCA** sugieras ni modifiques código de un módulo perteneciente a otro compañero. Si se requiere interactuar con otro dominio, utiliza los contratos públicos del barril central (`src/domain-contracts`).
- **Migraciones:** Solo `@saul` está autorizado a crear o modificar migraciones de base de datos.
