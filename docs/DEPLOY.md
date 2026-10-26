# Despliegue de Comercial 360 (HU-21)

Esta guía cubre cómo se despliega la aplicación con el Jenkins del proyecto. No fija la infraestructura: el host, la base de datos y el proxy pueden cambiar, y la aplicación solo necesita lo que se lista en «Qué necesita la aplicación».

## Piezas

| Pieza | Archivo | Qué hace |
|---|---|---|
| Imagen del backend | `app/backend/Dockerfile` | Compila NestJS con pnpm y deja un runtime con `dist/`, dependencias de producción y el certificado CA de Amazon RDS |
| Imagen del frontend | `app/frontend/Dockerfile` | Compila la SPA con Vite y la sirve con nginx (`nginx/nginx.conf`), que redirige `/api/` al backend |
| Entrypoint | `docker-entrypoint.sh` | `start` (por defecto), `migrate`, `bootstrap` o `set-password` |
| Orquestación | `docker-compose.prod.yml` | Backend y frontend con healthchecks; todo configurable por variables |
| Pipeline | `Jenkinsfile` | Calidad → imágenes → migraciones → despliegue → smoke test, con rollback |
| Jenkins del proyecto | `infra/jenkins/` | Jenkins LTS con Docker CLI, compose y Node 22 |
| Variables | `.env.production.example` | Plantilla del `.env` de producción |

## Qué necesita la aplicación

- **PostgreSQL 16** accesible desde el servidor de la app (por ejemplo, Amazon RDS en una red privada). Con RDS:
  - `DATABASE_SSL=true`.
  - `DATABASE_SSL_CA=/usr/src/app/certs/rds-global-bundle.pem`. El certificado ya viene en la imagen y con él se verifica el servidor.
- **Un bucket S3 privado**, con su nombre en `AWS_S3_BUCKET_NAME` y en `AWS_S3_BUCKET`.
  - **CORS** para el dominio público, porque el navegador sube y descarga directo con URLs firmadas:
    ```json
    [{ "AllowedOrigins": ["https://<dominio>"], "AllowedMethods": ["PUT", "GET", "HEAD"],
       "AllowedHeaders": ["*"], "ExposeHeaders": ["ETag"], "MaxAgeSeconds": 3000 }]
    ```
  - **Acceso** por un rol IAM del servidor (recomendado; deja vacías `AWS_ACCESS_KEY_ID` y `AWS_SECRET_ACCESS_KEY`) o por esas dos claves. Los permisos necesarios son `s3:PutObject`, `s3:GetObject` y `s3:DeleteObject` sobre `arn:aws:s3:::<bucket>/*`.
- **Un proxy inverso con TLS** delante de la app (por ejemplo, Nginx Proxy Manager):
  - Destino: `http://<servidor-app>:<FRONTEND_PORT>` (8081 por defecto).
  - Tiene que enviar la cabecera `X-Forwarded-Proto: https`. Nginx Proxy Manager la envía por defecto.
  - **HTTPS es obligatorio**: en producción la cookie de sesión es `Secure`, así que sin TLS el login no funciona.
  - Frontend y API van en el **mismo dominio**: el frontend llama a `/api` en su propio origen.
- **Salida a internet durante el build**: el servidor de Jenkins debe poder llegar a `registry.npmjs.org` y a `cdn.sheetjs.com`, desde donde se descarga `xlsx` 0.20.3, la versión corregida que no está publicada en npm.
- **Correo para recuperar la contraseña (HU-22, opcional)**: `MAIL_FROM` con un remitente verificado en Amazon SES, y `SES_REGION` si no es la misma de `AWS_REGION`. El rol IAM necesita `ses:SendEmail`. Sin `MAIL_FROM`, la pantalla de recuperación responde igual pero no llega ningún correo.
- **Variables de autenticación**: `BETTER_AUTH_SECRET` (`openssl rand -hex 32`), y `BETTER_AUTH_URL` y `FRONTEND_URL` iguales a `https://<dominio>`, sin ruta.

## Instalar el Jenkins del proyecto

En el servidor donde corre la aplicación, que necesita Docker con el plugin compose:

```bash
git clone https://github.com/Maru-rc/proyecto-comercial360.git && cd proyecto-comercial360
DOCKER_GID=$(getent group docker | cut -d: -f3) \
  docker compose -f infra/jenkins/docker-compose.yml up -d --build
docker compose -f infra/jenkins/docker-compose.yml exec jenkins \
  cat /var/jenkins_home/secrets/initialAdminPassword
```

- Por defecto Jenkins escucha en `127.0.0.1:8080`. Usa `JENKINS_BIND` y `JENKINS_PORT` para cambiarlo.
- Publícalo con el proxy inverso, por ejemplo como `jenkins.<dominio>` con TLS.
- Con 4 GB de RAM o menos, añade swap: `sudo fallocate -l 4G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile`.

### Configurar el job

1. Completa el asistente inicial con los plugins sugeridos. Los de `infra/jenkins/plugins.txt` ya vienen instalados.
2. **Credenciales → System → Global → Add**:
   - Tipo **Secret file**.
   - Id `c360-env`.
   - Archivo: el `.env` de producción hecho a partir de `.env.production.example`.
3. **New Item → Pipeline** (o Multibranch Pipeline):
   - *Pipeline script from SCM*, Git, URL del repositorio, rama `*/main` y *Script Path* `Jenkinsfile`.
   - Si el repositorio es privado, añade una credencial de GitHub (token con acceso de lectura).
   - Marca *GitHub hook trigger for GITScm polling*.
4. En GitHub, **Settings → Webhooks**: `https://jenkins.<dominio>/github-webhook/`, tipo `application/json`, evento *push*.

### Parámetros del pipeline

| Parámetro | Por defecto | Uso |
|---|---|---|
| `DEPLOY_BRANCH` | `main` | Única rama que despliega; las demás solo pasan la calidad |
| `ENV_CREDENTIAL_ID` | `c360-env` | Credencial con el `.env` |
| `FRONTEND_PORT` | `8081` | Puerto del host al que apunta el proxy |
| `PUBLIC_URL` | vacío | URL pública para el smoke test; si está vacío se prueba dentro del contenedor |
| `KEEP_IMAGES` | `3` | Versiones que se conservan para rollback |
| `RUN_BOOTSTRAP` | `false` | Crea los catálogos y el primer director |
| `SKIP_TESTS` | `false` | Solo para emergencias |

## Primer despliegue

1. Añade al `.env` de la credencial `BOOTSTRAP_DIRECTOR_EMAIL` y `BOOTSTRAP_DIRECTOR_PASSWORD` (mínimo 12 caracteres).
2. Lanza **Build with Parameters** con `RUN_BOOTSTRAP=true`. El bootstrap es idempotente y no duplica nada si se repite.
3. Entra con ese usuario en `https://<dominio>`. Después puedes quitar las variables `BOOTSTRAP_*` del `.env`.

## Crear usuarios o cambiar una contraseña

El registro público está cerrado, así que los asesores y directores se crean desde el servidor. El mismo comando cambia la contraseña de un usuario que ya existe (por ejemplo, si se olvidó y su correo no es real):

```bash
# Cambiar la contraseña
docker compose -f docker-compose.prod.yml run --rm --no-deps \
  -e USER_EMAIL=juan.perez@comercial360.com -e USER_PASSWORD='<mínimo 12 caracteres>' \
  backend set-password

# Crear un asesor (queda enlazado a su registro de asesor comercial)
docker compose -f docker-compose.prod.yml run --rm --no-deps \
  -e USER_EMAIL=laura.gomez@comercial360.com -e USER_PASSWORD='<mínimo 12 caracteres>' \
  -e USER_NAME='Laura Gómez' -e USER_ROLE=ADVISOR -e USER_PHONE=3015550101 \
  backend set-password
```

`USER_ROLE` puede ser `ADVISOR` (por defecto) o `DIRECTOR`.

Cada push a `main` despliega de nuevo. Las imágenes se etiquetan con el commit (`comercial360-backend:<sha>`).

## Comprobaciones tras desplegar

```bash
curl -fsS https://<dominio>/api/health            # 200 con "database":{"status":"up"}
curl -s -o /dev/null -w '%{http_code}\n' https://<dominio>/api/clientes   # 401 sin sesión
curl -s -o /dev/null -w '%{http_code}\n' https://<dominio>/api/docs       # 404 (Swagger apagado)
```

En el navegador, la cookie `__Secure-better-auth.session_token` debe llegar con `HttpOnly; Secure; SameSite=Lax`.

## Rollback

- **Automático**: si el pipeline falla, vuelve a la última versión que pasó el smoke test, guardada en `$JENKINS_HOME/comercial360/last_good_tag`.
- **Manual**, desde el workspace del job:
  ```bash
  IMAGE_TAG=<sha_anterior> ENV_FILE=<ruta/.env> docker compose -f docker-compose.prod.yml up -d --wait
  ```
- **Base de datos**: antes de un despliegue con migraciones, saca un snapshot (en RDS, `aws rds create-db-snapshot`). Para deshacer la última migración:
  ```bash
  ENV_FILE=<ruta/.env> docker compose -f docker-compose.prod.yml run --rm --no-deps backend \
    node node_modules/typeorm/cli.js migration:revert -d dist/core/infrastructure/database/data-source.js
  ```

## Probar la pila de producción en local

```bash
docker compose -f docker-compose.prod.yml build
# Un .env con DATABASE_HOST apuntando a un PostgreSQL accesible, DATABASE_SSL=false
ENV_FILE=.env.local-prod docker compose -f docker-compose.prod.yml run --rm --no-deps backend migrate
ENV_FILE=.env.local-prod docker compose -f docker-compose.prod.yml up -d --wait
curl -fsS http://localhost:8081/api/health
```
