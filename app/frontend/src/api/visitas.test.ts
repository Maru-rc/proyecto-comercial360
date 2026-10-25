import { describe, it, expect, vi, afterEach } from 'vitest';

vi.mock('./client', () => ({
  apiClient: { post: vi.fn(), put: vi.fn(), get: vi.fn() },
}));

import { apiClient } from './client';
import { registrarVisita } from './visitas';
import type { IVisitaRegistroFormData } from '../types/visita';

const post = vi.mocked(apiClient.post);
const put = vi.mocked(apiClient.put);

const form = (overrides: Partial<IVisitaRegistroFormData> = {}) =>
  ({
    fecha_visita: '2026-10-25',
    hora_inicio: '10:15 AM',
    hora_fin: '02:30 PM',
    id_cliente: '7',
    objetivo_visita: 'Presentación',
    estado_visita: 'VISITADO',
    resultado_visita: 'Interesado',
    observaciones: 'Todo bien',
    genero_cotizacion: true,
    numero_cotizacion: 'COT-1',
    valor_cotizacion: 1000,
    genero_pedido: false,
    fecha_proxima_visita: '2026-10-30',
    ...overrides,
  }) as IVisitaRegistroFormData;

describe('registrarVisita (HU-12/13/14)', () => {
  afterEach(() => vi.clearAllMocks());

  it('an unplanned visit is created first and then closed with its outcome', async () => {
    post.mockResolvedValue({ data: { id: 55 } });
    put.mockResolvedValue({ data: { visitId: 55, outcome: 'SUCCESSFUL' } });

    await registrarVisita(form(), ['visit-evidence/a.jpg']);

    expect(post).toHaveBeenCalledWith('/visits', {
      clientId: 7,
      scheduledDate: '2026-10-25',
      startTime: '10:15',
      objective: 'Presentación',
    });
    const [url, body] = put.mock.calls[0];
    expect(url).toBe('/visits/55');
    expect(body).toMatchObject({
      outcome: 'SUCCESSFUL',
      endTime: '2026-10-25T14:30:00',
      evidenceS3Key: 'visit-evidence/a.jpg',
      quotation: { quotationNumber: 'COT-1', amount: 1000, currency: 'COP' },
      order: undefined,
      followUp: { nextContactDate: '2026-10-30' },
    });
  });

  it('a scheduled visit goes straight to PUT; rescheduling sends the new date', async () => {
    put.mockResolvedValue({ data: { visitId: 9, outcome: 'RESCHEDULED' } });

    await registrarVisita(
      form({ estado_visita: 'REPROGRAMADO', genero_cotizacion: false }),
      [],
      [],
      9,
    );

    expect(post).not.toHaveBeenCalled();
    expect(put.mock.calls[0][1]).toMatchObject({
      outcome: 'RESCHEDULED',
      rescheduledDate: '2026-10-30',
      followUp: undefined,
    });
  });

  it('"No interesado" is a NO_SALE with the observations as reason', async () => {
    put.mockResolvedValue({ data: {} });
    await registrarVisita(
      form({ resultado_visita: 'No interesado' }),
      [],
      [],
      3,
    );
    expect(put.mock.calls[0][1]).toMatchObject({
      outcome: 'NO_SALE',
      reasonNoSale: 'Todo bien',
    });
  });

  it('12:05 AM is midnight and an unparseable end time is omitted', async () => {
    put.mockResolvedValue({ data: {} });
    await registrarVisita(form({ hora_fin: '12:05 AM' }), [], [], 1);
    expect(put.mock.calls[0][1]).toMatchObject({
      endTime: '2026-10-25T00:05:00',
    });

    await registrarVisita(form({ hora_fin: 'tarde' }), [], [], 1);
    expect(put.mock.calls[1][1]).toMatchObject({ endTime: undefined });
  });
});
