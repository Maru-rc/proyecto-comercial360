import type {
  FollowUpContractDto,
  FollowUpReader,
} from '../../../../domain-contracts/index.js';
import { FollowUp } from '../../domain/entities/follow-up.entity.js';
import type { IFollowUpRepository } from '../../domain/repositories/follow-up-repository.port.js';

export class InMemoryFollowUpRepository
  implements IFollowUpRepository, FollowUpReader
{
  private readonly followUps: FollowUp[] = [];
  private autoIncrementId = 1;

  async save(followUp: FollowUp): Promise<FollowUp> {
    const existingIndex = followUp.id
      ? this.followUps.findIndex((f) => f.id === followUp.id)
      : -1;

    const id = followUp.id ?? this.autoIncrementId++;
    const saved = FollowUp.create({
      id,
      clientId: followUp.clientId,
      visitId: followUp.visitId,
      responsibleAdvisorId: followUp.responsibleAdvisorId,
      nextContactDate: followUp.nextContactDate,
      activity: followUp.activity,
      isCompleted: followUp.isCompleted,
      observation: followUp.observation,
      createdAt: followUp.createdAt,
    });

    if (existingIndex >= 0) {
      this.followUps[existingIndex] = saved;
    } else {
      this.followUps.push(saved);
    }

    return saved;
  }

  async findById(id: number): Promise<FollowUp | null> {
    return this.followUps.find((f) => f.id === id) ?? null;
  }

  async findByClient(clientId: number): Promise<FollowUp[]> {
    return this.followUps
      .filter((f) => f.clientId === clientId)
      .sort(
        (a, b) => a.nextContactDate.getTime() - b.nextContactDate.getTime(),
      );
  }

  async findPendingByClient(clientId: number): Promise<FollowUp[]> {
    return this.followUps
      .filter((f) => f.clientId === clientId && !f.isCompleted)
      .sort(
        (a, b) => a.nextContactDate.getTime() - b.nextContactDate.getTime(),
      );
  }

  async findAll(): Promise<FollowUp[]> {
    return [...this.followUps].sort(
      (a, b) => a.nextContactDate.getTime() - b.nextContactDate.getTime(),
    );
  }

  async getPendingByClient(clientId: number): Promise<FollowUpContractDto[]> {
    const pending = await this.findPendingByClient(clientId);
    return pending.map((f) => ({
      id: f.id ?? 0,
      clientId: f.clientId,
      visitId: f.visitId,
      responsibleAdvisorId: f.responsibleAdvisorId,
      nextContactDate: f.nextContactDate,
      activity: f.activity,
      isCompleted: f.isCompleted,
      observation: f.observation,
    }));
  }

  clear(): void {
    this.followUps.length = 0;
    this.autoIncrementId = 1;
  }
}
