# Plan de arquitectura: Plataforma de Gestión Comercial

## 1. Decisión arquitectónica

Para la plataforma de gestión comercial utilizaremos **Clean Architecture con un monolito modular en NestJS**, organizado por dominios de negocio y con un barril central para facilitar la comunicación entre ellos.

La estructura seguirá el patrón que compartiste para `requests`, adaptándolo a los dominios comerciales.

Principios de diseño:

- **Un módulo por dominio de negocio**, no por tabla de la base de datos.
- **Domain:** entidades, objetos de valor y reglas de negocio.
- **Application:** casos de uso y puertos de entrada y salida.
- **Infrastructure:** implementaciones de persistencia e integraciones externas.
- **Interfaces:** controladores HTTP y DTO de entrada.
- **Barril central:** punto de acceso a los contratos públicos entre dominios.
- **NestJS:** composición de módulos e inyección de dependencias.
- **TypeORM:** persistencia en PostgreSQL mediante repositorios y migraciones.
- **Better Auth:** autenticación de usuarios.
- **Amazon S3:** almacenamiento de documentos y archivos.
- **Jenkins:** automatización de pruebas y despliegues.

La regla principal es que las dependencias de código apunten hacia el dominio y la aplicación, nunca desde estos hacia TypeORM, NestJS o servicios externos.

## 2. Dominios del sistema

Propongo los siguientes módulos:

| Módulo | Responsabilidad |
|---|---|
| `clients` | Clientes, contactos y clasificación comercial |
| `advisors` | Asesores y su estado operativo |
| `territories` | Zonas geográficas y clasificación territorial |
| `portfolios` | Portafolio comercial y asignación a clientes |
| `routes` | Planeación de rutas y orden de visitas |
| `visits` | Agenda, registro y resultados de visitas |
| `follow-ups` | Seguimientos y próximas actividades |
| `quotations` | Cotizaciones y sus detalles |
| `orders` | Pedidos generados a partir de cotizaciones |
| `history` | Historial y bitácora comercial |
| `reports` | KPI, consultas de indicadores y exportaciones CSV |
| `documents` | Metadatos, almacenamiento y acceso a documentos |
| `identity` | Integración con Better Auth y autorización de operaciones |

No crearía módulos independientes para `tipo_cliente`, `potencial`, `estado_cliente` y `resultado_visita` únicamente porque existen como tablas. Inicialmente serían conceptos administrados por sus respectivos dominios.

Tampoco separaría `quotations` y `orders` en un único módulo comercial: tienen reglas, estados y responsabilidades diferentes, aunque exista una relación entre ambos.

## 3. Estructura completa del backend

Esta es la estructura objetivo del proyecto. Mantiene tu patrón de carpetas y permite que cada equipo trabaje en dominios concretos.

```text
backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   │
│   ├── modules/
│   │   ├── clients/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── client.entity.ts
│   │   │   │   │   └── client-contact.entity.ts
│   │   │   │   ├── value-objects/
│   │   │   │   └── repositories/
│   │   │   │       └── client-repository.port.ts
│   │   │   ├── application/
│   │   │   │   ├── create-client/
│   │   │   │   │   └── create-client.use-case.ts
│   │   │   │   ├── update-client/
│   │   │   │   │   └── update-client.use-case.ts
│   │   │   │   ├── get-client/
│   │   │   │   │   └── get-client.use-case.ts
│   │   │   │   ├── list-clients/
│   │   │   │   │   └── list-clients.use-case.ts
│   │   │   │   ├── deactivate-client/
│   │   │   │   │   └── deactivate-client.use-case.ts
│   │   │   │   └── ports/
│   │   │   │       └── client-reader.port.ts
│   │   │   ├── infrastructure/
│   │   │   │   └── persistence/
│   │   │   │       ├── entities/
│   │   │   │       │   ├── client.orm-entity.ts
│   │   │   │       │   └── client-contact.orm-entity.ts
│   │   │   │       ├── mappers/
│   │   │   │       └── typeorm-client.repository.ts
│   │   │   ├── interfaces/
│   │   │   │   └── http/
│   │   │   │       ├── clients.controller.ts
│   │   │   │       └── dto/
│   │   │   ├── clients.module.ts
│   │   │   └── public-api.ts
│   │   │
│   │   ├── advisors/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   └── advisor.entity.ts
│   │   │   │   ├── value-objects/
│   │   │   │   └── repositories/
│   │   │   ├── application/
│   │   │   │   ├── create-advisor/
│   │   │   │   ├── update-advisor/
│   │   │   │   ├── change-advisor-status/
│   │   │   │   └── ports/
│   │   │   ├── infrastructure/
│   │   │   │   └── persistence/
│   │   │   │       ├── entities/
│   │   │   │       ├── mappers/
│   │   │   │       └── typeorm-advisor.repository.ts
│   │   │   ├── interfaces/
│   │   │   │   └── http/
│   │   │   │       ├── advisors.controller.ts
│   │   │   │       └── dto/
│   │   │   ├── advisors.module.ts
│   │   │   └── public-api.ts
│   │   │
│   │   ├── territories/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   └── territory.entity.ts
│   │   │   │   └── repositories/
│   │   │   ├── application/
│   │   │   │   ├── create-territory/
│   │   │   │   ├── update-territory/
│   │   │   │   └── ports/
│   │   │   ├── infrastructure/
│   │   │   │   └── persistence/
│   │   │   ├── interfaces/
│   │   │   │   └── http/
│   │   │   │       ├── territories.controller.ts
│   │   │   │       └── dto/
│   │   │   ├── territories.module.ts
│   │   │   └── public-api.ts
│   │   │
│   │   ├── portfolios/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── portfolio.entity.ts
│   │   │   │   │   └── client-portfolio.entity.ts
│   │   │   │   └── repositories/
│   │   │   ├── application/
│   │   │   │   ├── create-portfolio/
│   │   │   │   ├── assign-portfolio-to-client/
│   │   │   │   ├── remove-portfolio-from-client/
│   │   │   │   └── ports/
│   │   │   ├── infrastructure/
│   │   │   │   └── persistence/
│   │   │   ├── interfaces/
│   │   │   │   └── http/
│   │   │   │       ├── portfolios.controller.ts
│   │   │   │       └── dto/
│   │   │   ├── portfolios.module.ts
│   │   │   └── public-api.ts
│   │   │
│   │   ├── routes/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── route.entity.ts
│   │   │   │   │   └── route-client.entity.ts
│   │   │   │   ├── value-objects/
│   │   │   │   └── repositories/
│   │   │   ├── application/
│   │   │   │   ├── create-route/
│   │   │   │   ├── update-route/
│   │   │   │   ├── assign-advisor/
│   │   │   │   ├── add-client-to-route/
│   │   │   │   ├── remove-client-from-route/
│   │   │   │   ├── reorder-route-clients/
│   │   │   │   └── ports/
│   │   │   ├── infrastructure/
│   │   │   │   └── persistence/
│   │   │   │       ├── entities/
│   │   │   │       ├── mappers/
│   │   │   │       └── typeorm-route.repository.ts
│   │   │   ├── interfaces/
│   │   │   │   └── http/
│   │   │   │       ├── routes.controller.ts
│   │   │   │       └── dto/
│   │   │   ├── routes.module.ts
│   │   │   └── public-api.ts
│   │   │
│   │   ├── visits/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── visit.entity.ts
│   │   │   │   │   ├── visit-result.entity.ts
│   │   │   │   │   └── visit-outcome.entity.ts
│   │   │   │   ├── value-objects/
│   │   │   │   └── repositories/
│   │   │   ├── application/
│   │   │   │   ├── schedule-visit/
│   │   │   │   ├── reschedule-visit/
│   │   │   │   ├── record-visit/
│   │   │   │   ├── record-visit-outcome/
│   │   │   │   ├── list-agenda/
│   │   │   │   └── ports/
│   │   │   ├── infrastructure/
│   │   │   │   └── persistence/
│   │   │   │       ├── entities/
│   │   │   │       ├── mappers/
│   │   │   │       └── typeorm-visit.repository.ts
│   │   │   ├── interfaces/
│   │   │   │   └── http/
│   │   │   │       ├── visits.controller.ts
│   │   │   │       └── dto/
│   │   │   ├── visits.module.ts
│   │   │   └── public-api.ts
│   │   │
│   │   ├── follow-ups/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   └── follow-up.entity.ts
│   │   │   │   └── repositories/
│   │   │   ├── application/
│   │   │   │   ├── create-follow-up/
│   │   │   │   ├── complete-follow-up/
│   │   │   │   ├── reschedule-follow-up/
│   │   │   │   ├── list-pending-follow-ups/
│   │   │   │   └── ports/
│   │   │   ├── infrastructure/
│   │   │   │   └── persistence/
│   │   │   ├── interfaces/
│   │   │   │   └── http/
│   │   │   │       ├── follow-ups.controller.ts
│   │   │   │       └── dto/
│   │   │   ├── follow-ups.module.ts
│   │   │   └── public-api.ts
│   │   │
│   │   ├── quotations/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── quotation.entity.ts
│   │   │   │   │   └── quotation-item.entity.ts
│   │   │   │   ├── value-objects/
│   │   │   │   └── repositories/
│   │   │   ├── application/
│   │   │   │   ├── create-quotation/
│   │   │   │   ├── update-quotation/
│   │   │   │   ├── calculate-quotation/
│   │   │   │   ├── change-quotation-status/
│   │   │   │   ├── get-quotation/
│   │   │   │   └── ports/
│   │   │   ├── infrastructure/
│   │   │   │   └── persistence/
│   │   │   │       ├── entities/
│   │   │   │       ├── mappers/
│   │   │   │       └── typeorm-quotation.repository.ts
│   │   │   ├── interfaces/
│   │   │   │   └── http/
│   │   │   │       ├── quotations.controller.ts
│   │   │   │       └── dto/
│   │   │   ├── quotations.module.ts
│   │   │   └── public-api.ts
│   │   │
│   │   ├── orders/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   └── order.entity.ts
│   │   │   │   ├── value-objects/
│   │   │   │   └── repositories/
│   │   │   ├── application/
│   │   │   │   ├── create-order/
│   │   │   │   ├── create-order-from-quotation/
│   │   │   │   ├── change-order-status/
│   │   │   │   ├── get-order/
│   │   │   │   └── ports/
│   │   │   ├── infrastructure/
│   │   │   │   └── persistence/
│   │   │   ├── interfaces/
│   │   │   │   └── http/
│   │   │   │       ├── orders.controller.ts
│   │   │   │       └── dto/
│   │   │   ├── orders.module.ts
│   │   │   └── public-api.ts
│   │   │
│   │   ├── history/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   └── history-entry.entity.ts
│   │   │   │   └── repositories/
│   │   │   ├── application/
│   │   │   │   ├── record-history-entry/
│   │   │   │   ├── get-client-history/
│   │   │   │   └── ports/
│   │   │   ├── infrastructure/
│   │   │   │   └── persistence/
│   │   │   ├── interfaces/
│   │   │   │   └── http/
│   │   │   │       ├── history.controller.ts
│   │   │   │       └── dto/
│   │   │   ├── history.module.ts
│   │   │   └── public-api.ts
│   │   │
│   │   ├── reports/
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   │   ├── get-dashboard-kpis/
│   │   │   │   ├── get-visit-statistics/
│   │   │   │   ├── get-sales-statistics/
│   │   │   │   ├── get-advisor-performance/
│   │   │   │   ├── export-clients-csv/
│   │   │   │   └── ports/
│   │   │   ├── infrastructure/
│   │   │   │   └── queries/
│   │   │   ├── interfaces/
│   │   │   │   └── http/
│   │   │   │       ├── reports.controller.ts
│   │   │   │       └── dto/
│   │   │   ├── reports.module.ts
│   │   │   └── public-api.ts
│   │   │
│   │   ├── documents/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   └── document.entity.ts
│   │   │   │   ├── value-objects/
│   │   │   │   └── repositories/
│   │   │   ├── application/
│   │   │   │   ├── upload-document/
│   │   │   │   ├── get-document/
│   │   │   │   ├── delete-document/
│   │   │   │   └── ports/
│   │   │   ├── infrastructure/
│   │   │   │   ├── persistence/
│   │   │   │   └── storage/
│   │   │   │       └── s3-document-storage.ts
│   │   │   ├── interfaces/
│   │   │   │   └── http/
│   │   │   │       ├── documents.controller.ts
│   │   │   │       └── dto/
│   │   │   ├── documents.module.ts
│   │   │   └── public-api.ts
│   │   │
│   │   └── identity/
│   │       ├── domain/
│   │       ├── application/
│   │       │   └── ports/
│   │       ├── infrastructure/
│   │       │   └── better-auth/
│   │       ├── interfaces/
│   │       │   └── http/
│   │       ├── identity.module.ts
│   │       └── public-api.ts
│   │
│   ├── domain-contracts/
│   │   └── index.ts
│   │
│   ├── infrastructure/
│   │   ├── database/
│   │   │   ├── database.module.ts
│   │   │   ├── data-source.ts
│   │   │   └── migrations/
│   │   ├── storage/
│   │   │   └── s3/
│   │   ├── authentication/
│   │   └── logging/
│   │
│   └── shared/
│       ├── domain/
│       │   └── value-objects/
│       └── application/
│           └── pagination/
│
├── test/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.example
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── Jenkinsfile
├── nest-cli.json
├── package.json
├── tsconfig.json
└── README.md
```

**Nota sobre la estructura:** los directorios `domain/` pueden mantenerse pequeños cuando el dominio no tenga reglas complejas. No es necesario crear clases o archivos vacíos para completar el árbol.

También puedes usar nombres en español o inglés, pero conviene mantener una única convención. Recomiendo inglés para carpetas, clases, archivos, nombres de casos de uso y comentarios.

## 4. El barril central para comunicar los dominios

Esta es la parte que quieres implementar específicamente.

El objetivo es que los dominios consuman los contratos públicos de otros dominios desde un único punto de entrada, sin importar sus implementaciones internas.

### 4.1. ¿Cómo funcionará?

```text
                    ┌──────────────────────────┐
                    │     domain-contracts     │
                    │                          │
                    │  ClientReader             │
                    │  AdvisorReader            │
                    │  VisitReader              │
                    │  QuotationReader          │
                    └────────────┬─────────────┘
                                 │
                 ┌───────────────┼───────────────┐
                 │               │               │
                 ▼               ▼               ▼
              Routes           Visits          Orders
                 │               │               │
                 └───────────────┼───────────────┘
                                 ▼
                       Contratos públicos
                       implementados por
                       cada dominio
```

El barril central no debe contener la lógica de negocio. Su función es exportar contratos.

### 4.2. Contratos públicos de los dominios

Cada dominio tendrá un archivo `public-api.ts` para exponer exclusivamente lo que otros módulos pueden consumir.

Por ejemplo, `src/modules/clients/public-api.ts`:

```typescript
export type { ClientReader } from './application/ports/client-reader.port';
export { CLIENT_READER } from './application/ports/client-reader.token';
```

El contrato, `src/modules/clients/application/ports/client-reader.port.ts`:

```typescript
export interface ClientReader {
  existsById(clientId: string): Promise<boolean>;
}
```

Como las interfaces de TypeScript desaparecen durante la compilación, necesitamos un token de inyección.

Archivo `src/modules/clients/application/ports/client-reader.token.ts`:

```typescript
export const CLIENT_READER = Symbol('CLIENT_READER');
```

### 4.3. Barril central

Archivo `src/domain-contracts/index.ts`:

```typescript
export {
  CLIENT_READER,
} from '../modules/clients/public-api';

export type {
  ClientReader,
} from '../modules/clients/public-api';
```

A medida que los demás dominios necesiten exponer contratos, se agregarán sus exportaciones.

Por ejemplo, también podrías exponer `AdvisorReader` para consultar asesores y `QuotationReader` para consultar cotizaciones.

**Regla:** solo se exportan los contratos que necesitan otros dominios. No se exportan controladores, entidades ORM ni repositorios concretos.

### 4.4. Implementar el contrato

Archivo `src/modules/clients/infrastructure/persistence/typeorm-client.repository.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type { ClientReader } from '../../application/ports/client-reader.port';
import { ClientOrmEntity } from './entities/client.orm-entity';

@Injectable()
export class TypeOrmClientRepository implements ClientReader {
  constructor(
    @InjectRepository(ClientOrmEntity)
    private readonly repository: Repository<ClientOrmEntity>,
  ) {}

  async existsById(clientId: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { id: clientId },
    });

    return count > 0;
  }
}
```

Este ejemplo asume que la entidad ORM tiene una propiedad `id`. Deberá ajustarse al nombre definitivo de la clave primaria.

### 4.5. Registrar el proveedor en NestJS

Archivo `src/modules/clients/clients.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CLIENT_READER } from './application/ports/client-reader.token';
import { ClientOrmEntity } from './infrastructure/persistence/entities/client.orm-entity';
import { TypeOrmClientRepository } from './infrastructure/persistence/typeorm-client.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClientOrmEntity]),
  ],
  providers: [
    TypeOrmClientRepository,
    {
      provide: CLIENT_READER,
      useExisting: TypeOrmClientRepository,
    },
  ],
  exports: [CLIENT_READER],
})
export class ClientsModule {}
```

`useExisting` permite utilizar la instancia de `TypeOrmClientRepository` como implementación del token, sin registrar una segunda instancia.

### 4.6. Consumir el contrato desde otro dominio

Supongamos que `routes` necesita verificar que un cliente existe antes de incorporarlo a una ruta.

Archivo `src/modules/routes/application/add-client-to-route/add-client-to-route.use-case.ts`:

```typescript
import { Inject, Injectable } from '@nestjs/common';

import {
  CLIENT_READER,
  type ClientReader,
} from '../../../../domain-contracts';

@Injectable()
export class AddClientToRouteUseCase {
  constructor(
    @Inject(CLIENT_READER)
    private readonly clientReader: ClientReader,
  ) {}

  async execute(clientId: string): Promise<void> {
    const exists = await this.clientReader.existsById(clientId);

    if (!exists) {
      throw new Error('Client not found');
    }

    // Continue with the route assignment.
  }
}
```

El caso de uso conoce el contrato, pero no necesita saber que la implementación utiliza TypeORM.

Para que el ejemplo sea una implementación completa, falta incorporar la persistencia de la ruta y su cliente asociado, así como un error de aplicación específico para el cliente inexistente.

### 4.7. Configurar la comunicación entre módulos

En `routes.module.ts`, se importa el módulo que proporciona el contrato:

```typescript
import { Module } from '@nestjs/common';

import { ClientsModule } from '../clients/clients.module';
import { AddClientToRouteUseCase } from './application/add-client-to-route/add-client-to-route.use-case';
import { RoutesController } from './interfaces/http/routes.controller';

@Module({
  imports: [ClientsModule],
  controllers: [RoutesController],
  providers: [AddClientToRouteUseCase],
})
export class RoutesModule {}
```

NestJS resuelve la dependencia porque `ClientsModule` exporta `CLIENT_READER`.

El barril simplifica las importaciones de TypeScript, mientras que `imports` y `exports` de NestJS controlan la disponibilidad de los proveedores.

### 4.8. Reglas para evitar problemas de arquitectura

1. Un dominio no importa archivos desde `infrastructure/` de otro dominio.
2. Un dominio no consulta directamente las entidades ORM de otro.
3. El barril no exporta todas las clases automáticamente.
4. Los contratos deben representar necesidades reales de comunicación.
5. Los módulos no deben importarse circularmente.
6. `shared/` no debe convertirse en un lugar para trasladar lógica de negocio.
7. Los casos de uso deben utilizar los puertos que necesitan, no depender de implementaciones concretas.

Para evitar dependencias circulares, el barril debe actuar como punto de exposición de contratos, no como un módulo de negocio que orquesta toda la aplicación.

---

## 5. Responsabilidades de cada capa

Todos los módulos seguirán tu estructura, con las siguientes responsabilidades.

| Capa | Contenido | Puede depender de |
|---|---|---|
| `domain/` | Entidades, objetos de valor, reglas y contratos del dominio | Elementos del dominio |
| `application/` | Casos de uso y puertos | Dominio y contratos de entrada/salida |
| `infrastructure/` | TypeORM, S3 y otras implementaciones | Application, Domain y servicios externos |
| `interfaces/` | Controladores HTTP y DTO | Casos de uso y mecanismos de presentación |
| `*.module.ts` | Configuración e inyección de dependencias | Componentes que ensambla |
| `public-api.ts` | Contratos públicos exportados por el dominio | Declaraciones públicas de ese dominio |

Los contratos de repositorios pueden ubicarse en `domain/repositories/` cuando representan una abstracción del dominio, o en `application/ports/` cuando responden a las necesidades de un caso de uso. Lo importante es mantener una convención coherente.

Para tu proyecto, utilizaría `application/ports/` como ubicación predeterminada para los contratos de persistencia y comunicación entre dominios, salvo que una abstracción pertenezca claramente al propio dominio.

## 6. Distribución del modelo de datos por dominio

Las tablas propuestas se distribuirían así:

| Dominio | Tablas principales | Observaciones |
|---|---|---|
| `clients` | `cliente`, `contacto_cliente`, `tipo_cliente`, `potencial`, `estado_cliente` | Propietario de los datos y clasificación del cliente |
| `advisors` | `asesor` | Datos operativos del asesor |
| `territories` | `zona` | Clasificación territorial |
| `portfolios` | `portafolio`, `cliente_portafolio` | Catálogo y asignaciones |
| `routes` | `ruta`, `ruta_cliente` | Recorridos y orden de clientes |
| `visits` | `visita`, `resultado_visita`, `visita_resultado` | Agenda, registro y resultados |
| `follow-ups` | `seguimiento` | Actividades pendientes y próximas acciones |
| `quotations` | `cotizacion`, `cotizacion_detalle` | Cotizaciones y valores comerciales |
| `orders` | `pedido` | Pedidos generados a partir de cotizaciones |
| `history` | `historial_cliente` | Bitácora de cambios y acciones comerciales |
| `documents` | Nueva tabla `documento` | Metadatos y referencias de archivos en S3 |
| `identity` | Tablas administradas por Better Auth | Usuarios, sesiones y demás estructuras que requiera su configuración |

Las tablas de clientes, rutas, visitas y cotizaciones pueden tener relaciones mediante claves foráneas en PostgreSQL. La separación en dominios no exige crear bases de datos independientes.

### Consideraciones importantes

**1. Identidad y asesor**

No asumiría que cada asesor es una cuenta de usuario. Si un asesor inicia sesión, debe existir una relación explícita entre su registro comercial y la identidad autenticada.

**2. Documentos**

La tabla `documento` debería incluir, como mínimo:

- Identificador.
- Clave del objeto en S3.
- Nombre original.
- Tipo de contenido.
- Tamaño.
- Fecha de carga.
- Usuario que realizó la carga.
- Tipo e identificador del registro asociado.

Si se utiliza una asociación polimórfica para vincular documentos a cotizaciones y otros registros, debe definirse cómo se garantizará la integridad referencial.

**3. Productos**

El modelo original guarda el nombre del producto directamente en `cotizacion_detalle`. Si el portafolio representa un catálogo de productos, convendría evaluar una entidad `producto` y relacionarla con el detalle de la cotización. Si representa únicamente líneas comerciales o servicios, esa decisión puede ser diferente.

**4. Resultados de visitas**

Hay que determinar si una visita admite varios resultados. La relación propuesta permite múltiples registros de resultado por visita, pero si cada visita tiene un único resultado final, el modelo podría simplificarse.

**5. Historial**

Los cambios comerciales relevantes deben registrarse desde los casos de uso que los producen. No conviene depender exclusivamente de que el frontend envíe información para construir la bitácora.

---

## 7. Comunicación entre dominios en los casos de uso

El barril no sustituye las reglas de negocio. Cada interacción debe tener una responsabilidad clara.

| Operación | Dominio que inicia | Dominio consultado o afectado |
|---|---|---|
| Agregar un cliente a una ruta | `routes` | `clients` |
| Programar una visita | `visits` | `clients`, `advisors` y, cuando corresponda, `routes` |
| Crear un seguimiento desde una visita | `follow-ups` | `visits` |
| Crear una cotización para un cliente | `quotations` | `clients` |
| Generar un pedido desde una cotización | `orders` | `quotations` |
| Registrar una actividad comercial | Dominio que ejecuta la acción | `history` |
| Consultar indicadores | `reports` | Datos comerciales de los dominios correspondientes |
| Asociar un documento a una cotización | `documents` | `quotations`, para verificar el registro y sus permisos |

Estas interacciones no requieren que cada módulo conozca las clases internas de los demás.

Por ejemplo, al generar un pedido desde una cotización, el caso de uso debe verificar que la cotización exista y cumpla las condiciones comerciales necesarias. También debe prevenir la creación duplicada de pedidos cuando el negocio no lo permita.

Para operaciones que involucren varios dominios, las reglas transaccionales deben definirse explícitamente. Una transacción de PostgreSQL puede abarcar varias tablas de la misma base de datos, pero no resuelve automáticamente los efectos externos, como cargar un archivo a S3.

## 8. API REST propuesta

La API debe versionarse desde el principio, por ejemplo, bajo `/api/v1`.

| Recurso | Rutas principales |
|---|---|
| Clientes | `GET /clients`, `POST /clients`, `GET /clients/:id`, `PATCH /clients/:id` |
| Contactos | `POST /clients/:id/contacts`, `PATCH /clients/:id/contacts/:contactId` |
| Asesores | `GET /advisors`, `POST /advisors`, `PATCH /advisors/:id` |
| Territorios | `GET /territories`, `POST /territories` |
| Portafolios | `GET /portfolios`, `POST /portfolios` |
| Rutas | `GET /routes`, `POST /routes`, `PATCH /routes/:id` |
| Clientes de una ruta | `POST /routes/:id/clients`, `PATCH /routes/:id/clients/order` |
| Visitas | `GET /visits`, `POST /visits`, `PATCH /visits/:id` |
| Agenda | `GET /visits/agenda` |
| Seguimientos | `GET /follow-ups`, `POST /follow-ups`, `PATCH /follow-ups/:id` |
| Cotizaciones | `GET /quotations`, `POST /quotations`, `GET /quotations/:id` |
| Pedidos | `GET /orders`, `POST /orders`, `GET /orders/:id` |
| Documentos | `POST /documents`, `GET /documents/:id`, `DELETE /documents/:id` |
| Historial | `GET /clients/:id/history` |
| Indicadores | `GET /reports/dashboard`, `GET /reports/visits`, `GET /reports/sales` |
| Exportaciones | `GET /reports/clients.csv`, `GET /reports/visits.csv` |

Estos endpoints son una propuesta inicial. Los filtros, permisos y operaciones definitivas deben ajustarse a las reglas de negocio.

---

## 9. Autenticación, autorización y seguridad

Better Auth debe encargarse de la autenticación. Los casos de uso no deberían depender directamente de su implementación.

La integración debe resolver la identidad autenticada y proporcionar al backend el contexto necesario para autorizar las operaciones.

Roles iniciales sugeridos:

- **Administrador:** gestiona la configuración general y tiene acceso administrativo.
- **Supervisor:** consulta y administra la operación de los asesores bajo su responsabilidad.
- **Asesor:** gestiona sus clientes, rutas, visitas, seguimientos y operaciones autorizadas.

La autorización debe contemplar tanto los permisos por rol como el alcance de los registros. Un asesor no debería poder consultar o modificar automáticamente las visitas de cualquier otro asesor.

También deben implementarse:

- Validación de DTO de entrada.
- Manejo centralizado de errores.
- Configuración segura de CORS.
- Protección de credenciales mediante variables de entorno.
- Control de acceso a documentos almacenados en S3.
- Validación del contenido y tamaño de archivos.
- Paginación y filtros para listados.
- Pruebas de permisos para operaciones sensibles.

---

## 10. Infraestructura y despliegue en AWS

La arquitectura de despliegue debe cumplir los requisitos obligatorios de la prueba.

```text
                       Usuarios
                           │
                           ▼
                    ┌─────────────┐
                    │    Nginx    │
                    │   EC2       │
                    └──────┬──────┘
                           │
                   ┌───────┴────────┐
                   │                │
                   ▼                ▼
             ┌──────────┐     ┌──────────┐
             │ Frontend │     │ NestJS   │
             │          │     │ Backend  │
             └──────────┘     └────┬─────┘
                                   │
                     ┌─────────────┴─────────────┐
                     │                           │
                     ▼                           ▼
              ┌─────────────┐             ┌───────────┐
              │ Aurora DB   │             │ S3        │
              │ PostgreSQL  │             │ Documents │
              │ (RDS)       │             │           │
              └─────────────┘             └───────────┘

                 Jenkins en la misma EC2
                 que ejecuta la aplicación
                           │
                           ▼
                         GitHub
```

Este diagrama es lógico: Jenkins también necesita conectarse al repositorio para obtener el código y ejecutar el pipeline. En una implementación real, hay que configurar esa conexión y los permisos necesarios.

### Responsabilidades

**EC2**

- Ejecutar Nginx.
- Ejecutar el backend NestJS.
- Servir el frontend o alojar el servidor que lo entregue.
- Ejecutar Jenkins en la misma instancia que la aplicación, como exige la actividad.

**Amazon Aurora PostgreSQL (RDS)**

- Almacenar los datos comerciales con alta disponibilidad y compatibilidad PostgreSQL.
- Ejecutar migraciones controladas.
- Mantener credenciales fuera del repositorio.
- Permitir conexiones desde la aplicación mediante reglas de red restringidas.

**S3**

- Almacenar documentos y archivos multimedia.
- Conservar los archivos fuera del repositorio.
- Permitir acceso controlado mediante el backend o URLs prefirmadas.
- Almacenar las referencias de los objetos en PostgreSQL.

**Jenkins**

- Obtener el código desde GitHub.
- Ejecutar pruebas.
- Construir el frontend y el backend.
- Desplegar la nueva versión.
- Permitir demostrar una actualización real durante la sustentación.

### Consideración de seguridad

No expondría PostgreSQL públicamente si no es necesario. RDS debería aceptar conexiones desde la infraestructura autorizada. Las credenciales de AWS deben gestionarse mediante un mecanismo seguro, como roles IAM cuando la configuración lo permita, en lugar de incorporarlas al repositorio.

---

## 11. Distribución del trabajo entre los cuatro equipos

Hay 30 participantes, incluidos los cuatro líderes. La distribución propuesta es:

| Equipo | Integrantes | Dominios principales |
|---|---:|---|
| Equipo 1 | 1 líder + 6 desarrolladores | Clientes, asesores, territorios y portafolios |
| Equipo 2 | 1 líder + 6 desarrolladores | Rutas, visitas y seguimientos |
| Equipo 3 | 1 líder + 7 desarrolladores | Cotizaciones, pedidos e historial |
| Equipo 4 | 1 líder + 7 desarrolladores | Reportes, frontend transversal, documentos e infraestructura |

Esta distribución es una propuesta inicial. El frontend y la infraestructura no deberían convertirse en responsabilidades exclusivas del cuarto equipo: todos los equipos deben desarrollar y probar las interfaces necesarias para sus funcionalidades.

### Responsabilidades compartidas

Antes de desarrollar funcionalidades en paralelo, todos los equipos deben acordar:

1. Estructura de carpetas y convenciones de nombres.
2. Modelo de datos y migraciones.
3. Contratos públicos entre dominios.
4. Convenciones de API y manejo de errores.
5. Estrategia de autenticación y autorización.
6. Pruebas unitarias, de integración y de extremo a extremo.
7. Estrategia de Git y revisión de código.
8. Pipeline de Jenkins y estrategia de despliegue.

Cada equipo debe ser responsable de sus módulos, pruebas y documentación.

El líder de cada equipo debe revisar los contratos que publique su equipo antes de que otros módulos comiencen a depender de ellos.

## 12. Plan de implementación por fases

Recomiendo organizar el trabajo en ocho fases.

| Fase | Actividades | Resultado esperado |
|---|---|---|
| 1. Diseño | Modelo ER, arquitectura, contratos y reglas comerciales | Diseño técnico aprobado |
| 2. Base del proyecto | NestJS, TypeORM, PostgreSQL, módulos y configuración | Backend ejecutable |
| 3. Contratos | Barriles públicos, puertos y tokens de inyección | Comunicación entre dominios funcional |
| 4. Funcionalidades principales | Clientes, asesores, rutas, visitas y seguimientos | Flujo operativo comercial |
| 5. Ventas | Cotizaciones, pedidos, documentos e historial | Flujo comercial de ventas |
| 6. Interfaz y reportes | Frontend, agenda, mapa y KPI | Aplicación funcional de extremo a extremo |
| 7. Calidad e infraestructura | Pruebas, seguridad, S3, RDS, EC2 y Jenkins | Aplicación desplegada y validada |
| 8. Sustentación | Pruebas finales, documentación y demostración | Solución lista para evaluación |

**Prioridad:** definir primero los contratos públicos y el modelo de datos. Si los equipos desarrollan módulos en paralelo sin acordar esas interfaces, las integraciones pueden convertirse en el principal problema del proyecto.

## 13. Convenciones de desarrollo

Para mantener coherencia entre los cuatro equipos, establecería estas reglas.

### Nombres de archivos

```text
create-client.use-case.ts
client-repository.port.ts
typeorm-client.repository.ts
client.orm-entity.ts
clients.controller.ts
create-client.dto.ts
clients.module.ts
public-api.ts
```

### Reglas de implementación

- Una clase por archivo cuando corresponda.
- Un caso de uso por operación de negocio.
- Interfaces para definir contratos.
- Inyección de dependencias mediante tokens explícitos cuando se consuman interfaces.
- Repositorios concretos dentro de `infrastructure/`.
- Controladores HTTP limitados a recibir solicitudes y presentar respuestas.
- DTO de entrada independientes de las entidades del dominio.
- Migraciones versionadas en Git.
- Pruebas para los casos de uso y las integraciones críticas.
- Ninguna credencial o secreto en el repositorio.

### Flujo de Git

Utilizaría ramas de funcionalidad y solicitudes de integración revisadas por otro desarrollador.

Ejemplos:

```text
feat/clients-crud
feat/routes-planning
feat/visits-agenda
feat/quotations-management
feat/reports-dashboard
fix/quotation-total-calculation
```

Las convenciones definitivas de ramas y commits deben documentarse en el repositorio para que todos los equipos utilicen el mismo estándar.

## 14. Criterios de aceptación del proyecto

La plataforma no debería considerarse terminada hasta cumplir, como mínimo, estos puntos:

- [ ] Todos los dominios están organizados según la estructura acordada.
- [ ] Los módulos se comunican mediante contratos públicos definidos.
- [ ] El barril central permite importar los contratos compartidos.
- [ ] NestJS resuelve correctamente los proveedores y sus dependencias.
- [ ] La persistencia funciona sobre PostgreSQL en Amazon Aurora (RDS).
- [ ] Las migraciones permiten construir el esquema de la base de datos.
- [ ] Better Auth está integrado y las operaciones aplican los permisos definidos.
- [ ] Se pueden administrar clientes, asesores, rutas y visitas.
- [ ] Los seguimientos y las cotizaciones funcionan correctamente.
- [ ] Los pedidos respetan las reglas comerciales acordadas.
- [ ] Los documentos se almacenan en S3 y sus referencias quedan en PostgreSQL.
- [ ] El dashboard presenta indicadores calculados a partir de los datos.
- [ ] El mapa y la agenda muestran las visitas correspondientes.
- [ ] Los reportes se pueden exportar a CSV.
- [ ] Las pruebas unitarias, de integración y E2E cubren los flujos críticos.
- [ ] Jenkins puede obtener el código de GitHub y desplegar una nueva versión.
- [ ] La aplicación está disponible para su demostración en AWS.
- [ ] Existe documentación de arquitectura, instalación, variables de entorno y despliegue.

## 15. Decisión final

La estructura definitiva se basa en:

**Clean Architecture + módulos por dominio + contratos públicos + barril central + NestJS + TypeORM + PostgreSQL.**

Cada dominio conserva su estructura:

```text
modules/
└── domain-name/
    ├── domain/
    │   ├── entities/
    │   ├── value-objects/
    │   └── repositories/
    │
    ├── application/
    │   ├── use-case-name/
    │   │   └── use-case-name.use-case.ts
    │   └── ports/
    │
    ├── infrastructure/
    │   └── persistence/
    │       ├── entities/
    │       ├── mappers/
    │       └── typeorm-domain.repository.ts
    │
    ├── interfaces/
    │   └── http/
    │       ├── domain.controller.ts
    │       └── dto/
    │
    ├── domain-name.module.ts
    └── public-api.ts
```

El barril central expone los contratos que los dominios necesitan compartir. Los módulos de NestJS configuran los proveedores y las dependencias reales.

**La decisión más importante es mantener los límites de cada dominio incluso cuando todos compartan la misma base de datos.** Esto permite que los equipos trabajen en paralelo, reduce el acoplamiento y facilita mantener la aplicación sin introducir la complejidad de los microservicios.