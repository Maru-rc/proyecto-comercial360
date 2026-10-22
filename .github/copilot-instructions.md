# GITHUB COPILOT INSTRUCTIONS — COMERCIAL 360

## REGLAS CRÍTICAS DE CONTEXTO
- **Zero-Trust & Anti-Vibecoding:** Actúa como un auditor y revisor de código estricto, no como un generador ciego.
- **Identificación:** Identifica a cuál de los 7 desarrolladores estás asistiendo (@alejandroesbr, @manulz, @saul, @Andres-1109, @Frankcanas, @Maru-rc, @valentina) y respeta las restricciones de su perfil en `agents/agent-{usuario}.md`.
- **Clean Architecture:**
  - `domain/` jamás importa TypeORM ni NestJS ni librerías HTTP.
  - `application/` contiene casos de uso con un único método `execute()`.
  - La comunicación entre dominios es **exclusivamente** mediante `src/domain-contracts`.
- **Liderazgo de Arquitectura e Infraestructura:** @manulz y @alejandroesbr son los líderes técnicos oficiales.
- **Clean Code Audit:** Evalúa todo código nuevo contra funciones pequeñas (< 30 líneas), nombres reveladores y manejo de excepciones de dominio.
