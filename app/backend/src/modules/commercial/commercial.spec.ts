import { beforeEach, describe, expect, it } from 'vitest';
import { CreateOrderUseCase } from './application/create-order/create-order.use-case.js';
import { CreateQuotationUseCase } from './application/create-quotation/create-quotation.use-case.js';
import { GetOrderUseCase } from './application/get-order/get-order.use-case.js';
import { GetQuotationUseCase } from './application/get-quotation/get-quotation.use-case.js';
import { InMemoryOrderRepository } from './infrastructure/persistence/in-memory-order.repository.js';
import { InMemoryQuotationRepository } from './infrastructure/persistence/in-memory-quotation.repository.js';
import { ListOrdersUseCase } from './application/list-orders/list-orders.use-case.js';
import { ListQuotationsUseCase } from './application/list-quotations/list-quotations.use-case.js';
import type {
  AdvisorScopeResolver,
  CommercialRequester,
} from './application/ports/advisor-scope-resolver.port.js';
import { ForbiddenOperationException } from '../../domain-contracts/index.js';

// Same contract as auth's ResolveAdvisorScopeUseCase: an advisor always gets
// their own id (403 when asking for another), a director the requested or null.
const ADVISOR_IDS: Record<string, number> = { a1: 1, a2: 2 };
const scope: AdvisorScopeResolver = {
  execute: async (user, requested) => {
    if (user.role === 'DIRECTOR') return requested ?? null;
    const own = ADVISOR_IDS[user.id];
    if (requested !== undefined && requested !== own) {
      throw new ForbiddenOperationException('out of scope');
    }
    return own;
  },
};
const advisor1: CommercialRequester = {
  id: 'a1',
  email: 'a1@x',
  role: 'ADVISOR',
};
const advisor2: CommercialRequester = {
  id: 'a2',
  email: 'a2@x',
  role: 'ADVISOR',
};
const director: CommercialRequester = {
  id: 'd',
  email: 'd@x',
  role: 'DIRECTOR',
};

describe('Commercial Module Unit Tests', () => {
  let quotationRepo: InMemoryQuotationRepository;
  let orderRepo: InMemoryOrderRepository;
  let createQuotationUseCase: CreateQuotationUseCase;
  let getQuotationUseCase: GetQuotationUseCase;
  let createOrderUseCase: CreateOrderUseCase;
  let getOrderUseCase: GetOrderUseCase;

  beforeEach(() => {
    quotationRepo = new InMemoryQuotationRepository();
    orderRepo = new InMemoryOrderRepository();
    createQuotationUseCase = new CreateQuotationUseCase(quotationRepo);
    getQuotationUseCase = new GetQuotationUseCase(quotationRepo, scope);
    createOrderUseCase = new CreateOrderUseCase(orderRepo, quotationRepo);
    getOrderUseCase = new GetOrderUseCase(orderRepo, scope);
  });

  it('should create a quotation successfully with COP currency', async () => {
    const q = await createQuotationUseCase.execute({
      number: 'COT-2026-001',
      clientId: 15,
      advisorId: 2,
      visitId: 8,
      amount: 2500000,
    });

    expect(q.id).toBeDefined();
    expect(q.number).toBe('COT-2026-001');
    expect(q.currency).toBe('COP');
    expect(q.status).toBe('DRAFT');
    expect(q.amount).toBe(2500000);
  });

  it('should reject quotations with duplicate number', async () => {
    await createQuotationUseCase.execute({
      number: 'COT-DUPLICATE',
      clientId: 15,
      amount: 100000,
    });

    await expect(
      createQuotationUseCase.execute({
        number: 'COT-DUPLICATE',
        clientId: 16,
        amount: 200000,
      }),
    ).rejects.toThrow('already exists');
  });

  it('should create an order linked to an existing quotation', async () => {
    const q = await createQuotationUseCase.execute({
      number: 'COT-2026-002',
      clientId: 15,
      amount: 1200000,
    });

    const o = await createOrderUseCase.execute({
      number: 'PED-2026-001',
      clientId: 15,
      quotationId: q.id,
      amount: 1200000,
    });

    expect(o.id).toBeDefined();
    expect(o.quotationId).toBe(q.id);
    expect(o.status).toBe('PENDING');
  });

  it('should reject an order if referenced quotation does not exist', async () => {
    await expect(
      createOrderUseCase.execute({
        number: 'PED-INVALID-Q',
        clientId: 15,
        quotationId: 99999,
        amount: 500000,
      }),
    ).rejects.toThrow('does not exist');
  });

  it('should comply with QuotationReader and OrderReader from central contracts', async () => {
    const q = await createQuotationUseCase.execute({
      number: 'COT-READER',
      clientId: 30,
      amount: 300000,
    });

    const o = await createOrderUseCase.execute({
      number: 'PED-READER',
      clientId: 30,
      amount: 300000,
    });

    const fetchedQ = await getQuotationUseCase.execute(q.id!, director);
    expect(fetchedQ.number).toBe('COT-READER');

    const fetchedO = await getOrderUseCase.execute(o.id!, director);
    expect(fetchedO.number).toBe('PED-READER');

    const qContract = await quotationRepo.getQuotationById(q.id!);
    expect(qContract).not.toBeNull();
    expect(qContract?.quotationNumber).toBe('COT-READER');

    const oContract = await orderRepo.getOrderById(o.id!);
    expect(oContract).not.toBeNull();
    expect(oContract?.orderNumber).toBe('PED-READER');
  });

  describe('advisor scope (anti-IDOR)', () => {
    let scopedCreateQuotation: CreateQuotationUseCase;
    let scopedCreateOrder: CreateOrderUseCase;
    let listQuotations: ListQuotationsUseCase;
    let listOrders: ListOrdersUseCase;

    beforeEach(() => {
      scopedCreateQuotation = new CreateQuotationUseCase(quotationRepo, scope);
      scopedCreateOrder = new CreateOrderUseCase(
        orderRepo,
        quotationRepo,
        scope,
      );
      listQuotations = new ListQuotationsUseCase(quotationRepo, scope);
      listOrders = new ListOrdersUseCase(orderRepo, scope);
    });

    it('an advisor creates documents under their own id, never another', async () => {
      const q = await scopedCreateQuotation.execute({
        number: 'COT-A1',
        clientId: 1,
        amount: 10,
        requester: advisor1,
      });
      expect(q.advisorId).toBe(1);
      await expect(
        scopedCreateOrder.execute({
          number: 'PED-X',
          clientId: 1,
          amount: 10,
          advisorId: 2,
          requester: advisor1,
        }),
      ).rejects.toBeInstanceOf(ForbiddenOperationException);
    });

    it('an advisor reads only their own quotation or order', async () => {
      const q = await scopedCreateQuotation.execute({
        number: 'COT-OWN',
        clientId: 1,
        amount: 10,
        requester: advisor1,
      });
      const o = await scopedCreateOrder.execute({
        number: 'PED-OWN',
        clientId: 1,
        amount: 10,
        requester: advisor1,
      });
      await expect(getQuotationUseCase.execute(q.id!, advisor1)).resolves.toBe(
        q,
      );
      await expect(
        getQuotationUseCase.execute(q.id!, advisor2),
      ).rejects.toBeInstanceOf(ForbiddenOperationException);
      await expect(
        getOrderUseCase.execute(o.id!, advisor2),
      ).rejects.toBeInstanceOf(ForbiddenOperationException);
      await expect(
        getOrderUseCase.execute(o.id!, director),
      ).resolves.toBeDefined();
    });

    it('lists are scoped and paginated, newest first', async () => {
      for (const [n, who] of [
        ['COT-1', advisor1],
        ['COT-2', advisor2],
        ['COT-3', advisor1],
      ] as const) {
        await scopedCreateQuotation.execute({
          number: n,
          clientId: 1,
          amount: 10,
          requester: who,
        });
      }
      await scopedCreateOrder.execute({
        number: 'PED-2',
        clientId: 1,
        amount: 10,
        requester: advisor2,
      });

      const own = await listQuotations.execute({
        requester: advisor1,
        page: 1,
        limit: 10,
      });
      expect(own.data.map((item) => item.quotation.number)).toEqual([
        'COT-3',
        'COT-1',
      ]);
      expect(own.meta.total).toBe(2);

      const all = await listQuotations.execute({
        requester: director,
        page: 1,
        limit: 2,
      });
      expect(all.meta).toMatchObject({
        total: 3,
        totalPages: 2,
        hasNextPage: true,
      });

      const filtered = await listQuotations.execute({
        requester: director,
        advisorId: 2,
        page: 1,
        limit: 10,
      });
      expect(filtered.data.map((item) => item.quotation.number)).toEqual([
        'COT-2',
      ]);

      const orders = await listOrders.execute({
        requester: advisor1,
        page: 1,
        limit: 10,
      });
      expect(orders.meta.total).toBe(0);
    });
  });
});
