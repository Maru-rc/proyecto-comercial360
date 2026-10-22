import { beforeEach, describe, expect, it } from 'vitest';
import { CompleteFollowUpUseCase } from './application/complete-follow-up/complete-follow-up.use-case.js';
import { CreateFollowUpUseCase } from './application/create-follow-up/create-follow-up.use-case.js';
import { ListPendingFollowUpsUseCase } from './application/list-pending-follow-ups/list-pending-follow-ups.use-case.js';
import { FollowUp } from './domain/entities/follow-up.entity.js';
import { InMemoryFollowUpRepository } from './infrastructure/persistence/in-memory-follow-up.repository.js';

describe('Follow-Ups Module Unit Tests', () => {
  let repository: InMemoryFollowUpRepository;
  let createUseCase: CreateFollowUpUseCase;
  let listPendingUseCase: ListPendingFollowUpsUseCase;
  let completeUseCase: CompleteFollowUpUseCase;

  beforeEach(() => {
    repository = new InMemoryFollowUpRepository();
    createUseCase = new CreateFollowUpUseCase(repository);
    listPendingUseCase = new ListPendingFollowUpsUseCase(repository);
    completeUseCase = new CompleteFollowUpUseCase(repository);
  });

  it('should create a follow-up successfully', async () => {
    const tomorrow = new Date(Date.now() + 86400000);
    const result = await createUseCase.execute({
      clientId: 101,
      visitId: 5,
      responsibleAdvisorId: 2,
      nextContactDate: tomorrow,
      activity: 'Call to verify sample delivery',
      observation: 'Client interested in new catalog',
    });

    expect(result.id).toBeDefined();
    expect(result.clientId).toBe(101);
    expect(result.isCompleted).toBe(false);
    expect(result.activity).toBe('Call to verify sample delivery');
  });

  it('should reject creation if activity is missing', () => {
    expect(() =>
      FollowUp.create({
        clientId: 1,
        nextContactDate: new Date(),
        activity: '   ',
      }),
    ).toThrow('Follow-up activity is required');
  });

  it('should list only pending follow-ups for a client', async () => {
    const d1 = new Date('2026-10-25T10:00:00Z');
    const d2 = new Date('2026-10-26T10:00:00Z');

    const f1 = await createUseCase.execute({
      clientId: 10,
      nextContactDate: d1,
      activity: 'Follow-up 1',
    });

    await createUseCase.execute({
      clientId: 10,
      nextContactDate: d2,
      activity: 'Follow-up 2',
    });

    // Complete f1
    await completeUseCase.execute(f1.id!);

    const pending = await listPendingUseCase.execute(10);
    expect(pending.length).toBe(1);
    expect(pending[0].activity).toBe('Follow-up 2');
    expect(pending[0].isCompleted).toBe(false);
  });

  it('should comply with public contract FollowUpReader', async () => {
    await createUseCase.execute({
      clientId: 20,
      nextContactDate: new Date('2026-11-01T09:00:00Z'),
      activity: 'Send revised quotation',
    });

    const dtos = await repository.getPendingByClient(20);
    expect(dtos.length).toBe(1);
    expect(dtos[0].clientId).toBe(20);
    expect(dtos[0].activity).toBe('Send revised quotation');
    expect(dtos[0].isCompleted).toBe(false);
  });
});
