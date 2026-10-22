import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import type {
  ClientReader,
  OrderReader,
  OrderContractDto,
} from '../../domain-contracts/index.js';
import { Visit } from './domain/entities/visit.entity.js';
import { VisitOutcome } from './domain/entities/visit-outcome.entity.js';
import { ListAgendaUseCase } from './application/list-agenda/list-agenda.use-case.js';
import { GetMapUseCase } from './application/get-map/get-map.use-case.js';
import { RecordVisitUseCase } from './application/record-visit/record-visit.use-case.js';
import { ScheduleVisitUseCase } from './application/schedule-visit/schedule-visit.use-case.js';
import { GetVisitUseCase } from './application/get-visit/get-visit.use-case.js';
import { InMemoryVisitRepository } from './infrastructure/persistence/in-memory-visit.repository.js';
import {
  InMemoryVisitUnitOfWork,
  type InMemoryFollowUpStore,
  type InMemoryHistoryStore,
  type InMemoryOrderStore,
  type InMemoryQuotationStore,
} from './infrastructure/persistence/in-memory-visit-unit-of-work.js';

class MockQuotationStore implements InMemoryQuotationStore {
  public quotations: any[] = [];
  public autoIncrementId = 1;

  async findByNumber(number: string) {
    return this.quotations.find((q) => q.number === number) ?? null;
  }

  async save(quotation: any) {
    const record = { id: this.autoIncrementId++, ...quotation };
    this.quotations.push(record);
    return record;
  }
}

class MockOrderStore implements InMemoryOrderStore, OrderReader {
  public orders: any[] = [];
  public autoIncrementId = 1;

  async findByNumber(number: string) {
    return this.orders.find((o) => o.number === number) ?? null;
  }

  async save(order: any) {
    if (order.amount <= 0) {
      throw new BadRequestException('Order amount must be greater than zero');
    }
    const record = { id: this.autoIncrementId++, ...order };
    this.orders.push(record);
    return record;
  }

  async getOrderById(id: number): Promise<OrderContractDto | null> {
    const order = this.orders.find((o) => o.id === id);
    if (!order) return null;
    return {
      id: order.id,
      orderNumber: order.orderNumber ?? order.number ?? `ORD-${order.id}`,
      number: order.number ?? order.orderNumber ?? `ORD-${order.id}`,
      visitId: order.visitId ?? null,
      quotationId: order.quotationId ?? null,
      clientId: order.clientId,
      advisorId: order.advisorId,
      amount: order.amount,
      status: order.status ?? 'PENDING',
      date: order.date,
      estimatedDeliveryDate: order.estimatedDeliveryDate ?? null,
      createdAt: order.createdAt,
    };
  }

  async hasOrderByVisit(visitId: number): Promise<boolean> {
    return this.orders.some((o) => o.visitId === visitId);
  }
}

class MockFollowUpStore implements InMemoryFollowUpStore {
  public followUps: any[] = [];
  public autoIncrementId = 1;

  async save(followUp: any) {
    if (!followUp.activity || followUp.activity.trim().length === 0) {
      throw new BadRequestException('Follow-up activity is required');
    }
    const record = { id: this.autoIncrementId++, ...followUp };
    this.followUps.push(record);
    return record;
  }

  async findAll() {
    return this.followUps;
  }
}

class MockHistoryStore implements InMemoryHistoryStore {
  public entries: any[] = [];
  public autoIncrementId = 1;

  async save(entry: any) {
    const record = { id: this.autoIncrementId++, ...entry };
    this.entries.push(record);
    return record;
  }

  async findAll() {
    return this.entries;
  }
}

describe('Milestone 3 Visits Domain & Operational Backbone', () => {
  let visitRepo: InMemoryVisitRepository;
  let quotationRepo: MockQuotationStore;
  let orderRepo: MockOrderStore;
  let followUpRepo: MockFollowUpStore;
  let historyRepo: MockHistoryStore;
  let unitOfWork: InMemoryVisitUnitOfWork;

  let listAgendaUseCase: ListAgendaUseCase;
  let getMapUseCase: GetMapUseCase;
  let recordVisitUseCase: RecordVisitUseCase;
  let scheduleVisitUseCase: ScheduleVisitUseCase;
  let getVisitUseCase: GetVisitUseCase;

  const mockClientReader: ClientReader = {
    existsById: vi.fn().mockResolvedValue(true),
    getSummaryById: vi.fn().mockImplementation(async (id: number) => ({
      id,
      nit: `NIT-${id}`,
      legalName: `Client ${id}`,
      address: `Street ${id} #10-20`,
      isActive: true,
      potential: 'HIGH',
      primaryContact: { name: 'Pedro Gomez', phone: '3001234567' },
    })),
    getCoordinatesById: vi
      .fn()
      .mockResolvedValue({ latitude: 4.6097, longitude: -74.0817 }),
  };

  beforeEach(() => {
    visitRepo = new InMemoryVisitRepository();
    quotationRepo = new MockQuotationStore();
    orderRepo = new MockOrderStore();
    followUpRepo = new MockFollowUpStore();
    historyRepo = new MockHistoryStore();

    unitOfWork = new InMemoryVisitUnitOfWork(
      visitRepo,
      quotationRepo,
      orderRepo,
      followUpRepo,
      historyRepo,
    );

    listAgendaUseCase = new ListAgendaUseCase(visitRepo, mockClientReader);
    getMapUseCase = new GetMapUseCase(visitRepo, mockClientReader, orderRepo);
    recordVisitUseCase = new RecordVisitUseCase(unitOfWork);
    scheduleVisitUseCase = new ScheduleVisitUseCase(visitRepo);
    getVisitUseCase = new GetVisitUseCase(visitRepo);
  });

  describe('HU-10: Agenda Query with Potential & Active Visit', () => {
    it('should return scheduled visits with client potential and identify the active visit', async () => {
      // 1. Visit 1: Completed
      await visitRepo.save(
        Visit.create({
          clientId: 101,
          advisorId: 1,
          scheduledDate: new Date('2026-10-22T08:00:00Z'),
          visitOrder: 1,
          visitStatus: 'COMPLETED',
        }),
      );

      // 2. Visit 2: In progress (Active)
      const v2 = await visitRepo.save(
        Visit.create({
          clientId: 102,
          advisorId: 1,
          scheduledDate: new Date('2026-10-22T10:00:00Z'),
          visitOrder: 2,
          visitStatus: 'IN_PROGRESS',
        }),
      );

      // 3. Visit 3: Scheduled
      await visitRepo.save(
        Visit.create({
          clientId: 103,
          advisorId: 1,
          scheduledDate: new Date('2026-10-22T14:00:00Z'),
          visitOrder: 3,
          visitStatus: 'SCHEDULED',
        }),
      );

      const agenda = await listAgendaUseCase.execute({
        date: '2026-10-22',
        advisorId: 1,
      });

      expect(agenda).toHaveLength(3);
      expect(agenda[0].potential).toBe('HIGH');
      expect(agenda[0].isCurrent).toBe(false);

      // Visit 2 must be marked active / current
      expect(agenda[1].id).toBe(v2.id);
      expect(agenda[1].isCurrent).toBe(true);
      expect(agenda[1].active).toBe(true);
      expect(agenda[1].primaryContact?.name).toBe('Pedro Gomez');

      // Visit 3 is not active because v2 was in progress
      expect(agenda[2].isCurrent).toBe(false);
    });

    it('should pick first SCHEDULED visit as active when none are IN_PROGRESS', async () => {
      const v1 = await visitRepo.save(
        Visit.create({
          clientId: 201,
          advisorId: 2,
          scheduledDate: new Date('2026-10-23T08:00:00Z'),
          visitOrder: 1,
          visitStatus: 'SCHEDULED',
        }),
      );
      await visitRepo.save(
        Visit.create({
          clientId: 202,
          advisorId: 2,
          scheduledDate: new Date('2026-10-23T11:00:00Z'),
          visitOrder: 2,
          visitStatus: 'SCHEDULED',
        }),
      );

      const agenda = await listAgendaUseCase.execute({
        date: '2026-10-23',
        advisorId: 2,
      });

      expect(agenda).toHaveLength(2);
      expect(agenda[0].id).toBe(v1.id);
      expect(agenda[0].isCurrent).toBe(true);
      expect(agenda[1].isCurrent).toBe(false);
    });
  });

  describe('HU-11: Map Query & Dynamic Pin Color Calculation', () => {
    it('should assign ORDER_CLOSED (blue) when visit is completed AND order exists', async () => {
      const v = await visitRepo.save(
        Visit.create({
          clientId: 301,
          advisorId: 1,
          scheduledDate: new Date('2026-10-22T09:00:00Z'),
          visitStatus: 'COMPLETED',
        }),
      );
      await visitRepo.saveOutcome(
        VisitOutcome.create({
          visitId: v.id!,
          outcome: 'SUCCESSFUL',
        }),
      );
      // Link order to this visit
      await orderRepo.save({
        number: 'PED-MAP-01',
        clientId: 301,
        visitId: v.id!,
        amount: 750000,
      });

      const mapStops = await getMapUseCase.execute({
        date: '2026-10-22',
        advisorId: 1,
      });

      expect(mapStops).toHaveLength(1);
      expect(mapStops[0].pinStatus).toBe('ORDER_CLOSED');
      expect(mapStops[0].color).toBe('blue');
      expect(mapStops[0].colorHex).toBe('#3b82f6');
    });

    it('should assign VISITED (green) when visit is completed BUT NO order was placed', async () => {
      const v = await visitRepo.save(
        Visit.create({
          clientId: 302,
          advisorId: 1,
          scheduledDate: new Date('2026-10-22T11:00:00Z'),
          visitStatus: 'COMPLETED',
        }),
      );
      await visitRepo.saveOutcome(
        VisitOutcome.create({
          visitId: v.id!,
          outcome: 'NO_SALE',
          reasonNoSale: 'No current budget',
        }),
      );

      const mapStops = await getMapUseCase.execute({
        date: '2026-10-22',
        advisorId: 1,
      });

      expect(mapStops).toHaveLength(1);
      expect(mapStops[0].pinStatus).toBe('VISITED');
      expect(mapStops[0].color).toBe('green');
      expect(mapStops[0].colorHex).toBe('#22c55e');
    });

    it('should assign RESCHEDULED (red), NOT_VISITED (gray), and PENDING (orange) accurately', async () => {
      await visitRepo.save(
        Visit.create({
          clientId: 303,
          advisorId: 1,
          scheduledDate: new Date('2026-10-22T13:00:00Z'),
          visitOrder: 1,
          visitStatus: 'RESCHEDULED',
        }),
      );
      await visitRepo.save(
        Visit.create({
          clientId: 304,
          advisorId: 1,
          scheduledDate: new Date('2026-10-22T15:00:00Z'),
          visitOrder: 2,
          visitStatus: 'CANCELLED',
        }),
      );
      await visitRepo.save(
        Visit.create({
          clientId: 305,
          advisorId: 1,
          scheduledDate: new Date('2026-10-22T17:00:00Z'),
          visitOrder: 3,
          visitStatus: 'SCHEDULED',
        }),
      );

      const mapStops = await getMapUseCase.execute({
        date: '2026-10-22',
        advisorId: 1,
      });

      expect(mapStops).toHaveLength(3);

      expect(mapStops[0].pinStatus).toBe('RESCHEDULED');
      expect(mapStops[0].color).toBe('red');
      expect(mapStops[0].colorHex).toBe('#ef4444');

      expect(mapStops[1].pinStatus).toBe('NOT_VISITED');
      expect(mapStops[1].color).toBe('gray');
      expect(mapStops[1].colorHex).toBe('#6b7280');

      expect(mapStops[2].pinStatus).toBe('PENDING');
      expect(mapStops[2].color).toBe('orange');
      expect(mapStops[2].colorHex).toBe('#f97316');
    });
  });

  describe('HU-12: Visit Registration & Invariants', () => {
    it('Mode 1: should record outcome for a scheduled visit', async () => {
      const v = await visitRepo.save(
        Visit.create({
          clientId: 401,
          advisorId: 2,
          scheduledDate: new Date('2026-10-24'),
          visitStatus: 'SCHEDULED',
        }),
      );

      const res = await recordVisitUseCase.execute({
        visitId: v.id!,
        outcome: 'SUCCESSFUL',
        observations: 'Client satisfied with the presentation',
        endTime: '10:30',
      });

      expect(res.visitId).toBe(v.id);
      expect(res.outcome).toBe('SUCCESSFUL');

      const updated = await visitRepo.findById(v.id!);
      expect(updated?.visitStatus).toBe('COMPLETED');
      expect(updated?.endTime).toBe('10:30');
    });

    it('Mode 2: should create and complete an unplanned (spontaneous) visit', async () => {
      const res = await recordVisitUseCase.execute({
        clientId: 402,
        advisorId: 3,
        outcome: 'SUCCESSFUL',
        observations: 'Spontaneous visit due to geographic proximity',
        endTime: '16:45',
      });

      expect(res.visitId).toBeDefined();
      expect(res.outcome).toBe('SUCCESSFUL');

      const saved = await visitRepo.findById(res.visitId);
      expect(saved).not.toBeNull();
      expect(saved?.clientId).toBe(402);
      expect(saved?.advisorId).toBe(3);
      expect(saved?.visitStatus).toBe('COMPLETED');
    });

    it('should schedule a visit via ScheduleVisitUseCase and retrieve it via GetVisitUseCase', async () => {
      const scheduled = await scheduleVisitUseCase.execute({
        clientId: 405,
        advisorId: 1,
        scheduledDate: '2026-10-30',
        objective: 'Catalog presentation',
      });

      expect(scheduled.id).toBeDefined();

      const retrieved = await getVisitUseCase.execute(scheduled.id!);
      expect(retrieved.id).toBe(scheduled.id);
      expect(retrieved.clientId).toBe(405);
      expect(retrieved.objective).toBe('Catalog presentation');
    });

    it('should throw NotFoundException when visit does not exist', async () => {
      await expect(getVisitUseCase.execute(999999)).rejects.toThrow(
        NotFoundException,
      );
      await expect(
        recordVisitUseCase.execute({
          visitId: 999999,
          outcome: 'SUCCESSFUL',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject observations exceeding 500 characters', async () => {
      const v = await visitRepo.save(
        Visit.create({
          clientId: 403,
          advisorId: 1,
          scheduledDate: new Date('2026-10-24'),
        }),
      );

      const longObs = 'x'.repeat(501);
      await expect(
        recordVisitUseCase.execute({
          visitId: v.id!,
          outcome: 'SUCCESSFUL',
          observations: longObs,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should automatically create a new pending visit when outcome is RESCHEDULED', async () => {
      const v = await visitRepo.save(
        Visit.create({
          clientId: 404,
          advisorId: 1,
          scheduledDate: new Date('2026-10-24'),
          visitStatus: 'SCHEDULED',
          objective: 'Initial presentation',
        }),
      );

      const nextDate = new Date('2026-10-29T09:00:00Z');
      const res = await recordVisitUseCase.execute({
        visitId: v.id!,
        outcome: 'RESCHEDULED',
        rescheduledDate: nextDate,
        observations: 'Client out of town',
      });

      expect(res.rescheduledVisitId).toBeDefined();

      const oldVisit = await visitRepo.findById(v.id!);
      expect(oldVisit?.visitStatus).toBe('RESCHEDULED');

      const newVisit = await visitRepo.findById(res.rescheduledVisitId!);
      expect(newVisit).not.toBeNull();
      expect(newVisit?.clientId).toBe(404);
      expect(newVisit?.advisorId).toBe(1);
      expect(newVisit?.visitStatus).toBe('SCHEDULED');
      expect(newVisit?.scheduledDate.toISOString()).toBe(
        nextDate.toISOString(),
      );
    });
  });

  describe('ACID Transaction Boundary & 4 Rollback Scenarios', () => {
    it('ROLLBACK SCENARIO 1: Invalid order amount (<= 0) rolls back entire transaction', async () => {
      const initialVisit = await visitRepo.save(
        Visit.create({
          clientId: 501,
          advisorId: 1,
          scheduledDate: new Date('2026-10-25'),
          visitStatus: 'SCHEDULED',
        }),
      );

      const input = {
        visitId: initialVisit.id!,
        outcome: 'SUCCESSFUL' as const,
        observations: 'Sale with invalid order',
        quotation: { number: 'COT-ROLL-01', amount: 250000 },
        order: { number: 'PED-INVALID-01', amount: 0 }, // INVALID: Order.create rejects <= 0
      };

      await expect(recordVisitUseCase.execute(input)).rejects.toThrow();

      // VERIFY ROLLBACK: Visit remains SCHEDULED, no quote, no order, no history
      const visitAfter = await visitRepo.findById(initialVisit.id!);
      expect(visitAfter?.visitStatus).toBe('SCHEDULED');
      expect(await visitRepo.findOutcomeByVisit(initialVisit.id!)).toBeNull();
      expect(await quotationRepo.findByNumber('COT-ROLL-01')).toBeNull();
      expect(await orderRepo.findByNumber('PED-INVALID-01')).toBeNull();
      expect(await historyRepo.findAll()).toHaveLength(0);
    });

    it('ROLLBACK SCENARIO 2: Duplicate order number throws ConflictException and rolls back visit/quote', async () => {
      // Seed existing order
      await orderRepo.save({
        number: 'PED-EXISTING-01',
        clientId: 502,
        amount: 150000,
      });

      const initialVisit = await visitRepo.save(
        Visit.create({
          clientId: 502,
          advisorId: 1,
          scheduledDate: new Date('2026-10-25'),
          visitStatus: 'SCHEDULED',
        }),
      );

      const input = {
        visitId: initialVisit.id!,
        outcome: 'SUCCESSFUL' as const,
        quotation: { number: 'COT-ROLL-02', amount: 350000 },
        order: { number: 'PED-EXISTING-01', amount: 350000 }, // DUPLICATE!
      };

      await expect(recordVisitUseCase.execute(input)).rejects.toThrow(
        ConflictException,
      );

      const visitAfter = await visitRepo.findById(initialVisit.id!);
      expect(visitAfter?.visitStatus).toBe('SCHEDULED');
      expect(await visitRepo.findOutcomeByVisit(initialVisit.id!)).toBeNull();
      expect(await quotationRepo.findByNumber('COT-ROLL-02')).toBeNull();
      expect(await historyRepo.findAll()).toHaveLength(0);
    });

    it('ROLLBACK SCENARIO 3: Duplicate quotation number throws ConflictException and rolls back visit', async () => {
      await quotationRepo.save({
        number: 'COT-EXISTING-01',
        clientId: 503,
        amount: 200000,
      });

      const initialVisit = await visitRepo.save(
        Visit.create({
          clientId: 503,
          advisorId: 1,
          scheduledDate: new Date('2026-10-25'),
          visitStatus: 'SCHEDULED',
        }),
      );

      const input = {
        visitId: initialVisit.id!,
        outcome: 'SUCCESSFUL' as const,
        quotation: { number: 'COT-EXISTING-01', amount: 400000 }, // DUPLICATE!
      };

      await expect(recordVisitUseCase.execute(input)).rejects.toThrow(
        ConflictException,
      );

      const visitAfter = await visitRepo.findById(initialVisit.id!);
      expect(visitAfter?.visitStatus).toBe('SCHEDULED');
      expect(await visitRepo.findOutcomeByVisit(initialVisit.id!)).toBeNull();
      expect(await historyRepo.findAll()).toHaveLength(0);
    });

    it('ROLLBACK SCENARIO 4: Follow-up validation error (empty activity) rolls back all records', async () => {
      const initialVisit = await visitRepo.save(
        Visit.create({
          clientId: 504,
          advisorId: 1,
          scheduledDate: new Date('2026-10-25'),
          visitStatus: 'SCHEDULED',
        }),
      );

      const input = {
        visitId: initialVisit.id!,
        outcome: 'SUCCESSFUL' as const,
        quotation: { number: 'COT-ROLL-04', amount: 100000 },
        order: { number: 'PED-ROLL-04', amount: 100000 },
        followUp: { nextContactDate: new Date('2026-11-01'), activity: '   ' }, // EMPTY ACTIVITY -> FollowUp.create throws
      };

      await expect(recordVisitUseCase.execute(input)).rejects.toThrow();

      const visitAfter = await visitRepo.findById(initialVisit.id!);
      expect(visitAfter?.visitStatus).toBe('SCHEDULED');
      expect(await quotationRepo.findByNumber('COT-ROLL-04')).toBeNull();
      expect(await orderRepo.findByNumber('PED-ROLL-04')).toBeNull();
      expect(await followUpRepo.findAll()).toHaveLength(0);
      expect(await historyRepo.findAll()).toHaveLength(0);
    });
  });
});
