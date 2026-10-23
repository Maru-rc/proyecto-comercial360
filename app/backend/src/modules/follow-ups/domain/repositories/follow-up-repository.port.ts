import type { FollowUp } from '../entities/follow-up.entity.js';

export interface IFollowUpRepository {
  save(followUp: FollowUp): Promise<FollowUp>;
  findById(id: number): Promise<FollowUp | null>;
  findByClient(clientId: number): Promise<FollowUp[]>;
  findPendingByClient(clientId: number): Promise<FollowUp[]>;
  findAll(): Promise<FollowUp[]>;
}

export const FOLLOW_UP_REPOSITORY = Symbol('FOLLOW_UP_REPOSITORY');
