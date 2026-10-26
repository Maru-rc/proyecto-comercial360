import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { seedDemoUsers } from '../src/core/infrastructure/database/seeds/seed-demo-users.js';
import { AUTH } from '../src/modules/auth/infrastructure/better-auth/auth.factory.js';
import type { Auth } from '../src/modules/auth/infrastructure/better-auth/auth.factory.js';

const ORIGIN = 'http://localhost:5173';
type Cred = { email: string; password: string };
const DIRECTOR: Cred = {
  email: 'director.hu09@comercial360.com',
  password: 'Director-Hu09-123!',
};
const ADVISOR: Cred = {
  email: 'advisor.hu09@comercial360.com',
  password: 'Advisor-Hu09-123!',
};
const ROUTE_NAME = 'HU09 e2e route';
const ZONE_NAME = 'HU09 E2E ZONE';
const TAX_IDS = ['HU09-TEST-1', 'HU09-TEST-2'];

describe('HU-07/08/09: create, fill and assign a route (e2e)', () => {
  let app: INestApplication;
  let ds: DataSource;
  let advisorId: number;
  let zoneId: number;
  let customerIds: number[];
  let cookies: Record<'director' | 'advisor', string[]>;

  const login = async (cred: Cred) => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/sign-in/email')
      .set('Origin', ORIGIN)
      .send(cred);
    expect(res.status).toBe(200);
    return (res.headers['set-cookie'] as unknown as string[]).map(
      (c) => c.split(';')[0],
    );
  };
  const api = (
    method: 'get' | 'post' | 'put',
    url: string,
    cookie: string[],
    body?: object,
  ) => {
    const req = request(app.getHttpServer())
      [method](`/api${url}`)
      .set('Cookie', cookie);
    return body ? req.send(body) : req;
  };
  // Only this suite's rows: other suites delete every advisor, and routes
  // and visits reference them
  const clean = async () => {
    const routes = `SELECT route_id FROM "routes" WHERE name = $1`;
    await ds.query(`DELETE FROM "visits" WHERE route_id IN (${routes})`, [
      ROUTE_NAME,
    ]);
    await ds.query(`DELETE FROM "route_stops" WHERE route_id IN (${routes})`, [
      ROUTE_NAME,
    ]);
    await ds.query('DELETE FROM "routes" WHERE name = $1', [ROUTE_NAME]);
    await ds.query('DELETE FROM "zones" WHERE name = $1', [ZONE_NAME]);
    await ds.query('DELETE FROM "customers" WHERE tax_id = ANY($1)', [TAX_IDS]);
    await ds.query('DELETE FROM "user" WHERE email = ANY($1)', [
      [DIRECTOR.email, ADVISOR.email],
    ]);
    await ds.query('DELETE FROM "sales_representatives" WHERE email = $1', [
      ADVISOR.email,
    ]);
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
    ds = app.get(DataSource);

    await clean();
    await seedDemoUsers(app.get<Auth>(AUTH), ds, [
      { name: 'Director HU09', ...DIRECTOR, role: 'DIRECTOR' },
      {
        name: 'Advisor HU09',
        ...ADVISOR,
        role: 'ADVISOR',
        advisor: { phone: '9' },
      },
    ]);
    const [advisor]: { sales_representative_id: number }[] = await ds.query(
      'SELECT sales_representative_id FROM "sales_representatives" WHERE email = $1',
      [ADVISOR.email],
    );
    advisorId = advisor.sales_representative_id;

    // The e2e database has no catalogs: the route needs an existing zone
    const [zone]: { zone_id: number }[] = await ds.query(
      'INSERT INTO "zones" (name) VALUES ($1) RETURNING zone_id',
      [ZONE_NAME],
    );
    zoneId = zone.zone_id;

    const customers: { customer_id: number }[] = await ds.query(
      `INSERT INTO "customers" (tax_id, legal_name)
       VALUES ($1, 'HU09 Customer 1'), ($2, 'HU09 Customer 2')
       RETURNING customer_id`,
      TAX_IDS,
    );
    customerIds = customers.map((c) => c.customer_id);

    cookies = {
      director: await login(DIRECTOR),
      advisor: await login(ADVISOR),
    };
  });

  afterAll(async () => {
    await clean();
    await app.close();
  });

  it('assigning updates the same route: no copy, stops kept and visits generated', async () => {
    const created = await api('post', '/rutas', cookies.director, {
      nombre: ROUTE_NAME,
      zona_id: zoneId,
      dia_ejecucion: 'Lunes',
      frecuencia: 'Semanal',
      hora_inicio: '08:00',
      hora_fin: '17:00',
    });
    expect(created.status).toBe(201);
    const routeId: number = created.body.data.id;

    const stops = await api(
      'put',
      `/rutas/${routeId}/paradas`,
      cookies.director,
      {
        paradas: [
          { id_cliente: customerIds[0], orden: 1, hora_sugerida: '09:00' },
          { id_cliente: customerIds[1], orden: 2, hora_sugerida: '10:00' },
        ],
      },
    );
    expect(stops.status).toBe(200);

    // Mondays from Nov 2 to Nov 29, 2026: 4 weeks x 2 stops
    const assigned = await api(
      'post',
      `/rutas/${routeId}/asignar`,
      cookies.director,
      {
        id_asesor: advisorId,
        fecha_inicio: '2026-11-02',
        fecha_fin: '2026-11-29',
      },
    );
    expect(assigned.status).toBe(200);

    const routes: unknown[] = await ds.query(
      `SELECT route_id, status, sales_representative_id
       FROM "routes" WHERE name = $1`,
      [ROUTE_NAME],
    );
    expect(routes).toEqual([
      {
        route_id: routeId,
        status: 'ASIGNADA',
        sales_representative_id: advisorId,
      },
    ]);

    const [{ stops: savedStops, visits }]: { stops: number; visits: number }[] =
      await ds.query(
        `SELECT
           (SELECT count(*)::int FROM "route_stops" WHERE route_id = $1) AS stops,
           (SELECT count(*)::int FROM "visits"
             WHERE route_id = $1 AND sales_representative_id = $2) AS visits`,
        [routeId, advisorId],
      );
    expect(savedStops).toBe(2);
    expect(visits).toBe(8);

    const mine = await api('get', '/rutas', cookies.advisor);
    expect(mine.status).toBe(200);
    expect((mine.body.data as { id: number }[]).map((r) => r.id)).toEqual([
      routeId,
    ]);
  });
});
