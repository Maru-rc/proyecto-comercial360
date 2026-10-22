import { Controller, Get, INestApplication, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { AUTH } from '../src/modules/auth/infrastructure/better-auth/auth.factory.js';
import type { Auth } from '../src/modules/auth/infrastructure/better-auth/auth.factory.js';
import { AuthModule } from '../src/modules/auth/auth.module.js';
import { Auth as AuthDecorator } from '../src/modules/auth/presentation/auth.decorator.js';
import { seedDemoUsers } from '../src/core/infrastructure/database/seeds/seed-demo-users.js';

const ORIGIN = 'http://localhost:5173';
const ASESOR = {
  email: 'asesor.test@comercial360.com',
  password: 'Asesor-Test-123!',
};
const DIRECTOR = {
  email: 'director.test@comercial360.com',
  password: 'Director-Test-123!',
};
const SIN_REGISTRO = {
  email: 'sin.registro@comercial360.com',
  password: 'SinRegistro-123!',
};

// Rutas de prueba (solo existen en estas pruebas) para comprobar que los
// guards reales de AuthModule responden 401 / 403 / 200. Los módulos de
// negocio todavía no tienen endpoints, así que no se simulan en la app real.
@Controller('test-guards')
class TestGuardsController {
  @Get('director')
  @AuthDecorator('DIRECTOR')
  soloDirector() {
    return { ok: true };
  }

  @Get('cualquiera')
  @AuthDecorator('ASESOR', 'DIRECTOR')
  cualquiera() {
    return { ok: true };
  }
}

@Module({ imports: [AuthModule], controllers: [TestGuardsController] })
class TestGuardsModule {}

describe('Autenticación y roles (e2e, PostgreSQL real)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let auth: Auth;

  const login = (
    cred: { email: string; password: string },
    rememberMe?: boolean,
  ) =>
    request(app.getHttpServer())
      .post('/api/auth/sign-in/email')
      .set('Origin', ORIGIN)
      .send({ ...cred, ...(rememberMe === undefined ? {} : { rememberMe }) });

  // Inicia sesión y devuelve la cookie lista para reutilizar
  const cookieOf = async (cred: { email: string; password: string }) => {
    const res = await login(cred);
    expect(res.status).toBe(200);
    return (res.headers['set-cookie'] as unknown as string[]).map(
      (c) => c.split(';')[0],
    );
  };

  const demoUsers = () => [
    {
      name: 'Asesor Test',
      ...ASESOR,
      role: 'ASESOR' as const,
      asesor: { telefono: '3000000000' },
    },
    { name: 'Director Test', ...DIRECTOR, role: 'DIRECTOR' as const },
  ];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, TestGuardsModule],
    }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();

    dataSource = app.get(DataSource);
    auth = app.get<Auth>(AUTH);

    // Base limpia + usuarios de prueba creados con el mismo seed de la app
    await dataSource.query('DELETE FROM "user"');
    await dataSource.query('DELETE FROM "sales_representatives"');
    await seedDemoUsers(auth, dataSource, demoUsers());
    // Usuario ASESOR sin registro en la tabla SALES_REPRESENTATIVES
    await seedDemoUsers(auth, dataSource, [
      { name: 'Sin Registro', ...SIN_REGISTRO, role: 'ASESOR' },
    ]);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('HU-09: inicio de sesión', () => {
    it('1. inicia sesión con credenciales válidas y crea una cookie httpOnly', async () => {
      const res = await login(ASESOR);
      expect(res.status).toBe(200);
      const cookies = (res.headers['set-cookie'] as unknown as string[]).join(
        ';',
      );
      expect(cookies).toContain('better-auth.session_token=');
      expect(cookies).toContain('HttpOnly');
      expect(cookies).toContain('SameSite=Lax');
    });

    it('2. rechaza credenciales incorrectas (contraseña o correo)', async () => {
      const mala = await login({
        email: ASESOR.email,
        password: 'incorrecta-123',
      });
      expect(mala.status).toBe(401);
      expect(mala.headers['set-cookie']).toBeUndefined();
      const noExiste = await login({
        email: 'nadie@comercial360.com',
        password: 'cualquiera-123',
      });
      expect(noExiste.status).toBe(401);
    });

    it('no permite registrar usuarios (el registro público está desactivado)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/sign-up/email')
        .set('Origin', ORIGIN)
        .send({
          email: 'nuevo@comercial360.com',
          password: 'Nuevo-12345!',
          name: 'Nuevo',
        });
      expect(res.status).toBe(400);
      const rows = await dataSource.query(
        `SELECT 1 FROM "user" WHERE email = 'nuevo@comercial360.com'`,
      );
      expect(rows).toHaveLength(0);
    });

    it('rechaza peticiones de auth desde un origen no autorizado', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/sign-in/email')
        .set('Origin', 'http://evil.example')
        .send(ASESOR);
      expect(res.status).toBe(403);
    });

    it('CORS solo permite el origen del frontend', async () => {
      const ok = await request(app.getHttpServer())
        .options('/api/me')
        .set('Origin', ORIGIN)
        .set('Access-Control-Request-Method', 'GET');
      expect(ok.headers['access-control-allow-origin']).toBe(ORIGIN);
      expect(ok.headers['access-control-allow-credentials']).toBe('true');
      const mal = await request(app.getHttpServer())
        .options('/api/me')
        .set('Origin', 'http://evil.example')
        .set('Access-Control-Request-Method', 'GET');
      expect(mal.headers['access-control-allow-origin']).toBeUndefined();
    });

    it('12. "Recordarme" activo: cookie de 30 días y sesión de 30 días en el servidor', async () => {
      await dataSource.query('DELETE FROM "session"');
      const res = await login(ASESOR, true);
      const cookies = (res.headers['set-cookie'] as unknown as string[]).join(
        ';',
      );
      expect(cookies).toContain('Max-Age=2592000');
      const [{ dias }] = await dataSource.query(
        `SELECT EXTRACT(EPOCH FROM ("expiresAt" - now())) / 86400 AS dias FROM "session"`,
      );
      expect(Number(dias)).toBeGreaterThan(29.9);
    });

    it('12. "Recordarme" apagado: cookie de sesión del navegador y 1 día en el servidor', async () => {
      await dataSource.query('DELETE FROM "session"');
      const res = await login(ASESOR, false);
      const cookies = (res.headers['set-cookie'] as unknown as string[]).join(
        ';',
      );
      expect(cookies).not.toContain('Max-Age=2592000');
      expect(cookies).toContain('better-auth.dont_remember=');
      const [{ dias }] = await dataSource.query(
        `SELECT EXTRACT(EPOCH FROM ("expiresAt" - now())) / 86400 AS dias FROM "session"`,
      );
      expect(Number(dias)).toBeLessThan(1.01);
    });

    it('11. cerrar sesión invalida la sesión en el servidor', async () => {
      const cookie = await cookieOf(ASESOR);
      await request(app.getHttpServer())
        .get('/api/me')
        .set('Cookie', cookie)
        .expect(200);

      await request(app.getHttpServer())
        .post('/api/auth/sign-out')
        .set('Origin', ORIGIN)
        .set('Cookie', cookie)
        .send({})
        .expect(200);

      // La misma cookie ya no sirve
      await request(app.getHttpServer())
        .get('/api/me')
        .set('Cookie', cookie)
        .expect(401);
      // Y la fila de esa sesión ya no existe en la base de datos
      const token = decodeURIComponent(cookie[0].split('=')[1]).split('.')[0];
      const sesiones = await dataSource.query(
        `SELECT 1 FROM session WHERE token = $1`,
        [token],
      );
      expect(sesiones).toHaveLength(0);
    });
  });

  describe('GET /api/me', () => {
    it('3. sin sesión responde 401', async () => {
      await request(app.getHttpServer()).get('/api/me').expect(401);
    });

    it('3. con una cookie inventada responde 401', async () => {
      await request(app.getHttpServer())
        .get('/api/me')
        .set('Cookie', 'better-auth.session_token=falso.falso')
        .expect(401);
    });

    it('4 y 5. con sesión de asesor devuelve el perfil, el rol y su registro de asesor', async () => {
      const cookie = await cookieOf(ASESOR);
      const res = await request(app.getHttpServer())
        .get('/api/me')
        .set('Cookie', cookie)
        .expect(200);
      expect(res.body).toMatchObject({
        nombre: 'Asesor Test',
        email: ASESOR.email,
        rol: 'ASESOR',
        asesor: { telefono: '3000000000', estado: 'ACTIVO' },
      });
      expect(typeof res.body.id).toBe('string');
      expect(typeof res.body.asesor.id_asesor).toBe('number');
      // No se filtran datos internos
      expect(JSON.stringify(res.body)).not.toMatch(/password|token/i);
    });

    it('5. con sesión de director devuelve rol DIRECTOR y asesor null', async () => {
      const cookie = await cookieOf(DIRECTOR);
      const res = await request(app.getHttpServer())
        .get('/api/me')
        .set('Cookie', cookie)
        .expect(200);
      expect(res.body).toMatchObject({
        email: DIRECTOR.email,
        rol: 'DIRECTOR',
        asesor: null,
      });
    });

    it('6. vincula al asesor por correo sin distinguir mayúsculas', async () => {
      await dataSource.query(
        `UPDATE "sales_representatives" SET email = UPPER(email) WHERE LOWER(email) = $1`,
        [ASESOR.email],
      );
      const cookie = await cookieOf(ASESOR);
      const res = await request(app.getHttpServer())
        .get('/api/me')
        .set('Cookie', cookie)
        .expect(200);
      expect(res.body.asesor).not.toBeNull();
      await dataSource.query(
        `UPDATE "sales_representatives" SET email = LOWER(email)`,
      );
    });

    it('un usuario ASESOR sin registro en ASESOR recibe 403', async () => {
      const cookie = await cookieOf(SIN_REGISTRO);
      const res = await request(app.getHttpServer())
        .get('/api/me')
        .set('Cookie', cookie);
      expect(res.status).toBe(403);
    });
  });

  describe('HU-10: control de acceso por rol', () => {
    it('7. el director accede a una ruta exclusiva de director', async () => {
      const cookie = await cookieOf(DIRECTOR);
      await request(app.getHttpServer())
        .get('/api/test-guards/director')
        .set('Cookie', cookie)
        .expect(200);
    });

    it('8. el asesor recibe 403 en una ruta exclusiva de director', async () => {
      const cookie = await cookieOf(ASESOR);
      await request(app.getHttpServer())
        .get('/api/test-guards/director')
        .set('Cookie', cookie)
        .expect(403);
      await request(app.getHttpServer())
        .get('/api/test-guards/cualquiera')
        .set('Cookie', cookie)
        .expect(200);
    });

    it('sin sesión recibe 401 en rutas protegidas', async () => {
      await request(app.getHttpServer())
        .get('/api/test-guards/director')
        .expect(401);
    });

    it('10. no se puede elevar privilegios enviando DIRECTOR desde el cliente', async () => {
      const cookie = await cookieOf(ASESOR);

      // a) cambiar el rol con el endpoint de Better Auth
      const upd = await request(app.getHttpServer())
        .post('/api/auth/update-user')
        .set('Origin', ORIGIN)
        .set('Cookie', cookie)
        .send({ role: 'DIRECTOR' });
      expect(upd.status).toBe(400);

      // b) enviar el rol en el inicio de sesión o como cabecera/consulta
      await request(app.getHttpServer())
        .get('/api/test-guards/director?role=DIRECTOR')
        .set('Cookie', cookie)
        .set('X-Role', 'DIRECTOR')
        .expect(403);

      // c) el rol sigue siendo ASESOR en la base y en /api/me
      const [{ role }] = await dataSource.query(
        `SELECT role FROM "user" WHERE email = $1`,
        [ASESOR.email],
      );
      expect(role).toBe('ASESOR');
      const me = await request(app.getHttpServer())
        .get('/api/me')
        .set('Cookie', cookie)
        .expect(200);
      expect(me.body.rol).toBe('ASESOR');
    });

    it('la base de datos rechaza roles que no sean ASESOR o DIRECTOR', async () => {
      await expect(
        dataSource.query(`UPDATE "user" SET role = 'ADMIN' WHERE email = $1`, [
          ASESOR.email,
        ]),
      ).rejects.toThrow();
    });

    it('si el rol cambia en la base, el cambio aplica de inmediato (el rol no viaja en la cookie)', async () => {
      const cookie = await cookieOf(ASESOR);
      await dataSource.query(
        `UPDATE "user" SET role = 'DIRECTOR' WHERE email = $1`,
        [ASESOR.email],
      );
      try {
        await request(app.getHttpServer())
          .get('/api/test-guards/director')
          .set('Cookie', cookie)
          .expect(200);
      } finally {
        await dataSource.query(
          `UPDATE "user" SET role = 'ASESOR' WHERE email = $1`,
          [ASESOR.email],
        );
      }
      await request(app.getHttpServer())
        .get('/api/test-guards/director')
        .set('Cookie', cookie)
        .expect(403);
    });
  });

  describe('Seed', () => {
    it('es idempotente: ejecutarlo de nuevo no duplica usuarios ni asesores', async () => {
      await seedDemoUsers(auth, dataSource, demoUsers());
      await seedDemoUsers(auth, dataSource, demoUsers());
      const [{ n }] = await dataSource.query(
        `SELECT count(*)::int AS n FROM "user" WHERE email = ANY($1)`,
        [[ASESOR.email, DIRECTOR.email]],
      );
      expect(n).toBe(2);
      const [{ a }] = await dataSource.query(
        `SELECT count(*)::int AS a FROM "sales_representatives" WHERE LOWER(email) = $1`,
        [ASESOR.email],
      );
      expect(a).toBe(1);
      // Y los usuarios siguen pudiendo iniciar sesión
      expect((await login(DIRECTOR)).status).toBe(200);
    });
  });
});
