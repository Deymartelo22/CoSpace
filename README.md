# CoSpace

Plataforma fullstack para explorar escritorios, salas de reuniones y cabinas de coworking, reservar por horas y administrar el catálogo. Usa Next.js 16 App Router, TypeScript, Prisma y PostgreSQL.

## Requisitos

- Node.js 22 LTS y npm 10 o superior.
- Una base PostgreSQL en Supabase.
- Docker Engine/Desktop solo para la ejecución contenerizada.
- Git para clonar el repositorio.

## Configuración

1. Clona el repositorio e instala dependencias:

   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd cospace
   npm ci
   ```

2. Crea el archivo local de variables:

   ```bash
   cp .env.example .env
   ```

3. Completa `.env`:

| Variable | Uso y valor |
| --- | --- |
| `DATABASE_URL` | Conexión de ejecución a PostgreSQL. En Supabase, usa **Connect > Transaction pooler** (normalmente puerto `6543`) y conserva los parámetros indicados por Supabase. |
| `DIRECT_URL` | Conexión directa o session pooler para migraciones Prisma. Copia la cadena correspondiente desde **Connect** en Supabase; normalmente usa puerto `5432`. |
| `JWT_ACCESS_SECRET` | Secreto de firma del access token, mínimo 32 caracteres. Genera uno con `openssl rand -base64 48`. |
| `JWT_REFRESH_SECRET` | Secreto independiente para refresh tokens; genera otro con `openssl rand -base64 48`. |
| `ACCESS_TOKEN_EXPIRES_IN` | Vigencia del access token; formato admitido, por ejemplo `15m`. |
| `REFRESH_TOKEN_EXPIRES_IN` | Vigencia del refresh token; formato admitido, por ejemplo `7d`. |
| `SEED_ADMIN_EMAIL` | Correo opcional del administrador de seed. Por defecto: `admin@cospace.local`. |
| `SEED_ADMIN_PASSWORD` | Contraseña opcional del administrador de seed. Por defecto: `Admin12345!`; reemplázala antes de sembrar en cualquier entorno compartido. |

No publiques `.env` ni copies sus valores en el repositorio. Usa secretos distintos para cada entorno.

## Desarrollo

Después de configurar Supabase y `.env`, ejecuta en este orden:

```bash
npm run db:generate
npm run db:deploy
npm run db:seed
npm run dev
```

Abre <http://localhost:3000>. Para crear una migración durante desarrollo local usa `npm run db:migrate`.

El seed crea estos usuarios si todavía no existen:

- Administrador: `admin@cospace.local` / `Admin12345!` (o los valores `SEED_ADMIN_EMAIL` y `SEED_ADMIN_PASSWORD` configurados).
- Usuario demo: `user@cospace.local` / `User12345!`.

Cambia las contraseñas demo en cualquier entorno accesible públicamente.

## Docker

Primero configura `.env`, aplica migraciones y seed con los comandos anteriores. Luego construye y ejecuta:

```bash
docker build -t cospace .
docker run --rm --name cospace --env-file .env -p 3000:3000 cospace
```

Abre <http://localhost:3000>. El contenedor requiere `DATABASE_URL`, `DIRECT_URL` y los secretos JWT. No incluyas `.env` dentro de la imagen.

## Scripts

| Script | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo Next.js. |
| `npm run build` | Compila la aplicación para producción. |
| `npm run start` | Ejecuta el build de producción. |
| `npm run lint` | Ejecuta ESLint. |
| `npm run db:generate` | Genera el cliente Prisma. |
| `npm run db:migrate` | Crea/aplica migraciones en desarrollo. |
| `npm run db:deploy` | Aplica migraciones existentes en un entorno desplegado. |
| `npm run db:seed` | Inserta usuarios demo y espacios de ejemplo. |
| `npm run db:studio` | Abre Prisma Studio. |

Las pruebas se ejecutan con `npx vitest run`.

## Estructura

- `src/app`: páginas App Router y route handlers bajo `api/`.
- `src/components`: formularios, tarjetas y vistas interactivas compartidas.
- `src/services`: reglas de negocio y clientes HTTP del navegador.
- `src/lib`: Prisma, autenticación, cookies y respuestas HTTP.
- `src/validators`: esquemas Zod para entradas de API.
- `prisma`: esquema, migraciones y seed.
- `tests`: pruebas unitarias y de route handlers.

## Despliegue

La base de datos debe estar en Supabase y la aplicación puede desplegarse en Vercel. En Vercel, configura las mismas variables del apartado anterior y ejecuta las migraciones (`npm run db:deploy`) contra la base antes de probar la aplicación.

**URL desplegada:** pendiente. Aún no se ha proporcionado una URL de Vercel para este proyecto.
