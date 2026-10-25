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
    method: 'get' | 'post' | 'put' | 'patch',
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
    await ds.query('DELETE FROM "follow_ups"');
    await ds.query('DELETE FROM "orders"');
    await ds.query('DELETE FROM "quotes"');
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
      ['get', '/commercial/quotations'],
      ['get', '/commercial/orders'],
      ['post', '/storage/upload-url'],
      ['get', '/storage/download-url?s3Key=x'],
      ['get', '/me'],
      ['get', '/clientes'],
      ['get', '/clientes/catalogos'],
      ['get', '/clientes/plantilla'],
      ['get', '/catalogos'],
      ['post', '/rutas'],
      ['get', '/rutas/asesores'],
      ['post', '/follow-ups'],
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

    // HU-12/13/14: one transaction writes the outcome, quotation, order,
    // follow-up and client history, each with its real foreign keys.
    it('a successful visit stores quotation, order, follow-up and history with their keys', async () => {
      const visitId = await insertVisit(advisorAId);
      const quoteNumber = `COT-E2E-${visitId}`;
      const orderNumber = `PED-E2E-${visitId}`;
      const res = await api('put', `/visits/${visitId}`, cookies.advisorA, {
        outcome: 'SUCCESSFUL',
        observations: 'HU13',
        quotation: { quotationNumber: quoteNumber, amount: 450000 },
        order: { orderNumber, amount: 450000 },
        followUp: {
          nextContactDate: '2026-11-02T10:00:00Z',
          activity: 'Confirmar despacho',
        },
      });
      expect(res.status).toBe(200);

      const [quote] = await ds.query(
        'SELECT quote_id, customer_id, sales_representative_id FROM "quotes" WHERE quote_number = $1',
        [quoteNumber],
      );
      expect(quote).toMatchObject({
        customer_id: customerId,
        sales_representative_id: advisorAId,
      });
      const [order] = await ds.query(
        'SELECT customer_id, quote_id FROM "orders" WHERE order_number = $1',
        [orderNumber],
      );
      expect(order).toMatchObject({
        customer_id: customerId,
        quote_id: quote.quote_id,
      });
      const followUps = await ds.query(
        'SELECT activity FROM "follow_ups" WHERE visit_id = $1',
        [visitId],
      );
      expect(followUps).toEqual([{ activity: 'Confirmar despacho' }]);
      const history = await ds.query(
        'SELECT action FROM "customer_history" WHERE customer_id = $1 AND description LIKE $2',
        [customerId, '%HU13%'],
      );
      expect(history.length).toBeGreaterThan(0);
    });

    it('a duplicated quotation number rolls back the whole visit → 409', async () => {
      const visitId = await insertVisit(advisorAId);
      const quoteNumber = `COT-DUP-${visitId}`;
      await ds.query(
        `INSERT INTO "quotes" (quote_number, date, amount, customer_id) VALUES ($1, CURRENT_DATE, 1, $2)`,
        [quoteNumber, customerId],
      );
      const res = await api('put', `/visits/${visitId}`, cookies.advisorA, {
        outcome: 'SUCCESSFUL',
        observations: 'HU13-dup',
        quotation: { quotationNumber: quoteNumber, amount: 1000 },
      });
      expect(res.status).toBe(409);
      const [visit] = await ds.query(
        'SELECT visit_status FROM "visits" WHERE visit_id = $1',
        [visitId],
      );
      expect(visit.visit_status).toBe('PENDIENTE');
      const results = await ds.query(
        'SELECT 1 FROM "visit_results" WHERE visit_id = $1',
        [visitId],
      );
      expect(results).toHaveLength(0);
    });
    it('a visit that does not exist → 404', async () => {
      expect(
        (await api('put', '/visits/999999', cookies.advisorA, body)).status,
      ).toBe(404);
    });
  });

  // HU-14: follow-ups are reachable and keep their lifecycle.
  // HU-19: presigned URLs, keys built by the server and owner-only downloads.
  describe('storage', () => {
    const requestUpload = (cookie: string[], body: object) =>
      api('post', '/storage/upload-url', cookie, body);
    const evidence = {
      purpose: 'visit-evidence',
      contentType: 'image/jpeg',
      fileSize: 2048,
    };

    it('returns a signed upload URL and a key the client did not choose', async () => {
      const res = await requestUpload(cookies.advisorA, {
        ...evidence,
        s3Key: 'anything/i/want.jpg',
      });
      expect(res.status).toBe(400); // unknown property s3Key is rejected
      const ok = await requestUpload(cookies.advisorA, evidence);
      expect(ok.status).toBe(201);
      expect(ok.body.data.s3Key).toMatch(
        /^visit-evidence\/[^/]+\/\d{4}\/\d{2}\//,
      );
      const signed = new URL(ok.body.data.uploadUrl).searchParams.get(
        'X-Amz-SignedHeaders',
      );
      expect(signed).toContain('content-length');
      expect(signed).toContain('content-type');
    });

    it('rejects a missing or oversized fileSize → 400', async () => {
      const { fileSize: _omit, ...withoutSize } = evidence;
      expect((await requestUpload(cookies.advisorA, withoutSize)).status).toBe(
        400,
      );
      expect(
        (
          await requestUpload(cookies.advisorA, {
            ...evidence,
            fileSize: 16 * 1024 * 1024,
          })
        ).status,
      ).toBe(400);
    });

    it('client import files are for directors only', async () => {
      const body = {
        purpose: 'client-import',
        contentType: 'text/csv',
        fileSize: 10,
      };
      expect((await requestUpload(cookies.advisorA, body)).status).toBe(403);
      expect((await requestUpload(cookies.director, body)).status).toBe(201);
    });

    it('only the owner or a director can download a key', async () => {
      const { body } = await requestUpload(cookies.advisorA, evidence);
      const key = encodeURIComponent(body.data.s3Key as string);
      const url = `/storage/download-url?s3Key=${key}`;
      expect((await api('get', url, cookies.advisorA)).status).toBe(200);
      expect((await api('get', url, cookies.advisorB)).status).toBe(403);
      expect((await api('get', url, cookies.director)).status).toBe(200);
      expect(
        (
          await api(
            'get',
            '/storage/download-url?s3Key=..%2Fsecret.jpg',
            cookies.director,
          )
        ).status,
      ).toBe(400);
    });
  });

  // HU-13: quotations and orders, scoped by advisor (anti-IDOR).
  describe('commercial', () => {
    it('an advisor creates, lists and reads only their own quotations and orders', async () => {
      const quote = await api(
        'post',
        '/commercial/quotations',
        cookies.advisorA,
        {
          quotationNumber: 'COT-E2E-A',
          clientId: customerId,
          amount: 120000,
        },
      );
      expect(quote.status).toBe(201);
      expect(quote.body.data.advisorId).toBe(advisorAId);

      const order = await api('post', '/commercial/orders', cookies.advisorA, {
        orderNumber: 'PED-E2E-A',
        clientId: customerId,
        quotationId: quote.body.data.id,
        amount: 120000,
      });
      expect(order.status).toBe(201);
      expect(order.body.data.advisorId).toBe(advisorAId);

      const own = await api('get', '/commercial/quotations', cookies.advisorA);
      expect(own.status).toBe(200);
      expect(own.body.meta).toMatchObject({ page: 1 });
      expect(
        (own.body.data as { advisorId: number }[]).every(
          (q) => q.advisorId === advisorAId,
        ),
      ).toBe(true);

      const other = await api(
        'get',
        '/commercial/quotations',
        cookies.advisorB,
      );
      expect(
        (other.body.data as { number: string }[]).map((q) => q.number),
      ).not.toContain('COT-E2E-A');

      expect(
        (
          await api(
            'get',
            `/commercial/quotations/${quote.body.data.id}`,
            cookies.advisorB,
          )
        ).status,
      ).toBe(403);
      expect(
        (
          await api(
            'get',
            `/commercial/orders/${order.body.data.id}`,
            cookies.advisorB,
          )
        ).status,
      ).toBe(403);
      expect(
        (
          await api(
            'get',
            `/commercial/orders/${order.body.data.id}`,
            cookies.director,
          )
        ).status,
      ).toBe(200);
    });

    it('an advisor cannot create a quotation for another advisor → 403', async () => {
      const res = await api(
        'post',
        '/commercial/quotations',
        cookies.advisorA,
        {
          quotationNumber: 'COT-E2E-X',
          clientId: customerId,
          advisorId: advisorBId,
          amount: 1,
        },
      );
      expect(res.status).toBe(403);
    });

    it('a director lists every advisor and can filter by one', async () => {
      const all = await api(
        'get',
        '/commercial/orders?limit=100',
        cookies.director,
      );
      expect(all.status).toBe(200);
      const filtered = await api(
        'get',
        `/commercial/quotations?advisorId=${advisorBId}`,
        cookies.director,
      );
      expect(
        (filtered.body.data as { advisorId: number }[]).every(
          (q) => q.advisorId === advisorBId,
        ),
      ).toBe(true);
    });
  });

  describe('GET /api/rutas', () => {
    it('an advisor sees only the routes assigned to them; a director all', async () => {
      const insertRoute = async (name: string, advisorId: number) => {
        const [row] = await ds.query(
          `INSERT INTO "routes" (name, sales_representative_id) VALUES ($1, $2) RETURNING route_id`,
          [name, advisorId],
        );
        return row.route_id as number;
      };
      const routeA = await insertRoute('Ruta E2E A', advisorAId);
      const routeB = await insertRoute('Ruta E2E B', advisorBId);

      const ids = async (cookie: string[]) =>
        (
          (await api('get', '/rutas', cookie)).body.data as { id: number }[]
        ).map((r) => r.id);
      const forA = await ids(cookies.advisorA);
      expect(forA).toContain(routeA);
      expect(forA).not.toContain(routeB);
      expect(await ids(cookies.director)).toEqual(
        expect.arrayContaining([routeA, routeB]),
      );
      await ds.query('DELETE FROM "routes" WHERE route_id = ANY($1)', [
        [routeA, routeB],
      ]);
    });
  });

  describe('follow-ups', () => {
    it('schedules, lists as pending and completes a follow-up', async () => {
      const visitId = await insertVisit(advisorAId);
      const created = await api('post', '/follow-ups', cookies.advisorA, {
        clientId: customerId,
        visitId,
        responsibleAdvisorId: advisorAId,
        nextContactDate: '2026-11-03T15:00:00Z',
        activity: 'Llamar para cierre',
      });
      expect(created.status).toBe(201);
      const followUpId = created.body.data.id as number;

      const pending = await api(
        'get',
        `/follow-ups/pending/${customerId}`,
        cookies.advisorA,
      );
      expect(pending.status).toBe(200);
      expect(
        (pending.body.data as { id: number }[]).map((f) => f.id),
      ).toContain(followUpId);

      const done = await api(
        'patch',
        `/follow-ups/${followUpId}/complete`,
        cookies.advisorA,
      );
      expect(done.status).toBe(200);
      const after = await api(
        'get',
        `/follow-ups/pending/${customerId}`,
        cookies.advisorA,
      );
      expect(
        (after.body.data as { id: number }[]).map((f) => f.id),
      ).not.toContain(followUpId);
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
    it('the web flow: unplanned visit, then outcome with quotation, order and end time', async () => {
      const created = await api('post', '/visits', cookies.advisorA, {
        clientId: customerId,
        scheduledDate: DATE,
        startTime: '10:15',
        objective: 'Presentación de catálogo',
      });
      expect(created.status).toBe(201);
      const visitId = created.body.data.id as number;

      const closed = await api('put', `/visits/${visitId}`, cookies.advisorA, {
        outcome: 'SUCCESSFUL',
        observations: 'Cliente interesado',
        endTime: `${DATE}T11:30:00`,
        quotation: {
          quotationNumber: 'COT-WEB-0001',
          amount: 1200000,
          currency: 'COP',
        },
        order: { orderNumber: 'PED-WEB-0001', amount: 900000 },
        followUp: { nextContactDate: DATE, activity: 'Llamar al cliente' },
      });
      expect(closed.status).toBe(200);
      expect(closed.body.data.quotationId).toEqual(expect.any(Number));
      expect(closed.body.data.orderId).toEqual(expect.any(Number));

      const quotations = await api(
        'get',
        '/commercial/quotations',
        cookies.advisorA,
      );
      expect(
        (
          quotations.body.data as Array<{ number: string; visitId: number }>
        ).find((q) => q.number === 'COT-WEB-0001')?.visitId,
      ).toBe(visitId);
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
