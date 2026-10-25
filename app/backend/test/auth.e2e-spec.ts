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
const ADVISOR = {
  email: 'advisor.test@comercial360.com',
  password: 'Advisor-Test-123!',
};
const DIRECTOR = {
  email: 'director.test@comercial360.com',
  password: 'Director-Test-123!',
};
const UNLINKED = {
  email: 'unlinked@comercial360.com',
  password: 'Unlinked-123!',
};

// Test routes (only exist in this test suite) to verify that real
// AuthModule guards respond with 401 / 403 / 200.
@Controller('test-guards')
class TestGuardsController {
  @Get('director')
  @AuthDecorator('DIRECTOR')
  onlyDirector() {
    return { ok: true };
  }

  @Get('any')
  @AuthDecorator('ADVISOR', 'DIRECTOR')
  anyRole() {
    return { ok: true };
  }
}

@Module({ imports: [AuthModule], controllers: [TestGuardsController] })
class TestGuardsModule {}

describe('Authentication and Roles (e2e, PostgreSQL)', () => {
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

  // Logs in and returns session cookies ready for reuse
  const cookieOf = async (cred: { email: string; password: string }) => {
    const res = await login(cred);
    expect(res.status).toBe(200);
    return (res.headers['set-cookie'] as unknown as string[]).map(
      (c) => c.split(';')[0],
    );
  };

  const demoUsers = () => [
    {
      name: 'Advisor Test',
      ...ADVISOR,
      role: 'ADVISOR' as const,
      advisor: { phone: '3000000000' },
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

    // Clean database + test users created with the seed utility
    await dataSource.query('DELETE FROM "user"');
    await dataSource.query('DELETE FROM "sales_representatives"');
    await seedDemoUsers(auth, dataSource, demoUsers());
    // ADVISOR user without a record in SALES_REPRESENTATIVES
    await seedDemoUsers(auth, dataSource, [
      { name: 'Unlinked Advisor', ...UNLINKED, role: 'ADVISOR' },
    ]);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('HU-09: Sign In', () => {
    it('1. signs in with valid credentials and sets an httpOnly cookie', async () => {
      const res = await login(ADVISOR);
      expect(res.status).toBe(200);
      const cookies = (res.headers['set-cookie'] as unknown as string[]).join(
        ';',
      );
      expect(cookies).toContain('better-auth.session_token=');
      expect(cookies).toContain('HttpOnly');
      expect(cookies).toContain('SameSite=Lax');
    });

    it('2. rejects invalid credentials (wrong password or nonexistent email)', async () => {
      const wrongPassword = await login({
        email: ADVISOR.email,
        password: 'incorrect-password-123',
      });
      expect(wrongPassword.status).toBe(401);
      expect(wrongPassword.headers['set-cookie']).toBeUndefined();
      const nonexistent = await login({
        email: 'nobody@comercial360.com',
        password: 'any-password-123',
      });
      expect(nonexistent.status).toBe(401);
    });

    it('does not allow user self-registration (public sign-up is disabled)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/sign-up/email')
        .set('Origin', ORIGIN)
        .send({
          email: 'newuser@comercial360.com',
          password: 'NewUser-12345!',
          name: 'New User',
        });
      expect(res.status).toBe(400);
      const rows = await dataSource.query(
        `SELECT 1 FROM "user" WHERE email = 'newuser@comercial360.com'`,
      );
      expect(rows).toHaveLength(0);
    });

    it('rejects auth requests from an unauthorized origin', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/sign-in/email')
        .set('Origin', 'http://evil.example')
        .send(ADVISOR);
      expect(res.status).toBe(403);
    });

    it('CORS only permits the frontend origin', async () => {
      const ok = await request(app.getHttpServer())
        .options('/api/me')
        .set('Origin', ORIGIN)
        .set('Access-Control-Request-Method', 'GET');
      expect(ok.headers['access-control-allow-origin']).toBe(ORIGIN);
      expect(ok.headers['access-control-allow-credentials']).toBe('true');
      const bad = await request(app.getHttpServer())
        .options('/api/me')
        .set('Origin', 'http://evil.example')
        .set('Access-Control-Request-Method', 'GET');
      expect(bad.headers['access-control-allow-origin']).toBeUndefined();
    });

    it('12. "Remember Me" enabled: 30-day cookie and 30-day session on server', async () => {
      await dataSource.query('DELETE FROM "session"');
      const res = await login(ADVISOR, true);
      const cookies = (res.headers['set-cookie'] as unknown as string[]).join(
        ';',
      );
      expect(cookies).toContain('Max-Age=2592000');
      const [{ days }] = await dataSource.query(
        `SELECT EXTRACT(EPOCH FROM ("expiresAt" - now())) / 86400 AS days FROM "session"`,
      );
      expect(Number(days)).toBeGreaterThan(29.9);
    });

    it('12. "Remember Me" disabled: browser session cookie and 1 day on server', async () => {
      await dataSource.query('DELETE FROM "session"');
      const res = await login(ADVISOR, false);
      const cookies = (res.headers['set-cookie'] as unknown as string[]).join(
        ';',
      );
      expect(cookies).not.toContain('Max-Age=2592000');
      expect(cookies).toContain('better-auth.dont_remember=');
      const [{ days }] = await dataSource.query(
        `SELECT EXTRACT(EPOCH FROM ("expiresAt" - now())) / 86400 AS days FROM "session"`,
      );
      expect(Number(days)).toBeLessThan(1.01);
    });

    it('11. signing out invalidates session on server', async () => {
      const cookie = await cookieOf(ADVISOR);
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

      // Same cookie is now rejected
      await request(app.getHttpServer())
        .get('/api/me')
        .set('Cookie', cookie)
        .expect(401);
      // And session row is deleted from database
      const token = decodeURIComponent(cookie[0].split('=')[1]).split('.')[0];
      const sessions = await dataSource.query(
        `SELECT 1 FROM session WHERE token = $1`,
        [token],
      );
      expect(sessions).toHaveLength(0);
    });
  });

  describe('GET /api/me', () => {
    it('3. without session responds 401', async () => {
      await request(app.getHttpServer()).get('/api/me').expect(401);
    });

    it('3. with invalid cookie responds 401', async () => {
      await request(app.getHttpServer())
        .get('/api/me')
        .set('Cookie', 'better-auth.session_token=fake.fake')
        .expect(401);
    });

    it('4 and 5. with advisor session returns profile, role, and linked advisor record', async () => {
      const cookie = await cookieOf(ADVISOR);
      const res = await request(app.getHttpServer())
        .get('/api/me')
        .set('Cookie', cookie)
        .expect(200);
      expect(res.body.data).toMatchObject({
        name: 'Advisor Test',
        email: ADVISOR.email,
        role: 'ADVISOR',
        advisor: { phone: '3000000000', status: 'ACTIVE' },
      });
      expect(typeof res.body.data.id).toBe('string');
      expect(typeof res.body.data.advisor.idAdvisor).toBe('number');
      // No internal secrets are exposed
      expect(JSON.stringify(res.body)).not.toMatch(/password|token/i);
    });

    it('5. with director session returns DIRECTOR role and advisor null', async () => {
      const cookie = await cookieOf(DIRECTOR);
      const res = await request(app.getHttpServer())
        .get('/api/me')
        .set('Cookie', cookie)
        .expect(200);
      expect(res.body.data).toMatchObject({
        email: DIRECTOR.email,
        role: 'DIRECTOR',
        advisor: null,
      });
    });

    it('6. links advisor by email case-insensitively', async () => {
      await dataSource.query(
        `UPDATE "sales_representatives" SET email = UPPER(email) WHERE LOWER(email) = $1`,
        [ADVISOR.email],
      );
      const cookie = await cookieOf(ADVISOR);
      const res = await request(app.getHttpServer())
        .get('/api/me')
        .set('Cookie', cookie)
        .expect(200);
      expect(res.body.data.advisor).not.toBeNull();
      await dataSource.query(
        `UPDATE "sales_representatives" SET email = LOWER(email)`,
      );
    });

    it('an ADVISOR user without sales_representatives record receives 403', async () => {
      const cookie = await cookieOf(UNLINKED);
      const res = await request(app.getHttpServer())
        .get('/api/me')
        .set('Cookie', cookie);
      expect(res.status).toBe(403);
    });
  });

  describe('HU-10: Role-Based Access Control', () => {
    it('7. director accesses director-only route', async () => {
      const cookie = await cookieOf(DIRECTOR);
      await request(app.getHttpServer())
        .get('/api/test-guards/director')
        .set('Cookie', cookie)
        .expect(200);
    });

    it('8. advisor receives 403 on director-only route, and 200 on shared route', async () => {
      const cookie = await cookieOf(ADVISOR);
      await request(app.getHttpServer())
        .get('/api/test-guards/director')
        .set('Cookie', cookie)
        .expect(403);
      await request(app.getHttpServer())
        .get('/api/test-guards/any')
        .set('Cookie', cookie)
        .expect(200);
    });

    it('without session receives 401 on protected routes', async () => {
      await request(app.getHttpServer())
        .get('/api/test-guards/director')
        .expect(401);
    });

    it('10. cannot escalate privileges sending DIRECTOR from client', async () => {
      const cookie = await cookieOf(ADVISOR);

      // a) change role using Better Auth endpoint
      const upd = await request(app.getHttpServer())
        .post('/api/auth/update-user')
        .set('Origin', ORIGIN)
        .set('Cookie', cookie)
        .send({ role: 'DIRECTOR' });
      expect(upd.status).toBe(400);

      // b) send role in query string or header
      await request(app.getHttpServer())
        .get('/api/test-guards/director?role=DIRECTOR')
        .set('Cookie', cookie)
        .set('X-Role', 'DIRECTOR')
        .expect(403);

      // c) role remains ADVISOR in database and /api/me
      const [{ role }] = await dataSource.query(
        `SELECT role FROM "user" WHERE email = $1`,
        [ADVISOR.email],
      );
      expect(role).toBe('ADVISOR');
      const me = await request(app.getHttpServer())
        .get('/api/me')
        .set('Cookie', cookie)
        .expect(200);
      expect(me.body.data.role).toBe('ADVISOR');
    });

    it('database rejects roles other than ADVISOR or DIRECTOR', async () => {
      await expect(
        dataSource.query(`UPDATE "user" SET role = 'ADMIN' WHERE email = $1`, [
          ADVISOR.email,
        ]),
      ).rejects.toThrow();
    });

    it('if role changes in database, change applies immediately (role is not cached in cookie)', async () => {
      const cookie = await cookieOf(ADVISOR);
      await dataSource.query(
        `UPDATE "user" SET role = 'DIRECTOR' WHERE email = $1`,
        [ADVISOR.email],
      );
      try {
        await request(app.getHttpServer())
          .get('/api/test-guards/director')
          .set('Cookie', cookie)
          .expect(200);
      } finally {
        await dataSource.query(
          `UPDATE "user" SET role = 'ADVISOR' WHERE email = $1`,
          [ADVISOR.email],
        );
      }
      await request(app.getHttpServer())
        .get('/api/test-guards/director')
        .set('Cookie', cookie)
        .expect(403);
    });
  });

  describe('Seed', () => {
    it('is idempotent: running again does not duplicate users or sales representatives', async () => {
      await seedDemoUsers(auth, dataSource, demoUsers());
      await seedDemoUsers(auth, dataSource, demoUsers());
      const [{ n }] = await dataSource.query(
        `SELECT count(*)::int AS n FROM "user" WHERE email = ANY($1)`,
        [[ADVISOR.email, DIRECTOR.email]],
      );
      expect(n).toBe(2);
      const [{ a }] = await dataSource.query(
        `SELECT count(*)::int AS a FROM "sales_representatives" WHERE LOWER(email) = $1`,
        [ADVISOR.email],
      );
      expect(a).toBe(1);
      // And users can still log in
      expect((await login(DIRECTOR)).status).toBe(200);
    });
  });
});
