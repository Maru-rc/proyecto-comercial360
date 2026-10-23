export interface AdvisorRecord {
  readonly idAdvisor: number;
  readonly name: string;
  readonly email: string;
  readonly phone: string | null;
  readonly status: string;
}

/** Port: how the application queries advisors. */
export interface AdvisorRepository {
  /** Finds the advisor whose email matches (case-insensitive). */
  findByEmail(email: string): Promise<AdvisorRecord | null>;
}

export const ADVISOR_REPOSITORY = Symbol('ADVISOR_REPOSITORY');
