import { beforeEach, describe, expect, it } from 'vitest';
import { CreateOrderUseCase } from './application/create-order/create-order.use-case.js';
import { CreateQuotationUseCase } from './application/create-quotation/create-quotation.use-case.js';
import { GetOrderUseCase } from './application/get-order/get-order.use-case.js';
import { GetQuotationUseCase } from './application/get-quotation/get-quotation.use-case.js';
import { InMemoryOrderRepository } from './infrastructure/persistence/in-memory-order.repository.js';
import { InMemoryQuotationRepository } from './infrastructure/persistence/in-memory-quotation.repository.js';

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
    getQuotationUseCase = new GetQuotationUseCase(quotationRepo);
    createOrderUseCase = new CreateOrderUseCase(orderRepo, quotationRepo);
    getOrderUseCase = new GetOrderUseCase(orderRepo);
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

    const fetchedQ = await getQuotationUseCase.execute(q.id!);
    expect(fetchedQ.number).toBe('COT-READER');

    const fetchedO = await getOrderUseCase.execute(o.id!);
    expect(fetchedO.number).toBe('PED-READER');

    const qContract = await quotationRepo.getQuotationById(q.id!);
    expect(qContract).not.toBeNull();
    expect(qContract?.quotationNumber).toBe('COT-READER');

    const oContract = await orderRepo.getOrderById(o.id!);
    expect(oContract).not.toBeNull();
    expect(oContract?.orderNumber).toBe('PED-READER');
  });
});
