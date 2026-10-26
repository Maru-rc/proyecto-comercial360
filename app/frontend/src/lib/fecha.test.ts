import { afterEach, describe, expect, it, vi } from 'vitest';
import { toLocalIsoDate, toLocalTime } from './fecha';

describe('toLocalIsoDate', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('keeps the local day in the evening, when UTC is already tomorrow', () => {
    // 26 Oct 2026, 20:30 in Bogotá = 27 Oct 01:30 UTC
    const evening = new Date('2026-10-27T01:30:00Z');
    vi.spyOn(evening, 'getTimezoneOffset').mockReturnValue(300);
    expect(evening.toISOString().slice(0, 10)).toBe('2026-10-27');
    expect(toLocalIsoDate(evening)).toBe('2026-10-26');
  });
});

describe('toLocalTime', () => {
  it('pads hours and minutes', () => {
    expect(toLocalTime(new Date(2026, 9, 26, 7, 5))).toBe('07:05');
  });
});
