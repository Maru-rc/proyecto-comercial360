# Fundamentos e Implementación de Clean Architecture — Comercial 360

> **Documento Teórico-Práctico con Citas y Bibliografía Canónica**  
> Basado en la obra de referencia de Robert C. Martin (*Uncle Bob*):  
> **Martin, R. C. (2017). *Clean Architecture: A Craftsman's Guide to Software Structure and Design*. Prentice Hall.**  
> Aplicado al backend de NestJS con TypeScript, TypeORM, PostgreSQL y AWS en el proyecto **Comercial 360**.

---

## 1. ¿Qué es Clean Architecture?

**Clean Architecture** (Arquitectura Limpia) es un modelo arquitectónico formulado por Robert C. Martin ("Uncle Bob") en 2012 y consolidado en su libro homónimo de 2017. Nace como una síntesis de las ideas arquitectónicas más sólidas de las últimas décadas:
- **Separation of Concerns** (Dijkstra, 1974)
- **Data, Context, and Interaction (DCI)** (Reenskaug & Coplien)
- **Boundary-Control-Entity (BCE)** (Jacobson, 1992)
- **Hexagonal Architecture / Ports & Adapters** (Cockburn, 2005)
- **Onion Architecture** (Palermo, 2008)

El objetivo central de Clean Architecture es producir sistemas que presenten las siguientes 5 características fundamentales (*Martin, 2017, Cap. 22*):

1. **Independencia de Frameworks:** La arquitectura no depende de la existencia de una biblioteca de software con esteroides. Esto permite usar los frameworks como herramientas, en lugar de forzar al sistema a acomodarse a sus limitaciones.
2. **Testabilidad:** Las reglas de negocio pueden probarse sin la interfaz de usuario, sin la base de datos, sin el servidor web y sin ningún elemento externo.
3. **Independencia de la UI:** La interfaz de usuario puede cambiar fácilmente (de consola a web, de web a móvil) sin alterar las reglas de negocio.
4. **Independencia de la Base de Datos:** Se puede cambiar PostgreSQL por MongoDB, Oracle o archivos planos porque las reglas de negocio no están atadas al esquema de la base de datos.
5. **Independencia de cualquier Agencia Externa:** Las reglas de negocio simplemente no saben nada sobre las interfaces hacia el mundo exterior.

> *"The center of your application is not the database. Nor is it one or more of the frameworks you may be using. The center of your application is the use cases of your application."*  
> — **Robert C. Martin (2017, Capítulo 22, p. 203)**

---

## 2. Las 4 Capas Concéntricas y la Regla de Dependencia

Clean Architecture organiza el software en círculos concéntricos de abstracción decreciente:

```
+-------------------------------------------------------+
|  4. Frameworks & Drivers (Web, DB, Devices, AWS)      |
|    +-----------------------------------------------+  |
|    |  3. Interface Adapters (Controllers, Gateways)|  |
|    |    +-------------------------------------+    |  |
|    |    |  2. Use Cases (Application Rules)   |    |  |
|    |    |    +---------------------------+    |    |  |
|    |    |    |  1. Entities (Enterprise) |    |    |  |
|    |    |    +---------------------------+    |    |  |
|    |    +-------------------------------------+    |  |
|    +-----------------------------------------------+  |
+-------------------------------------------------------+
              Dependencies point inward ONLY ------>
```

### 2.1. Capa 1: Entities (Enterprise Business Rules) — El Núcleo

Las **Entidades** encapsulan las reglas críticas de negocio más generales y de más alto nivel de la empresa. Una entidad puede ser un objeto con métodos o un conjunto de estructuras de datos y funciones (*Martin, 2017, Cap. 19 y 22*).

* **En Comercial 360:** Son clases puras de TypeScript (`Cliente`, `Ruta`, `Visita`, `Cotizacion`, `Pedido`) y sus *Value Objects* (`NIT`, `EstadoVisita`, `Coordenadas`).
* **Regla estricta:** No contienen decoradores de TypeORM (`@Entity()`, `@Column()`), ni decoradores de NestJS (`@Injectable()`), ni librerías de validación HTTP. Si la base de datos cambia o desaparece, estas clases compilan y ejecutan sus reglas intactas.

> *"Entities encapsulate Enterprise wide business rules. An entity can be an object with methods, or it can be a set of data structures and functions... They are the least likely to change when something external changes."*  
> — **Robert C. Martin (2017, Capítulo 22, p. 191)**

### 2.2. Capa 2: Use Cases (Application Business Rules) — La Orquestación

Los **Casos de Uso** encapsulan las reglas de negocio específicas de la aplicación. Orquestan el flujo de datos hacia y desde las entidades, e instruyen a esas entidades a usar sus reglas de negocio a nivel de empresa para cumplir con los objetivos del caso de uso (*Martin, 2017, Cap. 20 y 22*).

* **En Comercial 360:** Cada historia de usuario es un Caso de Uso (`CrearClienteUseCase`, `AsignarRutaUseCase`, `RegistrarVisitaUseCase`, `ObtenerResumenDashboardUseCase`).
* **Interactors:** La clase concreta que implementa el caso de uso es el *Interactor*.
* **Puertos de Frontera (Boundary Interfaces):** El caso de uso define las interfaces que necesita para leer/guardar datos (`IClienteRepository`) o comunicarse con servicios externos (`IStorageService`, `ICSVService`). Estas interfaces pertenecen a esta capa, no a la infraestructura.

> *"These use cases orchestrate the flow of data to and from the entities, and direct those entities to use their enterprise wide business rules to achieve the goals of the use case."*  
> — **Robert C. Martin (2017, Capítulo 22, p. 192)**

### 2.3. Capa 3: Interface Adapters (Adaptadores de Interfaz) — Los Traductores

Esta capa es un conjunto de adaptadores que convierten los datos desde el formato más conveniente para los casos de uso y entidades, hacia el formato más conveniente para agentes externos como la base de datos o la Web (*Martin, 2017, Cap. 22*).

Aquí residen:
- **Controllers:** Reciben la petición HTTP, leen los parámetros y llaman al Caso de Uso.
- **Gateways (Implementación de Repositorios):** Implementan las interfaces de acceso a datos definidas en los casos de uso (`TypeOrmClienteRepository implements IClienteRepository`). Convierten entidades de dominio a entidades del ORM y viceversa usando **Mappers**.
- **Presenters:** Toman los datos crudos que devuelve el Caso de Uso y los formatean en una estructura lista para la vista (**View Model**).

> *"The software in this layer is a set of adapters that convert data from the format most convenient for the use cases and entities, to the format most convenient for some external agency such as the DB or the Web."*  
> — **Robert C. Martin (2017, Capítulo 22, p. 193)**

### 2.4. Capa 4: Frameworks & Drivers — Los Detalles Externos

Es la capa más externa, compuesta por herramientas como el motor de base de datos (PostgreSQL), el servidor web/framework (NestJS, Express), la interfaz de usuario, y librerías externas (AWS SDK S3, BetterAuth).

* En Clean Architecture, **la base de datos y la web son detalles técnicos**.
* Esta capa solo contiene código de conexión y configuración que "enchufa" los frameworks a los adaptadores de la capa 3.

> *"The outermost layer is generally composed of frameworks and tools such as the Database, the Web Framework, etc... We keep these things on the outside where they can do little harm."*  
> — **Robert C. Martin (2017, Capítulo 22, p. 194)**

---

### 2.5. La Regla de Dependencia (The Dependency Rule)

Es la ley inviolable de Clean Architecture:

$$\text{Regla de Dependencia: Las dependencias en el código fuente solo pueden apuntar hacia adentro.}$$

> *"Source code dependencies must point only inward, toward higher-level policies... Nothing in an inner circle can know anything at all about something in an outer circle. In particular, the name of something declared in an outer circle must not be mentioned by the code in an inner circle."*  
> — **Robert C. Martin (2017, Capítulo 22, p. 190)**

Esto significa que:
- La capa `Domain` no puede importar nada de `Application`, `Interface Adapters` ni `Frameworks`.
- La capa `Application` solo puede importar de `Domain`.
- Los datos que cruzan los límites de las capas deben ser estructuras de datos simples (*DTOs*, datos primitivos o *Value Objects*), nunca entidades de base de datos (`@Entity()`) o peticiones HTTP (`Request`, `Response`).

---

## 3. ¿Para qué sirve Clean Architecture en Comercial 360?

En este proyecto, Clean Architecture no es un ejercicio teórico, sino la solución directa a **4 problemas operativos reales**:

1. **Trabajo en paralelo de 7 desarrolladores sin conflictos de Git:**
   - Si se usa la arquitectura tradicional de NestJS de 3 capas (`controllers/`, `services/`, `entities/`), todos los desarrolladores terminan editando los mismos 3 archivos gigantes (`VisitasService.ts`, `ClientesService.ts`), provocando *merge conflicts* destructivos a días de la entrega.
   - En Clean Architecture, cada funcionalidad es un Caso de Uso independiente en su propio archivo (`registrar-visita.use-case.ts`). Los desarrolladores pueden codificar y hacer PRs en paralelo sin tocar el código de los demás.

2. **Pruebas unitarias instantáneas en Jenkins sin base de datos (`HU-03`):**
   - Correr pruebas que levantan PostgreSQL en un pipeline de Jenkins consume mucha memoria RAM en la EC2, arriesgando caídas por falta de memoria (*OOM Killer*).
   - En Clean Architecture, como los Casos de Uso solo dependen de interfaces (`IClienteRepository`), las pruebas unitarias se ejecutan con repositorios simulados en memoria (*Test Doubles*). 50 pruebas corren en menos de **300 milisegundos**.

3. **Inmunidad a cambios en librerías externas:**
   - Si `betterAuth` actualiza su API o si el cliente de AWS S3 cambia de versión (v2 a v3), **cero líneas de código de negocio cambian**. Solo se modifica el adaptador correspondiente en la capa de infraestructura.

4. **Calificación máxima en sustentación técnica:**
   - Los evaluadores exigen explícitamente Clean Architecture y evaluarán si el equipo realmente entiende la inversión de dependencias o si simplemente crearon carpetas vacías con entidades acopladas a TypeORM.

---

## 4. ¿Por qué se van a integrar diferentes piezas? (La necesidad del sistema)

Un sistema de gestión comercial moderno como **Comercial 360** no es un simple CRUD de formularios; integra **5 naturalezas tecnológicas distintas**:

```
[ Navegador Web / React SPA ]
             |
             v (HTTP / JSON)
     [ Nginx Proxy ]
             |
             v (HTTP / REST)
+-------------------------------------------------------+
|  NestJS Core (Clean Architecture)                     |
|                                                       |
|  - Auth Engine: BetterAuth (Sesiones / Roles)         |
|  - ORM Engine: TypeORM (Relacional ACID)              |
|  - Object Storage: AWS SDK S3 (Presigned URLs)        |
|  - Geo Engine: OpenStreetMap / Nominatim (Coords)     |
|  - Export Engine: CSV Streaming (UTF-8 BOM)           |
+-------------------------------------------------------+
        |                 |                 |
        v                 v                 v
[ RDS PostgreSQL ]   [ AWS S3 Bucket ]  [ Nominatim API ]
```

1. **Gestión de Sesiones y Control de Accesos:** `betterAuth` provee validación de cookies, hashing de contraseñas y control por roles (`DIRECTOR` vs `ASESOR`).
2. **Persistencia Transaccional ACID:** PostgreSQL (en Amazon RDS) maneja la concurrencia y atomicidad para registrar visitas, cotizaciones, pedidos y bitácoras en bloques indivisibles.
3. **Almacenamiento de Archivos Pesados (Multimedia / PDFs):** Amazon S3 almacena las evidencias de visitas y los archivos de importación de clientes sin sobrecargar la base de datos relacional.
4. **Geolocalización:** OpenStreetMap (con Nominatim) convierte direcciones físicas en coordenadas cartográficas (`latitud`, `longitud`) para pintar rutas y paradas sobre Leaflet.
5. **Automatización CI/CD:** Jenkins orquesta la compilación, pruebas y despliegue dentro del contenedor Docker en la instancia EC2.

---

## 5. ¿Por qué se van a combinar bajo Clean Architecture? (El "Por Qué")

Si conectáramos todas estas piezas directamente a los servicios de NestJS (el típico servicio donde se mezclan llamadas SQL de TypeORM, llamadas HTTP a Nominatim y llamadas a la SDK de AWS), el sistema sufriría de **alto acoplamiento y fragilidad extrema**:

* Si Nominatim se cae o tarda más de 1 segundo, la creación del cliente fallaría por completo.
* Si TypeORM cambia su API en una actualización, tendríamos que reescribir la lógica de cálculo de rutas y visitas.
* Sería imposible escribir pruebas automáticas sin tener corriendo la base de datos de AWS y credenciales activas de S3.

Clean Architecture resuelve esto aplicando **el Principio de Inversión de Dependencias (DIP)**:

> *"High-level modules should not depend on low-level modules. Both should depend on abstractions. Abstractions should not depend on details. Details should depend on abstractions."*  
> — **Robert C. Martin (2002 / 2017, Capítulo 11 - DIP, p. 87)**

Al combinar todas estas piezas bajo Clean Architecture:
- Las reglas de negocio (ej. *"Una ruta debe tener al menos una parada para poder asignarse a un asesor"*, *"El número de cotización no se puede repetir"*) residen en el centro, aisladas y protegidas.
- AWS S3, PostgreSQL, Nominatim y BetterAuth quedan relegados al perímetro como **detalles de implementación intercambiables**.

---

## 6. ¿Cómo se van a integrar? (Mecanismos Técnicos de Clean Architecture)

Para integrar cada componente sin violar la Regla de Dependencia, se utilizan **3 patrones canónicos explicados en el libro de Robert C. Martin**:

### 6.1. Patrón Inversión de Dependencias (DIP) y Puertos de Salida

Para que un Caso de Uso guarde datos o suba archivos sin conocer a TypeORM ni a AWS:

1. **En la Capa de Aplicación (`application/ports/`):** El Caso de Uso define una interfaz abstracta que especifica qué necesita hacer:
   ```typescript
   // application/ports/storage.port.ts (Capa 2 - Use Cases)
   export const STORAGE_SERVICE = Symbol('STORAGE_SERVICE');

   export interface IStorageService {
     generarUrlSubida(s3Key: string, tipoMime: string): Promise<string>;
     generarUrlDescarga(s3Key: string): Promise<string>;
   }
   ```

2. **En la Capa de Infraestructura (`infrastructure/adapters/`):** Una clase implementa la interfaz utilizando la librería externa concreta:
   ```typescript
   // infrastructure/adapters/s3-storage.adapter.ts (Capa 3 - Interface Adapters)
   import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
   import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
   import { IStorageService } from '../../application/ports/storage.port';

   export class S3StorageAdapter implements IStorageService {
     constructor(private readonly s3Client: S3Client, private readonly bucketName: string) {}

     async generarUrlSubida(s3Key: string, tipoMime: string): Promise<string> {
       const command = new PutObjectCommand({
         Bucket: this.bucketName,
         Key: s3Key,
         ContentType: tipoMime,
       });
       return await getSignedUrl(this.s3Client, command, { expiresIn: 300 });
     }

     async generarUrlDescarga(s3Key: string): Promise<string> {
       const command = new GetObjectCommand({ Bucket: this.bucketName, Key: s3Key });
       return await getSignedUrl(this.s3Client, command, { expiresIn: 300 });
     }
   }
   ```

3. **En el Módulo de NestJS (Inyección de Dependencias):** Se asocia el token de la interfaz con la clase concreta:
   ```typescript
   // visitas.module.ts (Capa 4 - Frameworks & Drivers)
   @Module({
     providers: [
       RegistrarVisitaUseCase,
       { provide: STORAGE_SERVICE, useClass: S3StorageAdapter },
       { provide: VISITA_REPOSITORY, useClass: TypeOrmVisitaRepository },
     ],
   })
   export class VisitasModule {}
   ```

---

### 6.2. Patrón Humble Object y Mappers (Entidades de Dominio vs. Entidades ORM)

Robert C. Martin dedica el **Capítulo 23** al **Humble Object Pattern**: un patrón diseñado para separar el código difícil de probar del código fácil de probar.

> *"The Humble Object pattern is a design pattern that was originally identified as a way to help unit testers to separate behaviors that are hard to test from behaviors that are easy to test... Database gateways are interfaces between the use cases and the database... They follow the Humble Object pattern by acting as a humble layer that simply executes database commands."*  
> — **Robert C. Martin (2017, Capítulo 23, p. 211-213)**

En Comercial 360 se aplica este patrón para separar la persistencia de la lógica de dominio:

1. **La Entidad de Dominio (Testeable):**
   ```typescript
   // domain/entities/cliente.entity.ts (Capa 1)
   export class Cliente {
     constructor(
       public readonly id: number | null,
       public readonly nit: string,
       public razonSocial: string,
       public latitud: number | null,
       public longitud: number | null,
       public activo: boolean
     ) {}

     public actualizarCoordenadas(lat: number, lng: number): void {
       if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
         throw new Error('Coordenadas geográficas inválidas.');
       }
       this.latitud = lat;
       this.longitud = lng;
     }
   }
   ```

2. **La Entidad de TypeORM (Objeto Humilde / Portador de Datos de Base de Datos):**
   ```typescript
   // infrastructure/persistence/entities/cliente.orm-entity.ts (Capa 3 / 4)
   import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

   @Entity({ name: 'cliente' })
   export class ClienteOrmEntity {
     @PrimaryGeneratedColumn({ name: 'id_cliente' })
     idCliente: number;

     @Column({ unique: true })
     nit: string;

     @Column({ name: 'razon_social' })
     razonSocial: string;

     @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
     latitud: number | null;

     @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
     longitud: number | null;

     @Column({ default: true })
     activo: boolean;
   }
   ```

3. **El Mapper (Traductor Bidireccional):**
   ```typescript
   // infrastructure/persistence/mappers/cliente.mapper.ts (Capa 3)
   export class ClienteMapper {
     public static toDomain(orm: ClienteOrmEntity): Cliente {
       return new Cliente(orm.idCliente, orm.nit, orm.razonSocial, orm.latitud, orm.longitud, orm.activo);
     }

     public static toPersistence(domain: Cliente): ClienteOrmEntity {
       const orm = new ClienteOrmEntity();
       if (domain.id) orm.idCliente = domain.id;
       orm.nit = domain.nit;
       orm.razonSocial = domain.razonSocial;
       orm.latitud = domain.latitud;
       orm.longitud = domain.longitud;
       orm.activo = domain.activo;
       return orm;
     }
   }
   ```

---

### 6.3. Cruce de Fronteras Arquitectónicas (Crossing Boundaries)

El **Capítulo 22 (p. 195–197)** detalla el flujo exacto en tiempo de ejecución para una petición:

```
[ Petición HTTP ] 
       |
       v
+-----------------------------------------------------------------+
| CAPA 3: Interface Adapters                                      |
|                                                                 |
| 1. Controller recibe el HTTP Request y valida DTO               |
|    |                                                            |
|    v invoca execute(requestModel)                               |
+-----------------------------------------------------------------+
| CAPA 2: Use Cases                                               |
|                                                                 |
| 2. Interactor ejecuta la lógica del Caso de Uso                 |
|    - Carga la Entidad desde Database Gateway Interface          |
|    - Aplica las reglas en la Entidad (Capa 1: Domain)           |
|    - Guarda cambios a través de Database Gateway Interface      |
|    - Construye el Response Model (DTO de salida puro)           |
|    |                                                            |
|    v retorna Response Model o llama al Output Port              |
+-----------------------------------------------------------------+
| CAPA 3: Interface Adapters                                      |
|                                                                 |
| 3. Presenter / Controller formatea la salida en View Model      |
|    |                                                            |
|    v                                                            |
+-----------------------------------------------------------------+
[ Respuesta HTTP JSON (200 / 201) ]
```

A nivel de código fuente:
- El flujo de control viaja: `Controller -> Interactor -> Gateway / Presenter`.
- Pero el flujo de dependencias en el código fuente apunta en sentido contrario gracias al Polimorfismo: `Controller -> Interactor` y `Gateway Implementation -> Gateway Interface`.

> *"The flow of control goes from the controller, through the use case, and then to the presenter... Note the flow of control: It begins in the controller, moves through the use case, and then winds up executing in the presenter. Note also the source code dependencies: They all point inward toward the use cases."*  
> — **Robert C. Martin (2017, Capítulo 22, p. 196)**

---

## 7. Estructura de Carpetas del Proyecto bajo Clean Architecture

Siguiendo las directrices del libro y las convenciones de NestJS, el código se organiza por módulos funcionales (*Package by Component*):

```text
src/
├── core/                               <-- Núcleo transversal compartido
│   ├── domain/                         (Value Objects globales, Excepciones base)
│   └── application/                    (Puertos globales: IUnitOfWork, IStorageService)
│
├── modules/
│   ├── auth/                           <-- Módulo de Autenticación (BetterAuth)
│   ├── clientes/                       <-- Bounded Context Clientes
│   │   ├── domain/                     <-- CAPA 1: Enterprise Business Rules
│   │   │   ├── entities/               (cliente.entity.ts, contacto.entity.ts)
│   │   │   ├── value-objects/          (nit.vo.ts, coordenadas.vo.ts)
│   │   │   └── exceptions/             (nit-invalido.exception.ts)
│   │   │
│   │   ├── application/                <-- CAPA 2: Application Business Rules
│   │   │   ├── use-cases/              (crear-cliente.use-case.ts, importar-clientes.use-case.ts)
│   │   │   ├── ports/                  (cliente.repository.port.ts, geocoding.service.port.ts)
│   │   │   └── dtos/                   (crear-cliente.request-dto.ts, cliente-creado.response-dto.ts)
│   │   │
│   │   └── infrastructure/             <-- CAPAS 3 Y 4: Interface Adapters & Frameworks
│   │       ├── controllers/            (clientes.controller.ts)
│   │       ├── persistence/
│   │       │   ├── entities/           (cliente.orm-entity.ts, contacto.orm-entity.ts)
│   │       │   ├── mappers/            (cliente.mapper.ts)
│   │       │   └── repositories/       (typeorm-cliente.repository.ts)
│   │       ├── external-services/      (nominatim-geocoding.adapter.ts)
│   │       └── clientes.module.ts      (Ensamblador y contenedor IoC de NestJS)
│   │
│   ├── rutas/                          <-- Bounded Context Rutas
│   ├── visitas/                        <-- Bounded Context Visitas y Evidencias S3
│   ├── comercial/                      <-- Bounded Context Cotizaciones y Pedidos
│   ├── dashboard/                      <-- Bounded Context KPIs y Seguimiento
│   └── reportes/                       <-- Bounded Context Exportación CSV
│
├── config/                             <-- Variables de entorno (.env)
└── main.ts                             <-- Punto de entrada de NestJS
```

---

## 8. Bibliografía y Fuentes de Referencia

1. **Martin, R. C. (2017).** *Clean Architecture: A Craftsman's Guide to Software Structure and Design*. Prentice Hall.
   - **Capítulo 5:** *Object-Oriented Programming (Polymorphism & Inversion of Control)*, pp. 45–54.
   - **Capítulo 11:** *DIP: The Dependency Inversion Principle*, pp. 87–92.
   - **Capítulo 16:** *Independence (Decoupling Layers & Use Cases)*, pp. 147–156.
   - **Capítulo 19:** *Policy and Level*, pp. 177–184.
   - **Capítulo 20:** *Business Rules (Entities & Use Cases)*, pp. 185–190.
   - **Capítulo 22:** *The Clean Architecture (The Dependency Rule)*, pp. 191–208.
   - **Capítulo 23:** *Presenters and Humble Objects*, pp. 209–214.
   - **Capítulo 27:** *Services: Great and Small*, pp. 241–248.
2. **Martin, R. C. (2012).** *The Clean Architecture*. The Clean Code Blog. Recuperado de: `https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html`
3. **Stemmler, K. (2020).** *Solid Book: Building Robust Fullstack TypeScript Applications with Clean Architecture and Domain-Driven Design*.
4. **Vitillo, R. (2021).** *Understanding Distributed Systems: What Every Developer Should Know About Large Distributed Applications*.
5. **Casciaro, M., & Mammino, L. (2020).** *Node.js Design Patterns (3rd ed.)*. Packt Publishing.

