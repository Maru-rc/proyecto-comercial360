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
const ADVISOR_A: Cred = {
  email: 'advisor.a.hu10@comercial360.com',
  password: 'AdvisorA-Hu10-123!',
};
const ADVISOR_B: Cred = {
  email: 'advisor.b.hu10@comercial360.com',
  password: 'AdvisorB-Hu10-123!',
};
const DIRECTOR: Cred = {
  email: 'director.hu10@comercial360.com',
  password: 'Director-Hu10-123!',
};
const UNLINKED_ADVISOR: Cred = {
  email: 'unlinked.hu10@comercial360.com',
  password: 'Unlinked-Hu10-123!',
};
const DATE = '2026-10-22';

describe('HU-10: role-based access control (e2e, real endpoints)', () => {
  let app: INestApplication;
  let ds: DataSource;
  let advisorAId: number;
  let advisorBId: number;
  let visitA: number;
  let visitB: number;
  let customerId: number;
  let cookies: Record<
    'advisorA' | 'advisorB' | 'director' | 'unlinked',
    string[]
  >;

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
    cookie: string[] = [],
    body?: object,
  ) => {
    const req = request(app.getHttpServer())
      [method](`/api${url}`)
      .set('Cookie', cookie);
    return body ? req.send(body) : req;
  };
  const clean = async () => {
    await ds.query('DELETE FROM "visit_results"');
    await ds.query('DELETE FROM "visits"');
    await ds.query(`DELETE FROM "customers" WHERE tax_id = 'HU10-TEST'`);
    await ds.query('DELETE FROM "user"');
    await ds.query('DELETE FROM "sales_representatives"');
  };
  const insertVisit = async (advisorId: number) => {
    const rows: { visit_id: number }[] = await ds.query(
      `INSERT INTO "visits" (scheduled_at, visit_status, customer_id, sales_representative_id)
       VALUES ($1, 'PENDIENTE', $2, $3) RETURNING visit_id`,
      [`${DATE} 09:00:00`, customerId, advisorId],
    );
    return rows[0].visit_id;
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
    ds = app.get(DataSource);
    const auth = app.get<Auth>(AUTH);

    await clean();
    await seedDemoUsers(auth, ds, [
      {
        name: 'Advisor A',
        ...ADVISOR_A,
        role: 'ADVISOR',
        advisor: { phone: '1' },
      },
      {
        name: 'Advisor B',
        ...ADVISOR_B,
        role: 'ADVISOR',
        advisor: { phone: '2' },
      },
      { name: 'Director', ...DIRECTOR, role: 'DIRECTOR' },
      { name: 'Unlinked Advisor', ...UNLINKED_ADVISOR, role: 'ADVISOR' }, // no row in sales_representatives
    ]);
    const advisors: { sales_representative_id: number; email: string }[] =
      await ds.query(
        'SELECT sales_representative_id, email FROM "sales_representatives"',
      );
    advisorAId = advisors.find(
      (a) => a.email === ADVISOR_A.email,
    )!.sales_representative_id;
    advisorBId = advisors.find(
      (a) => a.email === ADVISOR_B.email,
    )!.sales_representative_id;

    const customer: { customer_id: number }[] = await ds.query(
      `INSERT INTO "customers" (tax_id, legal_name) VALUES ('HU10-TEST', 'HU10 Customer') RETURNING customer_id`,
    );
    customerId = customer[0].customer_id;
    visitA = await insertVisit(advisorAId);
    visitB = await insertVisit(advisorBId);

    cookies = {
      advisorA: await login(ADVISOR_A),
      advisorB: await login(ADVISOR_B),
      director: await login(DIRECTOR),
      unlinked: await login(UNLINKED_ADVISOR),
    };
  });

  afterAll(async () => {
    // Leave the database clean: other e2e suites delete advisors, and visits reference them
    await clean();
    await app.close();
  });

  describe('without a session → 401 on every protected endpoint', () => {
    it.each([
      ['get', `/visits/agenda?date=${DATE}`],
      ['get', '/visits/map'],
      ['get', '/visits/1'],
      ['post', '/visits'],
      ['put', '/visits/1'],
      ['get', '/dashboard/kpis'],
      ['get', '/visitas/seguimiento'],
      ['get', '/reportes/seguimiento.csv'],
      ['post', '/commercial/quotations'],
      ['get', '/commercial/orders/1'],
      ['post', '/storage/upload-url'],
      ['get', '/storage/download-url?s3Key=x'],
      ['get', '/me'],
    ] as const)('%s %s', async (method, url) => {
      expect((await api(method, url)).status).toBe(401);
    });

    it('a forged cookie → 401', async () => {
      const res = await api('get', '/visits/agenda', [
        'better-auth.session_token=falsa',
      ]);
      expect(res.status).toBe(401);
    });
  });

  describe('public routes stay public', () => {
    it('GET /api and GET /api/health do not ask for a session', async () => {
      expect((await api('get', '')).status).toBe(200);
      expect((await api('get', '/health')).status).not.toBe(401);
    });
  });

  describe('GET /api/visits/agenda', () => {
    it('an advisor sees only their own agenda', async () => {
      const res = await api(
        'get',
        `/visits/agenda?date=${DATE}`,
        cookies.advisorA,
      );
      expect(res.status).toBe(200);
      expect(res.body.data.map((v: { id: number }) => v.id)).toEqual([visitA]);
    });
    it('an advisor may explicitly ask for their own id', async () => {
      const res = await api(
        'get',
        `/visits/agenda?date=${DATE}&advisorId=${advisorAId}`,
        cookies.advisorA,
      );
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
    it('an advisor cannot ask for another advisor agenda → 403', async () => {
      const res = await api(
        'get',
        `/visits/agenda?date=${DATE}&advisorId=${advisorBId}`,
        cookies.advisorA,
      );
      expect(res.status).toBe(403);
    });
    it('the other advisor only sees their own', async () => {
      const res = await api(
        'get',
        `/visits/agenda?date=${DATE}`,
        cookies.advisorB,
      );
      expect(res.body.data.map((v: { id: number }) => v.id)).toEqual([visitB]);
    });
    it('a director sees every advisor agenda', async () => {
      const res = await api(
        'get',
        `/visits/agenda?date=${DATE}`,
        cookies.director,
      );
      expect(res.status).toBe(200);
      expect(
        res.body.data
          .map((v: { id: number }) => v.id)
          .sort((a: number, b: number) => a - b),
      ).toEqual([visitA, visitB].sort((a, b) => a - b));
    });
    it('a director can filter by advisor', async () => {
      const res = await api(
        'get',
        `/visits/agenda?date=${DATE}&advisorId=${advisorBId}`,
        cookies.director,
      );
      expect(res.body.data.map((v: { id: number }) => v.id)).toEqual([visitB]);
    });
    it('an advisor without a linked record → 403', async () => {
      expect(
        (await api('get', `/visits/agenda?date=${DATE}`, cookies.unlinked))
          .status,
      ).toBe(403);
    });
    it('sending a role in a header does not raise privileges', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/visits/agenda?date=${DATE}`)
        .set('Cookie', cookies.advisorA)
        .set('X-Role', 'DIRECTOR');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('GET /api/visits/map', () => {
    it('an advisor cannot see another advisor map → 403', async () => {
      expect(
        (
          await api(
            'get',
            `/visits/map?date=${DATE}&advisorId=${advisorBId}`,
            cookies.advisorA,
          )
        ).status,
      ).toBe(403);
    });
    it('an advisor sees their map and a director sees anyone map', async () => {
      expect(
        (await api('get', `/visits/map?date=${DATE}`, cookies.advisorA)).status,
      ).toBe(200);
      expect(
        (
          await api(
            'get',
            `/visits/map?date=${DATE}&advisorId=${advisorBId}`,
            cookies.director,
          )
        ).status,
      ).toBe(200);
    });
  });

  describe('GET /api/visits/:id', () => {
    it('an advisor sees their own visit', async () => {
      const res = await api('get', `/visits/${visitA}`, cookies.advisorA);
      expect(res.status).toBe(200);
      expect(res.body.data.advisorId).toBe(advisorAId);
    });
    it('an advisor cannot see another advisor visit → 403', async () => {
      expect(
        (await api('get', `/visits/${visitB}`, cookies.advisorA)).status,
      ).toBe(403);
    });
    it('a director sees any visit', async () => {
      expect(
        (await api('get', `/visits/${visitB}`, cookies.director)).status,
      ).toBe(200);
    });
    it('a visit that does not exist → 404', async () => {
      expect(
        (await api('get', '/visits/999999', cookies.director)).status,
      ).toBe(404);
    });
    it('an advisor without a linked record → 403', async () => {
      expect(
        (await api('get', `/visits/${visitA}`, cookies.unlinked)).status,
      ).toBe(403);
    });
  });

  describe('PUT /api/visits/:id (record outcome)', () => {
    const body = {
      outcome: 'NO_SALE',
      reasonNoSale: 'No credit available',
      observations: 'HU10',
    };
    it('an advisor cannot record on another advisor visit → 403 and nothing changes', async () => {
      const res = await api('put', `/visits/${visitB}`, cookies.advisorA, body);
      expect(res.status).toBe(403);
      const rows: { visit_status: string }[] = await ds.query(
        'SELECT visit_status FROM "visits" WHERE visit_id = $1',
        [visitB],
      );
      expect(rows[0].visit_status).toBe('PENDIENTE');
      const results = await ds.query(
        'SELECT 1 FROM "visit_results" WHERE visit_id = $1',
        [visitB],
      );
      expect(results).toHaveLength(0);
    });
    it('an advisor records the outcome of their own visit → 200', async () => {
      const res = await api('put', `/visits/${visitA}`, cookies.advisorA, body);
      expect(res.status).toBe(200);
      expect(res.body.data.visitId).toBe(visitA);
    });
    it('a visit that does not exist → 404', async () => {
      expect(
        (await api('put', '/visits/999999', cookies.advisorA, body)).status,
      ).toBe(404);
    });
  });

  describe('POST /api/visits', () => {
    const base = { clientId: 0, scheduledDate: DATE };
    it('an advisor creates the visit under their own name without sending advisorId', async () => {
      const res = await api('post', '/visits', cookies.advisorA, {
        ...base,
        clientId: customerId,
      });
      expect(res.status).toBe(201);
      expect(res.body.data.advisorId).toBe(advisorAId);
    });
    it('an advisor cannot create a visit for another advisor → 403', async () => {
      const res = await api('post', '/visits', cookies.advisorA, {
        ...base,
        clientId: customerId,
        advisorId: advisorBId,
      });
      expect(res.status).toBe(403);
    });
    it('a director must say which advisor → 400 when missing', async () => {
      const res = await api('post', '/visits', cookies.director, {
        ...base,
        clientId: customerId,
      });
      expect(res.status).toBe(400);
    });
    it('a director creates a visit for a specific advisor', async () => {
      const res = await api('post', '/visits', cookies.director, {
        ...base,
        clientId: customerId,
        advisorId: advisorBId,
      });
      expect(res.status).toBe(201);
      expect(res.body.data.advisorId).toBe(advisorBId);
    });
  });

  describe('KPIs and tracking', () => {
    it('GET /dashboard/kpis: advisor and director → 200', async () => {
      expect(
        (await api('get', '/dashboard/kpis', cookies.advisorA)).status,
      ).toBe(200);
      expect(
        (await api('get', '/dashboard/kpis', cookies.director)).status,
      ).toBe(200);
    });
    it('GET /dashboard/kpis: advisor without a linked record → 403', async () => {
      expect(
        (await api('get', '/dashboard/kpis', cookies.unlinked)).status,
      ).toBe(403);
    });
    it('GET /visitas/seguimiento: an advisor cannot ask for another advisor → 403', async () => {
      expect(
        (
          await api(
            'get',
            `/visitas/seguimiento?asesor=${advisorBId}`,
            cookies.advisorA,
          )
        ).status,
      ).toBe(403);
    });
    it('GET /visitas/seguimiento: advisor (own) and director (any) → 200', async () => {
      expect(
        (
          await api(
            'get',
            `/visitas/seguimiento?asesor=${advisorAId}`,
            cookies.advisorA,
          )
        ).status,
      ).toBe(200);
      expect(
        (
          await api(
            'get',
            `/visitas/seguimiento?asesor=${advisorBId}`,
            cookies.director,
          )
        ).status,
      ).toBe(200);
    });
    it('GET /reportes/seguimiento.csv: an advisor cannot export another advisor → 403', async () => {
      expect(
        (
          await api(
            'get',
            `/reportes/seguimiento.csv?asesor=${advisorBId}`,
            cookies.advisorA,
          )
        ).status,
      ).toBe(403);
      expect(
        (
          await api(
            'get',
            `/reportes/seguimiento.csv?asesor=${advisorBId}`,
            cookies.director,
          )
        ).status,
      ).toBe(200);
    });
  });
});
