## 📌 Description

<!-- Provide a brief summary of the changes introduced in this Pull Request and the problem they solve. -->

## 🔗 Related Issue / Story (HU)

- **User Story:** `HU-XX` <!-- e.g., HU-05, HU-12, HU-16 -->
- **Issue / Ticket:** # <!-- e.g., #123 -->

---

## 👤 Module Ownership & Developer

- **Author:** <!-- @alejandroesbr | @manulz | @saul | @Andres-1109 | @Frankcanas | @Maru-rc | @valentina -->
- **Primary Module(s) Affected:** <!-- auth | clients | routes | visits | commercial | dashboard | storage | core -->

---

## 🛠️ Changes Made

- 
- 
- 

---

## 🌐 Public Contracts & Endpoints (Clean Architecture)

- **Endpoints Exposed / Modified:**
  - `METHOD /api/...`
- **Domain Contracts Added / Consumed (`src/domain-contracts`):**
  - <!-- e.g., Consumed ClientReader from src/domain-contracts, added VisitReader -->

---

## 📐 Clean Architecture & Uncle Bob Checklist

Please verify and mark all applicable boxes:

- [ ] **Clean Architecture Boundaries:**
  - `domain/` has ZERO imports of `@nestjs/*`, `typeorm`, or HTTP libraries.
  - Inter-module communication is done **exclusively** through the central barrel `src/domain-contracts`.
- [ ] **Single Responsibility Principle (SRP):**
  - Use cases expose only a single public method `execute(dto)`.
  - Functions are concise (< 30 lines) and well-scoped.
- [ ] **Dependency Inversion Principle (DIP):**
  - Use cases depend strictly on abstract ports/tokens injected via `@Inject(TOKEN)`, never concrete TypeORM repositories.
- [ ] **Liskov Substitution & Interface Segregation (LSP / ISP):**
  - In-memory repository doubles (`InMemory*Repository`) fulfill identical invariants as TypeORM implementations.
  - Consumer interfaces are minimal and segregated.
- [ ] **Clean Code:**
  - No vague variable names (`data`, `temp`, `res`, `obj`).
  - No database migrations created outside `@saul`'s ownership.

---

## 🧪 Testing & Verification

- [ ] **Clean Architecture Auditor:** `./scripts/check-clean-architecture.sh --all` passed with 0 errors.
- [ ] **Unit Tests:** `pnpm --filter backend test` passed (Vitest).
- [ ] **Build:** `pnpm --filter backend run build` exited with code 0.
- [ ] **Manual Verification:** Tested against local/dockerized PostgreSQL & API.

---

## 📝 Notes & Breaking Changes

<!-- Document any breaking changes, environment variable requirements, database migration notices, or coordination needed with other teammates. -->
