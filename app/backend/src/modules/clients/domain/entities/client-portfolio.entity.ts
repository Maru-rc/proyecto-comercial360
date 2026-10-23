export interface ClientPortfolioProps {
  id?: number;
  customerId?: number;
  portfolioId: number;
  registeredAt?: Date;
}

export class ClientPortfolio {
  private readonly _id?: number;
  private readonly _customerId?: number;
  private readonly _portfolioId: number;
  private readonly _registeredAt: Date;

  constructor(props: ClientPortfolioProps) {
    this._id = props.id;
    this._customerId = props.customerId;
    this._portfolioId = props.portfolioId;
    this._registeredAt = props.registeredAt ?? new Date();
  }

  get id(): number | undefined {
    return this._id;
  }
  get customerId(): number | undefined {
    return this._customerId;
  }
  get portfolioId(): number {
    return this._portfolioId;
  }
  get registeredAt(): Date {
    return this._registeredAt;
  }
}
