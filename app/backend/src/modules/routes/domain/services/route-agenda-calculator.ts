export interface CalculateDatesParams {
  executionDay: string | null;
  frequency: string | null;
  startDate: Date;
  endDate: Date;
}

export interface RouteStopForAgenda {
  customerId: number;
  visitOrder: number;
  suggestedTime?: string | null;
}

export interface GenerateVisitsParams extends CalculateDatesParams {
  routeId: number;
  advisorId: number;
  defaultStartTime?: string | null;
  stops: RouteStopForAgenda[];
}

export interface GeneratedVisit {
  customerId: number;
  salesRepresentativeId: number;
  routeId: number;
  scheduledAt: Date;
  status: 'PENDIENTE';
}

const DAY_MAP: Record<string, number> = {
  domingo: 0,
  lunes: 1,
  martes: 2,
  miercoles: 3,
  miércoles: 3,
  jueves: 4,
  viernes: 5,
  sabado: 6,
  sábado: 6,
};

export class RouteAgendaCalculator {
  static calculateExecutionDates(params: CalculateDatesParams): Date[] {
    const dayName = (params.executionDay ?? '').trim().toLowerCase();
    const targetDayNumber = DAY_MAP[dayName] ?? 1; // Default: Lunes

    const stepDays = this.resolveFrequencyStep(params.frequency);

    const dates: Date[] = [];
    const current = new Date(params.startDate);
    current.setHours(0, 0, 0, 0);

    const end = new Date(params.endDate);
    end.setHours(23, 59, 59, 999);

    // Avanzar hasta el primer día coincidente
    while (current.getDay() !== targetDayNumber && current <= end) {
      current.setDate(current.getDate() + 1);
    }

    // Iterar aplicando la frecuencia
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + stepDays);
    }

    return dates;
  }

  static generateVisits(params: GenerateVisitsParams): GeneratedVisit[] {
    const executionDates = this.calculateExecutionDates(params);
    const sortedStops = [...params.stops].sort(
      (a, b) => a.visitOrder - b.visitOrder,
    );

    const visits: GeneratedVisit[] = [];

    for (const date of executionDates) {
      for (const stop of sortedStops) {
        const scheduledAt = new Date(date);
        const timeStr =
          stop.suggestedTime || params.defaultStartTime || '08:00';
        const [hours, minutes] = timeStr
          .split(':')
          .map((val) => Number(val) || 0);
        scheduledAt.setHours(hours, minutes, 0, 0);

        visits.push({
          customerId: stop.customerId,
          salesRepresentativeId: params.advisorId,
          routeId: params.routeId,
          scheduledAt,
          status: 'PENDIENTE',
        });
      }
    }

    return visits;
  }

  private static resolveFrequencyStep(frequency: string | null): number {
    const freq = (frequency ?? '').trim().toLowerCase();
    if (freq.includes('quincenal')) return 14;
    if (freq.includes('mensual')) return 28;
    return 7; // Semanal por defecto
  }
}
